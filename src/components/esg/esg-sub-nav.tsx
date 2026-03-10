"use client";

import type { SubNavItem } from "@/components/common/sub-nav";
import { SubNav } from "@/components/common/sub-nav";

const items: SubNavItem[] = [
  { href: "/data/esg/environment", label: "환경 데이터" },
  { href: "/data/esg/social", label: "사회 데이터" },
  { href: "/data/esg/governance", label: "거버넌스 데이터" },
];

export function EsgSubNav() {
  return (
    <SubNav
      items={items}
      variant="pill"
      aria-label="ESG 데이터 서브 내비게이션"
    />
  );
}
