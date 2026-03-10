import type {
  AIInsight,
  AiKpiCard,
  AiAnomalyItem,
  AiScenarioItem,
  AiForecastPoint,
  AiRoiPoint,
  AiRiskSummary,
  AiSupplyChainRiskItem,
  AiInsightReportItem,
} from "@/types";
import {
  mockAIInsights,
  mockAiKpiCards,
  mockAiAnomalies,
  mockAiScenarios,
  mockAiForecast,
  mockAiRoi,
  mockAiRiskSummary,
  mockAiSupplyChainRisk,
  mockAiInsightReports,
} from "@/lib/mock";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getAIInsights(): Promise<AIInsight[]> {
  await delay(200);
  return mockAIInsights;
}

export async function getAiKpiCards(): Promise<AiKpiCard[]> {
  await delay(150);
  return mockAiKpiCards;
}

export async function getAiAnomalies(): Promise<AiAnomalyItem[]> {
  await delay(200);
  return mockAiAnomalies;
}

export async function getAiScenarios(): Promise<AiScenarioItem[]> {
  await delay(200);
  return mockAiScenarios;
}

export async function getAiForecast(): Promise<AiForecastPoint[]> {
  await delay(150);
  return mockAiForecast;
}

export async function getAiRoi(): Promise<AiRoiPoint[]> {
  await delay(150);
  return mockAiRoi;
}

export async function getAiRiskSummary(): Promise<AiRiskSummary> {
  await delay(120);
  return mockAiRiskSummary;
}

export async function getAiSupplyChainRisk(): Promise<AiSupplyChainRiskItem[]> {
  await delay(150);
  return mockAiSupplyChainRisk;
}

export async function getAiInsightReports(): Promise<AiInsightReportItem[]> {
  await delay(150);
  return mockAiInsightReports;
}
