import { NextRequest, NextResponse } from "next/server";

import type {
  AnalyticsData,
  Platform,
  PlatformSummary,
  TopPost,
} from "@/types/analytics";

/**
 * Server-side route handler for live Metricool data.
 *
 * Metricool's API requires a private token, so this fetch happens here
 * (server) rather than in the client adapter — the token never reaches
 * the browser.
 *
 * Required env vars (set in `.env.local`, never commit them):
 *   METRICOOL_API_TOKEN  - personal/account API token from Metricool settings
 *   METRICOOL_USER_ID    - your Metricool user id
 *   METRICOOL_BLOG_ID    - the brand/blog id within your Metricool account
 *
 * Metricool's exact endpoint paths and response fields have changed across
 * API versions — verify each path below against the current docs
 * (https://metricool.com/api) with your own token before relying on this,
 * and adjust the `mapX` functions to match the real response shape.
 */

const METRICOOL_BASE_URL = "https://app.metricool.com/api";

// Only platforms actually connected in Metricool for this account.
const CONNECTED_PLATFORMS: Platform[] = [
  "instagram",
  "youtube",
  "tiktok",
  "facebook",
];

function metricoolAuthParams() {
  const token = process.env.METRICOOL_API_TOKEN;
  const userId = process.env.METRICOOL_USER_ID;
  const blogId = process.env.METRICOOL_BLOG_ID;

  if (!token || !userId || !blogId) {
    throw new Error(
      "Missing METRICOOL_API_TOKEN / METRICOOL_USER_ID / METRICOOL_BLOG_ID env vars."
    );
  }

  return { token, userId, blogId };
}

async function metricoolFetch(path: string, params: Record<string, string>) {
  const { token, userId, blogId } = metricoolAuthParams();

  const url = new URL(`${METRICOOL_BASE_URL}${path}`);
  url.searchParams.set("userId", userId);
  url.searchParams.set("blogId", blogId);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    headers: {
      "X-Mc-Auth": token,
      Accept: "application/json",
    },
    // Metricool data doesn't need to be realtime-fresh; cache briefly.
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(
      `Metricool request failed (${res.status}) for ${path}: ${await res.text()}`
    );
  }

  return res.json();
}

// TODO: confirm the real response shape for each platform's stats endpoint
// against your Metricool account and adjust this mapping.
function mapPlatformSummary(
  platform: Platform,
  raw: {
    impressions?: number;
    reach?: number;
    engagementRate?: number;
    followerGrowth?: number;
    posts?: number;
  }
): PlatformSummary {
  return {
    platform,
    impressions: raw.impressions ?? 0,
    reach: raw.reach ?? 0,
    engagementRate: raw.engagementRate ?? 0,
    followerGrowth: raw.followerGrowth ?? 0,
    posts: raw.posts ?? 0,
  };
}

async function fetchPlatformSummary(
  platform: Platform,
  from: string,
  to: string
): Promise<PlatformSummary> {
  // TODO: verify path — Metricool exposes per-network analytics endpoints,
  // e.g. /v2/analytics/posts/{network}. Confirm against the docs/your token.
  const raw = await metricoolFetch(`/v2/analytics/posts/${platform}`, {
    start: from,
    end: to,
  });

  return mapPlatformSummary(platform, raw);
}

async function fetchTopPosts(from: string, to: string): Promise<TopPost[]> {
  // TODO: verify path/fields — likely something like /v2/analytics/posts
  // returning an array of post objects across connected networks.
  const raw = await metricoolFetch("/v2/analytics/posts", {
    start: from,
    end: to,
  });

  const posts: unknown[] = Array.isArray(raw) ? raw : raw.posts ?? [];

  return posts.map((p, i) => {
    const post = p as Record<string, unknown>;
    const impressions = Number(post.impressions ?? 0);
    const likes = Number(post.likes ?? 0);
    const comments = Number(post.comments ?? 0);
    const shares = Number(post.shares ?? 0);

    return {
      id: String(post.id ?? `post-${i + 1}`),
      title: String(post.text ?? post.title ?? "Untitled post"),
      platform: (post.network ?? post.platform) as Platform,
      publishDate: String(post.publishDate ?? post.date ?? ""),
      impressions,
      likes,
      comments,
      shares,
      engagementRate: Number(
        (((likes + comments + shares) / Math.max(impressions, 1)) * 100).toFixed(2)
      ),
    };
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json(
      { error: "Missing required from/to query params (YYYY-MM-DD)." },
      { status: 400 }
    );
  }

  try {
    const byPlatform = await Promise.all(
      CONNECTED_PLATFORMS.map((platform) =>
        fetchPlatformSummary(platform, from, to)
      )
    );

    const totalImpressions = byPlatform.reduce((s, p) => s + p.impressions, 0);
    const totalReach = byPlatform.reduce((s, p) => s + p.reach, 0);
    const totalPosts = byPlatform.reduce((s, p) => s + p.posts, 0);
    const followerGrowth = byPlatform.reduce((s, p) => s + p.followerGrowth, 0);
    const engagementRate = Number(
      (
        byPlatform.reduce((s, p) => s + p.engagementRate, 0) / byPlatform.length
      ).toFixed(2)
    );
    const bestPlatform = byPlatform.reduce((best, p) =>
      p.impressions > best.impressions ? p : best
    ).platform;

    const topPosts = await fetchTopPosts(from, to);

    // Time-series (follower growth / engagement rate over time) requires
    // its own Metricool endpoint per network — left as a follow-up once the
    // summary + top posts paths above are confirmed working end-to-end.
    const data: AnalyticsData = {
      summary: {
        totalImpressions,
        totalReach,
        engagementRate,
        followerGrowth,
        totalPosts,
        bestPlatform,
        byPlatform,
      },
      followerGrowth: [],
      engagementRate: [],
      topPosts,
    };

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 }
    );
  }
}
