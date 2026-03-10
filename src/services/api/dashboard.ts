import type {
  DashboardKpiItem,
  TopVendorEmission,
  OffsetSummary,
  DashboardNotification,
  DashboardInsightItem,
  ChartDataPoint,
} from "@/types";
import {
  mockDashboardKpis,
  mockDashboardTrendData,
  mockScopeDonutData,
  mockOffsetSummary,
  mockTopVendorEmissions,
  mockDashboardInsights,
  mockDashboardNotifications,
} from "@/lib/mock/dashboard";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getDashboardKpis(): Promise<DashboardKpiItem[]> {
  await delay(200);
  return mockDashboardKpis;
}

export async function getDashboardTrendData(): Promise<ChartDataPoint[]> {
  await delay(200);
  return mockDashboardTrendData;
}

export async function getScopeDonutData(): Promise<
  { name: string; value: number; tCO2e: number; fill: string }[]
> {
  await delay(100);
  return mockScopeDonutData;
}

export async function getOffsetSummary(): Promise<OffsetSummary> {
  await delay(100);
  return mockOffsetSummary;
}

export async function getTopVendorEmissions(): Promise<TopVendorEmission[]> {
  await delay(250);
  return mockTopVendorEmissions;
}

export async function getDashboardInsights(): Promise<DashboardInsightItem[]> {
  await delay(200);
  return mockDashboardInsights;
}

export async function getDashboardNotifications(): Promise<
  DashboardNotification[]
> {
  await delay(200);
  return mockDashboardNotifications;
}
