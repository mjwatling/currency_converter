# src/ — Next.js web app source

All TypeScript/TSX source for the Currency Converter web app. Uses Next.js App Router (server + client components).

## Structure

| Directory | Contents |
|-----------|----------|
| `app/` | Page routes, root layout, global CSS, API routes |
| `components/` | Reusable React UI components (client-side `"use client"`) |
| `lib/` | Shared data and utility modules |

## How it works

1. **`app/`** — Defines the page structure (`page.tsx`), root layout with SEO metadata & AdSense script (`layout.tsx`), global theming via CSS custom properties (`globals.css`), and server-side API routes that proxy exchange rates with caching and rate limiting.
2. **`components/`** — All interactive UI: converter card, currency selectors, favorites bar, historical charts, multi-currency comparison, ad banners, and the parent shell that ties them together.
3. **`lib/`** — Static currency definitions (`currencies.ts`) and persistent file-based cache utilities (`cache.ts`).

## Build & run

From project root:

```bash
npm run dev      # Dev server on localhost:3000 (Turbopack)
npm run build    # Production build
npm start        # Serve production build
```
