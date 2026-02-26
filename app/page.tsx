"use client";

import { useData } from "@/context/DataContext";
import SummaryMetrics from "@/components/SummaryMetrics";
import CarbonCostTrend from "@/components/charts/CarbonCostTrend";
import ServiceBreakdown from "@/components/charts/ServiceBreakdown";
import RegionHeatmap from "@/components/charts/RegionHeatmap";
import CarbonLatencyScatter from "@/components/charts/CarbonLatencyScatter";
import Upload from "@/components/Upload";
import IaCUpload from "@/components/IaCUpload";
import GreenAdvisor from "@/components/GreenAdvisor";
import GreenBadge from "@/components/GreenBadge";
import WhatIfSimulator from "@/components/simulator/WhatIfSimulator";
import { Leaf, Upload as UploadIcon, BarChart3, Activity, Wrench, Code2 } from "lucide-react";
import { useState } from "react";

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <h2 className="text-[15px] font-bold text-gray-800 dark:text-white leading-tight">{title}</h2>
        {description && (
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { report, loadSampleData, isLoading } = useData();
  const [uploadTab, setUploadTab] = useState<"billing" | "iac">("billing");

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 p-6 text-white shadow-lg shadow-emerald-200/50 dark:shadow-none">
        {/* decorative circles */}
        <div className="pointer-events-none absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -right-2 top-12 w-28 h-28 rounded-full bg-white/5" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase bg-white/15 px-2.5 py-1 rounded-full mb-3">
              <Leaf className="w-3 h-3" />
              Cloud Sustainability
            </span>
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight">
              Carbon &amp; Cost Command Center
            </h1>
            <p className="text-emerald-100 text-sm mt-1.5 max-w-md">
              Analyze your cloud footprint, simulate infrastructure changes, and get AI‑powered green refactoring suggestions.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-3.5 py-2.5 text-sm font-medium flex-shrink-0">
            <span className={`w-2 h-2 rounded-full ${report ? "bg-emerald-300 animate-pulse" : "bg-white/40"}`} />
            {report
              ? `${report.resources.length} resources loaded`
              : "No data loaded"}
          </div>
        </div>
      </div>

      {/* Upload section */}
      <section id="upload">
        <SectionHeader
          icon={UploadIcon}
          title="Data Source"
          description="Upload a billing export or scan your infrastructure code"
        />
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex gap-1 border-b border-gray-100 dark:border-slate-700 px-4 pt-3">
            {[
              { id: "billing" as const, label: "Billing File", icon: UploadIcon },
              { id: "iac" as const, label: "Terraform / IaC", icon: Code2 },
            ].map(({ id, label, icon: TabIcon }) => (
              <button
                key={id}
                onClick={() => setUploadTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all -mb-px border-b-2 ${
                  uploadTab === id
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-900/15"
                    : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {uploadTab === "billing" ? <Upload /> : <IaCUpload />}
          </div>
        </div>
      </section>

      {/* Empty state */}
      {!report && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <Leaf className="w-10 h-10 text-emerald-400 dark:text-emerald-500" />
            </div>
            <span className="absolute -right-1 -bottom-1 w-6 h-6 bg-amber-400 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow">
              ?
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-slate-300 mb-2">
            No data loaded yet
          </h3>
          <p className="text-sm text-gray-400 dark:text-slate-500 max-w-xs mb-7">
            Upload a cloud billing export or try the built-in sample dataset to see your carbon and cost breakdown.
          </p>
          <button
            onClick={loadSampleData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors shadow-sm shadow-emerald-200 dark:shadow-none"
          >
            <Leaf className="w-4 h-4" />
            Load Sample Data
          </button>
        </div>
      )}

      {/* Dashboard */}
      {report && (
        <>
          {/* Overview KPIs */}
          <section>
            <SectionHeader
              icon={BarChart3}
              title="Overview"
              description="Key metrics for the current period"
            />
            <SummaryMetrics report={report} />
          </section>

          {/* Trend charts */}
          <section>
            <SectionHeader
              icon={Activity}
              title="Trend Analysis"
              description="Carbon and cost over time, broken down by service"
            />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <CarbonCostTrend data={report.byDate} />
              <ServiceBreakdown data={report.byService} />
            </div>
          </section>

          {/* Carbon detail */}
          <section id="carbon">
            <SectionHeader
              icon={Leaf}
              title="Carbon Footprint"
              description="Regional intensity and latency trade-offs across all cloud regions"
            />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <RegionHeatmap data={report.byRegion} />
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-0.5">
                  Carbon vs Latency
                </h3>
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">
                  All 16 regions — find your sweet spot
                </p>
                <CarbonLatencyScatter report={report} />
              </div>
            </div>
          </section>

          {/* GreenScore badge */}
          <section>
            <GreenBadge report={report} />
          </section>

          {/* Simulator + Advisor */}
          <section id="simulator">
            <SectionHeader
              icon={Wrench}
              title="Optimization Tools"
              description="Simulate infrastructure changes and get AI‑powered recommendations"
            />
            <div className="space-y-5">
              <WhatIfSimulator />
              <GreenAdvisor />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
