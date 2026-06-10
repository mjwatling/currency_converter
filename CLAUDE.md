# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

- `npm run dev` — Start development server (Turbopack, http://localhost:3000)
- `npm run build` — Production build
- `npm run start` — Serve production build
- `npm run lint` — Run ESLint (also runs in CI via `.github/workflows/lint.yml` on push/PR to `main`)

## Architecture

Next.js 16 app using App Router, TypeScript, and Tailwind CSS v4. A native macOS SwiftUI companion app is referenced in the README (`CurrencyConverterApp/`) but does not exist in this repo yet.

### Page composition

`src/app/page.tsx` (server component) renders the static page chrome (header, features section, footer, ad placements) and embeds `ConverterShell`.

`src/components/ConverterShell.tsx` (client) lifts shared `from`/`to` currency state and renders `CurrencyConverter` + `HistoricalChart` together so the chart follows whatever pair the user selects.

### Components (`src/components/`)

- `CurrencyConverter` — main converter card (amount input, selectors, swap, rate display). Supports controlled mode via `fromProp`/`toProp`/`onPairChange` (used by `ConverterShell`); fetches `/api/rates?base=<currency>`.
- `CurrencySelector` — searchable currency dropdown with flags, favorites star, scroll-to-load.
- `HistoricalChart` — Recharts line chart, fetches `/api/rates/historical?base=&target=&days=` with 7/30/90-day toggles.
- `AdBanner` — Google AdSense wrapper; renders a placeholder when `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is unset.
- `FavoritesBar`, `MultiCurrencyView`, `RateChart` — exist but are **not currently wired into `page.tsx`/`ConverterShell`**; check before assuming they're live.

### API routes (`src/app/api/`)

- `GET /api/rates?base=&skipCache=&maxAge=` — current rates. Flow: `rateLimit.ts` (30 req/min/IP sliding window) → `lib/cache.ts` file cache (`.cache/rates/<base>.json`, 1h TTL) → in-memory cache → external API. Falls back to stale cache on upstream failure.
- `GET /api/rates/historical?base=&target=&days=` — historical series for charts, separate in-memory cache keyed by `base-target-days`.
- Both proxy `v6.exchangerate-api.com` (if `EXCHANGE_RATE_API_KEY` is set) with fallback to free `open.er-api.com`.

### `src/lib/`

- `currencies.ts` — static list of ~30 currencies (`code`, `name`, `symbol`, `flag`) plus `currencyMap` lookup.
- `cache.ts` — persistent JSON file cache (`getCached`, `setCached`, `cleanupStale`); also accumulates a rolling history of up to 30 rate snapshots per base currency.

### Theming

CSS custom properties in `globals.css` drive light/dark mode via `prefers-color-scheme`. Components use inline `style={{ ... }}` with these variables (e.g. `var(--card-bg)`, `var(--primary)`) rather than Tailwind color utility classes, for consistent cross-mode theming.

### Environment Variables

- `EXCHANGE_RATE_API_KEY` — Optional ExchangeRate-API v6 key (free tier works without it)
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID` — Google AdSense client ID (`ca-pub-XXXXXXXXXXXXXXXX`)

See `.env.local.example` for reference.

## Directory READMEs

Each subdirectory has its own `README.md` with deeper detail: `src/`, `src/app/`, `src/app/api/`, `src/app/api/rates/`, `src/components/`, `src/lib/`, `public/`.
