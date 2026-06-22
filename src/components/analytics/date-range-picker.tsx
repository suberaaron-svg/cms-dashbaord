"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRange } from "@/types/analytics";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const PRESETS: { label: string; days: number }[] = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 14 days", days: 14 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

function toInputValue(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  function applyPreset(days: number) {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - (days - 1));
    onChange({ from, to });
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="font-normal">
          <CalendarIcon className="h-4 w-4" />
          {format(value.from, "MMM d, yyyy")} – {format(value.to, "MMM d, yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="secondary"
                size="sm"
                onClick={() => applyPreset(preset.days)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="h-px bg-border" />
          <div className="flex flex-col gap-2 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">From</span>
              <input
                type="date"
                value={toInputValue(value.from)}
                max={toInputValue(value.to)}
                onChange={(e) =>
                  onChange({ ...value, from: new Date(e.target.value) })
                }
                className="rounded-md border border-input bg-transparent px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/50"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">To</span>
              <input
                type="date"
                value={toInputValue(value.to)}
                min={toInputValue(value.from)}
                max={toInputValue(new Date())}
                onChange={(e) =>
                  onChange({ ...value, to: new Date(e.target.value) })
                }
                className="rounded-md border border-input bg-transparent px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/50"
              />
            </label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
