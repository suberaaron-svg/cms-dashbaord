"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PLATFORM_META, PLATFORM_ORDER } from "@/lib/metricool/platform-meta";
import type { PlatformFilter as PlatformFilterValue } from "@/types/analytics";

interface PlatformFilterProps {
  value: PlatformFilterValue;
  onChange: (value: PlatformFilterValue) => void;
}

export function PlatformFilter({ value, onChange }: PlatformFilterProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as PlatformFilterValue)}
    >
      <TabsList className="flex-wrap">
        <TabsTrigger value="all">All Platforms</TabsTrigger>
        {PLATFORM_ORDER.map((platform) => {
          const meta = PLATFORM_META[platform];
          const Icon = meta.icon;
          return (
            <TabsTrigger key={platform} value={platform} className="gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              {meta.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
