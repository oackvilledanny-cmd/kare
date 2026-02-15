from app.services.scoring import bullish_score


def test_bullish_score_positive_case():
    prev = {"rsi14": 50, "macd_hist": -0.1, "close": 9, "bb_mid": 10}
    latest = {
        "ema20": 11,
        "ema50": 10,
        "rsi14": 55,
        "macd_hist": 0.2,
        "close": 11,
        "bb_mid": 10,
        "volume": 200,
        "vol_ma20": 100,
        "atr14": 0.4,
    }
    score, reasons = bullish_score(latest, prev)
    assert score > 0
    assert reasons
