import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CloudResource } from "@/types";

const SYSTEM_PROMPT = `You are a cloud infrastructure analyst. Given Terraform HCL configuration, extract all AWS resources and estimate their monthly energy usage and cost.

Respond ONLY with a valid JSON array of resource objects. No markdown, no explanation.

Each object must have these exact keys:
- id: string (unique, e.g. "tf-ec2-web")
- service: "EC2" | "Lambda" | "RDS" | "S3" | "CloudFront"
- region: string (AWS region code, e.g. "us-east-1")
- usageKwh: number (estimated monthly kWh)
- costUSD: number (estimated monthly cost in USD)
- date: string (today's date YYYY-MM-DD)
- description: string (e.g. "terraform: web_server (t3.medium)")

Energy estimates (watts × 730h/1000):
- t3.micro=2.5W, t3.small=5W, t3.medium=10W, t3.large=20W
- m5.large=34W, m5.xlarge=68W, r5.large=48W, r5.xlarge=96W
- Lambda: 1 kWh/month default
- RDS db.t3.micro: 15 kWh, db.t3.medium: 40 kWh, db.m5.large: 80 kWh
- S3: 0.5 kWh/month`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  let content: string;
  try {
    const body = await req.json();
    content = body.content;
    if (!content || typeof content !== "string") throw new Error("Invalid payload");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const today = new Date().toISOString().slice(0, 10);
    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: `Today's date is ${today}.\n\nTerraform HCL:\n\`\`\`hcl\n${content}\n\`\`\`` },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array in response");

    const resources: CloudResource[] = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ resources });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Parse error: ${msg}` }, { status: 500 });
  }
}
