import yfinance as yf
import time
from app.models.schemas import StockInfo, OHLCVItem

# Simple in-memory cache: { key: (data, timestamp) }
_cache: dict = {}
CACHE_TTL = 300  # 5 menit


def _get_cache(key: str):
    if key in _cache:
        data, ts = _cache[key]
        if time.time() - ts < CACHE_TTL:
            return data
    return None


def _set_cache(key: str, data):
    _cache[key] = (data, time.time())


def get_stock_info(ticker: str) -> StockInfo:
    key = f"info:{ticker}"
    cached = _get_cache(key)
    if cached:
        return cached

    try:
        tk = yf.Ticker(ticker)
        info = tk.info

        # Validasi: ticker tidak ditemukan jika tidak ada regularMarketPrice
        price = info.get("regularMarketPrice") or info.get("currentPrice") or info.get("previousClose")
        if not price:
            raise ValueError(f"Ticker '{ticker}' tidak ditemukan")

        result = StockInfo(
            ticker=ticker.upper(),
            name=info.get("longName") or info.get("shortName") or ticker,
            price=round(float(price), 2),
            change=round(float(info.get("regularMarketChange", 0)), 2),
            change_pct=round(float(info.get("regularMarketChangePercent", 0)), 2),
            volume=int(info.get("regularMarketVolume", 0)),
            market_cap=info.get("marketCap"),
            pe_ratio=info.get("trailingPE") or info.get("forwardPE"),
            currency=info.get("currency", "IDR"),
        )
        _set_cache(key, result)
        return result

    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Gagal mengambil data untuk '{ticker}': {str(e)}")


def get_history(ticker: str, period: str = "1mo") -> list[OHLCVItem]:
    valid_periods = {"1wk", "1mo", "3mo", "1y"}
    if period not in valid_periods:
        raise ValueError(f"Period '{period}' tidak valid. Pilih: {valid_periods}")

    key = f"history:{ticker}:{period}"
    cached = _get_cache(key)
    if cached:
        return cached

    try:
        tk = yf.Ticker(ticker)
        df = tk.history(period=period)

        if df.empty:
            raise ValueError(f"Tidak ada data historis untuk '{ticker}'")

        result = []
        for date, row in df.iterrows():
            result.append(OHLCVItem(
                date=date.strftime("%Y-%m-%d"),
                open=round(float(row["Open"]), 2),
                high=round(float(row["High"]), 2),
                low=round(float(row["Low"]), 2),
                close=round(float(row["Close"]), 2),
                volume=int(row["Volume"]),
            ))

        _set_cache(key, result)
        return result

    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Gagal mengambil histori '{ticker}': {str(e)}")
