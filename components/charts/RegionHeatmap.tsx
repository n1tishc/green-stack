"use client";

import type { RegionBreakdown } from "@/types";
import { getCarbonColor } from "@/lib/carbon";

interface Props {
  data: RegionBreakdown[];
}

const INTENSITY_META: Record<string, { bar: string; dot: string; bg: string; label: string }> = {
  emerald: {
    bar: "bg-emerald-500",
    dot: "bg-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    label: "text-emerald-700 dark:text-emerald-300",
  },
  amber: {
    bar: "bg-amber-400",
    dot: "bg-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    label: "text-amber-700 dark:text-amber-300",
  },
  red: {
    bar: "bg-red-400",
    dot: "bg-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    label: "text-red-700 dark:text-red-300",
  },
};

const INTENSITY_TIERS = [
  { key: "emerald", label: "Clean", range: "< 200 gCO₂/kWh" },
  { key: "amber", label: "Moderate", range: "200–450 gCO₂/kWh" },
  { key: "red", label: "Dirty", range: "> 450 gCO₂/kWh" },
];

export default function RegionHeatmap({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.carbonIntensity - a.carbonIntensity);
  const maxCo2 = sorted.reduce((m, r) => Math.max(m, r.co2kg), 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white">Region Carbon Intensity</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            Sorted dirtiest → cleanest · bar width = your CO₂ share
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {INTENSITY_TIERS.map(({ key, label }) => {
            const m = INTENSITY_META[key];
            return (
              <span
                key={key}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.bg} ${m.label}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                {label}
              </span>
            );
          })}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-gray-300 dark:text-slate-600 text-sm">
          No data
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((r) => {
            const colorKey = getCarbonColor(r.carbonIntensity, "intensity");
            const m = INTENSITY_META[colorKey] ?? INTENSITY_META.red;
            const barPct = maxCo2 > 0 ? (r.co2kg / maxCo2) * 100 : 0;

            return (
              <div key={r.region} className="group">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.dot}`} />
                  <span className="text-xs font-mono font-medium text-gray-700 dark:text-slate-300 flex-1 truncate">
                    {r.region}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-slate-500 flex-shrink-0">
                    {r.carbonIntensity} gCO₂/kWh
                  </span>
                  <span className={`text-[11px] font-semibold flex-shrink-0 ${m.label}`}>
                    {r.co2kg.toFixed(2)} kg
                  </span>
                </div>
                {/* Proportional bar */}
                <div className="ml-5 bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${m.bar}`}
                    style={{ width: `${barPct}%`, opacity: 0.8 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
