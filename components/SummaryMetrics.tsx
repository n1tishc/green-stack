"use client";

import { Card, Metric, Text, BadgeDelta } from "@tremor/react";
import { Leaf, DollarSign, Zap, Globe } from "lucide-react";
import type { FootprintReport } from "@/types";

interface Props {
  report: FootprintReport;
}

export default function SummaryMetrics({ report }: Props) {
  const cards = [
    {
      title: "Total CO₂",
      value: `${report.totalCO2kg.toFixed(2)} kg`,
      sub: `${report.totalCO2grams.toFixed(0)} grams`,
      icon: Leaf,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      delta: "decrease" as const,
      deltaText: "vs last period",
    },
    {
      title: "Total Cost",
      value: `$${report.totalCostUSD.toFixed(2)}`,
      sub: `${report.resources.length} resources`,
      icon: DollarSign,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      delta: "unchanged" as const,
      deltaText: "this period",
    },
    {
      title: "Avg Carbon Intensity",
      value: `${report.avgCarbonIntensity.toFixed(0)} gCO₂/kWh`,
      sub: report.highestCarbonService + " is highest",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      delta: "moderateIncrease" as const,
      deltaText: "avg intensity",
    },
    {
      title: "Greenest Region",
      value: report.greenestRegion,
      sub: "lowest carbon intensity",
      icon: Globe,
      color: "text-teal-500",
      bg: "bg-teal-50 dark:bg-teal-900/20",
      delta: "decrease" as const,
      deltaText: "cleanest",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({ title, value, sub, icon: Icon, color, bg }) => (
        <Card key={title} className="dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <Text className="text-gray-500 dark:text-slate-400 text-sm font-medium">{title}</Text>
            <span className={`p-2 rounded-lg ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </span>
          </div>
          <Metric className="text-gray-900 dark:text-white text-xl font-bold truncate">{value}</Metric>
          <Text className="text-gray-400 dark:text-slate-500 text-xs mt-1">{sub}</Text>
        </Card>
      ))}
    </div>
  );
}
