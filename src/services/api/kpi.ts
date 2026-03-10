import type {
  KpiManagementItem,
  KpiSummaryCard,
  KpiMasterItem,
  KpiTargetItem,
  KpiPerformanceItem,
  KpiCoverageItem,
  KpiCategoryItem,
  KpiChangeLogItem,
  KpiSettings,
} from "@/types";
import {
  mockKpiList,
  mockKpiSummary,
  mockKpiMaster,
  mockKpiTargets,
  mockKpiPerformance,
  mockKpiCoverage,
  mockKpiCategories,
  mockKpiChangeHistory,
  mockKpiSettings,
} from "@/lib/mock";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getKpiList(): Promise<KpiManagementItem[]> {
  await delay(250);
  return mockKpiList;
}

export async function getKpiSummary(): Promise<KpiSummaryCard[]> {
  await delay(150);
  return mockKpiSummary;
}

export async function getKpiMaster(): Promise<KpiMasterItem[]> {
  await delay(200);
  return mockKpiMaster;
}

export async function getKpiTargets(): Promise<KpiTargetItem[]> {
  await delay(200);
  return mockKpiTargets;
}

export async function getKpiPerformance(): Promise<KpiPerformanceItem[]> {
  await delay(200);
  return mockKpiPerformance;
}

export async function getKpiCoverage(): Promise<KpiCoverageItem[]> {
  await delay(150);
  return mockKpiCoverage;
}

export async function getKpiCategories(): Promise<KpiCategoryItem[]> {
  await delay(150);
  return mockKpiCategories;
}

export async function getKpiChangeHistory(): Promise<KpiChangeLogItem[]> {
  await delay(200);
  return mockKpiChangeHistory;
}

export async function getKpiSettings(): Promise<KpiSettings> {
  await delay(100);
  return mockKpiSettings;
}
