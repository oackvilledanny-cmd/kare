import pandas as pd
import numpy as np
from fastapi.testclient import TestClient

from app.main import app
from app.api import routes


class FakeProvider:
    def universe(self):
        return ["AAA.TO"]

    def historical(self, ticker: str, period: str = "6mo", interval: str = "1d"):
        idx = pd.date_range("2024-01-01", periods=140)
        close = np.linspace(10, 16, 140)
        return pd.DataFrame(
            {
                "open": close,
                "high": close * 1.02,
                "low": close * 0.98,
                "close": close,
                "volume": np.linspace(200000, 250000, 140),
            },
            index=idx,
        )


def test_scan_to_weights_flow():
    routes.market = FakeProvider()
    c = TestClient(app)
    res = c.get("/api/scan")
    assert res.status_code == 200
    top = res.json()["top10"]
    assert top

    w = c.post(
        "/api/portfolio/weights",
        json={
            "tickers": ["AAA.TO"],
            "method": "equal",
            "profile": "neutral",
            "max_positions": 3,
            "max_weight_per_symbol": 1.0,
            "max_drawdown_limit": 0.2,
        },
    )
    assert w.status_code == 200
    assert w.json()["items"][0]["weight"] == 1.0
