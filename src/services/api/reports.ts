import type {
  ESGReport,
  ReportTemplate,
  ReportGenerationReadiness,
  ReportGenerationHistoryItem,
  DisclosureFrameworkItem,
  MappingEngineItem,
} from "@/types";
import {
  mockESGReports,
  mockReportTemplates,
  mockReportReadiness,
  mockReportHistory,
  mockDisclosureFrameworkItems,
  mockMappingItems,
} from "@/lib/mock";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getESGReports(): Promise<ESGReport[]> {
  await delay(250);
  return mockESGReports;
}

export async function getReportTemplates(): Promise<ReportTemplate[]> {
  await delay(200);
  return mockReportTemplates;
}

export async function getReportReadiness(): Promise<ReportGenerationReadiness[]> {
  await delay(150);
  return mockReportReadiness;
}

export async function getReportHistory(): Promise<ReportGenerationHistoryItem[]> {
  await delay(150);
  return mockReportHistory;
}

export async function getDisclosureFrameworkItems(): Promise<DisclosureFrameworkItem[]> {
  await delay(200);
  return mockDisclosureFrameworkItems;
}

export async function getMappingItems(): Promise<MappingEngineItem[]> {
  await delay(200);
  return mockMappingItems;
}
