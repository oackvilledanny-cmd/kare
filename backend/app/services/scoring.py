from __future__ import annotations
from app.core.config import settings


def bullish_score(latest: dict, prev: dict) -> tuple[float, list[str]]:
    w = settings.weights
    score = 0
    reasons: list[str] = []

    if latest.get("ema20", 0) > latest.get("ema50", 0):
        score += w.ema_trend
        reasons.append("EMA20 > EMA50 uptrend")
    if 45 <= latest.get("rsi14", 0) <= 65 and latest.get("rsi14", 0) > prev.get("rsi14", 0):
        score += w.rsi_strength
        reasons.append("RSI in constructive range and rising")
    if prev.get("macd_hist", -1) <= 0 < latest.get("macd_hist", -1):
        score += w.macd_cross
        reasons.append("MACD histogram crossed above 0")
    if prev.get("close", 0) <= prev.get("bb_mid", 0) and latest.get("close", 0) > latest.get("bb_mid", 0):
        score += w.bb_mid_break
        reasons.append("Price crossed above Bollinger midline")
    if latest.get("volume", 0) >= 1.5 * latest.get("vol_ma20", 1):
        score += w.volume_surge
        reasons.append("Volume surge above 1.5x 20-day average")
    atr_pct = latest.get("atr14", 0) / max(latest.get("close", 1), 1e-9)
    if atr_pct > 0.08:
        score += w.atr_overheat_penalty
        reasons.append("ATR volatility overheating penalty")

    return max(0, min(100, score)), reasons
