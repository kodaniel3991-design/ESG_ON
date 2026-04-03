"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/kpi", label: "KPI 대시보드" },
  { href: "/kpi/targets", label: "1. 목표 설정", step: true },
  { href: "/kpi/data-entry", label: "2. 데이터 입력", step: true },
  { href: "/kpi/performance", label: "3. 성과 분석", step: true },
  { href: "/kpi/reports", label: "4. 보고서", step: true },
  { href: "/kpi/history", label: "KPI 이력" },
];

export function KpiSubNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap items-center gap-1">
      {links.map((link, i) => {
        const isActive = pathname === link.href || (link.href !== "/kpi" && pathname.startsWith(link.href));
        const prevStep = links[i - 1];
        const showSep = link.step && prevStep?.step;
        return (
          <div key={link.href} className="flex items-center gap-1 shrink-0">
            {showSep && <span className="text-muted-foreground text-xs">›</span>}
            <Link
              href={link.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
