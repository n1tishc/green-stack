"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import type { FootprintReport } from "@/types";

interface Props {
  current: FootprintReport;
  simulated: FootprintReport;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const curr = payload.find((p) => p.dataKey === "Current CO₂ (kg)");
  const sim = payload.find((p) => p.dataKey === "Simulated CO₂ (kg)");
  const saved = curr && sim ? Number(curr.value) - Number(sim.value) : null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs shadow-2xl min-w-[180px]">
      <p className="text-slate-400 font-semibold mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: p.fill }} />
            {p.dataKey === "Current CO₂ (kg)" ? "Current" : "Simulated"}
          </span>
          <span className="text-white font-semibold">{Number(p.value).toFixed(3)} kg</span>
        </div>
      ))}
      {saved !== null && saved > 0 && (
        <div className="flex justify-between gap-4 pt-1.5 mt-1.5 border-t border-slate-700">
          <span className="text-emerald-400">Saved</span>
          <span className="text-emerald-300 font-bold">↓ {saved.toFixed(3)} kg</span>
        </div>
      )}
    </div>
  );
}

export default function DualPathChart({ current, simulated }: Props) {
  const simMap: Record<string, number> = {};
  for (const s of simulated.byService) {
    simMap[s.service] = s.co2kg;
  }

  const data = current.byService.map((s) => ({
    service: s.service,
    "Current CO₂ (kg)": parseFloat(s.co2kg.toFixed(3)),
    "Simulated CO₂ (kg)": parseFloat((simMap[s.service] ?? 0).toFixed(3)),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="35%">
        <defs>
          <linearGradient id="currGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
            <stop offset="100%" stopColor="#fca5a5" stopOpacity={0.7} />
          </linearGradient>
          <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
            <stop offset="100%" stopColor="#6ee7b7" stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:[stroke:#334155]" vertical={false} />
        <XAxis dataKey="service" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit=" kg" width={48} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "#94a3b8", paddingTop: 12 }}
          formatter={(value) => (
            <span style={{ color: "#94a3b8" }}>
              {value === "Current CO₂ (kg)" ? "Current" : "Simulated"}
            </span>
          )}
        />
        <Bar dataKey="Current CO₂ (kg)" fill="url(#currGrad)" radius={[6, 6, 0, 0]} />
        <Bar dataKey="Simulated CO₂ (kg)" fill="url(#simGrad)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
