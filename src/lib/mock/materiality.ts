import type {
  MaterialityIssue,
  MaterialityAiRecommendation,
  MaterialityMatrixPoint,
  MaterialityIssueRanking,
  MaterialityReportLink,
  MaterialityVersionHistory,
  MaterialitySettings,
} from "@/types";

export const mockMaterialityIssues: MaterialityIssue[] = [
  { id: "mi1", code: "ENV-01", name: "탄소 배출 및 기후변화", dimension: "environment", expertScore: 5, benchmarkScore: 5, kpiLinkedCount: 4, kpiConnectionStatus: "full", aiRecommendRank: 1, impactScale: 5, impactScope: 4.5, impactIrremediability: 4, impactScore: 4.5, financialScore: 4.8, reportLinkedCount: 2, updatedAt: "2024-11-01" },
  { id: "mi2", code: "ENV-02", name: "에너지 효율 및 재생에너지", dimension: "environment", expertScore: 4, benchmarkScore: 4, kpiLinkedCount: 3, kpiConnectionStatus: "full", aiRecommendRank: 2, impactScale: 4, impactScope: 4.5, impactIrremediability: 4, impactScore: 4.17, financialScore: 4.0, reportLinkedCount: 1, updatedAt: "2024-11-01" },
  { id: "mi3", code: "SOC-01", name: "인권 및 노동 안전", dimension: "social", expertScore: 4, benchmarkScore: 3, kpiLinkedCount: 2, kpiConnectionStatus: "partial", aiRecommendRank: 3, impactScale: 4, impactScope: 3.5, impactIrremediability: 4, impactScore: 3.83, financialScore: 4.2, reportLinkedCount: 1, updatedAt: "2024-10-28" },
  { id: "mi4", code: "SOC-02", name: "인재 육성 및 다양성", dimension: "social", expertScore: 3, benchmarkScore: 4, kpiLinkedCount: 2, kpiConnectionStatus: "partial", impactScale: 3.5, impactScope: 3.5, impactIrremediability: 3.5, impactScore: 3.5, financialScore: 3.8, reportLinkedCount: 0, updatedAt: "2024-10-28" },
  { id: "mi5", code: "GOV-01", name: "이사회 독립성 및 감사", dimension: "governance", expertScore: 5, benchmarkScore: 5, kpiLinkedCount: 2, kpiConnectionStatus: "full", aiRecommendRank: 4, impactScale: 4, impactScope: 4, impactIrremediability: 4, impactScore: 4.0, financialScore: 4.5, reportLinkedCount: 2, updatedAt: "2024-10-30" },
  { id: "mi6", code: "GOV-02", name: "윤리 경영 및 준법", dimension: "governance", expertScore: 4, benchmarkScore: 4, kpiLinkedCount: 1, kpiConnectionStatus: "partial", impactScale: 4, impactScope: 3.5, impactIrremediability: 4, impactScore: 3.83, financialScore: 4.0, reportLinkedCount: 1, updatedAt: "2024-10-30" },
];

export const mockMaterialityAiRecommendations: MaterialityAiRecommendation[] = [
  { id: "ar1", issueId: "mi1", issueName: "탄소 배출 및 기후변화", reason: "산업 벤치마크 및 KPI 연계도가 높고 이해관계자 관심 최상", suggestedPriority: 1, confidence: 0.95, createdAt: "2024-11-01T10:00:00" },
  { id: "ar2", issueId: "mi2", issueName: "에너지 효율 및 재생에너지", reason: "규제 강화와 에너지 비용 리스크 반영", suggestedPriority: 2, confidence: 0.88, createdAt: "2024-11-01T10:00:00" },
  { id: "ar3", issueId: "mi3", issueName: "인권 및 노동 안전", reason: "공급망 이슈와 ESG 등급에 직접 영향", suggestedPriority: 3, confidence: 0.82, createdAt: "2024-11-01T10:00:00" },
];

export const mockMaterialityMatrix: MaterialityMatrixPoint[] = mockMaterialityIssues
  .filter((i) => i.impactScore != null && i.financialScore != null)
  .map((i) => ({
    issueId: i.id,
    issueName: i.name,
    dimension: i.dimension,
    x: i.impactScore!,
    y: i.financialScore!,
  }));

export const mockMaterialityRanking: MaterialityIssueRanking[] = [
  { rank: 1, issueId: "mi1", issueName: "탄소 배출 및 기후변화", dimension: "environment", compositeScore: 4.72, expertScore: 5, benchmarkScore: 5, kpiLinkedCount: 4 },
  { rank: 2, issueId: "mi2", issueName: "에너지 효율 및 재생에너지", dimension: "environment", compositeScore: 4.08, expertScore: 4, benchmarkScore: 4, kpiLinkedCount: 3 },
  { rank: 3, issueId: "mi5", issueName: "이사회 독립성 및 감사", dimension: "governance", compositeScore: 4.18, expertScore: 5, benchmarkScore: 5, kpiLinkedCount: 2 },
  { rank: 4, issueId: "mi3", issueName: "인권 및 노동 안전", dimension: "social", compositeScore: 3.92, expertScore: 4, benchmarkScore: 3, kpiLinkedCount: 2 },
  { rank: 5, issueId: "mi6", issueName: "윤리 경영 및 준법", dimension: "governance", compositeScore: 3.88, expertScore: 4, benchmarkScore: 4, kpiLinkedCount: 1 },
  { rank: 6, issueId: "mi4", issueName: "인재 육성 및 다양성", dimension: "social", compositeScore: 3.58, expertScore: 3, benchmarkScore: 4, kpiLinkedCount: 2 },
];

export const mockMaterialityReportLinks: MaterialityReportLink[] = [
  { id: "rl1", issueId: "mi1", reportId: "r1", reportTitle: "2024 지속가능보고서", reportType: "annual", sectionRef: "기후", linkedAt: "2024-10-15" },
  { id: "rl2", issueId: "mi1", reportId: "r2", reportTitle: "TCFD 보고서", reportType: "tcfd", linkedAt: "2024-10-20" },
  { id: "rl3", issueId: "mi5", reportId: "r1", reportTitle: "2024 지속가능보고서", reportType: "annual", sectionRef: "거버넌스", linkedAt: "2024-10-15" },
];

export const mockMaterialityVersionHistory: MaterialityVersionHistory[] = [
  { id: "v1", version: "2024-Q4", description: "4분기 정기 업데이트", issueCount: 6, createdAt: "2024-11-01", createdBy: "김민준" },
  { id: "v2", version: "2024-Q3", description: "3분기 정기 업데이트", issueCount: 6, createdAt: "2024-08-01", createdBy: "이서연" },
  { id: "v3", version: "2024-Q2", description: "산업 벤치마크 반영", issueCount: 5, createdAt: "2024-05-01", createdBy: "김민준" },
];

export const mockMaterialitySettings: MaterialitySettings = {
  assessmentPeriod: "2024",
  expertWeight: 0.4,
  benchmarkWeight: 0.3,
  kpiImpactWeight: 0.3,
  matrixThresholdHigh: 4,
  matrixThresholdMedium: 3,
};
