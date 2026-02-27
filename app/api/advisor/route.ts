import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CloudResource, GreenSuggestion } from "@/types";
import { getRegionIntensity } from "@/lib/carbon";

const SYSTEM_PROMPT = `You are a cloud sustainability expert. Given a list of cloud resources with their CO2 emissions, suggest specific actionable improvements to reduce carbon footprint and costs.

For each suggestion, respond ONLY with a valid JSON array. Do not add markdown formatting or explanation text.

Each suggestion object must have these exact keys:
- suggestion: string (concise, actionable, 1-2 sentences)
- estimatedCO2Reduction: string (e.g. "~30%" or "~1.2 kg/month")
- estimatedCostSavings: string (e.g. "~$15/month")
- effort: "Low" | "Medium" | "High"
- category: "runtime" | "region" | "architecture" | "general"

Return 4-6 suggestions.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  let resources: CloudResource[];
  try {
    const body = await req.json();
    resources = body.resources;
    if (!Array.isArray(resources)) throw new Error("Invalid payload");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Take top 5 highest-carbon resources
  const topResources = [...resources]
    .sort((a, b) => b.usageKwh * getRegionIntensity(b.region) - a.usageKwh * getRegionIntensity(a.region))
    .slice(0, 5);

  const userMessage = `Here are the top 5 highest-carbon cloud resources:

${JSON.stringify(topResources, null, 2)}

Carbon intensity map (gCO2eq/kWh):
- us-east-1: 415 (Virginia, coal-heavy)
- us-east-2: 410
- us-west-1: 210
- us-west-2: 136 (Oregon, hydro/wind — very clean)
- eu-west-1: 316 (Ireland)
- eu-west-2: 228
- eu-west-3: 56 (Paris, nuclear — very clean)
- eu-central-1: 338 (Frankfurt)
- eu-north-1: 8 (Stockholm, almost zero)
- ap-southeast-1: 493 (Singapore, gas-heavy)
- ap-southeast-2: 760 (Sydney, coal-heavy)
- ap-northeast-1: 506 (Tokyo)
- ap-south-1: 708 (Mumbai, coal)
- sa-east-1: 68 (São Paulo, hydro)
- ca-central-1: 120

Provide green refactoring suggestions.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: userMessage },
    ]);

    const text = result.response.text();

    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found in response");

    const suggestions: GreenSuggestion[] = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ suggestions });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Gemini error: ${msg}` }, { status: 500 });
  }
}

