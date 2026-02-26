"use client";

import { useState } from "react";
import { Card, Text } from "@tremor/react";
import { Copy, Check, Award } from "lucide-react";
import { computeGreenScore } from "@/lib/greenscore";
import type { FootprintReport } from "@/types";

const GITHUB_ACTION_YAML = `# .github/workflows/carbon-check.yml
name: Carbon Check

on:
  pull_request:
    branches: [main]

jobs:
  greenscore:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      - name: Run GreenStack carbon check
        env:
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}
        run: npx greenstack check --fail-below 60

      - name: Comment GreenScore on PR
        uses: actions/github-script@v7
        with:
          script: |
            const score = require('./greenscore.json');
            github.rest.issues.createComment({
              ...context.repo,
              issue_number: context.issue.number,
              body: \`## 🌿 GreenScore: \${score.score}/100 (Grade \${score.grade})\`
            });`;

const gradeColors: Record<string, string> = {
  A: "text-emerald-600 dark:text-emerald-400",
  B: "text-green-600 dark:text-green-400",
  C: "text-yellow-600 dark:text-yellow-400",
  D: "text-orange-600 dark:text-orange-400",
  F: "text-red-600 dark:text-red-400",
};

const ringColors: Record<string, string> = {
  A: "ring-emerald-400",
  B: "ring-green-400",
  C: "ring-yellow-400",
  D: "ring-orange-400",
  F: "ring-red-400",
};

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
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

interface Props {
  report: FootprintReport;
}

export default function GreenBadge({ report }: Props) {
  const gs = computeGreenScore(report);

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700" id="badge">
      <div className="flex items-center gap-2 mb-4">
        <Award className="text-emerald-500 w-5 h-5" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">GreenScore Badge</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Score ring */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div
            className={`w-28 h-28 rounded-full ring-8 ${ringColors[gs.grade]} flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-inner`}
          >
            <span className={`text-4xl font-black ${gradeColors[gs.grade]}`}>{gs.grade}</span>
            <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">{gs.score}/100</span>
          </div>
          <Text className="text-xs text-gray-500 dark:text-slate-400">
            Avg {Math.round(gs.weightedIntensity)} gCO₂/kWh
          </Text>
        </div>

        {/* Badge + YAML */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Shield badge */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Shields.io Badge</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gs.shieldsUrl} alt={`GreenScore ${gs.score}/100`} className="mb-2" />
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 dark:bg-slate-700 rounded px-2 py-1 text-gray-700 dark:text-slate-300 flex-1 truncate">
                {gs.badgeMarkdown}
              </code>
              <CopyButton text={gs.badgeMarkdown} />
            </div>
          </div>

          {/* GitHub Action YAML */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">GitHub Action — PR Carbon Check</p>
            <div className="relative">
              <pre className="text-xs bg-gray-900 text-emerald-300 rounded-lg p-3 overflow-x-auto max-h-48 leading-relaxed">
                {GITHUB_ACTION_YAML}
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={GITHUB_ACTION_YAML} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
