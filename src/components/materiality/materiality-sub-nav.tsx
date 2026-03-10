"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/materiality", label: "대시보드" },
  { href: "/materiality/issues", label: "이슈 평가" },
  { href: "/materiality/matrix", label: "매트릭스/결과" },
  { href: "/materiality/reports", label: "보고서 연계" },
  { href: "/materiality/history", label: "이력" },
  { href: "/materiality/settings", label: "설정" },
];

export function MaterialitySubNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap items-center gap-1 border-b border-border pb-2">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/materiality" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
