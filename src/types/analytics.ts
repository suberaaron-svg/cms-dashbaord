export type Platform =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "facebook"
  | "linkedin";

export type PlatformFilter = "all" | Platform;

export interface DateRange {
  from: Date;
  to: Date;
}

export interface PlatformSummary {
  platform: Platform;
  impressions: number;
  reach: number;
  engagementRate: number;
  followerGrowth: number;
  posts: number;
}

export interface AnalyticsSummary {
  totalImpressions: number;
  totalReach: number;
  engagementRate: number;
  followerGrowth: number;
  totalPosts: number;
  bestPlatform: Platform;
  byPlatform: PlatformSummary[];
}

export interface FollowerGrowthPoint {
  date: string;
  total: number;
  instagram: number;
  youtube: number;
  tiktok: number;
  facebook: number;
  linkedin: number;
}

export interface EngagementRatePoint {
  date: string;
  total: number;
  instagram: number;
  youtube: number;
  tiktok: number;
  facebook: number;
  linkedin: number;
}

export interface TopPost {
  id: string;
  title: string;
  platform: Platform;
  publishDate: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  followerGrowth: FollowerGrowthPoint[];
  engagementRate: EngagementRatePoint[];
  topPosts: TopPost[];
}
