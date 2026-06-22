import { addDays, differenceInCalendarDays, format } from "date-fns";

import type {
  AnalyticsData,
  DateRange,
  Platform,
  PlatformFilter,
  PlatformSummary,
  TopPost,
} from "@/types/analytics";

/**
 * Metricool analytics adapter.
 *
 * This module is the single integration point between the dashboard UI and
 * Metricool's data. Every exported function currently returns deterministic
 * mock data shaped exactly like what the real Metricool API would return.
 *
 * To switch to live data:
 *   1. Implement `fetchFromMetricool` to call the Metricool API
 *      (https://metricool.com/api or your account's reporting endpoints)
 *      using `METRICOOL_API_TOKEN` / `METRICOOL_BLOG_ID` env vars.
 *   2. Map the raw Metricool response into the `AnalyticsData` shape below.
 *   3. Swap the `USE_MOCK_DATA` flag (or the call inside `getAnalyticsData`)
 *      to call `fetchFromMetricool` instead of `getMockAnalyticsData`.
 * No UI component needs to change — they only depend on the types in
 * `@/types/analytics`.
 */

const PLATFORMS: Platform[] = [
  "instagram",
  "youtube",
  "tiktok",
  "facebook",
  "linkedin",
];

const USE_MOCK_DATA = false;

// Seeded pseudo-random generator so mock data is stable across renders/SSR.
function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

const PLATFORM_BASE: Record<
  Platform,
  { impressions: number; engagement: number; growth: number }
> = {
  instagram: { impressions: 18000, engagement: 4.8, growth: 120 },
  youtube: { impressions: 9500, engagement: 6.2, growth: 60 },
  tiktok: { impressions: 26000, engagement: 7.9, growth: 210 },
  facebook: { impressions: 7200, engagement: 2.4, growth: 25 },
  linkedin: { impressions: 5400, engagement: 3.6, growth: 40 },
};

const POST_TITLES = [
  "Behind the scenes of our new product launch",
  "5 tips to grow your audience this quarter",
  "Customer spotlight: success story of the month",
  "Quick tutorial: getting started in under 60 seconds",
  "Our team's favorite moments from the offsite",
  "Announcing our newest feature update",
  "What our community is saying about us",
  "A day in the life at our studio",
  "Top trends shaping the industry right now",
  "Sneak peek: what's coming next month",
];

function buildDateSeries(range: DateRange) {
  const days = Math.max(differenceInCalendarDays(range.to, range.from), 1);
  return Array.from({ length: days + 1 }, (_, i) => addDays(range.from, i));
}

function getMockPlatformSummaries(range: DateRange): PlatformSummary[] {
  const days = differenceInCalendarDays(range.to, range.from) + 1;
  const rand = seededRandom(days * 17 + 3);

  return PLATFORMS.map((platform) => {
    const base = PLATFORM_BASE[platform];
    const dayFactor = days / 30;
    const variance = 0.85 + rand() * 0.3;
    const impressions = Math.round(base.impressions * dayFactor * variance);
    const reach = Math.round(impressions * (0.55 + rand() * 0.15));
    const engagementRate = Number(
      (base.engagement * (0.8 + rand() * 0.4)).toFixed(2)
    );
    const followerGrowth = Math.round(base.growth * dayFactor * variance);
    const posts = Math.max(1, Math.round(dayFactor * (3 + rand() * 4)));

    return {
      platform,
      impressions,
      reach,
      engagementRate,
      followerGrowth,
      posts,
    };
  });
}

function getMockAnalyticsData(range: DateRange): AnalyticsData {
  const byPlatform = getMockPlatformSummaries(range);

  const totalImpressions = byPlatform.reduce((s, p) => s + p.impressions, 0);
  const totalReach = byPlatform.reduce((s, p) => s + p.reach, 0);
  const totalPosts = byPlatform.reduce((s, p) => s + p.posts, 0);
  const followerGrowthTotal = byPlatform.reduce(
    (s, p) => s + p.followerGrowth,
    0
  );
  const engagementRate = Number(
    (
      byPlatform.reduce((s, p) => s + p.engagementRate, 0) / byPlatform.length
    ).toFixed(2)
  );
  const bestPlatform = byPlatform.reduce((best, p) =>
    p.impressions > best.impressions ? p : best
  ).platform;

  const dateSeries = buildDateSeries(range);
  const growthRand = seededRandom(7);
  const cumulative: Record<Platform, number> = {
    instagram: 4200,
    youtube: 1800,
    tiktok: 6100,
    facebook: 2600,
    linkedin: 1500,
  };

  const followerGrowth = dateSeries.map((date) => {
    const entry: Record<string, number | string> = {
      date: format(date, "MMM d"),
    };
    let total = 0;
    for (const platform of PLATFORMS) {
      const dailyGrowth = Math.round(
        (PLATFORM_BASE[platform].growth / 30) * (0.5 + growthRand() * 1.2)
      );
      cumulative[platform] += dailyGrowth;
      entry[platform] = cumulative[platform];
      total += cumulative[platform];
    }
    entry.total = total;
    return entry as unknown as AnalyticsData["followerGrowth"][number];
  });

  const engagementRand = seededRandom(13);
  const engagementSeries = dateSeries.map((date) => {
    const entry: Record<string, number | string> = {
      date: format(date, "MMM d"),
    };
    let totalRate = 0;
    for (const platform of PLATFORMS) {
      const base = PLATFORM_BASE[platform].engagement;
      const rate = Number(
        (base * (0.75 + engagementRand() * 0.5)).toFixed(2)
      );
      entry[platform] = rate;
      totalRate += rate;
    }
    entry.total = Number((totalRate / PLATFORMS.length).toFixed(2));
    return entry as unknown as AnalyticsData["engagementRate"][number];
  });

  const postsRand = seededRandom(29);
  const topPosts: TopPost[] = Array.from({ length: 10 }, (_, i) => {
    const platform = PLATFORMS[Math.floor(postsRand() * PLATFORMS.length)];
    const base = PLATFORM_BASE[platform];
    const impressions = Math.round(base.impressions * (0.3 + postsRand() * 0.9));
    const likes = Math.round(impressions * (0.03 + postsRand() * 0.05));
    const comments = Math.round(likes * (0.04 + postsRand() * 0.08));
    const shares = Math.round(likes * (0.02 + postsRand() * 0.06));
    const engagementRateValue = Number(
      (((likes + comments + shares) / Math.max(impressions, 1)) * 100).toFixed(
        2
      )
    );
    const publishDate = addDays(
      range.from,
      Math.floor(postsRand() * Math.max(dateSeries.length - 1, 1))
    );

    return {
      id: `post-${i + 1}`,
      title: POST_TITLES[i % POST_TITLES.length],
      platform,
      publishDate: format(publishDate, "MMM d, yyyy"),
      impressions,
      likes,
      comments,
      shares,
      engagementRate: engagementRateValue,
    };
  }).sort((a, b) => b.impressions - a.impressions);

  return {
    summary: {
      totalImpressions,
      totalReach,
      engagementRate,
      followerGrowth: followerGrowthTotal,
      totalPosts,
      bestPlatform,
      byPlatform,
    },
    followerGrowth,
    engagementRate: engagementSeries,
    topPosts,
  };
}

// Calls the server-side route handler (`src/app/api/analytics/route.ts`),
// which holds the Metricool token and does the actual upstream fetch.
async function fetchFromMetricool(range: DateRange): Promise<AnalyticsData> {
  const from = format(range.from, "yyyy-MM-dd");
  const to = format(range.to, "yyyy-MM-dd");

  const res = await fetch(`/api/analytics?from=${from}&to=${to}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Analytics request failed (${res.status})`);
  }

  return res.json();
}

export async function getAnalyticsData(
  range: DateRange,
  platform: PlatformFilter = "all"
): Promise<AnalyticsData> {
  const data = USE_MOCK_DATA
    ? getMockAnalyticsData(range)
    : await fetchFromMetricool(range);

  if (platform === "all") return data;

  const filteredPlatformSummary = data.summary.byPlatform.find(
    (p) => p.platform === platform
  );

  if (!filteredPlatformSummary) return data;

  return {
    summary: {
      totalImpressions: filteredPlatformSummary.impressions,
      totalReach: filteredPlatformSummary.reach,
      engagementRate: filteredPlatformSummary.engagementRate,
      followerGrowth: filteredPlatformSummary.followerGrowth,
      totalPosts: filteredPlatformSummary.posts,
      bestPlatform: filteredPlatformSummary.platform,
      byPlatform: [filteredPlatformSummary],
    },
    followerGrowth: data.followerGrowth.map((point) => ({
      date: point.date,
      total: point[platform],
      instagram: point.instagram,
      youtube: point.youtube,
      tiktok: point.tiktok,
      facebook: point.facebook,
      linkedin: point.linkedin,
    })),
    engagementRate: data.engagementRate.map((point) => ({
      date: point.date,
      total: point[platform],
      instagram: point.instagram,
      youtube: point.youtube,
      tiktok: point.tiktok,
      facebook: point.facebook,
      linkedin: point.linkedin,
    })),
    topPosts: data.topPosts.filter((post) => post.platform === platform),
  };
}
