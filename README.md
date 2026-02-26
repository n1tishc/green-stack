# GreenStack — Carbon & Cost Command Center

A developer-focused dashboard that ingests cloud billing exports, calculates CO₂ emissions per resource, visualizes spend vs. carbon over time, and uses Gemini AI to generate actionable green refactoring suggestions.

---

## Features

- **File ingestion** — drag-and-drop or upload `.json` / `.csv` billing exports (no live AWS/GCP connection needed)
- **Carbon math** — static region → carbon intensity map (16 AWS regions, gCO₂eq/kWh)
- **Dashboard** — 4 KPI cards + dual-axis trend chart + service breakdown bar chart + region heatmap
- **GreenScore** — letter-grade (A–F) carbon efficiency score with shareable badge and GitHub Actions CI snippet
- **What-If Simulator** — toggle regions and Graviton instances to preview CO₂ and cost savings
- **IaC Audit** — upload or paste Terraform `.tf` files; Gemini AI extracts resources and computes their footprint
- **AI Green Advisor** — sends top 5 highest-carbon resources to Gemini 2.5 Flash; returns runtime swap, region migration, and architectural suggestions with CO₂/cost reduction estimates
- **GitHub Login** — OAuth sign-in; uploads persist to MongoDB and auto-load on next login
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
| Auth | NextAuth v4 (GitHub OAuth, JWT sessions) |
| Database | MongoDB Atlas (`@next-auth/mongodb-adapter`) |

---

## Project Structure

```
app/
  layout.tsx                    — root layout (SessionWrapper + DataProvider)
  page.tsx                      — main dashboard page
  api/
    advisor/route.ts            — Gemini AI recommendations
    auth/[...nextauth]/route.ts — NextAuth handler (GitHub OAuth)
    iac-parse/route.ts          — Gemini IaC parser
    uploads/route.ts            — GET/POST user uploads (MongoDB)
components/
  Sidebar.tsx                   — navigation + dark mode + login/logout UI
  SessionWrapper.tsx            — "use client" SessionProvider wrapper
  GreenBadge.tsx                — GreenScore badge + CI/CD snippet
  GreenAdvisor.tsx              — AI suggestions UI
  IaCUpload.tsx                 — Terraform upload / paste UI
  charts/
    CarbonLatencyScatter.tsx    — all-regions scatter (carbon × latency)
    DualPathChart.tsx           — current vs. simulated CO₂ bar chart
  simulator/
    WhatIfSimulator.tsx         — region toggle + Graviton + savings table
context/
  DataContext.tsx               — global billing state + auto-load + save on upload
  SimulatorContext.tsx          — what-if overrides state
lib/
  auth.ts                       — NextAuth authOptions (GitHub + MongoDBAdapter)
  carbon.ts                     — carbon intensity map + calculateFootprint()
  greenscore.ts                 — computeGreenScore() → score/grade/badge
  mongodb.ts                    — lazy MongoClient singleton
  parsers.ts                    — CSV/JSON → CloudResource[]
  terraform-parser.ts           — regex HCL parser → CloudResource[]
data/
  region-meta.ts                — latency + cost multipliers for 16 regions
  sample-billing.json           — 15 fake resources (demo mode)
  sample-billing.csv            — 8-row CSV sample for upload testing
types/
  index.ts                      — CloudResource, FootprintReport, GreenSuggestion types
  next-auth.d.ts                — Session type augmentation (user.id)
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

Edit `.env.local` and fill in all values:

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` (or your production URL) |
| `GITHUB_ID` | GitHub OAuth App (see below) |
| `GITHUB_SECRET` | GitHub OAuth App (see below) |
| `MONGODB_URI` | MongoDB Atlas connection string (see below) |

### 3. Create a GitHub OAuth App

1. Go to **github.com/settings/developers** → **New OAuth App**
2. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`
3. Copy the **Client ID** → `GITHUB_ID` and generate a **Client Secret** → `GITHUB_SECRET`

### 4. Set up MongoDB Atlas

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user and allow network access from your IP
3. Copy the connection string → `MONGODB_URI`, using `greenstack` as the database name:
   ```
   mongodb+srv://<user>:<pass>@cluster.mongodb.net/greenstack?retryWrites=true&w=majority
   ```

### 5. Run the dev server

```bash
npm run dev
# → http://localhost:3000
```

### 6. Try it out

- Click **"Load Sample"** on the upload card to load demo data instantly
- Or drag-and-drop `data/sample-billing.csv` / `data/sample-billing.json`
- Scroll to **AI Green Advisor** and click **"Analyze & Get Suggestions"**
- Click **"Sign in with GitHub"** in the sidebar to enable upload persistence

---

## Auth & Persistence Flow

```
Not logged in
  → Sidebar shows "Sign in with GitHub"
  → No auto-load; empty state as normal

After sign-in (GitHub OAuth)
  → Session created in MongoDB
  → Last upload automatically loads into the dashboard

After uploading a file (logged in)
  → Dashboard populates
  → Upload saved to MongoDB (fire-and-forget)

After sign-out
  → Dashboard clears
  → Next login auto-loads the saved upload
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

**Terraform `.tf`** — upload or paste HCL; supported resource types: `aws_instance`, `aws_db_instance`, `aws_lambda_function`, `google_compute_instance`, `azurerm_virtual_machine`.

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

In Vercel dashboard → **Settings → Environment Variables**, add all 6 variables:
```
GEMINI_API_KEY
NEXTAUTH_SECRET
NEXTAUTH_URL        ← set to your production URL
GITHUB_ID
GITHUB_SECRET
MONGODB_URI
```

Update your GitHub OAuth App's callback URL to match your production domain:
```
https://your-app.vercel.app/api/auth/callback/github
```

---

## Scripts

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint
```
