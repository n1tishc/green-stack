export interface RegionMeta {
  label: string;
  latencyMs: number; // approximate round-trip from North America (ms)
  costMultiplier: number; // relative to us-east-1 = 1.0
}

export const REGION_META: Record<string, RegionMeta> = {
  "us-east-1":      { label: "US East (N. Virginia)",     latencyMs: 10,  costMultiplier: 1.00 },
  "us-east-2":      { label: "US East (Ohio)",             latencyMs: 20,  costMultiplier: 0.98 },
  "us-west-1":      { label: "US West (N. California)",    latencyMs: 60,  costMultiplier: 1.10 },
  "us-west-2":      { label: "US West (Oregon)",           latencyMs: 70,  costMultiplier: 0.95 },
  "eu-west-1":      { label: "Europe (Ireland)",           latencyMs: 90,  costMultiplier: 1.08 },
  "eu-west-2":      { label: "Europe (London)",            latencyMs: 95,  costMultiplier: 1.12 },
  "eu-west-3":      { label: "Europe (Paris)",             latencyMs: 100, costMultiplier: 1.10 },
  "eu-central-1":   { label: "Europe (Frankfurt)",         latencyMs: 105, costMultiplier: 1.12 },
  "eu-north-1":     { label: "Europe (Stockholm)",         latencyMs: 115, costMultiplier: 1.05 },
  "ap-southeast-1": { label: "Asia Pacific (Singapore)",   latencyMs: 200, costMultiplier: 1.15 },
  "ap-southeast-2": { label: "Asia Pacific (Sydney)",      latencyMs: 210, costMultiplier: 1.20 },
  "ap-northeast-1": { label: "Asia Pacific (Tokyo)",       latencyMs: 180, costMultiplier: 1.18 },
  "ap-northeast-2": { label: "Asia Pacific (Seoul)",       latencyMs: 185, costMultiplier: 1.15 },
  "ap-south-1":     { label: "Asia Pacific (Mumbai)",      latencyMs: 230, costMultiplier: 1.10 },
  "sa-east-1":      { label: "South America (São Paulo)",  latencyMs: 170, costMultiplier: 1.25 },
  "ca-central-1":   { label: "Canada (Central)",           latencyMs: 30,  costMultiplier: 1.03 },
};

export const ALL_REGIONS = Object.keys(REGION_META);
