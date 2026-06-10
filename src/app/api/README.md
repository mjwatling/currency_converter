# src/app/api/ — Next.js API Routes

Server-side endpoints that proxy exchange rate data from external APIs. All handlers are server-only and never bundled into client JavaScript.

## Sub-directories

| Directory | Endpoint | Purpose |
|-----------|----------|---------|
| `rates/` | `GET /api/rates?base=XXX` | Current exchange rates with rate limiting + persistent file cache before hitting external API |
| `rates/historical/` | `GET /api/rates/historical?base=X&target=Y&days=N` | Historical rate snapshots for charting (7/30/90-day ranges) |

## Shared utilities

| File | Purpose |
|------|---------|
| `rateLimit.ts` | In-memory sliding-window rate limiter (30 req/min per IP). Extracts client IP from `x-forwarded-for` header with safe fallback. Returns 429 when breached. |

## Routing conventions

- Each sub-directory named after the API resource
- Contains `route.ts` with exported HTTP method handlers (`GET`, etc.)
- Server-side only — can safely import Node.js APIs (fs, path) and environment variables
- Add new endpoints by creating a directory + `route.ts`, then document here

## Rate limiting

The `rateLimit.ts` module is imported by `/api/rates/route.ts` and applied before any cache or network lookup. Configuration:

| Setting | Value |
|---------|-------|
| Window | 60 seconds (sliding) |
| Max requests | 30 per window |
| IP extraction | `x-forwarded-for` header, fallback `"client"` |

Returns a `NextResponse` with status 429 and a `Retry-After` header when breached.
