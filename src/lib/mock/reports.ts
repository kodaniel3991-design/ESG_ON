import type {
  ESGReport,
  ReportTemplate,
  ReportGenerationReadiness,
  ReportGenerationHistoryItem,
  DisclosureFrameworkItem,
  MappingEngineItem,
  ReportFramework,
} from "@/types";

export const mockESGReports: ESGReport[] = [
  {
    id: "r1",
    title: "지속가능경영보고서 2024",
    type: "annual",
    period: "FY 2024",
    status: "published",
    publishedAt: "2024-02-15",
    framework: "ESG",
    version: "v1.0",
  },
  {
    id: "r2",
    title: "K-ESG 자가진단 보고서 2024",
    type: "annual",
    period: "2024",
    status: "draft",
    framework: "K-ESG",
    version: "v0.8",
  },
  {
    id: "r3",
    title: "GRI Consolidated Report 2024",
    type: "annual",
    period: "2024",
    status: "published",
    publishedAt: "2024-03-01",
    framework: "GRI",
    version: "v1.1",
  },
  {
    id: "r4",
    title: "CSRD ESRS E1/E2 초안",
    type: "annual",
    period: "2024",
    status: "draft",
    framework: "CSRD",
    version: "draft-1",
  },
];

export const mockReportTemplates: ReportTemplate[] = [
  {
    id: "t1",
    name: "기본 ESG 보고서 템플릿",
    framework: "ESG",
    description: "ESG 일반 공시에 최적화된 기본 템플릿",
    isDefault: true,
    lastUsedAt: "2024-02-15",
  },
  {
    id: "t2",
    name: "K-ESG 공시 템플릿",
    framework: "K-ESG",
    description: "국내 K-ESG 자가진단 양식 기반",
    isDefault: false,
  },
  {
    id: "t3",
    name: "CSRD ESRS 템플릿",
    framework: "CSRD",
    description: "ESRS E1/E2 중심의 CSRD 보고",
    isDefault: false,
  },
];

export const mockReportReadiness: ReportGenerationReadiness[] = [
  {
    framework: "ESG",
    readinessPercent: 92,
    coveragePercent: 88,
    missingKpiCount: 4,
  },
  {
    framework: "K-ESG",
    readinessPercent: 76,
    coveragePercent: 70,
    missingKpiCount: 9,
  },
  {
    framework: "CSRD",
    readinessPercent: 58,
    coveragePercent: 52,
    missingKpiCount: 16,
  },
];

export const mockReportHistory: ReportGenerationHistoryItem[] = [
  {
    id: "h1",
    title: "지속가능경영보고서 2024",
    framework: "ESG",
    period: "FY 2024",
    createdAt: "2024-02-10",
    status: "generated",
  },
  {
    id: "h2",
    title: "K-ESG 자가진단 보고서 2024",
    framework: "K-ESG",
    period: "2024",
    createdAt: "2024-01-20",
    status: "generated",
  },
  {
    id: "h3",
    title: "CSRD ESRS 초안",
    framework: "CSRD",
    period: "2024",
    createdAt: "2024-10-01",
    status: "draft",
  },
];

export const mockDisclosureFrameworkItems: DisclosureFrameworkItem[] = [
  {
    id: "df1",
    framework: "GRI",
    code: "GRI 305-1",
    name: "직접 온실가스 배출량(Scope 1)",
    linkedKpiCodes: ["CARBON-01"],
    dataStatus: "complete",
    inReports: true,
  },
  {
    id: "df2",
    framework: "ISSB",
    code: "S2-ESG-1",
    name: "기후 관련 리스크와 기회",
    linkedKpiCodes: ["CARBON-01", "CARBON-02"],
    dataStatus: "partial",
    inReports: false,
  },
  {
    id: "df3",
    framework: "CSRD",
    code: "ESRS E1-5",
    name: "Scope 3 배출량",
    linkedKpiCodes: ["CARBON-02", "CARBON-03"],
    dataStatus: "missing",
    inReports: false,
  },
];

export const mockMappingItems: MappingEngineItem[] = [
  {
    id: "m1",
    kpiCode: "CARBON-01",
    kpiName: "총 탄소 배출량",
    kpiCategory: "carbon",
    framework: "GRI",
    disclosureCode: "GRI 305-1",
    status: "linked",
  },
  {
    id: "m2",
    kpiCode: "CARBON-02",
    kpiName: "Scope 3 비율",
    kpiCategory: "carbon",
    framework: "CSRD",
    disclosureCode: "ESRS E1-5",
    status: "partial",
  },
  {
    id: "m3",
    kpiCode: "SOCIAL-02",
    kpiName: "교육 이수율",
    kpiCategory: "social",
    framework: "K-ESG",
    disclosureCode: "K-ESG S2-1",
    status: "unlinked",
  },
];
