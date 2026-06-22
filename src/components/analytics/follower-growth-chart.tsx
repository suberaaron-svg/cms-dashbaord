"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLATFORM_META } from "@/lib/metricool/platform-meta";
import type { FollowerGrowthPoint, PlatformFilter } from "@/types/analytics";

interface FollowerGrowthChartProps {
  data: FollowerGrowthPoint[];
  platform: PlatformFilter;
}

export function FollowerGrowthChart({
  data,
  platform,
}: FollowerGrowthChartProps) {
  const lineKey = platform === "all" ? "total" : platform;
  const color =
    platform === "all" ? "var(--color-chart-1)" : PLATFORM_META[platform].color;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Follower Growth Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 16, top: 8 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--popover-foreground)",
                fontSize: 12,
              }}
              formatter={(value) => Number(value).toLocaleString()}
            />
            <Line
              type="monotone"
              dataKey={lineKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
