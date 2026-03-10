import type { ComplianceItem } from "@/types";
import { mockComplianceItems } from "@/lib/mock";

export async function getComplianceStatus(): Promise<ComplianceItem[]> {
  await delay(280);
  return mockComplianceItems;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
