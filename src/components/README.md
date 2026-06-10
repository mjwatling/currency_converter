# src/components/ — React UI Components

Client-side `"use client"` React components that make up the Currency Converter interface.

## Component overview

| Component | Purpose |
|-----------|---------|
| `ConverterShell` | Parent wrapper: holds shared `fromCurrency` / `toCurrency` state, renders converter + chart together |
| `CurrencyConverter` | Main converter card: amount input, from/to selectors, swap button, result with rate info and timestamp |
| `CurrencySelector` | Searchable dropdown with flag icons, star toggle for favorites, scroll-to-load for large lists |
| `FavoritesBar` | Horizontal scrollable chips of favorited currencies; quick-select for current from/target currency |
| `HistoricalChart` | Recharts line chart showing exchange rate history (7 / 30 / 90-day toggle) |
| `MultiCurrencyView` | One base amount converted to up to 4 target currencies displayed side-by-side as cards |
| `AdBanner` | Google AdSense ad unit wrapper; placeholder when `NEXT_PUBLIC_ADSENSE_CLIENT_ID` not configured |

## ConverterShell

Lifts state so child components share context without prop drilling:

- Manages `from` and `to` currency via `useState`
- Passes them to `CurrencyConverter` as controlled props (`fromProp`, `toProp`, `onPairChange`)
- Passes them to `HistoricalChart` so the chart follows whatever pair the user selects

## CurrencyConverter

The core conversion component. In normal usage it fetches rates from `/api/rates?base=<currency>` when "from" changes. Supports controlled mode:

| Prop | Type | Description |
|------|------|-------------|
| `fromProp` | `string` | External "from" currency override (enables controlled mode) |
| `toProp` | `string` | External "to" currency override |
| `onPairChange` | `(from: string, to: string) => void` | Callback when user changes currencies |

Internal behavior: loading spinners, error state with retry button, swap without re-fetching (rebase math), `Intl.NumberFormat` for locale-aware formatting.

## CurrencySelector

Custom searchable dropdown replacing native `<select>`:

- Live filter by type-ahead search on code or name
- First 20 shown; "Load more" on scroll
- Flag emoji, symbol, code, and full name per option
- Star button toggles favorites in localStorage (shared `cx-favorites` key)
- Props: `value`, `onChange`, `currencies` (dynamic list from API response)

## FavoritesBar

Horizontal row of chips for favorited currencies. Reads/writes `cx-favorites` localStorage key via exported helpers `getFavorites()` / `saveFavorites()`. Used to quickly switch the current "from" or "to" currency.

**Props:** `currentFrom`, `currentTo`, `onSelectCurrency(code, target?)`

## HistoricalChart

Recharts-based interactive time-series chart:

- Fetches data from `/api/rates/historical?base=&target=&days=`
- Toggle buttons for 7 / 30 / 90-day ranges
- Shows rate change percentage and trend arrow at top
- `Loading`, `Error`, and fallback states built in

## MultiCurrencyView

Comparison dashboard: one base currency converted to multiple targets simultaneously. Features add/remove target rows (max 4), inline amount editing, and formatted result cards with flag icons.

## AdBanner

Wraps Google AdSense `<ins class="adsbygoogle">` elements. Takes `slot`, `format`, optional `className`. Renders a styled placeholder when no AdSense client ID is configured via `NEXT_PUBLIC_ADSENSE_CLIENT_ID`.
