'use client'
import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export default function BacktestPage() {
  const [ticker, setTicker] = useState('SHOP.TO')
  const [result, setResult] = useState<any>(null)

  const run = async () => {
    const res = await fetch(`${API}/api/backtest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickers: [ticker], start: '2021-01-01', end: '2025-01-01' })
    })
    setResult(await res.json())
  }

  return (
    <section className="page">
      <h2>Backtest</h2>
      <p>Not financial advice. Educational only.</p>
      <input value={ticker} onChange={e => setTicker(e.target.value)} />
      <button onClick={run}>Run Backtest</button>
      <div className="card">
        <h3>Metrics</h3>
        <pre>{JSON.stringify(result?.metrics, null, 2)}</pre>
      </div>
    </section>
  )
}
