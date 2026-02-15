import pandas as pd
import numpy as np
from app.services.indicators import add_indicators


def test_add_indicators_has_columns():
    idx = pd.date_range("2024-01-01", periods=80)
    base = np.linspace(10, 20, 80)
    df = pd.DataFrame(
        {
            "open": base,
            "high": base * 1.01,
            "low": base * 0.99,
            "close": base,
            "volume": np.linspace(100000, 200000, 80),
        },
        index=idx,
    )
    out = add_indicators(df)
    for col in ["ema20", "ema50", "rsi14", "macd", "bb_mid", "atr14", "adx14"]:
        assert col in out.columns
