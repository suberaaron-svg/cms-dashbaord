"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLATFORM_META } from "@/lib/metricool/platform-meta";
import type { PlatformSummary } from "@/types/analytics";

interface ImpressionsBarChartProps {
  data: PlatformSummary[];
}

export function ImpressionsBarChart({ data }: ImpressionsBarChartProps) {
  const chartData = data.map((d) => ({
    platform: PLATFORM_META[d.platform].label,
    impressions: d.impressions,
    color: PLATFORM_META[d.platform].color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impressions by Platform</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 8, right: 16, top: 8 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="platform"
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
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
              cursor={{ fill: "var(--accent)" }}
              formatter={(value) => Number(value).toLocaleString()}
            />
            <Bar dataKey="impressions" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
