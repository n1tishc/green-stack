"use client";

import { useState } from "react";
import { Card, Title, Text, Badge, ProgressBar } from "@tremor/react";
import { Leaf, Zap, Globe, Code, Lightbulb, AlertCircle } from "lucide-react";
import { useData } from "@/context/DataContext";
import type { GreenSuggestion } from "@/types";

const CATEGORY_ICONS = {
  runtime: Code,
  region: Globe,
  architecture: Zap,
  general: Lightbulb,
};

const EFFORT_COLORS = {
  Low: "emerald",
  Medium: "amber",
  High: "red",
} as const;

export default function GreenAdvisor() {
  const { resources } = useData();
  const [suggestions, setSuggestions] = useState<GreenSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const analyze = async () => {
    if (!resources.length) return;
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setProgress(0);

    // Animate progress bar
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 8, 88));
    }, 400);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resources }),
      });

      clearInterval(interval);
      setProgress(100);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "API error");
      setSuggestions(data.suggestions ?? []);
    } catch (e) {
      clearInterval(interval);
      setProgress(0);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700" id="advisor">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Leaf className="text-emerald-500 w-5 h-5" />
          <Title className="dark:text-white">AI Green Advisor</Title>
        </div>
        <button
          onClick={analyze}
          disabled={loading || !resources.length}
          className="px-5 py-2 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Analyzing..." : "Analyze & Get Suggestions"}
        </button>
      </div>

      <Text className="text-gray-500 dark:text-slate-400 text-sm mb-4">
        Powered by Gemini 2.5 Flash — analyzes your top carbon-emitting resources and suggests green refactoring strategies.
      </Text>

      {!resources.length && (
        <div className="py-8 text-center text-gray-400 dark:text-slate-500 text-sm">
          Load billing data first to enable AI analysis.
        </div>
      )}

      {loading && (
        <div className="space-y-2 mt-2">
          <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500">
            <span>Consulting Gemini 1.5 Flash...</span>
            <span>{progress}%</span>
          </div>
          <ProgressBar value={progress} color="emerald" className="animate-pulse" />
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-4 space-y-3">
          {suggestions.map((s, i) => {
            const Icon = CATEGORY_ICONS[s.category] ?? Lightbulb;
            return (
              <div
                key={i}
                className="p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                    <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-slate-200 font-medium leading-relaxed">{s.suggestion}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge color="emerald" size="xs">
                        🌿 {s.estimatedCO2Reduction} CO₂
                      </Badge>
                      <Badge color="blue" size="xs">
                        💰 {s.estimatedCostSavings}
                      </Badge>
                      <Badge color={EFFORT_COLORS[s.effort] ?? "gray"} size="xs">
                        Effort: {s.effort}
                      </Badge>
                      <Badge color="violet" size="xs">
                        {s.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
