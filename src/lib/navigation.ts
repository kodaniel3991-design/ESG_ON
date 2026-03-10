/**
 * CarbonOS 메뉴 설정 (한글 UI, 영문 route)
 * 1depth: 7개 (대시보드, 데이터 관리, KPI 관리, 분석, 감축 허브, 보고서, 설정)
 */

export type NavLinkItem = {
  href: string;
  label: string;
};

export type NavGroupItem = {
  label: string;
  children: NavLinkItem[];
};

/** 3depth: label + children only */
export type NavGroupWithChildren = {
  label: string;
  children: NavLinkItem[];
};

/** 2depth 그룹 (자식이 링크 배열) */
export type NavSectionItem = {
  label: string;
  href?: string;
  children: (NavLinkItem | NavGroupWithChildren)[];
};

/** 1depth 메뉴 아이템: 단일 링크 또는 섹션(2depth 그룹) */
export type NavItem =
  | { type: "link"; href: string; label: string }
  | { type: "section"; label: string; children: NavSectionItem[] };

function link(href: string, label: string): NavLinkItem {
  return { href, label };
}

function group(label: string, children: NavLinkItem[]): NavGroupWithChildren {
  return { label, children };
}

/** 최종 메뉴 트리 (한글 UI, 영문 path) */
export const NAV_ITEMS: NavItem[] = [
  {
    type: "link",
    href: "/dashboard",
    label: "대시보드",
  },
  {
    type: "section",
    label: "데이터 관리",
    children: [
      {
        label: "데이터 현황",
        children: [link("/data", "데이터 현황")],
      },
      {
        label: "ESG 데이터",
        children: [
          link("/data/esg/environment", "환경 데이터"),
          link("/data/esg/social", "사회 데이터"),
          link("/data/esg/governance", "거버넌스 데이터"),
        ],
      },
      {
        label: "배출량 관리",
        children: [
          link("/data/emissions/scope1", "Scope 1"),
          link("/data/emissions/scope2", "Scope 2"),
          link("/data/emissions/scope3", "Scope 3"),
        ],
      },
      {
        label: "공급망 포털",
        children: [
          link("/data/supply-chain/vendors", "협력사 관리"),
          link("/data/supply-chain/invitations", "협력사 초대"),
          link("/data/supply-chain/submissions", "데이터 제출"),
          link("/data/supply-chain/verification", "데이터 검증"),
        ],
      },
      {
        label: "데이터 연동",
        children: [
          link("/data/integrations/erp", "ERP 연동"),
          link("/data/integrations/iot", "IoT 연동"),
          link("/data/integrations/excel", "Excel 업로드"),
        ],
      },
    ],
  },
  {
    type: "section",
    label: "KPI 관리",
    children: [
      {
        label: "",
        children: [
          link("/kpi/dashboard", "KPI 대시보드"),
          link("/kpi/categories", "KPI 카테고리"),
          link("/kpi/targets", "KPI 목표 관리"),
          link("/kpi/performance", "KPI 성과 분석"),
          link("/kpi/history", "KPI 이력 관리"),
        ],
      },
    ],
  },
  {
    type: "section",
    label: "분석",
    children: [
      {
        label: "",
        children: [
          link("/analytics/emissions", "배출량 분석"),
          link("/analytics/anomalies", "이상치 탐지"),
          link("/analytics/scenarios", "감축 시나리오"),
          link("/analytics/carbon-flow", "탄소 흐름 분석"),
        ],
      },
    ],
  },
  {
    type: "section",
    label: "감축 허브",
    children: [
      {
        label: "",
        children: [
          link("/action/targets", "감축 목표"),
          link("/action/projects", "감축 프로젝트"),
          link("/action/credits", "탄소 크레딧"),
          link("/action/progress", "감축 진행 현황"),
        ],
      },
    ],
  },
  {
    type: "section",
    label: "보고서",
    children: [
      {
        label: "",
        children: [
          link("/reports/esg", "ESG 보고서"),
          link("/reports/generated", "생성된 보고서"),
          link("/reports/templates", "보고서 템플릿"),
        ],
      },
      {
        label: "공시 프레임워크",
        children: [
          link("/reports/frameworks/k-esg", "K-ESG"),
          link("/reports/frameworks/gri", "GRI"),
          link("/reports/frameworks/issb", "ISSB"),
          link("/reports/frameworks/csrd", "CSRD"),
        ],
      },
    ],
  },
  {
    type: "section",
    label: "설정",
    children: [
      {
        label: "",
        children: [
          link("/settings/organization", "조직 관리"),
          link("/settings/users", "사용자 관리"),
          link("/settings/roles", "권한 관리"),
          link("/settings/integrations", "데이터 연동 설정"),
          link("/settings/employee-roster", "직원명부"),
          link("/settings/api-keys", "API 키 관리"),
          link("/settings/system", "시스템 설정"),
        ],
      },
    ],
  },
];

/** pathname → breadcrumb labels (경로별 한글 메뉴명) */
export const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "대시보드",
  "/": "대시보드",
  "/data": "데이터 관리",
  "/data/esg": "ESG 데이터",
  "/data/esg/environment": "환경 데이터",
  "/data/esg/social": "사회 데이터",
  "/data/esg/governance": "거버넌스 데이터",
  "/data/emissions/scope1": "Scope 1",
  "/data/emissions/scope2": "Scope 2",
  "/data/emissions/scope3": "Scope 3",
  "/data/supply-chain/vendors": "협력사 관리",
  "/data/supply-chain/invitations": "협력사 초대",
  "/data/supply-chain/submissions": "데이터 제출",
  "/data/supply-chain/verification": "데이터 검증",
  "/data/integrations/erp": "ERP 연동",
  "/data/integrations/iot": "IoT 연동",
  "/data/integrations/excel": "Excel 업로드",
  "/kpi": "KPI 관리",
  "/kpi/dashboard": "KPI 대시보드",
  "/kpi/categories": "KPI 카테고리",
  "/kpi/targets": "KPI 목표 관리",
  "/kpi/performance": "KPI 성과 분석",
  "/kpi/history": "KPI 이력 관리",
  "/analytics": "분석",
  "/analytics/emissions": "배출량 분석",
  "/analytics/anomalies": "이상치 탐지",
  "/analytics/scenarios": "감축 시나리오",
  "/analytics/carbon-flow": "탄소 흐름 분석",
  "/action": "감축 허브",
  "/action/targets": "감축 목표",
  "/action/projects": "감축 프로젝트",
  "/action/credits": "탄소 크레딧",
  "/action/progress": "감축 진행 현황",
  "/reports": "보고서",
  "/reports/frameworks": "공시 프레임워크",
  "/reports/esg": "ESG 보고서",
  "/reports/generated": "생성된 보고서",
  "/reports/templates": "보고서 템플릿",
  "/reports/frameworks/k-esg": "K-ESG",
  "/reports/frameworks/gri": "GRI",
  "/reports/frameworks/issb": "ISSB",
  "/reports/frameworks/csrd": "CSRD",
  "/settings": "설정",
  "/settings/organization": "조직 관리",
  "/settings/users": "사용자 관리",
  "/settings/roles": "권한 관리",
  "/settings/integrations": "데이터 연동 설정",
  "/settings/employee-roster": "직원명부",
  "/settings/api-keys": "API 키 관리",
  "/settings/system": "시스템 설정",
};

/** pathname이 href와 일치하거나 해당 하위 경로인지 */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
  if (pathname === href) return true;
  if (href !== "/" && pathname.startsWith(href + "/")) return true;
  return false;
}

/** pathname에 해당하는 breadcrumb 배열 반환 (한글 메뉴명) */
export function getBreadcrumbs(pathname: string): { href: string; label: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { href: string; label: string }[] = [];
  let acc = "";
  for (let i = 0; i < segments.length; i++) {
    acc += (acc ? "/" : "") + segments[i];
    const fullPath = "/" + acc;
    const label = ROUTE_LABELS[fullPath] ?? segmentToLabel(segments[i]);
    crumbs.push({ href: fullPath, label });
  }
  if (crumbs.length > 0 && crumbs[0].label === "dashboard") {
    crumbs[0].label = "대시보드";
  }
  return crumbs;
}

function segmentToLabel(segment: string): string {
  const map: Record<string, string> = {
    data: "데이터 관리",
    kpi: "KPI 관리",
    analytics: "분석",
    action: "감축 허브",
    reports: "보고서",
    settings: "설정",
    esg: "ESG 데이터",
    emissions: "배출량 관리",
    "supply-chain": "공급망 포털",
    integrations: "데이터 연동",
    frameworks: "공시 프레임워크",
  };
  return map[segment] ?? segment;
}
