"use client";

import { useState } from "react";
import {
  Leaf, Zap, Globe, Code, Lightbulb, AlertCircle,
  Sparkles, Code2, Download, Copy, Check, Loader2,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import type { GreenSuggestion } from "@/types";

/* ─── category / effort style maps ─── */

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  runtime: Code,
  region: Globe,
  architecture: Zap,
  general: Lightbulb,
};

const EFFORT_STYLES: Record<string, string> = {
  Low: "bg-emerald-50 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-300",
  Medium: "bg-amber-50 dark:bg-amber-900/25 text-amber-700 dark:text-amber-300",
  High: "bg-red-50 dark:bg-red-900/25 text-red-700 dark:text-red-300",
};

const CATEGORY_STYLES: Record<string, string> = {
  runtime: "bg-blue-50 dark:bg-blue-900/25 text-blue-700 dark:text-blue-300",
  region: "bg-teal-50 dark:bg-teal-900/25 text-teal-700 dark:text-teal-300",
  architecture: "bg-violet-50 dark:bg-violet-900/25 text-violet-700 dark:text-violet-300",
  general: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300",
};

function Chip({ label, style }: { label: string; style: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${style}`}>
      {label}
    </span>
  );
}

/* ─── copy button ─── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

/* ─── download helper ─── */

function downloadTf(code: string, filename: string) {
  const blob = new Blob([code], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ─── per-suggestion remediation state ─── */

interface RemediationState {
  loading: boolean;
  code: string | null;
  filename: string;
  error: string | null;
}

/* ─── main component ─── */

export default function GreenAdvisor() {
  const { resources } = useData();
  const [suggestions, setSuggestions] = useState<GreenSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [remediations, setRemediations] = useState<Record<number, RemediationState>>({});

  /* ── analyse ── */
  const analyze = async () => {
    if (!resources.length) return;
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setRemediations({});
    setProgress(0);

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

  /* ── generate fix for one suggestion ── */
  const generateFix = async (suggestion: GreenSuggestion, idx: number) => {
    setRemediations((prev) => ({
      ...prev,
      [idx]: { loading: true, code: null, filename: "", error: null },
    }));

    try {
      const res = await fetch("/api/remediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestion, resources }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "API error");
      setRemediations((prev) => ({
        ...prev,
        [idx]: { loading: false, code: data.code, filename: data.filename, error: null },
      }));
    } catch (e) {
      setRemediations((prev) => ({
        ...prev,
        [idx]: {
          loading: false,
          code: null,
          filename: "",
          error: e instanceof Error ? e.message : String(e),
        },
      }));
    }
  };

  /* ── render ── */
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 shadow-sm" id="advisor">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-gray-800 dark:text-white leading-tight">AI Green Advisor</h2>
            <p className="text-[11px] text-gray-400 dark:text-slate-500">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>
        <button
          onClick={analyze}
          disabled={loading || !resources.length}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-emerald-200 dark:shadow-none"
        >
          <Sparkles className="w-4 h-4" />
          {loading ? "Analyzing…" : "Analyze & Get Suggestions"}
        </button>
      </div>

      {!resources.length && (
        <div className="py-10 text-center text-gray-400 dark:text-slate-500 text-sm">
          Load billing data first to enable AI analysis.
        </div>
      )}

      {/* Analysis progress */}
      {loading && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500">
            <span>Consulting Gemini 2.5 Flash…</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Analysis error */}
      {error && (
        <div className="mt-4 flex items-start gap-2.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Suggestion cards */}
      {suggestions.length > 0 && (
        <div className="mt-4 space-y-3">
          {suggestions.map((s, i) => {
            const Icon = CATEGORY_ICONS[s.category] ?? Lightbulb;
            const rem = remediations[i];

            return (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40 overflow-hidden transition-colors hover:border-emerald-200 dark:hover:border-emerald-800"
              >
                {/* Suggestion body */}
                <div className="p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-slate-200 font-medium leading-relaxed">
                      {s.suggestion}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <Chip label={`🌿 ${s.estimatedCO2Reduction} CO₂`} style="bg-emerald-50 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-300" />
                      <Chip label={`💰 ${s.estimatedCostSavings}`} style="bg-blue-50 dark:bg-blue-900/25 text-blue-700 dark:text-blue-300" />
                      <Chip label={`Effort: ${s.effort}`} style={EFFORT_STYLES[s.effort] ?? EFFORT_STYLES.Medium} />
                      <Chip label={s.category} style={CATEGORY_STYLES[s.category] ?? CATEGORY_STYLES.general} />
                    </div>
                  </div>

                  {/* Generate Fix button */}
                  {!rem && (
                    <button
                      onClick={() => generateFix(s, i)}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      Generate Fix
                    </button>
                  )}
                  {rem?.loading && (
                    <span className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating…
                    </span>
                  )}
                </div>

                {/* Remediation error */}
                {rem?.error && (
                  <div className="mx-4 mb-4 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {rem.error}
                  </div>
                )}

                {/* Generated Terraform code */}
                {rem?.code && (
                  <div className="border-t border-gray-100 dark:border-slate-700">
                    {/* Code header bar */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 dark:bg-slate-900/80">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-400 font-mono">
                          {rem.filename}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CopyButton text={rem.code} />
                        <button
                          onClick={() => downloadTf(rem.code!, rem.filename)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download .tf
                        </button>
                      </div>
                    </div>

                    {/* Code body */}
                    <pre className="text-xs font-mono text-emerald-300 bg-slate-900 dark:bg-slate-950 p-4 overflow-x-auto leading-relaxed max-h-72">
                      {rem.code}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
