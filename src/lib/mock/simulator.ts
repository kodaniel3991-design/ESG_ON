import type {
  ReductionScenario,
  SimulatorResult,
  ReductionOpportunity,
  ReductionProject,
  ReductionProgressKpi,
  ReductionScopeSummary,
} from "@/types";

export const mockReductionScenarios: ReductionScenario[] = [
  {
    id: "scenario-1",
    name: "Renewable PPAs (Top 5 sites)",
    description: "Power purchase agreements for 100% renewable electricity at largest facilities.",
    estimatedReductionPercent: 22,
    costImpact: "medium",
    timelineMonths: 12,
  },
  {
    id: "scenario-2",
    name: "Fleet electrification Phase 1",
    description: "Replace 30% of light-duty fleet with EVs by end of FY25.",
    estimatedReductionPercent: 8,
    costImpact: "high",
    timelineMonths: 18,
  },
  {
    id: "scenario-3",
    name: "Supplier engagement program",
    description: "Engage top 20 Scope 3 suppliers on SBTi and primary data collection.",
    estimatedReductionPercent: 12,
    costImpact: "low",
    timelineMonths: 24,
  },
];

export const mockSimulatorResult: SimulatorResult = {
  scenarioId: "scenario-1",
  baselineMtCO2e: 12450,
  projectedMtCO2e: 9711,
  reductionPercent: 22,
  costEstimate: 2.4,
};

export const mockReductionOpportunities: ReductionOpportunity[] = [
  {
    id: "o1",
    name: "데이터센터 재생에너지 전환",
    category: "energy",
    scope: "scope2",
    description: "주요 데이터센터 전력 사용량 80%를 재생에너지로 전환",
    estimatedReductionMt: 2.1,
    estimatedCostM: 3.2,
    roiYears: 4,
    status: "assessed",
  },
  {
    id: "o2",
    name: "물류 차량 전기화 1단계",
    category: "fleet",
    scope: "scope1",
    estimatedReductionMt: 0.9,
    estimatedCostM: 4.0,
    roiYears: 5,
    status: "idea",
  },
  {
    id: "o3",
    name: "고위험 공급사 감축 프로그램",
    category: "supply_chain",
    scope: "scope3",
    estimatedReductionMt: 1.4,
    estimatedCostM: 1.5,
    roiYears: 3,
    status: "approved",
  },
];

export const mockReductionProjects: ReductionProject[] = [
  {
    id: "p1",
    name: "데이터센터 PPA 체결",
    opportunityId: "o1",
    owner: "김민준",
    status: "in_progress",
    startDate: "2024-03-01",
    expectedReductionMt: 2.1,
    actualReductionMt: 0.5,
  },
  {
    id: "p2",
    name: "공급사 SBTi 참여 확대",
    opportunityId: "o3",
    owner: "이서연",
    status: "planning",
    startDate: "2024-09-01",
    expectedReductionMt: 1.0,
  },
];

export const mockReductionProgressKpis: ReductionProgressKpi[] = [
  { id: "k1", label: "누적 감축량", value: "3.1", unit: "MtCO₂e", target: "5.0" },
  { id: "k2", label: "진행 중 프로젝트", value: 4, unit: "건" },
  { id: "k3", label: "승인된 감축 기회", value: 6, unit: "건" },
];

export const mockReductionScopeSummary: ReductionScopeSummary[] = [
  { scope: "scope1", baselineMt: 3.2, reducedMt: 0.5 },
  { scope: "scope2", baselineMt: 4.8, reducedMt: 1.6 },
  { scope: "scope3", baselineMt: 8.4, reducedMt: 1.0 },
];
