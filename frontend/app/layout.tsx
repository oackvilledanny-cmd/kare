import './globals.css'
import Link from 'next/link'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="nav">
          <h1>TSX Volatility Scanner</h1>
          <nav>
            <Link href="/login">Login</Link>
            <Link href="/scanner">Scanner</Link>
            <Link href="/portfolio">Portfolio</Link>
            <Link href="/backtest">Backtest</Link>
          </nav>
          <p className="disclaimer">Not financial advice. Educational purpose only.</p>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
