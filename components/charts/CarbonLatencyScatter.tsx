"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
  Cell,
  type TooltipProps,
} from "recharts";
import { REGION_CARBON_INTENSITY } from "@/lib/carbon";
import { REGION_META } from "@/data/region-meta";
import type { FootprintReport } from "@/types";

interface Props {
  report: FootprintReport | null;
}

interface RegionDot {
  region: string;
  label: string;
  intensity: number;
  latency: number;
  userKwh: number;
}

function dotColor(intensity: number, latency: number): string {
  const lowCarbon = intensity < 200;
  const lowLatency = latency < 100;
  if (lowCarbon && lowLatency) return "#10b981";
  if (lowCarbon || lowLatency) return "#f59e0b";
  return "#ef4444";
}

function dotRadius(userKwh: number): number {
  if (userKwh === 0) return 5;
  return Math.max(7, Math.min(22, 7 + userKwh * 0.3));
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as RegionDot;
  const isUser = d.userKwh > 0;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs shadow-2xl min-w-[170px]">
      <p className="text-white font-semibold mb-2">{d.label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Carbon</span>
          <span className="text-white font-medium">{d.intensity} gCO₂/kWh</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Latency</span>
          <span className="text-white font-medium">{d.latency} ms</span>
        </div>
        {isUser && (
          <div className="flex justify-between gap-4 pt-1 mt-1 border-t border-slate-700">
            <span className="text-emerald-400">Your usage</span>
            <span className="text-emerald-300 font-semibold">{d.userKwh.toFixed(1)} kWh</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CarbonLatencyScatter({ report }: Props) {
  const regionKwh: Record<string, number> = {};
  if (report) {
    for (const r of report.byRegion) {
      regionKwh[r.region] = r.usageKwh;
    }
  }

  const data: RegionDot[] = Object.entries(REGION_META).map(([region, meta]) => ({
    region,
    label: meta.label,
    intensity: REGION_CARBON_INTENSITY[region] ?? 400,
    latency: meta.latencyMs,
    userKwh: regionKwh[region] ?? 0,
  }));

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={340}>
        <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
          {/* Sweet-spot quadrant */}
          <ReferenceArea
            x1={0} x2={200} y1={0} y2={100}
            fill="#10b981" fillOpacity={0.07}
            strokeOpacity={0}
          />

          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:[stroke:#334155]" />

          <XAxis
            type="number"
            dataKey="intensity"
            name="Carbon Intensity"
            domain={[0, 800]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            label={{
              value: "Carbon Intensity (gCO₂/kWh)",
              position: "insideBottom",
              offset: -18,
              fontSize: 11,
              fill: "#94a3b8",
            }}
          />
          <YAxis
            type="number"
            dataKey="latency"
            name="Latency"
            domain={[0, 260]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={40}
            label={{
              value: "Latency (ms)",
              angle: -90,
              position: "insideLeft",
              offset: 8,
              fontSize: 11,
              fill: "#94a3b8",
            }}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#64748b", strokeWidth: 1, strokeDasharray: "4 4" }} />

          {/* Quadrant dividers */}
          <ReferenceLine x={200} stroke="#94a3b8" strokeDasharray="5 4" strokeWidth={1} />
          <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="5 4" strokeWidth={1} />

          <Scatter data={data} isAnimationActive={false}>
            {data.map((d) => (
              <Cell
                key={d.region}
                fill={dotColor(d.intensity, d.latency)}
                r={dotRadius(d.userKwh)}
                fillOpacity={d.userKwh > 0 ? 0.95 : 0.65}
                stroke={d.userKwh > 0 ? "#fff" : "transparent"}
                strokeWidth={d.userKwh > 0 ? 2 : 0}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-[11px] text-gray-500 dark:text-slate-400">
        {[
          { color: "#10b981", label: "Sweet spot (<200 gCO₂ & <100ms)" },
          { color: "#f59e0b", label: "Moderate" },
          { color: "#ef4444", label: "High carbon or latency" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-white bg-emerald-500 flex-shrink-0" style={{ boxShadow: "0 0 0 1px #94a3b8" }} />
          Larger = your usage
        </span>
      </div>
    </div>
  );
}
