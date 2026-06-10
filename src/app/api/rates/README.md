# api/rates/ — Current Exchange Rates Endpoint

Server-side route that fetches, caches, and returns real-time exchange rates.

## Endpoint

```
GET /api/rates?base=<currency-code>&skipCache=false&maxAge=3600000
```

## Request parameters

| Param | Required | Type | Description | Default |
|-------|----------|------|-------------|---------|
| `base` | No | string | ISO currency code (e.g. `USD`) | `USD` |
| `skipCache` | No | boolean | Bypass both file cache and in-memory cache | `false` |
| `maxAge` | No | number | Max cache age in milliseconds | `3600000` (1 hour) |

## Responses

**Success (200):**

```json
{
  "rates": { "EUR": 0.92, "GBP": 0.79 },
  "base": "USD",
  "cached": false,
  "lastUpdated": "2025-01-15T12:00:00.000Z",
  "source": "exchangerate-api"
}
```

**Cache hit (200):** Same shape but `"cached": true`, includes `source` indicating which cache layer served the data.

**Stale fallback (200):** When live API fails but file cache has old data: `"cached": true, "stale": true`.

**Rate limited (429):** Rate limit exceeded — response includes `Retry-After` header.

**Bad request (400):** Invalid currency code format.

```json
{ "error": "Invalid currency code" }
```

**Server error (500):** API unreachable and no cached data available.

```json
{ "error": "Failed to fetch exchange rates" }
```

## Caching layers

Two-layer caching strategy:

1. **Persistent file cache** (`lib/cache.ts`) — JSON files in `.cache/rates/<currency>.json` with 1-hour TTL. Survives server restarts.
2. **In-memory cache** — Fallback object shared across requests in the same server process. Returns stale data on API failure.

## Rate limiting

Applied before any cache lookup via `rateLimit.ts`: 30 requests per minute per IP address.

## Data sources

1. Primary: `v6.exchangerate-api.com` (if `EXCHANGE_RATE_API_KEY` is set)
2. Fallback: `open.er-api.com` (free, no API key needed)

# api/rates/historical — Historical Rates Endpoint

Serves historical rate data for time-series charting.

## Endpoint

```
GET /api/rates/historical?base=<currency>&target=<currency>&days=<number>
```

## Request parameters

| Param | Required | Type | Description | Default |
|-------|----------|------|-------------|---------|
| `base` | No | string | Base currency code | `USD` |
| `target` | No | string | Target currency code | `EUR` |
| `days` | No | number | Days of history (max 365) | `30` |

## Response

```json
{
  "points": [ { "date": "2025-01-01", "rate": 1.08 }, ... ],
  "cached": false
}
```

## Behavior

- Fetches historical data via free-tier endpoints (one call per day)
- In-memory cache keyed by `base-target-days` parameter combo (1-hour TTL)
- Returns 500 with a helpful message if using exchange-rate-api-free tier
