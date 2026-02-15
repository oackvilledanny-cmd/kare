'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export default function ScannerPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch(`${API}/api/scan?days=60&threshold=0.10`).then(r => r.json()).then(setData)
  }, [])

  return (
    <section className="page">
      <h2>Scanner Top10</h2>
      <p>Not financial advice. Educational only.</p>
      <table>
        <thead><tr><th>Ticker</th><th>Shock Days</th><th>Score</th><th>Reasons</th></tr></thead>
        <tbody>
          {data?.top10?.map((x: any) => (
            <tr key={x.ticker}>
              <td><Link href={`/symbol/${x.ticker}`}>{x.ticker}</Link></td>
              <td>{x.shock_days}</td>
              <td>{x.score}</td>
              <td>{x.reasons?.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
