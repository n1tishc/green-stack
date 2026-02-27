import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CloudResource, GreenSuggestion } from "@/types";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are a senior Terraform/Infrastructure-as-Code engineer.
Your task is to generate production-quality Terraform HCL that implements a specific cloud optimization.

Rules:
- Output ONLY valid Terraform HCL. No markdown fences, no prose explanations outside of # comments.
- Open with a clearly formatted comment block (lines starting with #) that states:
    • What this file does
    • The optimization being applied
    • Estimated CO₂ reduction
    • Estimated cost savings
- Use resource names and IDs from the provided resource data where possible.
- Generate complete, copy-pasteable resource blocks (not diffs or partial snippets).
- For region migrations: update both the provider default_region and the resource's region/availability_zone.
- For instance type changes (Graviton, right-sizing): update instance_type and add lifecycle tags.
- For runtime/architecture changes: update the relevant fields and add a comment explaining the rationale.
- Use variables for credentials and secrets — never hardcode them.
- Follow Terraform style conventions (2-space indent, snake_case resource labels).
- If the suggestion applies to multiple resources, generate blocks for each one.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  let suggestion: GreenSuggestion;
  let resources: CloudResource[];
  try {
    const body = await req.json();
    suggestion = body.suggestion;
    resources = body.resources;
    if (!suggestion || !Array.isArray(resources)) throw new Error("Invalid payload");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Send only the top 5 highest-carbon resources to keep the prompt focused
  const top = [...resources]
    .map((r) => ({ ...r, _co2: r.usageKwh * (INTENSITY[r.region] ?? 400) }))
    .sort((a, b) => b._co2 - a._co2)
    .slice(0, 5)
    .map(({ _co2, ...r }) => r);

  const userMessage = `
Optimization suggestion to implement:
  "${suggestion.suggestion}"

Category: ${suggestion.category}
Estimated CO₂ reduction: ${suggestion.estimatedCO2Reduction}
Estimated cost savings: ${suggestion.estimatedCostSavings}
Implementation effort: ${suggestion.effort}

Top 5 highest-carbon resources (current state):
${JSON.stringify(top, null, 2)}

Carbon intensity reference (gCO₂eq/kWh):
  eu-north-1=8, eu-west-3=56, sa-east-1=68, ca-central-1=120,
  us-west-2=136, eu-west-2=228, us-west-1=210, eu-west-1=316,
  eu-central-1=338, us-east-2=410, us-east-1=415, ap-northeast-2=415,
  ap-southeast-1=493, ap-northeast-1=506, ap-south-1=708, ap-southeast-2=760

Generate the Terraform HCL that implements this optimization.`.trim();

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: userMessage },
    ]);

    let code = result.response.text().trim();

    // Strip any accidental markdown fences
    code = code.replace(/^```(?:hcl|terraform)?\s*/i, "").replace(/\s*```$/, "").trim();

    // Derive a sensible filename from the category
    const filename = `greenstack-${suggestion.category}-remediation.tf`;

    return NextResponse.json({ code, filename });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Gemini error: ${msg}` }, { status: 500 });
  }
}

const INTENSITY: Record<string, number> = {
  "us-east-1": 415, "us-east-2": 410, "us-west-1": 210, "us-west-2": 136,
  "eu-west-1": 316, "eu-west-2": 228, "eu-west-3": 56, "eu-central-1": 338,
  "eu-north-1": 8, "ap-southeast-1": 493, "ap-southeast-2": 760,
  "ap-northeast-1": 506, "ap-northeast-2": 415, "ap-south-1": 708,
  "sa-east-1": 68, "ca-central-1": 120,
};
