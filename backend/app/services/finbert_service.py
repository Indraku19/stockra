import httpx
import os
import time
from app.models.schemas import NewsItem

HF_MODEL  = "ProsusAI/finbert"
HF_URL    = f"https://api-inference.huggingface.co/models/{HF_MODEL}"
CACHE_TTL = 1800  # 30 menit
_cache: dict = {}


async def analyze_news(news_items: list[NewsItem]) -> tuple[list[NewsItem], float]:
    """
    Analisis sentimen setiap berita menggunakan FinBERT.
    Returns: (news_items dengan sentiment terisi, overall_score 0–1)
    """
    if not news_items:
        return [], 0.5

    api_key = os.getenv("HUGGINGFACE_API_KEY", "")
    titles  = [item.title for item in news_items]

    scored = await _query_finbert(titles, api_key)

    for i, item in enumerate(news_items):
        if i < len(scored):
            label, score = scored[i]
            item.sentiment = label
            item.score     = score
        else:
            item.sentiment = "netral"
            item.score     = 0.5

    # Hitung overall: positif=1, netral=0.5, negatif=0
    scores = [item.score for item in news_items]
    overall = sum(scores) / len(scores) if scores else 0.5

    return news_items, round(overall, 3)


async def _query_finbert(texts: list[str], api_key: str) -> list[tuple[str, float]]:
    """Query Hugging Face Inference API. Fallback ke netral jika gagal."""
    if not api_key:
        return [("netral", 0.5)] * len(texts)

    cache_key = str(sorted(texts))
    if cache_key in _cache:
        data, ts = _cache[cache_key]
        if time.time() - ts < CACHE_TTL:
            return data

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                HF_URL,
                headers={"Authorization": f"Bearer {api_key}"},
                json={"inputs": texts},
            )
            if resp.status_code == 503:
                # Model masih loading
                return [("netral", 0.5)] * len(texts)
            resp.raise_for_status()
            raw = resp.json()

        result = []
        for item_scores in raw:
            # FinBERT mengembalikan: [{"label":"positive","score":0.9}, ...]
            best = max(item_scores, key=lambda x: x["score"])
            label_map = {"positive": "positif", "negative": "negatif", "neutral": "netral"}
            label = label_map.get(best["label"].lower(), "netral")
            # Normalisasi: positif → score mendekati 1, negatif → mendekati 0
            if label == "positif":
                score = round(0.5 + best["score"] * 0.5, 3)
            elif label == "negatif":
                score = round(0.5 - best["score"] * 0.5, 3)
            else:
                score = 0.5
            result.append((label, score))

        _cache[cache_key] = (result, time.time())
        return result

    except Exception:
        return [("netral", 0.5)] * len(texts)
