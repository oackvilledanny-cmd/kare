from __future__ import annotations
from fastapi import APIRouter, HTTPException
import pandas as pd

from app.models.schemas import (
    BacktestRequest,
    BacktestResponse,
    ChartResponse,
    IndicatorResponse,
    NewsResponse,
    ScanCandidate,
    ScanResponse,
    SellGuideResponse,
    WeightItem,
    WeightRequest,
    WeightResponse,
)
from app.providers.news_provider import MockNewsProvider
from app.providers.yfinance_provider import YFinanceProvider
from app.services.indicators import add_indicators
from app.services.scoring import bullish_score
from app.services.portfolio import annualized_vol, clamp_weights, compute_weights
from app.services.backtest import run_backtest

router = APIRouter(prefix="/api")
market = YFinanceProvider()
news_provider = MockNewsProvider()


def _load(ticker: str, period: str = "6mo") -> pd.DataFrame:
    df = market.historical(ticker, period=period)
    return add_indicators(df).dropna()


@router.get("/scan", response_model=ScanResponse)
def scan(days: int = 60, threshold: float = 0.10, min_volume: int = 100000):
    candidates: list[ScanCandidate] = []
    for t in market.universe():
        try:
            df = _load(t)
        except Exception:
            continue
        tail = df.tail(days)
        shock_days = int((tail["ret"].abs() >= threshold).sum())
        if tail["volume"].mean() < min_volume:
            continue
        latest, prev = tail.iloc[-1].to_dict(), tail.iloc[-2].to_dict()
        score, reasons = bullish_score(latest, prev)
        candidates.append(ScanCandidate(ticker=t, shock_days=shock_days, score=score, reasons=reasons))

    candidates.sort(key=lambda x: (x.shock_days, x.score), reverse=True)
    top10 = sorted(candidates[:50], key=lambda x: x.score, reverse=True)[:10]
    return ScanResponse(days=days, threshold=threshold, candidates=candidates[:50], top10=top10)


@router.get("/symbol/{ticker}/chart", response_model=ChartResponse)
def chart(ticker: str):
    df = _load(ticker)
    pts = []
    for idx, row in df.tail(126).iterrows():
        pts.append({"date": idx.to_pydatetime(), **row.to_dict()})
    return ChartResponse(ticker=ticker, points=pts)


@router.get("/symbol/{ticker}/indicators", response_model=IndicatorResponse)
def indicators(ticker: str):
    df = _load(ticker)
    latest, prev = df.iloc[-1].to_dict(), df.iloc[-2].to_dict()
    score, reasons = bullish_score(latest, prev)
    keys = ["sma20", "ema20", "ema50", "rsi14", "macd", "macd_signal", "macd_hist", "bb_upper", "bb_mid", "bb_lower", "atr14", "adx14"]
    return IndicatorResponse(ticker=ticker, score=score, reasons=reasons, indicators={k: latest.get(k) for k in keys})


@router.get("/symbol/{ticker}/news", response_model=NewsResponse)
def news(ticker: str, days: int = 10):
    return NewsResponse(ticker=ticker, items=news_provider.latest(ticker, days=days))


@router.post("/portfolio/weights", response_model=WeightResponse)
def weights(payload: WeightRequest):
    if len(payload.tickers) > payload.max_positions:
        raise HTTPException(400, "Selected tickers exceed max positions")

    vol_map = {}
    for t in payload.tickers:
        df = _load(t)
        vol_map[t] = annualized_vol(df["close"])
    raw = compute_weights(vol_map, payload.method)
    final = clamp_weights(raw, payload.max_weight_per_symbol)
    items = [
        WeightItem(
            ticker=t,
            weight=w,
            expected_volatility=vol_map[t],
            risk_note=f"{payload.profile} profile capped at {payload.max_weight_per_symbol:.0%} per symbol.",
        )
        for t, w in final.items()
    ]
    return WeightResponse(items=items)


@router.post("/backtest", response_model=BacktestResponse)
def backtest(payload: BacktestRequest):
    ticker = payload.tickers[0]
    df = _load(ticker, period="5y")
    latest_score = []
    for i in range(1, len(df)):
        sc, _ = bullish_score(df.iloc[i].to_dict(), df.iloc[i - 1].to_dict())
        latest_score.append(sc)
    df = df.iloc[1:].copy()
    df["score"] = latest_score
    metrics, curve, trades = run_backtest(df, payload.atr_stop_mult, payload.atr_take_mult, payload.fee_bps, payload.slippage_bps)
    return BacktestResponse(metrics=metrics, equity_curve=curve, trades=trades)


@router.get("/symbol/{ticker}/sell-guide", response_model=SellGuideResponse)
def sell_guide(ticker: str, entry: float):
    df = _load(ticker)
    atr = float(df.iloc[-1]["atr14"])
    stop = entry - atr * 1.5
    take = entry + atr * 3.0
    return SellGuideResponse(ticker=ticker, entry=entry, stop_loss=stop, take_profit=take, trail_rule="Consider trailing stop on EMA20 break")
