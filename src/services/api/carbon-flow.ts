import type { CarbonFlowNode } from "@/types";
import { mockCarbonFlowRoot } from "@/lib/mock";

export async function getCarbonFlowTree(): Promise<CarbonFlowNode> {
  await delay(250);
  return mockCarbonFlowRoot;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
