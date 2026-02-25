"use client";

import { useData } from "@/context/DataContext";
import SummaryMetrics from "@/components/SummaryMetrics";
import CarbonCostTrend from "@/components/charts/CarbonCostTrend";
import ServiceBreakdown from "@/components/charts/ServiceBreakdown";
import RegionHeatmap from "@/components/charts/RegionHeatmap";
import Upload from "@/components/Upload";
import GreenAdvisor from "@/components/GreenAdvisor";
import { Leaf } from "lucide-react";

export default function HomePage() {
  const { report } = useData();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Leaf className="text-emerald-500 w-8 h-8" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Carbon &amp; Cost Command Center</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Upload cloud billing data to analyze your CO₂ footprint and get AI-powered green refactor suggestions.</p>
        </div>
      </div>

      {/* Upload section */}
      <section id="upload">
        <Upload />
      </section>

      {/* If no data, show placeholder */}
      {!report && (
        <div className="text-center py-20 text-gray-400 dark:text-slate-500">
          <Leaf className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Load sample data or upload a file to get started.</p>
        </div>
      )}

      {/* Dashboard */}
      {report && (
        <>
          <section>
            <SummaryMetrics report={report} />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <CarbonCostTrend data={report.byDate} />
            <ServiceBreakdown data={report.byService} />
          </section>

          <section id="carbon">
            <RegionHeatmap data={report.byRegion} />
          </section>

          <section id="advisor">
            <GreenAdvisor />
          </section>
        </>
      )}
    </div>
  );
}
