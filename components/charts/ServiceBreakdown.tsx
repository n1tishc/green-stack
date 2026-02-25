"use client";

import { Card, Title, Text, BarChart } from "@tremor/react";
import type { ServiceBreakdown as ServiceBreakdownType } from "@/types";

interface Props {
  data: ServiceBreakdownType[];
}

const SERVICE_COLORS: Record<string, string> = {
  EC2: "blue",
  Lambda: "emerald",
  S3: "amber",
  RDS: "rose",
  CloudFront: "violet",
};

export default function ServiceBreakdown({ data }: Props) {
  const chartData = data.map((s) => ({
    service: s.service,
    "CO₂ (kg)": parseFloat(s.co2kg.toFixed(3)),
    "Cost ($)": parseFloat(s.costUSD.toFixed(2)),
  }));

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <Title className="dark:text-white">Carbon by Service</Title>
      <Text className="dark:text-slate-400 mb-4">CO₂ and cost breakdown per AWS service</Text>
      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-400 dark:text-slate-500">No data</div>
      ) : (
        <BarChart
          className="mt-2"
          data={chartData}
          index="service"
          categories={["CO₂ (kg)", "Cost ($)"]}
          colors={["emerald", "blue"]}
          yAxisWidth={56}
          showLegend
        />
      )}
    </Card>
  );
}
