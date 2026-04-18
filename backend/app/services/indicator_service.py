import pandas as pd
import ta
from app.models.schemas import OHLCVItem, IndicatorResponse


def _none_list(series: pd.Series) -> list:
    """Convert pandas Series to list, replacing NaN with None."""
    return [None if pd.isna(v) else round(float(v), 4) for v in series]


def calculate_indicators(ticker: str, history: list[OHLCVItem]) -> IndicatorResponse:
    if len(history) < 2:
        raise ValueError("Data historis tidak cukup untuk menghitung indikator")

    df = pd.DataFrame([
        {"date": item.date, "close": item.close, "high": item.high,
         "low": item.low, "volume": item.volume}
        for item in history
    ])
    close = df["close"]
    high  = df["high"]
    low   = df["low"]

    # Moving Averages
    ma7  = ta.trend.sma_indicator(close, window=7)
    ma20 = ta.trend.sma_indicator(close, window=20)
    ma50 = ta.trend.sma_indicator(close, window=50)

    # RSI
    rsi = ta.momentum.rsi(close, window=14)

    # MACD
    macd_obj    = ta.trend.MACD(close, window_slow=26, window_fast=12, window_sign=9)
    macd_line   = macd_obj.macd()
    macd_signal = macd_obj.macd_signal()
    macd_hist   = macd_obj.macd_diff()

    # Bollinger Bands
    bb_obj    = ta.volatility.BollingerBands(close, window=20, window_dev=2)
    bb_upper  = bb_obj.bollinger_hband()
    bb_middle = bb_obj.bollinger_mavg()
    bb_lower  = bb_obj.bollinger_lband()

    return IndicatorResponse(
        ticker=ticker,
        dates=df["date"].tolist(),
        ma7=_none_list(ma7),
        ma20=_none_list(ma20),
        ma50=_none_list(ma50),
        rsi=_none_list(rsi),
        macd_line=_none_list(macd_line),
        macd_signal=_none_list(macd_signal),
        macd_histogram=_none_list(macd_hist),
        bb_upper=_none_list(bb_upper),
        bb_middle=_none_list(bb_middle),
        bb_lower=_none_list(bb_lower),
    )
