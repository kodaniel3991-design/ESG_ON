import type {
  EmissionSummary,
  EmissionTrend,
  ScopeBreakdown,
  ChartDataPoint,
  EmissionSourceItem,
} from "@/types";

export const mockEmissionSummary: EmissionSummary = {
  totalMtCO2e: 12450,
  scope1: 2100,
  scope2: 3200,
  scope3: 7150,
  period: "FY 2024",
  yoyChangePercent: -8.2,
};

export const mockEmissionTrends: EmissionTrend[] = [
  { period: "Jan", scope1: 180, scope2: 268, scope3: 598, total: 1046 },
  { period: "Feb", scope1: 172, scope2: 262, scope3: 592, total: 1026 },
  { period: "Mar", scope1: 178, scope2: 270, scope3: 588, total: 1036 },
  { period: "Apr", scope1: 175, scope2: 265, scope3: 595, total: 1035 },
  { period: "May", scope1: 182, scope2: 272, scope3: 602, total: 1056 },
  { period: "Jun", scope1: 168, scope2: 258, scope3: 578, total: 1004 },
];

export const mockScopeBreakdown: ScopeBreakdown[] = [
  {
    scope: "scope1",
    label: "Scope 1",
    value: 2100,
    percent: 16.9,
    categoryBreakdown: [
      { category: "Stationary combustion", value: 1200, unit: "tCO₂e" },
      { category: "Mobile combustion", value: 700, unit: "tCO₂e" },
      { category: "Fugitive emissions", value: 200, unit: "tCO₂e" },
    ],
  },
  {
    scope: "scope2",
    label: "Scope 2",
    value: 3200,
    percent: 25.7,
    categoryBreakdown: [
      { category: "Purchased electricity", value: 2800, unit: "tCO₂e" },
      { category: "Steam & heating", value: 400, unit: "tCO₂e" },
    ],
  },
  {
    scope: "scope3",
    label: "Scope 3",
    value: 7150,
    percent: 57.4,
    categoryBreakdown: [
      { category: "Purchased goods", value: 3200, unit: "tCO₂e" },
      { category: "Business travel", value: 850, unit: "tCO₂e" },
      { category: "Employee commuting", value: 420, unit: "tCO₂e" },
      { category: "Upstream transport", value: 1680, unit: "tCO₂e" },
      { category: "Other", value: 1000, unit: "tCO₂e" },
    ],
  },
];

export const mockTrendChartData: ChartDataPoint[] = mockEmissionTrends.map(
  (t) => ({
    name: t.period,
    value: t.total,
    scope1: t.scope1,
    scope2: t.scope2,
    scope3: t.scope3,
    total: t.total,
  })
);

export const mockEmissionSources: EmissionSourceItem[] = [
  { id: "1", sourceName: "본사 보일러", scope: "scope1", category: "고정연소", value: 1200, unit: "tCO₂e", period: "2024", status: "verified" },
  { id: "2", sourceName: "회사 차량", scope: "scope1", category: "이동연소", value: 700, unit: "tCO₂e", period: "2024", status: "verified" },
  { id: "3", sourceName: "냉매 등", scope: "scope1", category: "비가스배출", value: 200, unit: "tCO₂e", period: "2024", status: "estimated" },
  { id: "4", sourceName: "전력 사용", scope: "scope2", category: "구입전력", value: 2800, unit: "tCO₂e", period: "2024", status: "verified" },
  { id: "5", sourceName: "증기·난방", scope: "scope2", category: "증기 및 난방", value: 400, unit: "tCO₂e", period: "2024", status: "estimated" },
  { id: "6", sourceName: "원자재 구매", scope: "scope3", category: "구입상품", value: 3200, unit: "tCO₂e", period: "2024", status: "estimated" },
  { id: "7", sourceName: "출장", scope: "scope3", category: "출장", value: 850, unit: "tCO₂e", period: "2024", status: "verified" },
  { id: "8", sourceName: "직원 출퇴근", scope: "scope3", category: "직원 출퇴근", value: 420, unit: "tCO₂e", period: "2024", status: "pending" },
  { id: "9", sourceName: "상품 수송", scope: "scope3", category: "상류 수송", value: 1680, unit: "tCO₂e", period: "2024", status: "estimated" },
  { id: "10", sourceName: "기타", scope: "scope3", category: "기타", value: 1000, unit: "tCO₂e", period: "2024", status: "pending" },
];
