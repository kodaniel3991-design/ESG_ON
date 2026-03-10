import type {
  MaterialityIssue,
  MaterialityAiRecommendation,
  MaterialityMatrixPoint,
  MaterialityIssueRanking,
  MaterialityReportLink,
  MaterialityVersionHistory,
  MaterialitySettings,
} from "@/types";
import {
  mockMaterialityIssues,
  mockMaterialityAiRecommendations,
  mockMaterialityMatrix,
  mockMaterialityRanking,
  mockMaterialityReportLinks,
  mockMaterialityVersionHistory,
  mockMaterialitySettings,
} from "@/lib/mock";

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getMaterialityIssues(): Promise<MaterialityIssue[]> {
  await delay(200);
  return mockMaterialityIssues;
}

export async function getMaterialityAiRecommendations(): Promise<MaterialityAiRecommendation[]> {
  await delay(150);
  return mockMaterialityAiRecommendations;
}

export async function getMaterialityMatrix(): Promise<MaterialityMatrixPoint[]> {
  await delay(150);
  return mockMaterialityMatrix;
}

export async function getMaterialityRanking(): Promise<MaterialityIssueRanking[]> {
  await delay(150);
  return mockMaterialityRanking;
}

export async function getMaterialityReportLinks(issueId?: string): Promise<MaterialityReportLink[]> {
  await delay(100);
  if (issueId) return mockMaterialityReportLinks.filter((r) => r.issueId === issueId);
  return mockMaterialityReportLinks;
}

export async function getMaterialityVersionHistory(): Promise<MaterialityVersionHistory[]> {
  await delay(150);
  return mockMaterialityVersionHistory;
}

export async function getMaterialitySettings(): Promise<MaterialitySettings> {
  await delay(100);
  return mockMaterialitySettings;
}
