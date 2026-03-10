import type {
  EmissionSummary,
  EmissionTrend,
  ScopeBreakdown,
  ChartDataPoint,
  EmissionSourceItem,
} from "@/types";
import {
  mockEmissionSummary,
  mockEmissionTrends,
  mockScopeBreakdown,
  mockTrendChartData,
  mockEmissionSources,
} from "@/lib/mock";

// Stub: replace with fetch("/api/emissions/summary") when backend is ready
export async function getEmissionSummary(): Promise<EmissionSummary> {
  await delay(300);
  return mockEmissionSummary;
}

export async function getEmissionTrends(): Promise<EmissionTrend[]> {
  await delay(300);
  return mockEmissionTrends;
}

export async function getScopeBreakdown(): Promise<ScopeBreakdown[]> {
  await delay(200);
  return mockScopeBreakdown;
}

export async function getTrendChartData(): Promise<ChartDataPoint[]> {
  await delay(200);
  return mockTrendChartData;
}

export async function getEmissionSources(): Promise<EmissionSourceItem[]> {
  await delay(250);
  return mockEmissionSources;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
