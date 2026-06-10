# src/app/ — Next.js App Router

Page structure, root layout, global styles, and server-side API routes.

## Files

| File | Type | Purpose |
|------|------|---------|
| `layout.tsx` | Server | Root layout: SEO metadata (title, description, OpenGraph), Google AdSense script injection, Geist fonts, theme color meta |
| `page.tsx` | Server | Home page: header, ConverterShell wrapper, AdBanner placements (top, mid, bottom), features section, footer |
| `globals.css` | Style | Tailwind CSS import, light/dark theme via CSS custom properties (`prefers-color-scheme`) |
| `api/rates/` | Route | Current exchange rates with rate limiting + file cache |
| `api/rates/historical/` | Route | Historical rate data for chart rendering |

## Routing

Next.js App Router maps directories to URL paths:

- `/` → `page.tsx` (home page with ConverterShell)
- `/api/rates?base=USD` → `api/rates/route.ts` GET handler
- `/api/rates/historical?base=USD&target=EUR&days=30` → `api/rates/historical/route.ts`

## Theming

CSS custom properties handle light/dark mode via `prefers-color-scheme`. Components reference variables inline (`style={{ backgroundColor: "var(--card-bg)" }}`) rather than Tailwind color classes for consistent cross-mode theming.
