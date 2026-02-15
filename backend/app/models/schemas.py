from datetime import datetime
from pydantic import BaseModel, Field
from app.core.config import DISCLAIMER


class APIResponse(BaseModel):
    disclaimer: str = DISCLAIMER


class ScanCandidate(BaseModel):
    ticker: str
    shock_days: int
    score: float
    reasons: list[str]


class ScanResponse(APIResponse):
    days: int
    threshold: float
    candidates: list[ScanCandidate]
    top10: list[ScanCandidate]


class IndicatorResponse(APIResponse):
    ticker: str
    score: float
    reasons: list[str]
    indicators: dict


class ChartPoint(BaseModel):
    date: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float
    ema20: float | None
    ema50: float | None
    bb_upper: float | None
    bb_mid: float | None
    bb_lower: float | None
    rsi14: float | None
    macd: float | None
    macd_signal: float | None
    macd_hist: float | None


class ChartResponse(APIResponse):
    ticker: str
    points: list[ChartPoint]


class NewsItem(BaseModel):
    source: str
    title: str
    url: str
    published_at: datetime
    summary: str
    tag: str = Field(pattern="^(positive|negative|uncertain)$")


class NewsResponse(APIResponse):
    ticker: str
    items: list[NewsItem]


class WeightRequest(BaseModel):
    tickers: list[str]
    method: str = Field(default="risk_parity", pattern="^(risk_parity|equal|score_weighted)$")
    profile: str = Field(default="neutral", pattern="^(conservative|neutral|aggressive)$")
    max_positions: int = 5
    max_weight_per_symbol: float = 0.25
    max_drawdown_limit: float = 0.2


class WeightItem(BaseModel):
    ticker: str
    weight: float
    expected_volatility: float
    risk_note: str


class WeightResponse(APIResponse):
    items: list[WeightItem]


class BacktestRequest(BaseModel):
    tickers: list[str]
    start: str
    end: str
    initial_cash: float = 10000
    fee_bps: float = 10
    slippage_bps: float = 5
    atr_stop_mult: float = 1.5
    atr_take_mult: float = 3.0


class BacktestResponse(APIResponse):
    metrics: dict
    equity_curve: list[dict]
    trades: int


class SellGuideResponse(APIResponse):
    ticker: str
    entry: float
    stop_loss: float
    take_profit: float
    trail_rule: str
