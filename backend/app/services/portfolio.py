from __future__ import annotations
import numpy as np
import pandas as pd


def compute_weights(vol_map: dict[str, float], method: str, score_map: dict[str, float] | None = None) -> dict[str, float]:
    tickers = list(vol_map.keys())
    if method == "equal":
        return {t: 1 / len(tickers) for t in tickers}

    if method == "score_weighted" and score_map:
        total = sum(max(score_map.get(t, 0.0), 1e-9) for t in tickers)
        return {t: max(score_map.get(t, 0.0), 1e-9) / total for t in tickers}

    inv = {t: 1 / max(v, 1e-6) for t, v in vol_map.items()}
    total = sum(inv.values())
    return {t: v / total for t, v in inv.items()}


def clamp_weights(weights: dict[str, float], max_weight: float) -> dict[str, float]:
    clipped = {k: min(v, max_weight) for k, v in weights.items()}
    remainder = 1 - sum(clipped.values())
    if remainder > 0:
        eligible = [k for k, v in clipped.items() if v < max_weight]
        if eligible:
            add = remainder / len(eligible)
            for k in eligible:
                clipped[k] = min(max_weight, clipped[k] + add)
    total = sum(clipped.values())
    return {k: v / total for k, v in clipped.items()}


def annualized_vol(close: pd.Series) -> float:
    ret = close.pct_change().dropna()
    return float(ret.std() * np.sqrt(252)) if len(ret) else 0.0
