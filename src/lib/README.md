# src/lib/ — Shared Utilities

Server-side TypeScript modules used across the application. These are plain TypeScript (not React components).

## Files

| File | Purpose |
|------|---------|
| `currencies.ts` | Static currency definitions: code, name, symbol, flag emoji |
| `cache.ts` | Persistent file-based cache for exchange rate data |

## currencies.ts

Exports ~30 major world currencies with display metadata.

### Exports

```ts
interface Currency {
  code: string;       // "USD"
  name: string;       // "US Dollar"
  symbol: string;    // "$"
  flag: string;      // flag emoji
}

export const currencies: Currency[];
export const currencyMap: Map<string, Currency>;   // lookup by code
```

### Usage

- `CurrencySelector` renders dropdown options from the array
- `CurrencyConverter` / `MultiCurrencyView` use `currencyMap.get(code)` for symbols and flag icons
- Falls back to displaying raw code if a currency isn't in this list

## cache.ts

Persistent JSON-file cache for rate data. Survives server restarts, sits behind the in-memory cache layer.

### How it works

- Files live in `.cache/rates/<base_code>.json` (auto-created)
- Each entry stores: `rates` object, `base` currency, `timestamp`, and `source` string
- TTL: 1 hour. Expired entries return `null` from `getCached()`
- `cleanupStale()` deletes files older than TTL based on filesystem mtime (best-effort, silent failure)

### Exports

```ts
export function getCached(base: string): CacheEntry | null;
export function setCached(base: string, rates: Record<string, number>, source: string): void;
export function cleanupStale(): void;
```

### Usage

Called by `/api/rates/route.ts` before network requests. Checked first to avoid hitting external APIs when fresh data exists locally.
