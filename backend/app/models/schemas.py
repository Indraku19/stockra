from pydantic import BaseModel
from typing import Optional


class StockInfo(BaseModel):
    ticker: str
    name: str
    price: float
    change: float
    change_pct: float
    volume: int
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    currency: str = "IDR"


class OHLCVItem(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class HistoryResponse(BaseModel):
    ticker: str
    period: str
    data: list[OHLCVItem]


class IndicatorResponse(BaseModel):
    ticker: str
    dates: list[str]
    ma7: list[Optional[float]]
    ma20: list[Optional[float]]
    ma50: list[Optional[float]]
    rsi: list[Optional[float]]
    macd_line: list[Optional[float]]
    macd_signal: list[Optional[float]]
    macd_histogram: list[Optional[float]]
    bb_upper: list[Optional[float]]
    bb_middle: list[Optional[float]]
    bb_lower: list[Optional[float]]


class SignalFactor(BaseModel):
    value: str
    contribution: str  # "positif" | "netral" | "negatif"
    note: str


class SignalResponse(BaseModel):
    ticker: str
    signal: str          # "BELI" | "TAHAN" | "JUAL"
    confidence: int      # 0–100
    factors: dict[str, SignalFactor]
    summary: str


class NewsItem(BaseModel):
    title: str
    source: str
    published_at: str
    url: str
    sentiment: str       # "positif" | "netral" | "negatif"
    score: float         # 0–1


class SentimentResponse(BaseModel):
    ticker: str
    overall_score: float  # 0–1
    overall_label: str    # "positif" | "netral" | "negatif"
    news: list[NewsItem]


class ErrorResponse(BaseModel):
    error: str
