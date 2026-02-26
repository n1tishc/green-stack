"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import type { FootprintReport } from "@/types";
import { calculateFootprint } from "@/lib/carbon";
import { useData } from "@/context/DataContext";

// Quick-win target regions per current region prefix
const QUICK_WIN_TARGETS: Record<string, string> = {
  "us-east-1": "us-west-2",
  "us-east-2": "us-west-2",
  "eu-west-1": "eu-north-1",
  "eu-west-2": "eu-north-1",
  "eu-west-3": "eu-north-1",
  "eu-central-1": "eu-north-1",
  "ap-southeast-1": "ap-northeast-1",
  "ap-southeast-2": "ap-northeast-1",
  "ap-south-1": "ap-northeast-1",
  "ap-northeast-2": "ap-northeast-1",
};

interface SimulatorContextValue {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  graviton: boolean;
  setGraviton: (v: boolean) => void;
  overrides: Record<string, string>; // resourceId → region
  setOverride: (id: string, region: string) => void;
  clearOverrides: () => void;
  applyQuickWins: () => void;
  simulatedReport: FootprintReport | null;
  co2Saved: number;
  percentSaved: number;
}

const SimulatorContext = createContext<SimulatorContextValue | null>(null);

export function SimulatorProvider({ children }: { children: React.ReactNode }) {
  const { resources, report } = useData();
  const [enabled, setEnabled] = useState(false);
  const [graviton, setGraviton] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const setOverride = useCallback((id: string, region: string) => {
    setOverrides((prev) => ({ ...prev, [id]: region }));
  }, []);

  const clearOverrides = useCallback(() => setOverrides({}), []);

  const applyQuickWins = useCallback(() => {
    const next: Record<string, string> = {};
    for (const r of resources) {
      const target = QUICK_WIN_TARGETS[r.region];
      if (target) next[r.id] = target;
    }
    setOverrides(next);
  }, [resources]);

  const simulatedReport = useMemo(() => {
    if (!enabled || resources.length === 0) return null;
    const simResources = resources.map((r) => ({
      ...r,
      region: overrides[r.id] ?? r.region,
      usageKwh:
        graviton && r.service === "EC2"
          ? r.usageKwh * 0.8
          : r.usageKwh,
    }));
    return calculateFootprint(simResources);
  }, [enabled, resources, overrides, graviton]);

  const co2Saved = report && simulatedReport
    ? Math.max(0, report.totalCO2kg - simulatedReport.totalCO2kg)
    : 0;

  const percentSaved = report && report.totalCO2kg > 0
    ? (co2Saved / report.totalCO2kg) * 100
    : 0;

  return (
    <SimulatorContext.Provider
      value={{
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
      }}
    >
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator(): SimulatorContextValue {
  const ctx = useContext(SimulatorContext);
  if (!ctx) throw new Error("useSimulator must be used inside <SimulatorProvider>");
  return ctx;
}
