import type { CloudResource } from "@/types";

// Watts per instance type → monthly kWh (assuming 730 hours/month)
const EC2_WATTS: Record<string, number> = {
  "t3.micro":    2.5,
  "t3.small":    5,
  "t3.medium":   10,
  "t3.large":    20,
  "m5.large":    34,
  "m5.xlarge":   68,
  "m5.2xlarge":  136,
  "r5.large":    48,
  "r5.xlarge":   96,
  "c5.large":    30,
  "c5.xlarge":   60,
};

// Monthly kWh defaults for RDS instance classes
const RDS_KWH: Record<string, number> = {
  "db.t3.micro":   15,
  "db.t3.small":   25,
  "db.t3.medium":  40,
  "db.m5.large":   80,
  "db.m5.xlarge":  160,
  "db.r5.large":   100,
};

const HOURS_PER_MONTH = 730;

function wattsToMonthlyKwh(watts: number): number {
  return (watts * HOURS_PER_MONTH) / 1000;
}

function extractDefaultRegion(content: string): string {
  // Match provider block across multiple lines without `s` flag
  const m = content.match(/provider\s+"aws"\s*\{[\s\S]*?region\s*=\s*"([^"]+)"/);
  return m ? m[1] : "us-east-1";
}

export function parseTerraform(content: string): CloudResource[] {
  const resources: CloudResource[] = [];
  const today = new Date().toISOString().slice(0, 10);
  const defaultRegion = extractDefaultRegion(content);

  // Match all resource blocks (no `s` flag — use [\s\S] for dot-all)
  const resourceRegex = /resource\s+"(\w+)"\s+"([^"]+)"\s*\{([\s\S]*?)\}/g;
  let match: RegExpExecArray | null;

  while ((match = resourceRegex.exec(content)) !== null) {
    const [, resourceType, resourceName, body] = match;

    // Extract region override from body if present
    const regionMatch = body.match(/region\s*=\s*"([^"]+)"/);
    const region = regionMatch ? regionMatch[1] : defaultRegion;

    if (resourceType === "aws_instance") {
      const instanceMatch = body.match(/instance_type\s*=\s*"([^"]+)"/);
      const instanceType = instanceMatch ? instanceMatch[1] : "t3.micro";
      const watts = EC2_WATTS[instanceType] ?? 20;
      const usageKwh = wattsToMonthlyKwh(watts);

      resources.push({
        id: `tf-ec2-${resourceName}`,
        service: "EC2",
        region,
        usageKwh,
        costUSD: usageKwh * 0.12, // rough estimate
        date: today,
        description: `terraform: ${resourceName} (${instanceType})`,
      });
    } else if (resourceType === "aws_lambda_function") {
      resources.push({
        id: `tf-lambda-${resourceName}`,
        service: "Lambda",
        region,
        usageKwh: 1,
        costUSD: 0.20,
        date: today,
        description: `terraform: ${resourceName}`,
      });
    } else if (resourceType === "aws_db_instance") {
      const classMatch = body.match(/instance_class\s*=\s*"([^"]+)"/);
      const instanceClass = classMatch ? classMatch[1] : "db.t3.micro";
      const usageKwh = RDS_KWH[instanceClass] ?? 40;

      resources.push({
        id: `tf-rds-${resourceName}`,
        service: "RDS",
        region,
        usageKwh,
        costUSD: usageKwh * 0.18,
        date: today,
        description: `terraform: ${resourceName} (${instanceClass})`,
      });
    } else if (resourceType === "aws_s3_bucket") {
      resources.push({
        id: `tf-s3-${resourceName}`,
        service: "S3",
        region,
        usageKwh: 0.5,
        costUSD: 0.05,
        date: today,
        description: `terraform: ${resourceName}`,
      });
    }
  }

  return resources;
}
