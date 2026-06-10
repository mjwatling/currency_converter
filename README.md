# Currency Converter

Real-time currency conversion app with a Next.js 16 web frontend and a native macOS SwiftUI desktop companion. Both share the same data source: ExchangeRate-API (v6) with a free-tier fallback to `open.er-api.com`.

## Project layout

```
currency_converter/
├── .env.local.example              # Environment variable template
├── .gitignore                      # Git ignore rules (Node + Swift)
├── CLAUDE.md                       # AI-assisted development guide
├── README.md                       # This file
│
├── CurrencyConverterApp/           # macOS desktop app (SwiftUI)
│   ├── CurrencyConverterApp/       # App entry point, views, assets
│   └── Models/                     # Data models & API client
│
├── public/                         # Static assets served by Next.js
│
└── src/                            # Next.js web app source
    ├── app/                        # App Router: pages, layout, CSS, API routes
    │   ├── api/rates/              # Current rates endpoint (with file cache + rate limit)
    │   └── api/rates/historical/   # Historical rates endpoint (for charts)
    ├── components/                 # React UI components (client-side)
    └── lib/                        # Shared data & utility modules
```

## Quick start — web app

```bash
npm install
cp .env.local.example .env.local     # optional: add API key
npm run dev                          # → http://localhost:3000
```

Other commands:

| Command | Description |
|---------|-------------|
| `npm run build` | Production build (.next/) |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint |

## Quick start — macOS app

```bash
open CurrencyConverterApp.xcodeproj   # open in Xcode, then Cmd+R
# or
cd CurrencyConverterApp && swift build -c release
```

## Environment variables

Copy `.env.local.example` to `.env.local`:

| Variable | Required | Description |
|----------|----------|-------------|
| `EXCHANGE_RATE_API_KEY` | No | ExchangeRate-API v6 key (free tier works without it) |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | No | Google AdSense client ID (`ca-pub-XXXXXXXXXXXXXXXX`) |

## Features

- Real-time conversion between 30+ currencies with live rate display
- Historical rate charts (7 / 30 / 90-day range) via Recharts
- Favorite currencies persisted in localStorage with quick-select bar
- Multi-currency comparison view (1 base → up to 4 targets)
- Rate limiting, file-based cache fallback on API failure
- Light/dark theme following system preference
- Google AdSense integration (placeholder when no client ID configured)

## Tech stack

- **Web:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Recharts
- **Desktop:** Swift 5, SwiftUI, Combine, URLSession
- **API:** ExchangeRate-API (v6), free fallback to open.er-api.com
- **Cache:** In-memory (1h TTL) + persistent JSON file cache in `.cache/rates/`

## Directory READMEs

Each subdirectory has its own `README.md` with details on files, exports, and usage:

- [`src/`](src/README.md) — Web app source overview
- [`src/app/`](src/app/README.md) — Pages, layout, global styles
- [`src/app/api/`](src/app/api/README.md) — API route index
- [`src/app/api/rates/`](src/app/api/rates/README.md) — Current rates endpoint
- [`src/components/`](src/components/README.md) — React UI components
- [`src/lib/`](src/lib/README.md) — Shared utilities (currencies, cache)
- [`CurrencyConverterApp/`](CurrencyConverterApp/README.md) — macOS desktop app
