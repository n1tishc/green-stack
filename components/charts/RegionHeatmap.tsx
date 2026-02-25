"use client";

import { Card, Title, Text, BarList, Badge } from "@tremor/react";
import type { RegionBreakdown } from "@/types";
import { getCarbonColor } from "@/lib/carbon";

interface Props {
  data: RegionBreakdown[];
}

const COLOR_MAP: Record<string, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

export default function RegionHeatmap({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.carbonIntensity - a.carbonIntensity);

  const barListData = sorted.map((r) => ({
    name: r.region,
    value: parseFloat(r.co2kg.toFixed(3)),
  }));

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <Title className="dark:text-white">Region Carbon Intensity</Title>
      <Text className="dark:text-slate-400 mb-4">Sorted by carbon intensity (gCO₂eq/kWh) — higher is dirtier</Text>

      {sorted.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-gray-400 dark:text-slate-500">No data</div>
      ) : (
        <div className="space-y-3">
          {sorted.map((r) => {
            const color = getCarbonColor(r.carbonIntensity, "intensity");
            return (
              <div key={r.region} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${COLOR_MAP[color] ?? "bg-gray-400"}`} />
                  <span className="text-sm font-mono text-gray-700 dark:text-slate-300 truncate">{r.region}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500 dark:text-slate-400">{r.carbonIntensity} gCO₂/kWh</span>
                  <Badge color={color as "emerald" | "amber" | "red"} size="xs">
                    {r.co2kg.toFixed(2)} kg
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
