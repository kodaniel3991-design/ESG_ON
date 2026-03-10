import type { EsgMetricItem, EsgSummaryCard } from "@/types";
import {
  mockEnvironmentMetrics,
  mockEnvironmentSummary,
  mockSocialMetrics,
  mockSocialSummary,
  mockGovernanceMetrics,
  mockGovernanceSummary,
} from "@/lib/mock/esg";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getEnvironmentMetrics(): Promise<EsgMetricItem[]> {
  await delay(280);
  return mockEnvironmentMetrics;
}

export async function getEnvironmentSummary(): Promise<EsgSummaryCard[]> {
  await delay(150);
  return mockEnvironmentSummary;
}

export async function getSocialMetrics(): Promise<EsgMetricItem[]> {
  await delay(280);
  return mockSocialMetrics;
}

export async function getSocialSummary(): Promise<EsgSummaryCard[]> {
  await delay(150);
  return mockSocialSummary;
}

export async function getGovernanceMetrics(): Promise<EsgMetricItem[]> {
  await delay(280);
  return mockGovernanceMetrics;
}

export async function getGovernanceSummary(): Promise<EsgSummaryCard[]> {
  await delay(150);
  return mockGovernanceSummary;
}
