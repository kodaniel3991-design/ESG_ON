"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/insights", label: "AI분석 대시보드" },
  { href: "/insights/anomalies", label: "이상치/원인 분석" },
  { href: "/insights/scenarios", label: "시나리오/예측" },
  { href: "/insights/reports", label: "인사이트 리포트" },
];

export function AiSubNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap items-center gap-1">
      {links.map((link) => {
        const active =
          pathname === link.href ||
          (link.href !== "/insights" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

