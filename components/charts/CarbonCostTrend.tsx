"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import type { DateBreakdown } from "@/types";

interface Props {
  data: DateBreakdown[];
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs shadow-2xl">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-semibold">{Number(p.value).toFixed(3)}</span>
        </div>
      ))}
    </div>
  );
}

export default function CarbonCostTrend({ data }: Props) {
  const formatted = data.map((d) => ({
    date: d.date.slice(5),
    "CO₂ (kg)": parseFloat(d.co2kg.toFixed(3)),
    "Cost ($)": parseFloat(d.costUSD.toFixed(2)),
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white">Carbon &amp; Cost Trend</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Daily CO₂ emissions vs cloud spend</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 opacity-80" />
            <span className="text-gray-500 dark:text-slate-400">CO₂</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 opacity-80" />
            <span className="text-gray-500 dark:text-slate-400">Cost</span>
          </div>
        </div>
      </div>

      {formatted.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-gray-300 dark:text-slate-600 text-sm">
          No data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:[stroke:#334155]" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="CO₂ (kg)"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#co2Grad)"
              dot={false}
              activeDot={{ r: 5, fill: "#10b981", strokeWidth: 0 }}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="Cost ($)"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#costGrad)"
              dot={false}
              activeDot={{ r: 5, fill: "#3b82f6", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
