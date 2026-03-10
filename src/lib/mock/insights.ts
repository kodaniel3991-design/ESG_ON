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

export const mockAIInsights: AIInsight[] = [
  {
    id: "1",
    title: "High-impact reduction in Scope 2",
    summary:
      "Switching to renewable PPAs for your top 3 facilities could reduce Scope 2 emissions by an estimated 34% with minimal capex.",
    category: "reduction",
    confidence: 0.92,
    createdAt: "2024-03-08T10:00:00Z",
    actions: ["View PPA options", "Run scenario"],
  },
  {
    id: "2",
    title: "Supply chain risk in Tier 2 mining",
    summary:
      "Supplier Global Ore Corp has not reported for 2 quarters. Estimated 18% of your Scope 3 Category 1 emissions may be at verification risk.",
    category: "risk",
    confidence: 0.88,
    createdAt: "2024-03-07T14:30:00Z",
    actions: ["Contact supplier", "Review alternatives"],
  },
  {
    id: "3",
    title: "CSRD alignment opportunity",
    summary:
      "Your current disclosure structure is 78% aligned with ESRS E1. Completing the remaining data points could streamline your first CSRD report.",
    category: "compliance",
    confidence: 0.95,
    createdAt: "2024-03-06T09:15:00Z",
    actions: ["Open gap analysis", "Assign data owners"],
  },
];

export const mockAiKpiCards: AiKpiCard[] = [
  { id: "k1", label: "총 배출량", value: "12,450", unit: "tCO₂e", changePercent: -4.2, riskLevel: "medium" },
  { id: "k2", label: "Scope 3 비율", value: "68%", unit: "%", changePercent: 1.3, riskLevel: "high" },
  { id: "k3", label: "이상치 KPI", value: 7, unit: "개", riskLevel: "high" },
  { id: "k4", label: "공급망 리스크 공급사", value: 5, unit: "개사", riskLevel: "medium" },
];

export const mockAiAnomalies: AiAnomalyItem[] = [
  {
    id: "a1",
    source: "Scope 2 전력 데이터",
    dimension: "carbon",
    kpiName: "전력 사용량",
    severity: "high",
    deviationPercent: 22.5,
    period: "2024-09",
    causeSummary: "신규 데이터센터 전력 사용량 반영 누락 가능성",
    linkedKpiCount: 2,
    linkedVendorCount: 1,
  },
  {
    id: "a2",
    source: "협력사 탄소 데이터",
    dimension: "supply_chain",
    kpiName: "구입상품 및 서비스",
    severity: "medium",
    deviationPercent: -15.1,
    period: "2024-Q3",
    causeSummary: "Tier 2 광산 업체 미보고로 인한 급감",
    linkedKpiCount: 1,
    linkedVendorCount: 2,
  },
  {
    id: "a3",
    source: "인력 KPI",
    dimension: "esg",
    kpiName: "이직률",
    severity: "medium",
    deviationPercent: 9.4,
    period: "2024-Q3",
    causeSummary: "특정 사업부 구조조정 이슈",
    linkedKpiCount: 1,
    linkedVendorCount: 0,
  },
];

export const mockAiScenarios: AiScenarioItem[] = [
  {
    id: "s1",
    name: "재생에너지 전환 50%",
    description: "주요 사업장 전력 사용량의 50%를 재생에너지로 전환",
    reductionMtCO2e: 3.4,
    reductionPercent: 18,
    costImpact: "medium",
    roiYears: 4,
  },
  {
    id: "s2",
    name: "고위험 공급사 교체",
    description: "탄소·ESG 리스크 상위 5개 공급사에 대한 대체 조달",
    reductionMtCO2e: 1.2,
    reductionPercent: 6,
    costImpact: "high",
    roiYears: 3,
  },
];

export const mockAiForecast: AiForecastPoint[] = [
  { scenarioId: "s1", name: "2024", value: 12.4 },
  { scenarioId: "s1", name: "2025", value: 11.6 },
  { scenarioId: "s1", name: "2026", value: 10.9 },
  { scenarioId: "s2", name: "2024", value: 12.4 },
  { scenarioId: "s2", name: "2025", value: 11.9 },
  { scenarioId: "s2", name: "2026", value: 11.2 },
];

export const mockAiRoi: AiRoiPoint[] = [
  { scenarioId: "s1", label: "재생에너지", investment: 4.2, benefit: 6.8, roiPercent: 62 },
  { scenarioId: "s2", label: "공급사 교체", investment: 3.1, benefit: 5.5, roiPercent: 77 },
];

export const mockAiRiskSummary: AiRiskSummary = {
  kpiAtRiskCount: 7,
  anomalyCount: 3,
  highRiskVendors: 5,
  supplyChainHotspots: 2,
};

export const mockAiSupplyChainRisk: AiSupplyChainRiskItem[] = [
  { id: "v1", vendorName: "Global Ore Corp", tier: 2, category: "Mining", riskLevel: "high", emissionsSharePercent: 12, anomalyCount: 2 },
  { id: "v2", vendorName: "Acme Raw Materials", tier: 1, category: "Raw materials", riskLevel: "medium", emissionsSharePercent: 8, anomalyCount: 1 },
];

export const mockAiInsightReports: AiInsightReportItem[] = [
  {
    id: "ir1",
    title: "2024 탄소·공급망 리스크 Executive Summary",
    summary: "Scope 2/3 및 고위험 공급사 중심의 주요 리스크 요약과 권고 시나리오.",
    readyForReport: true,
    relatedKpiCount: 6,
    relatedIssueCount: 4,
    createdAt: "2024-11-01",
  },
  {
    id: "ir2",
    title: "CSRD E1 데이터 준비 상태",
    summary: "TCFD·CSRD 공시를 위한 데이터 준비 수준 및 보완 필요 영역.",
    readyForReport: false,
    relatedKpiCount: 4,
    relatedIssueCount: 3,
    createdAt: "2024-10-20",
  },
];
