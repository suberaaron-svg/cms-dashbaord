import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  subtext?: string;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  subtext,
}: MetricCardProps) {
  const isPositive = (trend ?? 0) >= 0;

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <span className="text-2xl font-semibold tracking-tight">
            {value}
          </span>
          {trend !== undefined ? (
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                isPositive ? "text-emerald-400" : "text-red-400"
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {Math.abs(trend)}%
            </span>
          ) : subtext ? (
            <span className="text-xs text-muted-foreground">{subtext}</span>
          ) : null}
        </div>
        <div className="rounded-lg bg-accent p-2.5">
          <Icon className="h-4.5 w-4.5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="flex w-full flex-col gap-2">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-14 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}
