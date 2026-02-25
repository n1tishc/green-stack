export interface CloudResource {
  id: string;
  service: "Lambda" | "EC2" | "S3" | "RDS" | "CloudFront" | string;
  region: string;
  usageKwh: number;
  costUSD: number;
  date: string; // ISO date string YYYY-MM-DD
  description?: string;
}

export interface FootprintReport {
  totalCO2grams: number;
  totalCO2kg: number;
  totalCostUSD: number;
  avgCarbonIntensity: number;
  greenestRegion: string;
  mostExpensiveService: string;
  highestCarbonService: string;
  byService: ServiceBreakdown[];
  byRegion: RegionBreakdown[];
  byDate: DateBreakdown[];
  resources: CloudResource[];
}

export interface ServiceBreakdown {
  service: string;
  co2grams: number;
  co2kg: number;
  costUSD: number;
  usageKwh: number;
}

export interface RegionBreakdown {
  region: string;
  carbonIntensity: number;
  co2grams: number;
  co2kg: number;
  costUSD: number;
  usageKwh: number;
}

export interface DateBreakdown {
  date: string;
  co2kg: number;
  costUSD: number;
}

export interface GreenSuggestion {
  suggestion: string;
  estimatedCO2Reduction: string;
  estimatedCostSavings: string;
  effort: "Low" | "Medium" | "High";
  category: "runtime" | "region" | "architecture" | "general";
}
