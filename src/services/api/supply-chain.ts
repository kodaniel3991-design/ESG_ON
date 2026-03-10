import type { SupplyChainNode } from "@/types";
import { mockSupplyChainRoot } from "@/lib/mock";

export async function getSupplyChainTree(): Promise<SupplyChainNode> {
  await delay(300);
  return mockSupplyChainRoot;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
