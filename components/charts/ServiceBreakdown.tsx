"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  type TooltipProps,
} from "recharts";
import type { ServiceBreakdown as ServiceBreakdownType } from "@/types";

interface Props {
  data: ServiceBreakdownType[];
}

const SERVICE_COLORS: Record<string, [string, string]> = {
  EC2:         ["#3b82f6", "#93c5fd"],
  Lambda:      ["#10b981", "#6ee7b7"],
  S3:          ["#f59e0b", "#fcd34d"],
  RDS:         ["#f43f5e", "#fda4af"],
  CloudFront:  ["#8b5cf6", "#c4b5fd"],
};

const DEFAULT_COLORS: [string, string][] = [
  ["#06b6d4", "#67e8f9"],
  ["#84cc16", "#bef264"],
  ["#f97316", "#fdba74"],
  ["#ec4899", "#f9a8d4"],
];

function getColor(service: string, index: number): [string, string] {
  return SERVICE_COLORS[service] ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs shadow-2xl">
      <p className="text-slate-400 mb-2 font-semibold">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.fill }} />
          <span className="text-slate-400">{p.dataKey}:</span>
          <span className="text-white font-semibold">{Number(p.value).toFixed(3)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ServiceBreakdown({ data }: Props) {
  const chartData = data.map((s) => ({
    service: s.service,
    "CO₂ (kg)": parseFloat(s.co2kg.toFixed(3)),
    "Cost ($)": parseFloat(s.costUSD.toFixed(2)),
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white">Carbon by Service</h3>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">CO₂ and cost breakdown per cloud service</p>
      </div>

      {chartData.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-gray-300 dark:text-slate-600 text-sm">
          No data
        </div>
      ) : (
        <div className="space-y-5">
          {/* Recharts grouped bar */}
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
              <defs>
                {data.map((s, i) => {
                  const [dark, light] = getColor(s.service, i);
                  return (
                    <linearGradient key={s.service} id={`bar-${s.service}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={dark} stopOpacity={1} />
                      <stop offset="100%" stopColor={light} stopOpacity={0.7} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:[stroke:#334155]" vertical={false} />
              <XAxis dataKey="service" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
              <Bar dataKey="CO₂ (kg)" radius={[6, 6, 0, 0]}>
                {data.map((s, i) => (
                  <Cell key={s.service} fill={`url(#bar-${s.service})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Service legend with proportional bars */}
          <div className="space-y-2.5 pt-1 border-t border-gray-100 dark:border-slate-700">
            {[...data].sort((a, b) => b.co2kg - a.co2kg).map((s, i) => {
              const max = data.reduce((m, d) => Math.max(m, d.co2kg), 0);
              const pct = max > 0 ? (s.co2kg / max) * 100 : 0;
              const [color] = getColor(s.service, i);
              return (
                <div key={s.service} className="flex items-center gap-3">
                  <span className="w-20 text-xs font-medium text-gray-600 dark:text-slate-300 flex-shrink-0">
                    {s.service}
                  </span>
                  <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 dark:text-slate-500 w-16 text-right flex-shrink-0">
                    {s.co2kg.toFixed(2)} kg
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
