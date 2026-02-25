import Papa from "papaparse";
import type { CloudResource } from "@/types";

let idCounter = 0;
function nextId(): string {
  return `r-${Date.now()}-${idCounter++}`;
}

// ─── JSON parser (AWS Cost Explorer style) ───────────────────────────────────

export interface RawJsonResource {
  id?: string;
  service?: string;
  region?: string;
  usageKwh?: number;
  usage_kwh?: number;
  costUSD?: number;
  cost_usd?: number;
  date?: string;
  description?: string;
}

export function parseJSON(raw: unknown): CloudResource[] {
  let items: RawJsonResource[] = [];

  if (Array.isArray(raw)) {
    items = raw as RawJsonResource[];
  } else if (raw && typeof raw === "object" && "resources" in raw) {
    items = (raw as { resources: RawJsonResource[] }).resources;
  } else {
    throw new Error("Unrecognized JSON format. Expected an array or {resources:[...]}.");
  }

  return items.map((item) => ({
    id: item.id ?? nextId(),
    service: item.service ?? "Unknown",
    region: item.region ?? "us-east-1",
    usageKwh: Number(item.usageKwh ?? item.usage_kwh ?? 0),
    costUSD: Number(item.costUSD ?? item.cost_usd ?? 0),
    date: item.date ?? new Date().toISOString().split("T")[0],
    description: item.description,
  }));
}

// ─── CSV parser ───────────────────────────────────────────────────────────────

const CSV_FIELD_MAP: Record<string, keyof CloudResource> = {
  service: "service",
  region: "region",
  usagekwh: "usageKwh",
  usage_kwh: "usageKwh",
  usage: "usageKwh",
  costusd: "costUSD",
  cost_usd: "costUSD",
  cost: "costUSD",
  date: "date",
  description: "description",
  id: "id",
};

export function parseCSV(csvText: string): CloudResource[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error(`CSV parse error: ${result.errors[0].message}`);
  }

  return result.data.map((row) => {
    const resource: Partial<CloudResource> & { id: string } = { id: nextId() };

    for (const [rawKey, value] of Object.entries(row)) {
      const field = CSV_FIELD_MAP[rawKey];
      if (!field) continue;

      if (field === "usageKwh" || field === "costUSD") {
        (resource as Record<string, unknown>)[field] = parseFloat(value) || 0;
      } else {
        (resource as Record<string, unknown>)[field] = value.trim();
      }
    }

    return {
      id: resource.id,
      service: resource.service ?? "Unknown",
      region: resource.region ?? "us-east-1",
      usageKwh: resource.usageKwh ?? 0,
      costUSD: resource.costUSD ?? 0,
      date: resource.date ?? new Date().toISOString().split("T")[0],
      description: resource.description,
    } as CloudResource;
  });
}

// ─── Auto-detect and parse ────────────────────────────────────────────────────

export function parseFile(content: string, filename: string): CloudResource[] {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "csv") {
    return parseCSV(content);
  }
  if (ext === "json") {
    try {
      const parsed = JSON.parse(content);
      return parseJSON(parsed);
    } catch {
      throw new Error("Invalid JSON file.");
    }
  }
  throw new Error(`Unsupported file type: .${ext}. Please upload a .csv or .json file.`);
}
