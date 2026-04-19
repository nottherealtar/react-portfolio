"""
Extractive blog text engine: sentence ranking + MMR (Maximal Marginal Relevance).

Backends:
  - TF–IDF (default): no extra dependencies; word-overlap style similarity.
  - Embeddings (optional): sentence-transformers on CPU; semantic similarity.

No generative LLM: only sentences from the fetched article are selected.
"""

from __future__ import annotations

import math
import re
from collections import Counter
from typing import Any, Dict, List, Sequence, Tuple

# Lazy singleton for optional embedding model (name -> loaded model)
_ST_MODEL = None
_ST_MODEL_KEY: str | None = None

_STOP = frozenset(
    """
    a an the and or but if to of in on for with as at by from into through during
    before after above below between under again further then once here there when
    where why how all each every both few more most other some such no nor not only
    own same so than too very can will just don should now ve re ll d m s t is are
    was were been being be have has had having do does did doing been get got
    it its this that these those we you he she they them their what which who
    about into your our out up down over also back only even much such any
    """.split()
)


def _tokenize(text: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", (text or "").lower())


def _terms(text: str) -> List[str]:
    return [t for t in _tokenize(text) if len(t) > 1 and t not in _STOP]


def sentence_split(text: str) -> List[str]:
    text = (text or "").strip()
    if not text:
        return []
    parts = re.split(r"(?<=[.!?])\s+", text)
    return [p.strip() for p in parts if p.strip()]


# HTML→plain text often concatenates subheads without punctuation ("…now The timing…").
# Case-sensitive "The"/"Why" so we never split on ordinary "the …".
_GLUE_BEFORE_THE = re.compile(
    r"(?<=[a-z0-9\)'\"»])\s+"
    r"(?=The\s+(?:timing|goal|status|report|answer|truth|reason|difference|problem|"
    r"way|next|first|only|result|rest|whole|point|catch|twist|reality|big|other|"
    r"Cisco|GitHub|season)\b)"
)
_GLUE_BEFORE_WHY_HOW = re.compile(
    r"(?<=[a-z0-9\)'\"»])\s+"
    r"(?=Why\s+(?:agentic|this|we|the|your|it|security|are|is|does|do|should|can|will|matters)\b)"
)


def _split_glued_clauses(s: str) -> List[str]:
    """Break run-on lines where a new clause starts with The… / Why… mid-string."""
    s = (s or "").strip()
    if not s:
        return []
    work = [s]
    for rx in (_GLUE_BEFORE_THE, _GLUE_BEFORE_WHY_HOW):
        nxt: List[str] = []
        for chunk in work:
            nxt.extend(p.strip() for p in rx.split(chunk) if p.strip())
        work = nxt
    return work


def _explode_sentences(raw: List[str]) -> List[str]:
    out: List[str] = []
    for line in raw:
        for piece in _split_glued_clauses(line):
            out.extend(sentence_split(piece))
    deduped: List[str] = []
    seen = set()
    for s in out:
        k = s.strip().lower()
        if k and k not in seen:
            seen.add(k)
            deduped.append(s.strip())
    return deduped


def _heading_or_deck_like(s: str) -> bool:
    """Section titles / decks often lack a period and read as a headline."""
    t = (s or "").strip()
    if len(t) < 10:
        return True
    if re.search(r"[.!?]\s*[\"'\"]\s*$", t) or t.endswith((".", "?", "!")):
        return False
    words = re.findall(r"[A-Za-z]+", t)
    if len(words) < 4:
        return True
    caps = sum(1 for w in words if w[:1].isupper())
    if caps / max(len(words), 1) >= 0.58 and len(t) < 160:
        return True
    if re.match(
        r"^(?:why|how|what|when|where|which)\s+.{12,}$",
        t,
        re.I,
    ) and "." not in t and "?" not in t and len(t) < 140:
        return True
    return False


def _fragment_tail(s: str) -> bool:
    """Trailing glue like '… for your' with no clause after it."""
    t = (s or "").rstrip()
    if re.search(r"[.!?][\"'\"]?\s*$", t):
        return False
    tail = t.split()[-3:] if t.split() else []
    tail_l = " ".join(x.lower() for x in tail)
    if re.search(r"\b(for your|to your|in your|with the|into the)\s*$", tail_l):
        return True
    return bool(re.search(r"\b(a|an|the|your|their|this|that)\s*$", tail_l))


def _smart_truncate_paragraph(text: str, max_chars: int) -> str:
    """Prefer ending on a full sentence; avoid chopping mid-clause when possible."""
    text = text.strip()
    if len(text) <= max_chars:
        return text
    window = text[:max_chars]
    best = -1
    for punct in ".?!":
        idx = window.rfind(punct)
        if idx > int(max_chars * 0.42):
            best = max(best, idx)
    if best >= 0:
        return text[: best + 1].strip()
    cut = text[: max_chars - 1].rsplit(" ", 1)[0]
    return cut + "…"


def is_poor_extractive_sentence(s: str) -> bool:
    """True for glued headings, decks, or dangling tails — drop from bullets and similar."""
    return _heading_or_deck_like(s) or _fragment_tail(s)


def _tfidf_vectors(sentences: Sequence[str]) -> Tuple[List[Dict[str, float]], Dict[str, float]]:
    """Per-sentence L2-normalized TF–IDF sparse vectors and raw IDF weights."""
    n = len(sentences)
    if n == 0:
        return [], {}

    df: Counter[str] = Counter()
    tfs: List[Counter[str]] = []
    for sent in sentences:
        terms = _terms(sent)
        tf = Counter(terms)
        tfs.append(tf)
        for t in set(tf):
            df[t] += 1

    idf: Dict[str, float] = {}
    for term, dfi in df.items():
        idf[term] = math.log((n + 0.5) / (dfi + 0.5)) + 1.0

    vecs: List[Dict[str, float]] = []
    for tf in tfs:
        raw: Dict[str, float] = {}
        for term, c in tf.items():
            if term not in idf:
                continue
            w = (1.0 + math.log(c)) * idf[term]
            if w > 0:
                raw[term] = w
        norm = math.sqrt(sum(v * v for v in raw.values()))
        if norm > 0:
            vecs.append({t: v / norm for t, v in raw.items()})
        else:
            vecs.append({})

    return vecs, idf


def _cosine(a: Dict[str, float], b: Dict[str, float]) -> float:
    if not a or not b:
        return 0.0
    keys = set(a) & set(b)
    if not keys:
        return 0.0
    dot = sum(a[t] * b[t] for t in keys)
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    if na <= 0 or nb <= 0:
        return 0.0
    return dot / (na * nb)


def _weighted_centroid(vecs: Sequence[Dict[str, float]]) -> Dict[str, float]:
    acc: Dict[str, float] = {}
    for v in vecs:
        for t, w in v.items():
            acc[t] = acc.get(t, 0.0) + w
    norm = math.sqrt(sum(w * w for w in acc.values()))
    if norm <= 0:
        return {}
    return {t: w / norm for t, w in acc.items()}


def _title_query_vector(title: str, idf: Dict[str, float]) -> Dict[str, float]:
    raw: Dict[str, float] = {}
    for term in _terms(title):
        if term not in idf:
            continue
        raw[term] = raw.get(term, 0.0) + idf[term]
    norm = math.sqrt(sum(v * v for v in raw.values()))
    if norm <= 0:
        return {}
    return {t: v / norm for t, v in raw.items()}


def _blend_query(
    doc_centroid: Dict[str, float],
    title_vec: Dict[str, float],
    title_weight: float,
) -> Dict[str, float]:
    tw = max(0.0, min(0.35, title_weight))
    acc: Dict[str, float] = {}
    for t, w in doc_centroid.items():
        acc[t] = acc.get(t, 0.0) + (1.0 - tw) * w
    for t, w in title_vec.items():
        acc[t] = acc.get(t, 0.0) + tw * w
    norm = math.sqrt(sum(w * w for w in acc.values()))
    if norm <= 0:
        return doc_centroid or title_vec
    return {t: w / norm for t, w in acc.items()}


def _pairwise_sim(vecs: List[Dict[str, float]]) -> List[List[float]]:
    n = len(vecs)
    mat = [[0.0] * n for _ in range(n)]
    for i in range(n):
        mat[i][i] = 1.0
        for j in range(i + 1, n):
            s = _cosine(vecs[i], vecs[j])
            mat[i][j] = s
            mat[j][i] = s
    return mat


def _mmr_pick(
    relevance: List[float],
    sim: List[List[float]],
    k: int,
    forbidden: set[int],
    lam: float,
) -> List[int]:
    n = len(relevance)
    selected: List[int] = []
    candidates = {i for i in range(n) if i not in forbidden}
    lam = max(0.35, min(0.92, lam))
    while len(selected) < k and candidates:
        best_i = -1
        best_score = -1e18
        for i in candidates:
            rel_i = relevance[i]
            div = max(sim[i][j] for j in selected) if selected else 0.0
            score = lam * rel_i - (1.0 - lam) * div
            if score > best_score:
                best_score = score
                best_i = i
        if best_i < 0:
            break
        selected.append(best_i)
        candidates.discard(best_i)
    return selected


def _truncate_join(sentences: List[str], indices: List[int], max_chars: int) -> str:
    ordered = sorted(set(indices))
    parts = [sentences[i] for i in ordered if 0 <= i < len(sentences)]
    while len(parts) > 1:
        text = " ".join(parts).strip()
        text = _smart_truncate_paragraph(text, max_chars)
        if not _fragment_tail(text):
            return text
        parts = parts[:-1]
    if not parts:
        return ""
    return _smart_truncate_paragraph(parts[0].strip(), max_chars)


def _get_sentence_transformer(model_name: str) -> Any:
    global _ST_MODEL, _ST_MODEL_KEY
    if _ST_MODEL is None or _ST_MODEL_KEY != model_name:
        from sentence_transformers import SentenceTransformer

        _ST_MODEL = SentenceTransformer(model_name, device="cpu")
        _ST_MODEL_KEY = model_name
    return _ST_MODEL


def _embedding_relevance_and_sim(
    sentences: List[str],
    title: str,
    title_weight: float,
    model_name: str,
) -> Tuple[List[float], List[List[float]]]:
    """Cosine relevance to a title-blended centroid query; pairwise cosine sim matrix."""
    import numpy as np

    model = _get_sentence_transformer(model_name)
    embs = model.encode(
        sentences,
        convert_to_numpy=True,
        show_progress_bar=False,
        normalize_embeddings=True,
    )
    title_text = (title or "").strip() or " "
    title_e = model.encode(
        [title_text],
        convert_to_numpy=True,
        show_progress_bar=False,
        normalize_embeddings=True,
    )[0]
    centroid = np.mean(embs, axis=0)
    centroid = centroid / (float(np.linalg.norm(centroid)) + 1e-9)
    tw = max(0.0, min(0.35, title_weight))
    query = (1.0 - tw) * centroid + tw * title_e
    query = query / (float(np.linalg.norm(query)) + 1e-9)
    relevance = (embs @ query).astype(float).tolist()
    sim_np = (embs @ embs.T).astype(float)
    sim = sim_np.tolist()
    return relevance, sim


def _run_mmr_stages(
    sentences: List[str],
    relevance: List[float],
    sim: List[List[float]],
    summary_k: int,
    takeaway_k: int,
    lam: float,
    max_chars: int,
    engine: str,
) -> Dict[str, Any]:
    n = len(sentences)
    if n > 2:
        summary_k_eff = min(summary_k, max(1, n - 2))
    else:
        summary_k_eff = min(summary_k, 1)

    summary_idx = _mmr_pick(relevance, sim, min(summary_k_eff, n), set(), lam)
    summary_idx = sorted(set(summary_idx))
    summary_text = _truncate_join(sentences, summary_idx, max_chars)

    forbidden = set(summary_idx)
    rel_ctx = list(relevance)
    for i in forbidden:
        rel_ctx[i] = -1e9
    why_pick = _mmr_pick(rel_ctx, sim, 1, forbidden, min(lam + 0.06, 0.88))
    context_sentence = sentences[why_pick[0]] if why_pick else ""

    forbidden2 = set(summary_idx) | set(why_pick)
    rel_take = list(relevance)
    for i in forbidden2:
        rel_take[i] = -1e9
    take_idx = _mmr_pick(
        rel_take,
        sim,
        min(takeaway_k, max(0, n - len(forbidden2))),
        forbidden2,
        lam,
    )
    take_idx = sorted(set(take_idx))
    takeaway_sentences = [sentences[i] for i in take_idx if 0 <= i < n]
    takeaway_sentences = [s.strip() for s in takeaway_sentences if s.strip() and not is_poor_extractive_sentence(s)]

    cs = context_sentence.strip()
    if cs and is_poor_extractive_sentence(cs):
        cs = ""
    context_sentence = cs

    return {
        "summary": summary_text,
        "context_sentence": context_sentence,
        "takeaway_sentences": takeaway_sentences,
        "engine": engine,
        "sentence_count": n,
    }


def compose_post_fields(title: str, cleaned_body: str, settings: Dict[str, Any] | None = None) -> Dict[str, Any]:
    """
    Return summary, one context line for 'why', and takeaway sentences — all extractive.

    settings keys (optional):
      summary_sentences, takeaway_count, mmr_lambda, title_query_weight,
      min_words_per_sentence, max_doc_sentences, summary_max_chars,
      embedding_model: Hugging Face model id (e.g. sentence-transformers/all-MiniLM-L6-v2).
        When set and import succeeds, uses embedding MMR; otherwise TF–IDF.
    """
    cfg = settings or {}
    summary_k = int(cfg.get("summary_sentences", 3))
    takeaway_k = int(cfg.get("takeaway_count", 3))
    lam = float(cfg.get("mmr_lambda", 0.64))
    title_w = float(cfg.get("title_query_weight", 0.14))
    min_words = int(cfg.get("min_words_per_sentence", 5))
    max_sents = int(cfg.get("max_doc_sentences", 42))
    max_chars = int(cfg.get("summary_max_chars", 280))
    embedding_model = (cfg.get("embedding_model") or "").strip()

    raw_sents = _explode_sentences(sentence_split(cleaned_body))
    sentences: List[str] = []
    for s in raw_sents[:max_sents]:
        if len(re.findall(r"\w+", s)) >= min_words:
            sentences.append(s)

    title = (title or "").strip()

    if len(sentences) < 2:
        fallback = " ".join(raw_sents[:3]).strip() if raw_sents else ""
        return {
            "summary": _smart_truncate_paragraph(fallback, max_chars) if fallback else "",
            "context_sentence": "",
            "takeaway_sentences": [],
            "engine": "extractive-fallback",
            "sentence_count": len(sentences),
        }

    if embedding_model:
        try:
            rel, sim = _embedding_relevance_and_sim(sentences, title, title_w, embedding_model)
            return _run_mmr_stages(
                sentences,
                rel,
                sim,
                summary_k,
                takeaway_k,
                lam,
                max_chars,
                "embedding-mmr",
            )
        except Exception:  # noqa: BLE001 — fall back to TF–IDF if deps or model load fail
            pass

    vecs, idf = _tfidf_vectors(sentences)
    sim = _pairwise_sim(vecs)
    centroid = _weighted_centroid(vecs)
    title_vec = _title_query_vector(title, idf)
    query = _blend_query(centroid, title_vec, title_w)
    relevance = [_cosine(vecs[i], query) for i in range(len(sentences))]
    return _run_mmr_stages(
        sentences,
        relevance,
        sim,
        summary_k,
        takeaway_k,
        lam,
        max_chars,
        "tfidf-mmr",
    )


def _demo() -> None:
    body = (
        "Stripe once partnered with regional wallets to grow internationally. "
        "Airwallex built rails for cross-border payouts and SMB treasury. "
        "Now both chase the same enterprise deals in Asia Pacific, undercutting on fees and bundling fraud tools. "
        "Merchants report longer sales cycles as banks ask harder questions about vendor concentration."
    )
    out = compose_post_fields("Stripe and Airwallex compete for enterprise payments", body, {})
    print(out)


if __name__ == "__main__":
    _demo()
