"use client";

import type { SubNavItem } from "@/components/common/sub-nav";
import { SubNav } from "@/components/common/sub-nav";

const links: SubNavItem[] = [
  { href: "/kpi/dashboard", label: "KPI 대시보드" },
  { href: "/kpi/categories", label: "KPI 카테고리" },
  { href: "/kpi/targets", label: "KPI 목표 관리" },
  { href: "/kpi/performance", label: "KPI 성과 분석" },
  { href: "/kpi/history", label: "KPI 이력 관리" },
];

export function KpiSubNav() {
  return (
    <SubNav
      items={links}
      variant="underline"
      aria-label="KPI 관리 서브 내비게이션"
    />
  );
}
