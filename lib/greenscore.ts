import type { FootprintReport } from "@/types";

export interface GreenScoreResult {
  score: number;          // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  color: string;          // shields.io color name
  weightedIntensity: number; // gCO2/kWh
  shieldsUrl: string;
  badgeMarkdown: string;
}

export function computeGreenScore(report: FootprintReport): GreenScoreResult {
  const totalKwh = report.byService.reduce((s, r) => s + r.usageKwh, 0);

  // Weighted average intensity across all resources
  let weightedIntensity = 0;
  if (totalKwh > 0) {
    const numerator = report.byRegion.reduce(
      (sum, r) => sum + r.usageKwh * r.carbonIntensity,
      0
    );
    weightedIntensity = numerator / totalKwh;
  }

  // Scale: 760 g/kWh (ap-southeast-2, worst) → score 0; 0 g/kWh → score 100
  const score = Math.max(0, Math.round(100 - (weightedIntensity / 760) * 100));

  let grade: GreenScoreResult["grade"];
  let color: string;
  if (score >= 80) { grade = "A"; color = "brightgreen"; }
  else if (score >= 60) { grade = "B"; color = "green"; }
  else if (score >= 40) { grade = "C"; color = "yellow"; }
  else if (score >= 20) { grade = "D"; color = "orange"; }
  else { grade = "F"; color = "red"; }

  const shieldsUrl = `https://img.shields.io/badge/GreenScore-${score}%2F100-${color}?logo=leaf&logoColor=white`;
  const badgeMarkdown = `[![GreenScore](${shieldsUrl})](https://github.com)`;

  return { score, grade, color, weightedIntensity, shieldsUrl, badgeMarkdown };
}
