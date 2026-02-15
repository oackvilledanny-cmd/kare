from abc import ABC, abstractmethod
import pandas as pd


class MarketDataProvider(ABC):
    @abstractmethod
    def universe(self) -> list[str]:
        raise NotImplementedError

    @abstractmethod
    def historical(self, ticker: str, period: str = "6mo", interval: str = "1d") -> pd.DataFrame:
        raise NotImplementedError


class NewsProvider(ABC):
    @abstractmethod
    def latest(self, ticker: str, days: int = 7) -> list[dict]:
        raise NotImplementedError
