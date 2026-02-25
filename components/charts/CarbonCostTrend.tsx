"use client";

import { Card, Title, Text } from "@tremor/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DateBreakdown } from "@/types";

interface Props {
  data: DateBreakdown[];
}

export default function CarbonCostTrend({ data }: Props) {
  const formatted = data.map((d) => ({
    date: d.date.slice(5), // MM-DD
    "CO₂ (kg)": parseFloat(d.co2kg.toFixed(3)),
    "Cost ($)": parseFloat(d.costUSD.toFixed(2)),
  }));

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <Title className="dark:text-white">Carbon &amp; Cost Trend</Title>
      <Text className="dark:text-slate-400 mb-4">Daily CO₂ emissions vs cloud spend</Text>
      {formatted.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-400 dark:text-slate-500">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: 8, color: "#f1f5f9" }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="CO₂ (kg)"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Cost ($)"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
