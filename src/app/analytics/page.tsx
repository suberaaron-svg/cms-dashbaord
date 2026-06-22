"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  FileText,
  Sparkles,
  TrendingUp,
  Users,
  Eye,
} from "lucide-react";

import { DateRangePicker } from "@/components/analytics/date-range-picker";
import { EngagementRateChart } from "@/components/analytics/engagement-rate-chart";
import { FollowerGrowthChart } from "@/components/analytics/follower-growth-chart";
import { ImpressionsBarChart } from "@/components/analytics/impressions-bar-chart";
import { MetricCard, MetricCardSkeleton } from "@/components/analytics/metric-card";
import { PlatformFilter } from "@/components/analytics/platform-filter";
import { ChartSkeleton, EmptyState, ErrorState } from "@/components/analytics/state-views";
import { TopPostsChart } from "@/components/analytics/top-posts-chart";
import { TopPostsTable } from "@/components/analytics/top-posts-table";
import { getAnalyticsData } from "@/lib/metricool/adapter";
import { PLATFORM_META } from "@/lib/metricool/platform-meta";
import type { AnalyticsData, DateRange, PlatformFilter as PlatformFilterValue } from "@/types/analytics";

function defaultRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 29);
  return { from, to };
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [platform, setPlatform] = useState<PlatformFilterValue>("all");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getAnalyticsData(range, platform)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [range, platform, retryToken]);

  function updateRange(next: DateRange) {
    setStatus("loading");
    setRange(next);
  }

  function updatePlatform(next: PlatformFilterValue) {
    setStatus("loading");
    setPlatform(next);
  }

  function retry() {
    setStatus("loading");
    setRetryToken((token) => token + 1);
  }

  const isLoading = status === "loading";
  const isError = status === "error";
  const isEmpty = status === "ready" && (!data || data.summary.totalPosts === 0);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Content performance across your connected social platforms.
          </p>
        </div>
        <DateRangePicker value={range} onChange={updateRange} />
      </div>

      <PlatformFilter value={platform} onChange={updatePlatform} />

      {isError ? (
        <ErrorState onRetry={retry} />
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {isLoading || !data ? (
              Array.from({ length: 6 }).map((_, i) => (
                <MetricCardSkeleton key={i} />
              ))
            ) : (
              <>
                <MetricCard
                  label="Total Impressions"
                  value={data.summary.totalImpressions.toLocaleString()}
                  icon={Eye}
                  trend={8.4}
                />
                <MetricCard
                  label="Total Reach"
                  value={data.summary.totalReach.toLocaleString()}
                  icon={Users}
                  trend={5.1}
                />
                <MetricCard
                  label="Engagement Rate"
                  value={`${data.summary.engagementRate}%`}
                  icon={Activity}
                  trend={1.8}
                />
                <MetricCard
                  label="Follower Growth"
                  value={`+${data.summary.followerGrowth.toLocaleString()}`}
                  icon={TrendingUp}
                  trend={12.3}
                />
                <MetricCard
                  label="Total Posts"
                  value={data.summary.totalPosts.toLocaleString()}
                  icon={FileText}
                />
                <MetricCard
                  label="Best Platform"
                  value={PLATFORM_META[data.summary.bestPlatform].label}
                  icon={Sparkles}
                  subtext="By impressions"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {isLoading || !data ? (
              <>
                <ChartSkeleton />
                <ChartSkeleton />
              </>
            ) : (
              <>
                <ImpressionsBarChart data={data.summary.byPlatform} />
                <TopPostsChart data={data.topPosts} />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {isLoading || !data ? (
              <>
                <ChartSkeleton />
                <ChartSkeleton />
              </>
            ) : (
              <>
                <FollowerGrowthChart data={data.followerGrowth} platform={platform} />
                <EngagementRateChart data={data.engagementRate} platform={platform} />
              </>
            )}
          </div>

          {isLoading || !data ? (
            <ChartSkeleton />
          ) : (
            <TopPostsTable data={data.topPosts} />
          )}
        </>
      )}
    </div>
  );
}
