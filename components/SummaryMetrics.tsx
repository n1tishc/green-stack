"use client";

import { Leaf, DollarSign, Zap, Globe, TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { FootprintReport } from "@/types";

interface Props {
  report: FootprintReport;
}

const ACCENTS = {
  emerald: {
    bar: "bg-gradient-to-r from-emerald-400 to-emerald-500",
    badge: "bg-emerald-50 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-300",
    iconWrap: "bg-emerald-100 dark:bg-emerald-900/40",
    icon: "text-emerald-600 dark:text-emerald-400",
    trend: "text-emerald-500",
  },
  blue: {
    bar: "bg-gradient-to-r from-blue-400 to-blue-500",
    badge: "bg-blue-50 dark:bg-blue-900/25 text-blue-700 dark:text-blue-300",
    iconWrap: "bg-blue-100 dark:bg-blue-900/40",
    icon: "text-blue-600 dark:text-blue-400",
    trend: "text-blue-400",
  },
  amber: {
    bar: "bg-gradient-to-r from-amber-400 to-amber-500",
    badge: "bg-amber-50 dark:bg-amber-900/25 text-amber-700 dark:text-amber-300",
    iconWrap: "bg-amber-100 dark:bg-amber-900/40",
    icon: "text-amber-600 dark:text-amber-400",
    trend: "text-amber-500",
  },
  teal: {
    bar: "bg-gradient-to-r from-teal-400 to-teal-500",
    badge: "bg-teal-50 dark:bg-teal-900/25 text-teal-700 dark:text-teal-300",
    iconWrap: "bg-teal-100 dark:bg-teal-900/40",
    icon: "text-teal-600 dark:text-teal-400",
    trend: "text-teal-500",
  },
};

type Trend = "down" | "up" | "neutral";

const TREND_ICON: Record<Trend, React.ElementType> = {
  down: TrendingDown,
  up: TrendingUp,
  neutral: Minus,
};

const TREND_COLOR: Record<Trend, string> = {
  down: "text-emerald-500",
  up: "text-red-400",
  neutral: "text-gray-400 dark:text-slate-500",
};

export default function SummaryMetrics({ report }: Props) {
  const cards = [
    {
      title: "Total CO₂",
      value: report.totalCO2kg.toFixed(2),
      unit: "kg",
      sub: `${report.totalCO2grams.toFixed(0)} grams total`,
      icon: Leaf,
      accent: "emerald" as const,
      trend: "down" as Trend,
    },
    {
      title: "Total Cost",
      value: `$${report.totalCostUSD.toFixed(2)}`,
      unit: "",
      sub: `${report.resources.length} resources tracked`,
      icon: DollarSign,
      accent: "blue" as const,
      trend: "neutral" as Trend,
    },
    {
      title: "Avg Intensity",
      value: report.avgCarbonIntensity.toFixed(0),
      unit: "gCO₂/kWh",
      sub: `${report.highestCarbonService} is highest`,
      icon: Zap,
      accent: "amber" as const,
      trend: "up" as Trend,
    },
    {
      title: "Greenest Region",
      value: report.greenestRegion,
      unit: "",
      sub: "lowest carbon intensity",
      icon: Globe,
      accent: "teal" as const,
      trend: "down" as Trend,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({ title, value, unit, sub, icon: Icon, accent, trend }) => {
        const c = ACCENTS[accent];
        const TrendIcon = TREND_ICON[trend];
        return (
          <div
            key={title}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Colored top bar */}
            <div className={`h-1 ${c.bar}`} />

            <div className="p-5">
              {/* Header row */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${c.badge}`}>
                  {title}
                </span>
                <div className={`w-9 h-9 rounded-xl ${c.iconWrap} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${c.icon}`} />
                </div>
              </div>

              {/* Metric */}
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-[1.6rem] font-bold text-gray-900 dark:text-white leading-none truncate">
                  {value}
                </span>
                {unit && (
                  <span className="text-xs font-medium text-gray-400 dark:text-slate-500 flex-shrink-0">
                    {unit}
                  </span>
                )}
              </div>

              {/* Sub-text with trend icon */}
              <div className="flex items-center gap-1.5">
                <TrendIcon className={`w-3.5 h-3.5 flex-shrink-0 ${TREND_COLOR[trend]}`} />
                <span className="text-xs text-gray-400 dark:text-slate-500 truncate">{sub}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
