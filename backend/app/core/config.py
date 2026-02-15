from pydantic import BaseModel, Field


DISCLAIMER = "Not financial advice. For educational and informational use only."


class ScanWeights(BaseModel):
    ema_trend: int = 20
    rsi_strength: int = 15
    macd_cross: int = 15
    bb_mid_break: int = 10
    volume_surge: int = 10
    atr_overheat_penalty: int = -10


class RiskProfileSettings(BaseModel):
    profile: str = Field(default="neutral", pattern="^(conservative|neutral|aggressive)$")
    max_positions: int = 5
    max_weight_per_symbol: float = 0.25
    max_drawdown_limit: float = 0.2


class Settings(BaseModel):
    default_universe: list[str] = [
        "SHOP.TO",
        "SU.TO",
        "CNQ.TO",
        "ENB.TO",
        "BNS.TO",
        "TRP.TO",
        "CVE.TO",
        "AC.TO",
        "WEED.TO",
        "LSPD.TO",
    ]
    weights: ScanWeights = ScanWeights()


settings = Settings()
