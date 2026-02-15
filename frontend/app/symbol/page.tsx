'use client'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export default function SymbolPage() {
  const search = useSearchParams()
  const ticker = useMemo(() => search.get('ticker') || 'SHOP.TO', [search])
  const [chart, setChart] = useState<any>(null)
  const [ind, setInd] = useState<any>(null)
  const [news, setNews] = useState<any>(null)

  useEffect(() => {
    fetch(`${API}/api/symbol/${ticker}/chart`).then(r => r.json()).then(setChart)
    fetch(`${API}/api/symbol/${ticker}/indicators`).then(r => r.json()).then(setInd)
    fetch(`${API}/api/symbol/${ticker}/news`).then(r => r.json()).then(setNews)
  }, [ticker])

  return (
    <section className="page">
      <h2>{ticker} Detail</h2>
      <p>Not financial advice. Educational only.</p>
      <div className="card">
        <h3>Indicators</h3>
        <pre>{JSON.stringify(ind?.indicators, null, 2)}</pre>
      </div>
      <div className="card">
        <h3>Chart Preview (last 5 bars)</h3>
        <pre>{JSON.stringify(chart?.points?.slice(-5), null, 2)}</pre>
      </div>
      <div className="card">
        <h3>News Summary</h3>
        {news?.items?.map((n: any) => <p key={n.url}>[{n.tag}] {n.title}</p>)}
      </div>
    </section>
  )
}
