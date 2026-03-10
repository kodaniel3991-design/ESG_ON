import type {
  DashboardKpiItem,
  TopVendorEmission,
  OffsetSummary,
  DashboardNotification,
  DashboardInsightItem,
  ChartDataPoint,
} from "@/types";

export const mockDashboardKpis: DashboardKpiItem[] = [
  {
    id: "total",
    label: "총 탄소 배출량",
    value: "1,248 tCO₂e",
    status: "on_track",
    trendDirection: "up",
    trendText: "12.3% 전년 대비 감소",
  },
  {
    id: "scope3-ratio",
    label: "SCOPE 3 비율",
    value: "68.4 %",
    subLabel: "854.5 tCO₂e (공급망)",
    status: "attention",
    trendDirection: "down",
    trendText: "+2.1%p 증가 추세",
  },
  {
    id: "2030-goal",
    label: "2030 감축 목표",
    value: "47.2 % 달성",
    trendDirection: "up",
    trendText: "+5.6%p 개선",
  },
  {
    id: "partners",
    label: "협력사 SCOPE3 연동",
    value: "23 / 50개사",
    subLabel: "연동 완료",
    trendDirection: "up",
    trendText: "이번 달 +3개사 추가",
  },
  {
    id: "ai-anomaly",
    label: "AI 이상치 탐지",
    value: "3 건 검토 필요",
    status: "anomaly",
    trendDirection: "down",
    trendText: "11월 전기 사용 +34%",
  },
];

export const mockDashboardTrendData: ChartDataPoint[] = [
  { name: "1월", scope1: 95, scope2: 42, scope3: 318, total: 455 },
  { name: "2월", scope1: 92, scope2: 40, scope3: 305, total: 437 },
  { name: "3월", scope1: 98, scope2: 44, scope3: 322, total: 464 },
  { name: "4월", scope1: 88, scope2: 38, scope3: 298, total: 424 },
  { name: "5월", scope1: 102, scope2: 46, scope3: 335, total: 483 },
  { name: "6월", scope1: 94, scope2: 41, scope3: 310, total: 445 },
  { name: "7월", scope1: 96, scope2: 43, scope3: 315, total: 454 },
  { name: "8월", scope1: 90, scope2: 39, scope3: 302, total: 431 },
  { name: "9월", scope1: 104, scope2: 45, scope3: 328, total: 477 },
  { name: "10월", scope1: 99, scope2: 44, scope3: 320, total: 463 },
  { name: "11월", scope1: 118, scope2: 59, scope3: 342, total: 519 },
  { name: "12월", scope1: 97, scope2: 42, scope3: 308, total: 447 },
];

export const mockScopeDonutData = [
  { name: "Scope 3", value: 68, tCO2e: 854.5, fill: "hsl(25 95% 53%)" },
  { name: "Scope 1", value: 22, tCO2e: 274.6, fill: "hsl(142 76% 36%)" },
  { name: "Scope 2", value: 10, tCO2e: 124.8, fill: "hsl(200 80% 45%)" },
];

export const mockOffsetSummary: OffsetSummary = {
  totalEmissionsT: 583,
  offsetT: 59,
};

export const mockTopVendorEmissions: TopVendorEmission[] = [
  {
    id: "v1",
    vendorName: "(주)한국부품소재",
    scope: "scope3",
    emissionsKg: 101136,
    trendDirection: "up",
    trendPercent: 12,
    status: "linked",
  },
  {
    id: "v2",
    vendorName: "글로벌로지스틱스",
    scope: "scope3",
    emissionsKg: 87520,
    trendDirection: "down",
    trendPercent: 5,
    status: "linked",
  },
  {
    id: "v3",
    vendorName: "에너지서비스코리아",
    scope: "scope2",
    emissionsKg: 45200,
    trendDirection: "up",
    status: "pending",
  },
  {
    id: "v4",
    vendorName: "대한화학",
    scope: "scope3",
    emissionsKg: 38900,
    trendDirection: "down",
    status: "not_linked",
  },
  {
    id: "v5",
    vendorName: "시티물류",
    scope: "scope3",
    emissionsKg: 32100,
    trendDirection: "up",
    trendPercent: 8,
    status: "linked",
  },
];

export const mockDashboardInsights: DashboardInsightItem[] = [
  {
    id: "i1",
    type: "anomaly",
    title: "11월 전기 사용량 이상치 감지",
    detail: "전월 대비 +34.2% 증가, 추정 원인: 난방 가동 증가",
    actionLabel: "원인 분석 보기",
    actionHref: "/analytics",
  },
  {
    id: "i2",
    type: "recommendation",
    title: "태양광 설치 시 -18% 감축 가능",
    detail: "본사 옥상 설치 시 연 224 tCO₂e 절감·ROI 약 7년",
    actionLabel: "시나리오 시뮬레이션",
    actionHref: "/simulator",
  },
  {
    id: "i3",
    type: "report",
    title: "K-ESG 보고서 초안 생성 완료",
    detail: "ESRS 매핑 완료, 검토 후 제출 가능",
    actionLabel: "보고서 확인하기",
    actionHref: "/reports",
  },
];

export const mockDashboardNotifications: DashboardNotification[] = [
  {
    id: "n1",
    type: "report",
    title: "2024년 하반기 K-ESG 제출 기한이 32일 남았습니다",
    body: "Report",
    actionLabel: "Add report",
    actionHref: "/reports",
    dismissible: true,
  },
  {
    id: "n2",
    type: "data",
    title: "협력사 데이터 미수집",
    body: "다음 협력사 Scope 3 데이터 미제출: (주)한국부품소재, 에너지서비스코리아",
    actionLabel: "QR 초대장 발송",
    dismissible: true,
  },
  {
    id: "n3",
    type: "system",
    title: "환경부 배출계수 자동 갱신",
    body: "4분기 배출계수 업데이트 · 재계산 완료",
    timestamp: "방금 전",
    dismissible: false,
  },
];
