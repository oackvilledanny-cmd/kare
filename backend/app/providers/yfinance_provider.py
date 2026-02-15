from __future__ import annotations
import yfinance as yf
import pandas as pd

from app.core.config import settings
from app.providers.base import MarketDataProvider


class YFinanceProvider(MarketDataProvider):
    def universe(self) -> list[str]:
        return settings.default_universe

    def historical(self, ticker: str, period: str = "6mo", interval: str = "1d") -> pd.DataFrame:
        df = yf.download(ticker, period=period, interval=interval, auto_adjust=False, progress=False)
        if df.empty:
            raise ValueError(f"No data for {ticker}")
        df = df.rename(columns={"Open": "open", "High": "high", "Low": "low", "Close": "close", "Volume": "volume"})
        return df[["open", "high", "low", "close", "volume"]]
