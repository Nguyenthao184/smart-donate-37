from __future__ import annotations

from functools import lru_cache
from typing import List, Optional

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from core.config import SEMANTIC_MODEL_NAME

try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover
    SentenceTransformer = None  # type: ignore


@lru_cache(maxsize=1)
def get_semantic_model() -> Optional["SentenceTransformer"]:
    """
    Load semantic model once per process.
    Supports:
    - sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
    - keepitreal/vietnamese-sbert (set via SEMANTIC_MODEL_NAME)
    """
    if SentenceTransformer is None:
        return None
    try:
        return SentenceTransformer(SEMANTIC_MODEL_NAME)
    except Exception:
        return None


def semantic_similarity_scores(target_text: str, other_texts: List[str]) -> np.ndarray:
    """
    Return cosine similarity scores between `target_text` and each text in `other_texts`.
    """
    model = get_semantic_model()
    if model is None:
        # Fallback nếu môi trường chưa cài model.
        texts = [target_text] + other_texts
        vectorizer = TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(3, 5),
            max_features=7000,
        )
        tfidf_matrix = vectorizer.fit_transform(texts)
        target_vec = tfidf_matrix[0:1]
        cand_vecs = tfidf_matrix[1:]
        return cosine_similarity(target_vec, cand_vecs)[0]

    embeddings = model.encode(
        [target_text] + other_texts,
        normalize_embeddings=True,
        convert_to_numpy=True,
    )
    target_emb = embeddings[0]
    cand_embs = embeddings[1:]
    # normalize_embeddings=True => cosine ~ dot product
    return cand_embs @ target_emb


def lexical_similarity_scores(target_text: str, other_texts: List[str]) -> np.ndarray:
    texts = [target_text] + other_texts
    vectorizer = TfidfVectorizer(
        analyzer="char_wb",
        ngram_range=(3, 5),
        max_features=7000,
    )
    tfidf_matrix = vectorizer.fit_transform(texts)
    target_vec = tfidf_matrix[0:1]
    cand_vecs = tfidf_matrix[1:]
    return cosine_similarity(target_vec, cand_vecs)[0]


def semantic_similarity_single_target(target_text: str, other_texts: List[str]) -> np.ndarray:
    """
    Semantic-first similarity for generic text matching.
    Uses model embedding as primary signal and lexical as backup for robustness.
    """
    semantic_sims = semantic_similarity_scores(target_text, other_texts)
    lexical_sims = lexical_similarity_scores(target_text, other_texts)
    return np.clip((0.9 * semantic_sims) + (0.1 * lexical_sims), 0.0, 1.0)

