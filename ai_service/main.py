from __future__ import annotations

from typing import Dict, List, Literal, Optional, Tuple
from datetime import datetime, timezone
import os
import json
from urllib.request import urlopen, Request
from urllib.parse import quote

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


app = FastAPI(title="SmartDonate AI Matching Service")

OSRM_BASE_URL = os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org").rstrip("/")
OSRM_PROFILE = os.getenv("OSRM_PROFILE", "driving").strip() or "driving"
OSRM_TIMEOUT_SECONDS = float(os.getenv("OSRM_TIMEOUT_SECONDS", "4"))


class AiPost(BaseModel):
    id: int
    loai_bai: Literal["CHO", "NHAN"]
    tieu_de: str
    mo_ta: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    created_at: datetime
    danh_muc: Optional[str] = None


class MatchRequest(BaseModel):
    post_id: int
    posts: List[AiPost] = Field(min_length=2)


class MatchResponseItem(BaseModel):
    post_id: int
    score: float
    distance: float
    match_percent: float


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate haversine distance in kilometers between two points.
    """
    r_km = 6371.0

    lat1_rad = np.radians(lat1)
    lon1_rad = np.radians(lon1)
    lat2_rad = np.radians(lat2)
    lon2_rad = np.radians(lon2)

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = np.sin(dlat / 2.0) ** 2 + np.cos(lat1_rad) * np.cos(lat2_rad) * np.sin(dlon / 2.0) ** 2
    c = 2.0 * np.arctan2(np.sqrt(a), np.sqrt(1.0 - a))

    return float(r_km * c)


def score_location_km(distance_km: float) -> float:
    if distance_km <= 2:
        return 3.0
    if distance_km <= 5:
        return 2.0
    if distance_km <= 10:
        return 1.0
    return 0.0


def score_time_days(delta_days: float) -> float:
    if delta_days < 1:
        return 2.0
    if delta_days < 3:
        return 1.0
    return 0.0


def score_rule(target: AiPost, cand: AiPost) -> float:
    score = 0.0
    if cand.loai_bai != target.loai_bai:
        score += 3.0

    if target.danh_muc is not None and cand.danh_muc is not None and target.danh_muc == cand.danh_muc:
        score += 2.0

    return score


def get_osrm_distance_km(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
    cache: Dict[Tuple[float, float, float, float], float],
) -> Optional[float]:
    """
    Fetch route distance from OSRM (road distance in km).
    Returns None if OSRM call fails.
    """
    key = (round(lat1, 6), round(lon1, 6), round(lat2, 6), round(lon2, 6))
    if key in cache:
        return cache[key]

    # OSRM route API expects lon,lat;lon,lat
    coordinates = f"{lon1},{lat1};{lon2},{lat2}"
    encoded_coordinates = quote(coordinates, safe=";,.-")
    url = f"{OSRM_BASE_URL}/route/v1/{OSRM_PROFILE}/{encoded_coordinates}?overview=false"

    try:
        req = Request(url, headers={"User-Agent": "smart-donate-37-ai/1.0"})
        with urlopen(req, timeout=OSRM_TIMEOUT_SECONDS) as res:
            payload = json.loads(res.read().decode("utf-8"))

        if payload.get("code") != "Ok":
            return None

        routes = payload.get("routes") or []
        if not routes:
            return None

        distance_m = routes[0].get("distance")
        if distance_m is None:
            return None

        distance_km = float(distance_m) / 1000.0
        cache[key] = distance_km
        return distance_km
    except Exception:
        return None


@app.post("/matches", response_model=List[MatchResponseItem])
def matches(req: MatchRequest) -> List[MatchResponseItem]:
    # 1) Find target post by post_id
    target = next((p for p in req.posts if p.id == req.post_id), None)
    if target is None:
        raise HTTPException(status_code=400, detail="post_id not found in posts array")

    others = [p for p in req.posts if p.id != req.post_id]
    if not others:
        return []

    # 2) Combine text
    target_text = (target.tieu_de + " " + target.mo_ta).strip()
    other_texts = [(p.tieu_de + " " + p.mo_ta).strip() for p in others]

    # 3) Apply TF-IDF vectorization
    texts = [target_text] + other_texts
    vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
    tfidf_matrix = vectorizer.fit_transform(texts)

    # 4) Cosine similarity between target and each other
    target_vec = tfidf_matrix[0:1]
    cand_vecs = tfidf_matrix[1:]
    cos_sims = cosine_similarity(target_vec, cand_vecs)[0]  # shape: (len(others),)

    # 5) Score each post
    results: List[MatchResponseItem] = []
    max_total_score = 16.0  # 6 similarity + 3 location + 2 time + 3/2 rule = 16

    now = datetime.now(timezone.utc)
    osrm_cache: Dict[Tuple[float, float, float, float], float] = {}

    for idx, cand in enumerate(others):
        similarity_score = float(cos_sims[idx]) * 6.0

        # location_score using haversine distance
        distance_km = 0.0
        location_score = 0.0
        if (
            target.lat is not None
            and target.lng is not None
            and cand.lat is not None
            and cand.lng is not None
        ):
            # Try road distance from OSRM first; fallback to haversine if OSRM fails.
            road_km = get_osrm_distance_km(
                target.lat,
                target.lng,
                cand.lat,
                cand.lng,
                osrm_cache,
            )
            distance_km = road_km if road_km is not None else haversine_km(
                target.lat,
                target.lng,
                cand.lat,
                cand.lng,
            )
            location_score = score_location_km(distance_km)

        # time_score: dựa trên độ "mới" của candidate so với thời điểm hiện tại
        cand_created_at = cand.created_at
        if cand_created_at.tzinfo is None:
            cand_created_at = cand_created_at.replace(tzinfo=timezone.utc)
        else:
            cand_created_at = cand_created_at.astimezone(timezone.utc)

        delta_days = (now - cand_created_at).total_seconds() / 86400.0
        if delta_days < 0:
            delta_days = 0.0
        time_score = score_time_days(delta_days)

        rule_score = score_rule(target, cand)

        final_score = similarity_score + location_score + time_score + rule_score

        # 7) filter score >= 5
        if final_score < 5:
            continue

        match_percent = float(min(100.0, (final_score / max_total_score) * 100.0))

        results.append(
            MatchResponseItem(
                post_id=cand.id,
                score=round(final_score, 6),
                distance=round(distance_km, 6),
                match_percent=round(match_percent, 2),
            )
        )

    # 8/9) sort descending & return top 5
    results.sort(key=lambda x: x.score, reverse=True)
    return results[:5]

