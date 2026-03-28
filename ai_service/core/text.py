from __future__ import annotations

import re
import unicodedata
from typing import Dict, List, Literal, Optional, Set, Tuple

import numpy as np

from core import config as core_config
from core.similarity import semantic_similarity_single_target


def normalize_semantic_text(text: str) -> str:
    """
    Normalize text for semantic/rule matching:
    - lowercase
    - strip accents
    - keep only word chars/spaces
    - collapse whitespace
    """
    value = (text or "").strip().lower()
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = re.sub(r"[^\w\s]", " ", value, flags=re.UNICODE)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def semantic_level(score: float) -> Literal["HIGH", "MEDIUM", "LOW"]:
    if score >= 0.8:
        return "HIGH"
    if score >= 0.5:
        return "MEDIUM"
    return "LOW"


def has_multi_intent_overlap(target_text: str, cand_text: str) -> bool:
    """
    Rule-based intent bridge for common donation scenarios.
    """
    rules: List[Tuple[Set[str], Set[str]]] = [
        ({"quan ao", "quan", "ao", "do mac"}, {"ao", "quan", "mac", "chan", "am"}),
        ({"thuc pham", "do an", "gao"}, {"gao", "mi", "my tom", "do an", "thuc pham"}),
        ({"chay nha", "mat nha", "hoa hoan"}, {"chan", "noi", "bep", "do gia dung", "vat dung sinh hoat"}),
        ({"hoc phi", "sach vo", "hoc tap"}, {"sach", "vo", "tap", "laptop", "may tinh"}),
    ]
    for target_terms, cand_terms in rules:
        if any(term in target_text for term in target_terms) and any(term in cand_text for term in cand_terms):
            return True
    return False


def infer_category_label(text: str) -> Tuple[Optional[str], float]:
    normalized = normalize_semantic_text(text)
    if not normalized:
        return None, 0.0

    best_label: Optional[str] = None
    best_score = -1.0
    for label in core_config.CATEGORY_LABELS:
        prototypes = core_config.CATEGORY_PROTOTYPES.get(label, [])
        if not prototypes:
            continue
        sims = semantic_similarity_single_target(normalized, prototypes)
        label_score = float(np.max(sims)) if len(sims) > 0 else 0.0
        if label_score > best_score:
            best_score = label_score
            best_label = label

    if best_label is None:
        return None, 0.0
    return best_label, max(0.0, min(1.0, best_score))


def normalize_category_label(raw: Optional[str], fallback_text: str) -> Tuple[Optional[str], float]:
    value = (raw or "").strip().lower()
    if value in core_config.CATEGORY_LABELS:
        return value, 1.0
    return infer_category_label(fallback_text)


def must_reject_by_rules(
    target_text: str,
    cand_text: str,
    match_sim: float,
    target_category: Optional[str],
    cand_category: Optional[str],
) -> bool:
    # Reject bắt buộc: không có tín hiệu text + semantic quá thấp.
    if not cand_text:
        return True

    target_words = set(target_text.split())
    cand_words = set(cand_text.split())
    overlap = len(target_words & cand_words)
    if match_sim < core_config.REJECT_LOW_SIM_THRESHOLD and overlap == 0:
        return True

    # Reject bắt buộc: category lệch mạnh và semantic không đủ cao.
    if (
        target_category is not None
        and cand_category is not None
        and target_category != cand_category
        and match_sim < core_config.CATEGORY_MISMATCH_REJECT_SIM
    ):
        return True

    return False


def is_relevant_enough(match_sim: float) -> bool:
    return match_sim >= core_config.MIN_SIM_LOOSE


def urgency_score(text: str) -> float:
    score = 0.0
    urgent_keywords = [
        "khan cap",
        "gap",
        "can ngay",
        "chay nha",
        "mat het",
        "khong con",
        "doi",
        "thieu an",
    ]
    for kw in urgent_keywords:
        if kw in text:
            score += 0.5
    return min(score, 1.0)


def relevance_penalty(match_sim: float) -> float:
    if match_sim < 0.45:
        return -1.5
    if match_sim < 0.5:
        return -0.5
    return 0.0


def _contains_any(text: str, keywords: List[str]) -> bool:
    return any(k in text for k in keywords)


def is_cross_domain_hard_reject(target_text: str, cand_text: str) -> bool:
    """
    Hard reject obvious cross-domain pairs.
    If target asks education items but candidate is vehicle-only (or inverse), reject.
    """
    edu_keywords = ["hoc tap", "sach", "vo", "but", "hoc phi", "laptop", "may tinh"]
    vehicle_keywords = ["xe may", "xe dap", "xe lan", "phuong tien"]

    target_is_edu = _contains_any(target_text, edu_keywords)
    cand_is_edu = _contains_any(cand_text, edu_keywords)
    target_is_vehicle = _contains_any(target_text, vehicle_keywords)
    cand_is_vehicle = _contains_any(cand_text, vehicle_keywords)

    if target_is_edu and cand_is_vehicle and not cand_is_edu:
        return True
    if target_is_vehicle and cand_is_edu and not cand_is_vehicle:
        return True
    return False


def extract_intents(text: str) -> Set[str]:
    intents: Set[str] = set()

    # Context mapping for emergency scenarios:
    # "cháy nhà / mất nhà" typically implies household items + some clothes + some food.
    if any(k in text for k in ["chay nha", "mat nha", "mat het", "khong con nha", "hoa hoan"]):
        intents.update({"household", "clothes", "food"})

    groups: Dict[str, List[str]] = {
        "education": ["hoc tap", "sach", "vo", "but", "hoc phi", "laptop", "may tinh", "giao khoa"],
        "vehicle": ["xe may", "xe dap", "xe lan", "phuong tien"],
        "food": [
            "gao",
            "my tom",
            "mi tom",
            "thuc pham",
            "do an",
            "sua",
            "thieu an",
            "khong du an",
            "doi",
            "can thuc pham",
            "can gao",
            "can do an",
        ],
        "clothes": ["quan ao", "ao", "quan", "quan jean", "jean", "ao khoac", "giay", "dep", "chan", "man", "do mac"],
        "household": ["noi", "bep", "noi com", "gia dung", "do sinh hoat"],
        "medical": ["thuoc", "y te", "phau thuat", "vien phi", "kham benh"],
    }
    for intent, keywords in groups.items():
        if any(k in text for k in keywords):
            intents.add(intent)
    return intents


def should_reject_by_intent(target_text: str, cand_text: str) -> bool:
    """
    If target has clear intent(s), candidate must overlap at least one intent.
    Otherwise reject to avoid semantic noise (e.g., education -> rice/cookware/clothes).
    """
    target_intents = extract_intents(target_text)
    if not target_intents:
        return False
    cand_intents = extract_intents(cand_text)
    return len(target_intents & cand_intents) == 0


def is_food_urgency_target(target_text: str) -> bool:
    food_need_keywords = ["khong du an", "thieu an", "doi", "can thuc pham", "can gao", "can do an"]
    return _contains_any(target_text, food_need_keywords)


def should_reject_for_food_urgency(target_text: str, cand_text: str) -> bool:
    """
    Tight mode for urgent food requests:
    - keep food
    - allow household as secondary support
    - reject others (clothes/vehicle/education/medical)
    """
    if not is_food_urgency_target(target_text):
        return False
    cand_intents = extract_intents(cand_text)
    if "food" in cand_intents:
        return False
    if "household" in cand_intents:
        return False
    return True


def should_reject_vehicle_offer_when_vehicle_not_allowed(
    cand_text: str,
    allowed_categories: Set[str],
) -> bool:
    """
    Bài CHO chỉ về xe/phương tiện: loại nếu target không có nhãn vehicle.
    Tránh nhãn food/clothes nhầm trong DB vẫn làm giao khác rỗng.
    """
    if "vehicle" in allowed_categories:
        return False
    if not _contains_any(cand_text, ["xe may", "xe dap", "xe lan", "phuong tien"]):
        return False
    if _contains_any(
        cand_text,
        [
            "thuc pham",
            "gao",
            "do an",
            "mi tom",
            "my tom",
            "tang gao",
            "tang mi",
            "com ",
            " com",
            "banh mi",
            "quan ao",
            "ao quan",
            "tang ao",
            "ao am",
            "giay",
            "dep",
            "quan jean",
            "chan ",
            " man",
        ],
    ):
        return False
    return True


def should_reject_for_vehicle_target(target_text: str, cand_text: str) -> bool:
    """
    Strict gate for vehicle demand:
    when target clearly asks for vehicle/transport, only keep vehicle candidates.
    """
    target_intents = extract_intents(target_text)
    if "vehicle" not in target_intents:
        return False
    cand_intents = extract_intents(cand_text)
    return "vehicle" not in cand_intents

