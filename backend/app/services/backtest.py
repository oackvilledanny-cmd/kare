from __future__ import annotations
import pandas as pd


def run_backtest(df: pd.DataFrame, atr_stop_mult: float, atr_take_mult: float, fee_bps: float, slippage_bps: float):
    cash = 1.0
    in_pos = False
    entry = stop = take = 0.0
    equity_curve = []
    trades = 0

    for idx, row in df.iterrows():
        price = row["close"]
        if not in_pos and row.get("score", 0) >= 40:
            entry = price * (1 + slippage_bps / 10000)
            stop = entry - row.get("atr14", 0) * atr_stop_mult
            take = entry + row.get("atr14", 0) * atr_take_mult
            in_pos = True
            trades += 1
        elif in_pos:
            exit_price = None
            if row["low"] <= stop:
                exit_price = stop
            elif row["high"] >= take:
                exit_price = take
            if exit_price is not None:
                gross = exit_price / entry
                net = gross * (1 - fee_bps / 10000)
                cash *= net
                in_pos = False
        equity_curve.append({"date": idx.isoformat(), "equity": cash})

    equity = pd.Series([p["equity"] for p in equity_curve])
    dd = (equity / equity.cummax() - 1).min() if len(equity) else 0
    cagr = (equity.iloc[-1] ** (252 / max(len(equity), 1)) - 1) if len(equity) else 0
    metrics = {
        "CAGR": float(cagr),
        "MaxDrawdown": float(dd),
        "WinRate": None,
    }
    return metrics, equity_curve, trades
