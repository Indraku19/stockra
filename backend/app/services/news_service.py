import httpx
import os
import time
from app.models.schemas import NewsItem

_cache: dict = {}
CACHE_TTL = 1800  # 30 menit


async def get_news(ticker: str, company_name: str) -> list[NewsItem]:
    key = f"news:{ticker}"
    if key in _cache:
        data, ts = _cache[key]
        if time.time() - ts < CACHE_TTL:
            return data

    api_key = os.getenv("NEWSAPI_KEY", "")
    if not api_key:
        return []

    # Buat query dari ticker dan nama perusahaan
    query = f"{ticker.replace('.JK', '')} OR \"{company_name}\""

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                "https://newsapi.org/v2/everything",
                params={
                    "q":        query,
                    "language": "en",
                    "sortBy":   "publishedAt",
                    "pageSize": 10,
                    "apiKey":   api_key,
                },
            )
            resp.raise_for_status()
            articles = resp.json().get("articles", [])

        result = []
        for art in articles[:10]:
            title = art.get("title", "") or ""
            if not title or title == "[Removed]":
                continue
            result.append(NewsItem(
                title=title,
                source=art.get("source", {}).get("name", "Unknown"),
                published_at=art.get("publishedAt", ""),
                url=art.get("url", ""),
                sentiment="netral",  # akan diisi oleh finbert_service
                score=0.5,
            ))

        _cache[key] = (result, time.time())
        return result

    except Exception:
        return []
