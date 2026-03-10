import type { EsgMetricItem, EsgSummaryCard } from "@/types";

// 환경 데이터
export const mockEnvironmentMetrics: EsgMetricItem[] = [
  { id: "e1", category: "에너지", indicatorName: "총 에너지 사용량", value: 125000, unit: "GJ", period: "2024", source: "에너지관리시스템", status: "verified" },
  { id: "e2", category: "에너지", indicatorName: "재생에너지 비율", value: 24.5, unit: "%", period: "2024", status: "verified" },
  { id: "e3", category: "온실가스", indicatorName: "Scope 1 배출량", value: 2100, unit: "tCO₂e", period: "2024", status: "verified" },
  { id: "e4", category: "온실가스", indicatorName: "Scope 2 배출량", value: 3200, unit: "tCO₂e", period: "2024", status: "verified" },
  { id: "e5", category: "온실가스", indicatorName: "Scope 3 배출량", value: 7150, unit: "tCO₂e", period: "2024", status: "estimated" },
  { id: "e6", category: "폐기물", indicatorName: "발생 폐기물 총량", value: 1850, unit: "톤", period: "2024", status: "verified" },
  { id: "e7", category: "폐기물", indicatorName: "재활용률", value: 72, unit: "%", period: "2024", status: "verified" },
  { id: "e8", category: "물", indicatorName: "총 취수량", value: 125000, unit: "m³", period: "2024", status: "verified" },
  { id: "e9", category: "물", indicatorName: "재이용률", value: 18, unit: "%", period: "2024", status: "estimated" },
];

export const mockEnvironmentSummary: EsgSummaryCard[] = [
  { label: "총 GHG 배출", value: "12,450", unit: "tCO₂e", changePercent: -8.2 },
  { label: "재생에너지 비율", value: "24.5", unit: "%", changePercent: 3.1 },
  { label: "폐기물 재활용률", value: "72", unit: "%", changePercent: 2.0 },
];

// 사회 데이터
export const mockSocialMetrics: EsgMetricItem[] = [
  { id: "s1", category: "인력", indicatorName: "전체 직원 수", value: 2840, unit: "명", period: "2024", status: "verified" },
  { id: "s2", category: "인력", indicatorName: "정규직 비율", value: 92, unit: "%", period: "2024", status: "verified" },
  { id: "s3", category: "인력", indicatorName: "이직률", value: 8.5, unit: "%", period: "2024", status: "verified" },
  { id: "s4", category: "안전", indicatorName: "산업재해 건수", value: 12, unit: "건", period: "2024", status: "verified" },
  { id: "s5", category: "안전", indicatorName: "재해율", value: 0.42, unit: "%", period: "2024", status: "verified" },
  { id: "s6", category: "교육", indicatorName: "교육 이수율", value: 94, unit: "%", period: "2024", status: "verified" },
  { id: "s7", category: "교육", indicatorName: "평균 교육 시간", value: 32, unit: "시간/인", period: "2024", status: "verified" },
  { id: "s8", category: "다양성", indicatorName: "여성 관리자 비율", value: 28, unit: "%", period: "2024", status: "verified" },
  { id: "s9", category: "다양성", indicatorName: "장애인 고용률", value: 2.4, unit: "%", period: "2024", status: "verified" },
];

export const mockSocialSummary: EsgSummaryCard[] = [
  { label: "전체 직원 수", value: "2,840", unit: "명", changePercent: 5.2 },
  { label: "교육 이수율", value: "94", unit: "%", changePercent: 2.1 },
  { label: "재해율", value: "0.42", unit: "%", changePercent: -15.0 },
];

// 거버넌스 데이터
export const mockGovernanceMetrics: EsgMetricItem[] = [
  { id: "g1", category: "이사회", indicatorName: "이사회 독립이사 비율", value: 67, unit: "%", period: "2024", status: "verified" },
  { id: "g2", category: "이사회", indicatorName: "이사회 회의 횟수", value: 8, unit: "회", period: "2024", status: "verified" },
  { id: "g3", category: "윤리", indicatorName: "윤리교육 이수율", value: 100, unit: "%", period: "2024", status: "verified" },
  { id: "g4", category: "윤리", indicatorName: "부정청탁 신고 건수", value: 0, unit: "건", period: "2024", status: "verified" },
  { id: "g5", category: "감사", indicatorName: "내부감사 실시", value: "연 2회", unit: "", period: "2024", status: "verified" },
  { id: "g6", category: "감사", indicatorName: "외부감사 실시", value: "연 1회", unit: "", period: "2024", status: "verified" },
  { id: "g7", category: "정보공개", indicatorName: "공시 항목 준수율", value: 100, unit: "%", period: "2024", status: "verified" },
];

export const mockGovernanceSummary: EsgSummaryCard[] = [
  { label: "독립이사 비율", value: "67", unit: "%", changePercent: 0 },
  { label: "윤리교육 이수율", value: "100", unit: "%", changePercent: 0 },
  { label: "공시 준수율", value: "100", unit: "%", changePercent: 0 },
];
