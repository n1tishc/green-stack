import type {
  CloudResource,
  FootprintReport,
  ServiceBreakdown,
  RegionBreakdown,
  DateBreakdown,
} from "@/types";

// Carbon intensity map: gCO2eq per kWh
export const REGION_CARBON_INTENSITY: Record<string, number> = {
  "us-east-1": 415,    // Virginia — coal-heavy
  "us-east-2": 410,    // Ohio
  "us-west-1": 210,    // N. California — mix
  "us-west-2": 136,    // Oregon — hydro/wind
  "eu-west-1": 316,    // Ireland
  "eu-west-2": 228,    // London
  "eu-west-3": 56,     // Paris — nuclear
  "eu-central-1": 338, // Frankfurt
  "eu-north-1": 8,     // Stockholm — almost zero (hydro)
  "ap-southeast-1": 493, // Singapore — gas-heavy
  "ap-southeast-2": 760, // Sydney — coal-heavy
  "ap-northeast-1": 506, // Tokyo
  "ap-northeast-2": 415, // Seoul
  "ap-south-1": 708,   // Mumbai — coal
  "sa-east-1": 68,     // São Paulo — hydro
  "ca-central-1": 120, // Canada — hydro
};

export const DEFAULT_INTENSITY = 400; // fallback for unknown regions

export function getRegionIntensity(region: string): number {
  return REGION_CARBON_INTENSITY[region] ?? DEFAULT_INTENSITY;
}

/**
 * Calculate CO2 emissions in grams for a given usage and region.
 */
export function calculateCarbon(usageKwh: number, region: string): number {
  const intensity = getRegionIntensity(region);
  return usageKwh * intensity; // gCO2eq
}

/**
 * Aggregate all resources into a full footprint report.
 */
export function calculateFootprint(resources: CloudResource[]): FootprintReport {
  if (resources.length === 0) {
    return {
      totalCO2grams: 0,
      totalCO2kg: 0,
      totalCostUSD: 0,
      avgCarbonIntensity: 0,
      greenestRegion: "N/A",
      mostExpensiveService: "N/A",
      highestCarbonService: "N/A",
      byService: [],
      byRegion: [],
      byDate: [],
      resources: [],
    };
  }

  let totalCO2grams = 0;
  let totalCostUSD = 0;
  let totalKwh = 0;

  const serviceMap: Record<string, ServiceBreakdown> = {};
  const regionMap: Record<string, RegionBreakdown> = {};
  const dateMap: Record<string, DateBreakdown> = {};

  for (const r of resources) {
    const co2 = calculateCarbon(r.usageKwh, r.region);
    totalCO2grams += co2;
    totalCostUSD += r.costUSD;
    totalKwh += r.usageKwh;

    // By service
    if (!serviceMap[r.service]) {
      serviceMap[r.service] = { service: r.service, co2grams: 0, co2kg: 0, costUSD: 0, usageKwh: 0 };
    }
    serviceMap[r.service].co2grams += co2;
    serviceMap[r.service].costUSD += r.costUSD;
    serviceMap[r.service].usageKwh += r.usageKwh;

    // By region
    if (!regionMap[r.region]) {
      regionMap[r.region] = {
        region: r.region,
        carbonIntensity: getRegionIntensity(r.region),
        co2grams: 0,
        co2kg: 0,
        costUSD: 0,
        usageKwh: 0,
      };
    }
    regionMap[r.region].co2grams += co2;
    regionMap[r.region].costUSD += r.costUSD;
    regionMap[r.region].usageKwh += r.usageKwh;

    // By date
    if (!dateMap[r.date]) {
      dateMap[r.date] = { date: r.date, co2kg: 0, costUSD: 0 };
    }
    dateMap[r.date].co2kg += co2 / 1000;
    dateMap[r.date].costUSD += r.costUSD;
  }

  // Compute kg values
  for (const s of Object.values(serviceMap)) s.co2kg = s.co2grams / 1000;
  for (const r of Object.values(regionMap)) r.co2kg = r.co2grams / 1000;

  const byService = Object.values(serviceMap).sort((a, b) => b.co2grams - a.co2grams);
  const byRegion = Object.values(regionMap).sort((a, b) => b.co2grams - a.co2grams);
  const byDate = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

  const greenestRegion = [...byRegion].sort((a, b) => a.carbonIntensity - b.carbonIntensity)[0]?.region ?? "N/A";
  const mostExpensiveService = [...byService].sort((a, b) => b.costUSD - a.costUSD)[0]?.service ?? "N/A";
  const highestCarbonService = byService[0]?.service ?? "N/A";

  const avgCarbonIntensity = totalKwh > 0 ? totalCO2grams / totalKwh : 0;

  return {
    totalCO2grams,
    totalCO2kg: totalCO2grams / 1000,
    totalCostUSD,
    avgCarbonIntensity,
    greenestRegion,
    mostExpensiveService,
    highestCarbonService,
    byService,
    byRegion,
    byDate,
    resources,
  };
}

export function getCarbonColor(intensityOrKg: number, type: "intensity" | "kg" = "intensity"): string {
  if (type === "intensity") {
    if (intensityOrKg < 150) return "emerald";
    if (intensityOrKg < 350) return "amber";
    return "red";
  }
  // For kg
  if (intensityOrKg < 1) return "emerald";
  if (intensityOrKg < 5) return "amber";
  return "red";
}
