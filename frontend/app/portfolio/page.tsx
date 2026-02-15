'use client'
import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export default function PortfolioPage() {
  const [tickers, setTickers] = useState('SHOP.TO,SU.TO')
  const [items, setItems] = useState<any[]>([])

  const run = async () => {
    const res = await fetch(`${API}/api/portfolio/weights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tickers: tickers.split(',').map(s => s.trim()),
        method: 'risk_parity',
        profile: 'neutral',
        max_positions: 5,
        max_weight_per_symbol: 0.35,
        max_drawdown_limit: 0.2
      })
    })
    const data = await res.json()
    setItems(data.items || [])
  }

  return (
    <section className="page">
      <h2>Portfolio Builder</h2>
      <p>Not financial advice. Educational only.</p>
      <input value={tickers} onChange={e => setTickers(e.target.value)} style={{ width: 300 }} />
      <button onClick={run}>Compute Weights</button>
      {items.map(x => <div className="card" key={x.ticker}>{x.ticker}: {(x.weight * 100).toFixed(1)}%</div>)}
    </section>
  )
}
