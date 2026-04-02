"use client";

import { cn } from "@/lib/utils";

type AxisBarChartProps = {
  data: Array<{
    axis: string;
    leftLabel: string;
    rightLabel: string;
    score: number;
  }>;
};

export function AxisBarChart({ data }: AxisBarChartProps) {
  return (
    <div className="space-y-5">
      {data.map((item) => {
        const width = `${Math.abs(item.score)}%`;
        const positive = item.score >= 0;

        return (
          <div key={item.axis} className="space-y-2">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
              <span>{item.leftLabel}</span>
              <span>{item.axis}</span>
              <span>{item.rightLabel}</span>
            </div>
            <div className="relative h-4 overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
              <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/30" />
              <div
                className={cn(
                  "absolute inset-y-0 rounded-full transition-all duration-500",
                  positive
                    ? "left-1/2 bg-[linear-gradient(90deg,#f97316,#facc15)]"
                    : "right-1/2 bg-[linear-gradient(270deg,#2563eb,#38bdf8)]",
                )}
                style={{ width }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
