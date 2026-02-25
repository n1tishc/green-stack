# GreenStack — Carbon & Cost Command Center

A developer-focused dashboard that ingests cloud billing exports, calculates CO₂ emissions per resource, visualizes spend vs. carbon over time, and uses Gemini AI to generate actionable green refactoring suggestions.

---

## Features

- **File ingestion** — drag-and-drop or upload `.json` / `.csv` billing exports (no live AWS/GCP connection needed)
- **Carbon math** — static region → carbon intensity map (16 AWS regions, gCO₂eq/kWh)
- **Dashboard** — 4 KPI cards + dual-axis trend chart + service breakdown bar chart + region heatmap
- **AI Green Advisor** — sends top 5 highest-carbon resources to Gemini 2.5 Flash; returns runtime swap, region migration, and architectural suggestions with CO₂/cost reduction estimates
- **Dark mode** — toggle in the sidebar, persisted via `localStorage`
- **Sample data** — built-in demo dataset (15 resources, 4 regions, 4 services) — no upload needed

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| UI Components | Tremor |
| Charts | Recharts |
| Icons | Lucide React |
| CSV Parsing | PapaParse |
| AI | Google Gemini 2.5 Flash (`@google/generative-ai`) |

---

## Project Structure

```
app/
  layout.tsx              — root layout (sidebar + DataProvider)
  page.tsx                — main dashboard page
  api/
    advisor/route.ts      — Gemini API route (server-side, key stays safe)
components/
  Sidebar.tsx             — navigation + dark mode toggle
  SummaryMetrics.tsx      — 4 KPI summary cards
  Upload.tsx              — drag-and-drop file upload + "Load Sample" button
  GreenAdvisor.tsx        — AI suggestions UI
  charts/
    CarbonCostTrend.tsx   — dual-axis Recharts LineChart (CO₂ + cost over time)
    ServiceBreakdown.tsx  — Tremor BarChart (carbon by service)
    RegionHeatmap.tsx     — color-coded region list by carbon intensity
context/
  DataContext.tsx          — global React context for parsed billing data
lib/
  carbon.ts               — carbon intensity map + calculateFootprint()
  parsers.ts              — CSV/JSON → CloudResource[]
data/
  sample-billing.json     — 15 fake resources (demo mode)
  sample-billing.csv      — 8-row CSV sample for upload testing
types/
  index.ts                — CloudResource, FootprintReport, GreenSuggestion types
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Gemini API key

```bash
cp .env.local.example .env.local
# Edit .env.local and add your key:
# GEMINI_API_KEY=your_key_here
```

Get a free key at [aistudio.google.com](https://aistudio.google.com/app/apikey).

### 3. Run the dev server

```bash
npm run dev
# → http://localhost:3000
```

### 4. Try it out

- Click **"Load Sample"** on the upload card to load demo data instantly
- Or drag-and-drop `data/sample-billing.csv` / `data/sample-billing.json`
- Scroll to **AI Green Advisor** and click **"Analyze & Get Suggestions"**

---

## Carbon Intensity Map

| Region | gCO₂eq/kWh | Notes |
|---|---|---|
| eu-north-1 | 8 | Stockholm — almost zero (hydro) |
| eu-west-3 | 56 | Paris — nuclear |
| sa-east-1 | 68 | São Paulo — hydro |
| ca-central-1 | 120 | Canada — hydro |
| us-west-2 | 136 | Oregon — hydro/wind |
| eu-west-2 | 228 | London |
| us-west-1 | 210 | N. California |
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
GEMINI_API_KEY = your_key_here
```

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
