# GreenStack — Carbon & Cost Command Center

A developer-focused dashboard that ingests cloud billing exports, calculates CO₂ emissions per resource, visualizes spend vs. carbon over time, and uses Gemini AI to generate actionable green refactoring suggestions — including one-click Terraform remediation.

---

## Features

- **File ingestion** — drag-and-drop or upload `.json` / `.csv` billing exports (no live AWS/GCP connection needed)
- **Carbon math** — static region → carbon intensity map (16 AWS regions, gCO₂eq/kWh)
- **Dashboard** — 4 KPI cards + gradient area trend chart + service breakdown bar chart + region heatmap
- **GreenScore** — letter-grade (A–F) carbon efficiency score with shareable shields.io badge and GitHub Actions CI snippet
- **What-If Simulator** — toggle regions and Graviton instances per resource to preview CO₂ and cost savings before committing
- **IaC Audit** — upload or paste Terraform `.tf` files; Gemini AI extracts resources and computes their footprint
- **AI Green Advisor** — analyzes your top carbon-emitting resources and returns categorized suggestions with CO₂/cost reduction estimates
- **One-Click Remediation** — each AI suggestion has a "Generate Fix" button that calls Gemini to produce a ready-to-apply Terraform `.tf` file, downloadable instantly
- **Dark mode** — fixed top-right toggle switch, persisted via `localStorage`
- **Sample data** — built-in demo dataset (15 resources, 4 regions, 4 services) — no upload needed

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| CSV Parsing | PapaParse |
| AI | Google Gemini 2.5 Flash (`@google/generative-ai`) |

---

## Project Structure

```
app/
  layout.tsx                 — root layout (DataProvider + DarkModeToggle)
  page.tsx                   — main dashboard page
  api/
    advisor/route.ts         — Gemini: generate green suggestions
    iac-parse/route.ts       — Gemini: parse Terraform HCL → CloudResource[]
    remediate/route.ts       — Gemini: generate optimized Terraform fix for a suggestion
components/
  Sidebar.tsx                — grouped navigation (Overview / Data / Analytics / Tools)
  DarkModeToggle.tsx         — fixed top-right toggle switch
  GreenBadge.tsx             — GreenScore ring + shields.io badge + GitHub Action YAML
  GreenAdvisor.tsx           — AI suggestions + per-card "Generate Fix" → download .tf
  IaCUpload.tsx              — Terraform upload / paste UI
  Upload.tsx                 — billing file drag-and-drop
  charts/
    CarbonCostTrend.tsx      — gradient AreaChart (CO₂ + cost over time)
    ServiceBreakdown.tsx     — grouped BarChart + ranked proportional bar list
    RegionHeatmap.tsx        — region intensity list with proportional fill bars
    CarbonLatencyScatter.tsx — all-regions scatter (carbon × latency sweet-spot)
    DualPathChart.tsx        — current vs. simulated CO₂ grouped bar chart
  simulator/
    WhatIfSimulator.tsx      — region override table + Graviton toggle + savings summary
context/
  DataContext.tsx            — global billing state (resources + footprint report)
  SimulatorContext.tsx       — what-if overrides + simulated report
lib/
  carbon.ts                  — carbon intensity map + calculateFootprint()
  greenscore.ts              — computeGreenScore() → score / grade / badge URL
  parsers.ts                 — CSV/JSON → CloudResource[]
  terraform-parser.ts        — regex HCL parser → CloudResource[]
data/
  region-meta.ts             — latency + cost multipliers for 16 regions
  sample-billing.json        — 15 fake resources (demo mode)
  sample-billing.csv         — 8-row CSV sample for upload testing
types/
  index.ts                   — CloudResource, FootprintReport, GreenSuggestion types
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Add your Gemini API key (the only required variable):

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) |

### 3. Run the dev server

```bash
npm run dev
# → http://localhost:3000
```

### 4. Try it out

1. Click **"Load Sample Data"** to load the built-in demo dataset
2. Explore the dashboard — KPI cards, trend chart, region heatmap, scatter plot
3. Scroll to **What-If Simulator** — toggle regions and Graviton to model savings
4. Scroll to **AI Green Advisor** → click **"Analyze & Get Suggestions"**
5. On any suggestion card, click **"Generate Fix"** — Gemini produces a ready-to-apply `.tf` file
6. Click **"Download .tf"** to save it, or **"Copy"** to paste directly into your repo

---

## One-Click Remediation

The standout feature: instead of just telling you what to change, GreenStack generates the fix.

```
User clicks "Generate Fix" on a suggestion card
  → POST /api/remediate { suggestion, resources }
  → Gemini receives: the suggestion text, category, effort level,
    CO₂/cost estimates, and the top 5 highest-carbon resources
  → Gemini returns: complete Terraform HCL with
      • Header comment block (what changed + CO₂/cost savings)
      • Full resource blocks referencing actual resource IDs
      • Correct conventions (variables, no hardcoded creds)
  → Code panel opens below the suggestion:
      • Syntax-highlighted dark code block
      • "Copy" button
      • "Download .tf" button (e.g. greenstack-region-remediation.tf)
```

Each suggestion generates a file named after its category:
- `greenstack-region-remediation.tf` — region migration
- `greenstack-runtime-remediation.tf` — Graviton / instance type
- `greenstack-architecture-remediation.tf` — structural changes
- `greenstack-general-remediation.tf` — general optimizations

---

## Supported File Formats

**JSON** — array or `{ resources: [...] }` wrapper:
```json
[
  { "service": "EC2", "region": "us-east-1", "usageKwh": 12.4, "costUSD": 48.30, "date": "2026-01-01" }
]
```

**CSV** — header row with columns `service`, `region`, `usageKwh` (or `usage_kwh`), `costUSD` (or `cost_usd`), `date`:
```csv
service,region,usageKwh,costUSD,date
EC2,us-east-1,12.4,48.30,2026-01-01
```

**Terraform `.tf`** — upload or paste HCL; supported resource types: `aws_instance`, `aws_db_instance`, `aws_lambda_function`, `aws_s3_bucket`, `google_compute_instance`, `azurerm_virtual_machine`.

---

## Carbon Intensity Map

| Region | gCO₂eq/kWh | Notes |
|---|---|---|
| eu-north-1 | 8 | Stockholm — almost zero (hydro) |
| eu-west-3 | 56 | Paris — nuclear |
| sa-east-1 | 68 | São Paulo — hydro |
| ca-central-1 | 120 | Canada — hydro |
| us-west-2 | 136 | Oregon — hydro/wind |
| us-west-1 | 210 | N. California |
| eu-west-2 | 228 | London |
| eu-west-1 | 316 | Ireland |
| eu-central-1 | 338 | Frankfurt |
| us-east-2 | 410 | Ohio |
| us-east-1 | 415 | Virginia — coal-heavy |
| ap-northeast-2 | 415 | Seoul |
| ap-southeast-1 | 493 | Singapore — gas-heavy |
| ap-northeast-1 | 506 | Tokyo |
| ap-south-1 | 708 | Mumbai — coal |
| ap-southeast-2 | 760 | Sydney — coal-heavy |

---

## Deploy to Vercel

```bash
npx vercel
```

In Vercel dashboard → **Settings → Environment Variables**, add:
```
GEMINI_API_KEY
```

---

## Scripts

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint
```
