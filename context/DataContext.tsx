"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { CloudResource, FootprintReport } from "@/types";
import { calculateFootprint } from "@/lib/carbon";
import { parseFile } from "@/lib/parsers";
import sampleData from "@/data/sample-billing.json";

interface DataContextValue {
  resources: CloudResource[];
  report: FootprintReport | null;
  isLoading: boolean;
  error: string | null;
  loadSampleData: () => void;
  loadFile: (content: string, filename: string) => void;
  clearData: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [report, setReport] = useState<FootprintReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyResources = useCallback((res: CloudResource[]) => {
    setResources(res);
    setReport(calculateFootprint(res));
    setError(null);
  }, []);

  const loadSampleData = useCallback(() => {
    setIsLoading(true);
    try {
      const res = sampleData.resources as CloudResource[];
      applyResources(res);
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  }, [applyResources]);

  const loadFile = useCallback((content: string, filename: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsed = parseFile(content, filename);
      applyResources(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, [applyResources]);

  const clearData = useCallback(() => {
    setResources([]);
    setReport(null);
    setError(null);
  }, []);

  return (
    <DataContext.Provider value={{ resources, report, isLoading, error, loadSampleData, loadFile, clearData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}
