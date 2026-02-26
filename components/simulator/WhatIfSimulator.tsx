"use client";

import { Card, Text } from "@tremor/react";
import { Sliders, Zap, RotateCcw, TrendingDown } from "lucide-react";
import { useSimulator } from "@/context/SimulatorContext";
import { useData } from "@/context/DataContext";
import { ALL_REGIONS, REGION_META } from "@/data/region-meta";
import DualPathChart from "@/components/charts/DualPathChart";

export default function WhatIfSimulator() {
  const { resources, report } = useData();
  const {
    enabled,
    setEnabled,
    graviton,
    setGraviton,
    overrides,
    setOverride,
    clearOverrides,
    applyQuickWins,
    simulatedReport,
    co2Saved,
    percentSaved,
  } = useSimulator();

  if (!report || resources.length === 0) return null;

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700" id="simulator">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="text-emerald-500 w-5 h-5" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">What-If Simulator</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium">
            Beta
          </span>
        </div>
        {/* Master toggle */}
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? "bg-emerald-500" : "bg-gray-300 dark:bg-slate-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {!enabled && (
        <Text className="text-sm text-gray-400 dark:text-slate-500">
          Toggle the simulator to model alternative deployments without changing your actual infrastructure.
        </Text>
      )}

      {enabled && (
        <div className="space-y-5">
          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={graviton}
                onChange={(e) => setGraviton(e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-gray-700 dark:text-slate-300 font-medium">
                Graviton (−20% EC2 power)
              </span>
            </label>

            <div className="flex-1" />

            <button
              onClick={applyQuickWins}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
            >
              <TrendingDown className="w-4 h-4" />
              Apply Quick Wins
            </button>
            <button
              onClick={clearOverrides}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Savings summary */}
          {simulatedReport && (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {percentSaved.toFixed(1)}%
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">CO₂ Reduction</p>
              </div>
              <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-3 text-center">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {co2Saved.toFixed(2)} kg
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">CO₂ Saved/mo</p>
              </div>
              <div className="rounded-xl bg-violet-50 dark:bg-violet-900/20 p-3 text-center">
                <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                  {simulatedReport.totalCO2kg.toFixed(2)} kg
                </p>
                <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">Simulated CO₂</p>
              </div>
            </div>
          )}

          {/* DualPath chart */}
          {simulatedReport && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                CO₂ by Service — Current vs Simulated
              </p>
              <DualPathChart current={report} simulated={simulatedReport} />
            </div>
          )}

          {/* Per-resource region table */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Per-Resource Region Override
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700/50 text-xs text-gray-500 dark:text-slate-400 uppercase">
                    <th className="px-4 py-2.5 text-left font-medium">Resource</th>
                    <th className="px-4 py-2.5 text-left font-medium">Service</th>
                    <th className="px-4 py-2.5 text-left font-medium">Current Region</th>
                    <th className="px-4 py-2.5 text-left font-medium">Simulated Region</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {resources.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-2.5 text-gray-700 dark:text-slate-300 font-mono text-xs truncate max-w-[160px]">
                        {r.description ?? r.id}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {r.service}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 dark:text-slate-400 text-xs">{r.region}</td>
                      <td className="px-4 py-2.5">
                        <select
                          value={overrides[r.id] ?? r.region}
                          onChange={(e) => setOverride(r.id, e.target.value)}
                          className="text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        >
                          {ALL_REGIONS.map((reg) => (
                            <option key={reg} value={reg}>
                              {reg} — {REGION_META[reg].label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
