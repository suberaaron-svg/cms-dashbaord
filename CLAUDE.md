@AGENTS.md

# Project notes

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 (CSS-variable based theme, dark mode forced via `.dark` class on `<html>`)
- shadcn/ui-style primitives, hand-written under `src/components/ui` (the `shadcn` CLI could not
  reach `ui.shadcn.com` in this environment, so primitives were authored manually following the
  same conventions: `cn()` helper, `cva` variants, Radix UI primitives underneath)
- Recharts for all charts
- lucide-react for icons (note: v1 of lucide-react dropped brand/logo icons, so platform icons use
  generic equivalents — see `src/lib/metricool/platform-meta.ts`)

## Analytics page structure

```
src/app/analytics/page.tsx          Client page: owns date range, platform filter,
                                     and data-fetching state (loading/ready/error/empty).

src/components/analytics/
  metric-card.tsx                   MetricCard + MetricCardSkeleton (summary tiles)
  platform-filter.tsx               Tabs-based platform switcher (All / IG / YT / TikTok / FB / LinkedIn)
  date-range-picker.tsx             Popover with quick presets + native <input type="date"> range
  impressions-bar-chart.tsx         Bar chart: impressions by platform
  follower-growth-chart.tsx         Line chart: follower growth over time
  engagement-rate-chart.tsx         Line chart: engagement rate over time
  top-posts-chart.tsx               Horizontal bar chart: top posts by impressions
  top-posts-table.tsx               Full data table of top posts
  state-views.tsx                   ChartSkeleton, EmptyState, ErrorState (shared loading/empty/error UI)

src/components/layout/sidebar.tsx   App sidebar nav; highlights the active route via `usePathname()`.
                                     Analytics is wired in alongside Dashboard.

src/components/ui/                  Hand-authored shadcn-style primitives: button, card, badge,
                                     tabs, select, popover, table, skeleton.

src/lib/metricool/
  adapter.ts                        Data adapter — the integration boundary (see below).
  platform-meta.ts                  Per-platform label/color/icon lookup, shared by all charts/UI.

src/types/analytics.ts              Shared types: Platform, DateRange, AnalyticsData, TopPost, etc.
```

## Component decisions

- The page (`analytics/page.tsx`) is a client component that owns all state (`range`, `platform`,
  fetched `data`, and a `status` union of `"loading" | "ready" | "error"`). Components below it are
  presentational and receive data via props — no component reaches into the adapter directly except
  the page, so swapping data sources never touches the UI layer.
- `status` is only flipped to `"loading"` from explicit user actions (changing the date range,
  switching platform, or retrying) rather than unconditionally inside the data-fetching `useEffect`,
  to avoid the "setState synchronously in an effect" footgun / cascading renders.
- Charts share one visual language: dark `var(--popover)` tooltips, `var(--border)` gridlines, and
  per-platform colors from `PLATFORM_META` so a given platform's color is consistent across every
  chart and the table.
- The date range picker uses plain `<input type="date">` instead of a calendar grid component,
  since `react-day-picker`'s v10 API didn't match the shadcn `Calendar` recipe available, and the
  CLI couldn't be reached to pull a compatible version. Presets (7/14/30/90 days) cover the common
  cases; manual from/to inputs handle the rest.
- Empty state shows when the resolved data has zero posts for the selected range/platform. Error
  state shows a retry button that re-runs the same fetch with a bumped `retryToken`.

## Mock Metricool data structure (`src/lib/metricool/adapter.ts`)

`getAnalyticsData(range: DateRange, platform: PlatformFilter): Promise<AnalyticsData>` is the single
entry point the UI calls. It currently always resolves with deterministic mock data (seeded PRNG, so
numbers don't jump around on every render/SSR pass) shaped as:

```ts
AnalyticsData = {
  summary: {
    totalImpressions, totalReach, engagementRate, followerGrowth,
    totalPosts, bestPlatform,
    byPlatform: PlatformSummary[]   // per-platform totals for the bar chart + cards
  },
  followerGrowth: FollowerGrowthPoint[],   // one point per day: { date, total, instagram, youtube, tiktok, facebook, linkedin }
  engagementRate: EngagementRatePoint[],   // same shape, engagement % instead of follower count
  topPosts: TopPost[],                     // { id, title, platform, publishDate, impressions, likes, comments, shares, engagementRate }
}
```

When `platform` is a single platform (not `"all"`), `getAnalyticsData` filters/reshapes the mock
result so every chart/table still receives data in the exact same shape — components never branch on
"all vs. single platform" except to pick which line/key to plot.

## Replacing mock data with real Metricool data

1. In `src/lib/metricool/adapter.ts`, implement `fetchFromMetricool(range)` to call Metricool's
   reporting API (requires an account/blog ID and API token — store as `METRICOOL_API_TOKEN` /
   `METRICOOL_BLOG_ID` env vars, read via `process.env` in a server context).
2. Map Metricool's response fields onto the `AnalyticsData` / `PlatformSummary` / `TopPost` shapes in
   `src/types/analytics.ts`. Keep the field names identical so no component needs to change.
3. Flip `USE_MOCK_DATA` to `false` in `adapter.ts` (or delete the flag and call
   `fetchFromMetricool` directly once mock data is no longer needed).
4. If Metricool's API requires server-side auth (likely), move the fetch into a Next.js Route
   Handler (e.g. `src/app/api/analytics/route.ts`) and have `getAnalyticsData` call that route
   instead of hitting Metricool directly from the client.
5. Platform filtering by single platform currently happens by slicing the "all platforms" mock
   result client-side. A real implementation should ideally request platform-scoped data directly
   from Metricool to avoid over-fetching.

### Current status: live data wired, endpoints unverified

`USE_MOCK_DATA` is now `false`. `adapter.ts`'s `fetchFromMetricool` calls the Next.js Route Handler
at `src/app/api/analytics/route.ts`, which holds the Metricool credentials server-side and does the
actual upstream fetch — the token never reaches the browser.

- Connected platforms: Instagram, YouTube, TikTok, Facebook (LinkedIn intentionally excluded —
  not connected in Metricool for this account). See `CONNECTED_PLATFORMS` in `route.ts`.
- Required env vars (set locally in `.env.local`, which is gitignored — never commit these):
  - `METRICOOL_API_TOKEN` — personal/account API token from Metricool settings
  - `METRICOOL_USER_ID` — your Metricool user id
  - `METRICOOL_BLOG_ID` — the brand/blog id within your Metricool account
- **The endpoint paths in `route.ts` (`/v2/analytics/posts/{network}` and `/v2/analytics/posts`) are
  best-effort guesses, not confirmed against Metricool's current API docs.** Verify them against
  https://metricool.com/api with a real token and adjust `mapPlatformSummary`/`fetchTopPosts` to
  match the actual response shape before trusting this in production.
- `followerGrowth` and `engagementRate` time-series are currently stubbed as empty arrays — Metricool
  exposes these via separate endpoints per network that haven't been wired up yet. The two charts
  that depend on them will render empty until this is implemented.
