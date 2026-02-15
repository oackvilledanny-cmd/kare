# TSX Short-Term Volatility Scanner (Google Cloud + Firebase)

Not financial advice. This project is for educational/informational use only.

## 1) Solution overview
This repository implements an end-to-end MVP for:
- TSX short-term volatility scanner (|daily return| >= 10% frequency)
- Technical indicator scoring (Bullish score 0~100)
- News list + summary tags (positive/negative/uncertain)
- Portfolio weight guidance under user risk constraints
- Sell guide (ATR-based stop/take-profit)
- Daily-bar backtest with simple entry/exit simulation

Architecture:
- `frontend/`: Next.js static export app deployed to Firebase Hosting
- `backend/`: FastAPI service deployed to Cloud Run
- `infra/`: deployment scripts
- `scripts/`: one-command deploy orchestration

## 2) Backend API
Base path: `/api`
- `GET /scan?days=60&threshold=0.10&min_volume=100000`
- `GET /symbol/{ticker}/chart`
- `GET /symbol/{ticker}/indicators`
- `GET /symbol/{ticker}/news`
- `GET /symbol/{ticker}/sell-guide?entry=100`
- `POST /portfolio/weights`
- `POST /backtest`

All responses include disclaimer text: **Not financial advice**.

## 3) Core logic
### Scanner
- Universe defaults to TSX symbols in config (`SHOP.TO`, `SU.TO`, etc.)
- Computes shock-day count in trailing window
- Filters by minimum average volume
- Produces candidate list then Top10 by score

### Indicators
- SMA/EMA(20/50), RSI(14), MACD(12,26,9), Bollinger(20,2), ATR(14), ADX(14)

### Bullish scoring
Weights are configurable in `backend/app/core/config.py`.
Current rules:
- EMA20 > EMA50
- RSI in 45~65 and rising
- MACD histogram cross above zero
- Close crossing above Bollinger midline
- Volume surge >=1.5x vs 20-day average
- ATR overheat penalty

### Portfolio guidance
Input risk settings:
- profile: conservative/neutral/aggressive
- max_positions
- max_weight_per_symbol
- max_drawdown_limit

Methods:
- risk parity (inverse volatility)
- equal
- score weighted

### Sell guide
- Stop loss = Entry - ATR * m (default 1.5)
- Take profit = Entry + ATR * n (default 3.0)
- Trailing stop note (EMA20 break)

### Backtest
- Entry when score >= threshold (default encoded in service)
- Exit by ATR-based stop or take
- Includes fee/slippage params
- Returns CAGR/Max DD and equity curve

## 4) Providers and secrets
- Market data provider abstraction in `backend/app/providers/base.py`
- Current MVP provider: `yfinance`
- News provider abstraction ready; default mock implementation
- Do not hardcode API keys. Use **Google Secret Manager + Cloud Run env vars** for paid providers.

## 5) Local run
### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
NEXT_PUBLIC_API_BASE=http://localhost:8000 npm run dev
```
Open `http://localhost:3000`.

## 6) Tests
```bash
cd backend
PYTHONPATH=. pytest -q
```
Includes:
- unit tests for indicators/scoring
- minimal e2e scan -> weights flow using FastAPI TestClient

## 7) Production deployment (Cloud Run + Firebase Hosting)
> You can deploy this as a service. The scripts below are the intended production path.

### Prerequisites
```bash
gcloud auth login
gcloud config set project <gcp-project>
gcloud auth application-default login
npm i -g firebase-tools
firebase login
```

### Backend to Cloud Run
```bash
PROJECT_ID=<gcp-project> REGION=northamerica-northeast1 ./infra/cloudrun_deploy.sh
```

### Frontend to Firebase Hosting (static export)
```bash
cd frontend
npm install
NEXT_PUBLIC_API_BASE=<cloud-run-url> npm run build
cd ..
firebase deploy --project <firebase-project> --only hosting
```

### One-command deploy
```bash
PROJECT_ID=<gcp-project> FIREBASE_PROJECT=<firebase-project> ./scripts/deploy_all.sh
```

## 8) Demo tickers
Suggested demo: `SHOP.TO`, `SU.TO`, `CVE.TO`.

## 9) Roadmap extensions
- TSXV universe ingestion automation
- Real news connectors (NewsAPI/GDELT/Finnhub/Polygon)
- Firestore persistence for backtest summaries, watchlists, user settings
- Cloud Scheduler trigger for daily scan cache refresh
