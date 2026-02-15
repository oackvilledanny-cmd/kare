from __future__ import annotations
import numpy as np
import pandas as pd


def add_indicators(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["ret"] = out["close"].pct_change()
    out["sma20"] = out["close"].rolling(20).mean()
    out["ema20"] = out["close"].ewm(span=20, adjust=False).mean()
    out["ema50"] = out["close"].ewm(span=50, adjust=False).mean()

    delta = out["close"].diff()
    gain = np.where(delta > 0, delta, 0)
    loss = np.where(delta < 0, -delta, 0)
    avg_gain = pd.Series(gain, index=out.index).rolling(14).mean()
    avg_loss = pd.Series(loss, index=out.index).rolling(14).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    out["rsi14"] = 100 - (100 / (1 + rs))

    out["macd"] = out["close"].ewm(span=12, adjust=False).mean() - out["close"].ewm(span=26, adjust=False).mean()
    out["macd_signal"] = out["macd"].ewm(span=9, adjust=False).mean()
    out["macd_hist"] = out["macd"] - out["macd_signal"]

    out["bb_mid"] = out["close"].rolling(20).mean()
    std20 = out["close"].rolling(20).std()
    out["bb_upper"] = out["bb_mid"] + 2 * std20
    out["bb_lower"] = out["bb_mid"] - 2 * std20

    tr = pd.concat(
        [
            out["high"] - out["low"],
            (out["high"] - out["close"].shift(1)).abs(),
            (out["low"] - out["close"].shift(1)).abs(),
        ],
        axis=1,
    ).max(axis=1)
    out["atr14"] = tr.rolling(14).mean()

    plus_dm = out["high"].diff().clip(lower=0)
    minus_dm = (-out["low"].diff()).clip(lower=0)
    plus_di = 100 * (plus_dm.rolling(14).mean() / out["atr14"])
    minus_di = 100 * (minus_dm.rolling(14).mean() / out["atr14"])
    dx = ((plus_di - minus_di).abs() / (plus_di + minus_di).replace(0, np.nan)) * 100
    out["adx14"] = dx.rolling(14).mean()

    out["vol_ma20"] = out["volume"].rolling(20).mean()
    return out
