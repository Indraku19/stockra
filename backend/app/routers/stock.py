from fastapi import APIRouter, HTTPException, Query
from app.services import stock_service, indicator_service, signal_service, news_service, finbert_service
from app.models.schemas import (
    StockInfo, HistoryResponse, IndicatorResponse,
    SignalResponse, SentimentResponse
)

router = APIRouter(prefix="/api/stock", tags=["stock"])


@router.get("/{ticker}", response_model=StockInfo)
def get_stock(ticker: str):
    ticker = _sanitize(ticker)
    try:
        return stock_service.get_stock_info(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{ticker}/history", response_model=HistoryResponse)
def get_history(ticker: str, period: str = Query("1mo")):
    ticker = _sanitize(ticker)
    try:
        data = stock_service.get_history(ticker, period)
        return HistoryResponse(ticker=ticker.upper(), period=period, data=data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{ticker}/indicators", response_model=IndicatorResponse)
def get_indicators(ticker: str, period: str = Query("3mo")):
    ticker = _sanitize(ticker)
    try:
        history = stock_service.get_history(ticker, period)
        return indicator_service.calculate_indicators(ticker, history)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{ticker}/signal", response_model=SignalResponse)
async def get_signal(ticker: str):
    ticker = _sanitize(ticker)
    try:
        history    = stock_service.get_history(ticker, "3mo")
        indicators = indicator_service.calculate_indicators(ticker, history)
        stock_info = stock_service.get_stock_info(ticker)

        # Ambil sentimen untuk kontribusi ke sinyal
        news  = await news_service.get_news(ticker, stock_info.name)
        _, sentiment_score = await finbert_service.analyze_news(news)

        return signal_service.generate_signal(
            ticker=ticker,
            rsi_values=indicators.rsi,
            macd_hist_values=indicators.macd_histogram,
            sentiment_score=sentiment_score,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{ticker}/sentiment", response_model=SentimentResponse)
async def get_sentiment(ticker: str):
    ticker = _sanitize(ticker)
    try:
        stock_info = stock_service.get_stock_info(ticker)
        news       = await news_service.get_news(ticker, stock_info.name)
        analyzed, overall_score = await finbert_service.analyze_news(news)

        if overall_score > 0.65:
            label = "positif"
        elif overall_score < 0.35:
            label = "negatif"
        else:
            label = "netral"

        return SentimentResponse(
            ticker=ticker.upper(),
            overall_score=overall_score,
            overall_label=label,
            news=analyzed,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


def _sanitize(ticker: str) -> str:
    """Hilangkan karakter berbahaya dari ticker input."""
    allowed = set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.")
    clean = "".join(c for c in ticker if c in allowed)
    if not clean:
        raise HTTPException(status_code=400, detail="Ticker tidak valid")
    return clean.upper()
