# TraderAssistant - Gold & Silver Trading Dashboard

A professional, interactive web application for commodity traders specializing in gold (XAU/USD) and silver (XAG/USD). Built on a proven template from a trader with 20 years of experience, designed to maximize trading performance (1-2% weekly returns) with minimal risk.

## Features

### Dashboard
- Real-time price ticker for Gold, Silver, and DXY
- Key metrics widgets (weekly targets, risk limits, correlations)
- Live TradingView charts for XAU/USD and XAG/USD
- Watchlist, news feed, and performance overview
- Position size calculator with ATR-based stop loss
- Trading psychology reminders

### Weekly Analysis (Fundamentals)
- **Economic Calendar** — Interactive calendar with high-impact event filtering and notes
- **Macro Trends** — CME FedWatch integration, DXY analysis, supply/demand charts
- **Sentiment & Positioning** — CFTC COT report charts for gold and silver
- **Risk Assessment** — Portfolio exposure limits and weekly plan builder
- **Journal & Prep** — Weekly preparation notes with PDF export

### Daily Trading (Technical Analysis)
- **Market Open Review** — News scanner, correlation dashboard, volatility gauge
- **Technical Charts** — Multi-timeframe TradingView charts with indicator controls
- **Trade Setup** — Entry/target/stop forms with auto risk-reward calculation
- **Mid-Day Check** — Real-time position monitor with alert settings
- **End-of-Day Review** — Trade logging, mood tracking, lessons learned

### Risk Management Tools
- Position size calculator (1% risk rule)
- ATR-based stop loss calculator with multiplier slider
- Portfolio diversification simulator (Monte Carlo)
- Quick reference tables for different account sizes

### Analytics
- Win rate, profit factor, Sharpe ratio tracking
- Weekly returns vs target charts
- Monthly performance review with drawdown analysis
- Complete trade history with filtering

### Additional
- Dark/light mode toggle
- Responsive design (desktop and mobile)
- PWA support for offline access
- Demo mode with sample data
- Journal with tagging and search
- Local storage persistence (Zustand)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, Material UI 7 |
| State | Zustand with localStorage persistence |
| Charts | Recharts, TradingView widget embeds |
| Backend | Node.js, Express 5 |
| Styling | Material UI (dark/light themes) |
| PWA | vite-plugin-pwa, Workbox |
| Fonts | Inter, JetBrains Mono |

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000` with demo/mock data by default.

### Backend (Optional)

```bash
cd backend
npm install
npm start
```

API runs at `http://localhost:4000`. Set `VITE_API_URL=http://localhost:4000` in frontend `.env` to connect.

### Production Build

```bash
cd frontend
npm run build
npm run preview
```

## Project Structure

```
TraderAssistant/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Reusable components
│   │   │   └── layout/        # App layout, navigation
│   │   ├── context/           # Zustand store, MUI themes
│   │   ├── pages/             # Route pages
│   │   ├── services/          # API client, mock data
│   │   └── utils/             # Constants, helpers
│   ├── index.html
│   └── vite.config.js
├── backend/
│   └── src/
│       ├── routes/            # Express route handlers
│       ├── services/          # Mock data generators
│       └── server.js          # Express app entry
└── README.md
```

## Risk Parameters

| Parameter | Value |
|-----------|-------|
| Max risk per trade | 1% of account |
| Max portfolio risk | 2% total |
| Max drawdown per trade | 5% |
| Target weekly return | 1-2% |
| Min risk:reward | 1:2 |
| Gold/Silver correlation | ~0.8 |
| Silver beta vs Gold | ~1.5x |
| Target Sharpe ratio | >1.5 |

## API Integration Points

The app supports these data sources (currently using mock data):
- **TradingView** — Chart widgets (embedded)
- **Forex Factory** — Economic calendar events
- **CFTC** — COT positioning reports
- **CME FedWatch** — Rate probability data
- **Reuters/Bloomberg/Kitco** — News feeds
- **Alpha Vantage / CoinGecko** — Price data

Set API keys in `.env` files to enable live data.

## Disclaimer

This tool is for **educational purposes only**. Trading involves substantial risk of loss. Past performance does not guarantee future results. Consult a qualified financial advisor before making investment decisions.
