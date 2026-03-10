"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/simulator", label: "감축 허브 대시보드" },
  { href: "/simulator/opportunities", label: "감축 기회" },
  { href: "/simulator/scenarios", label: "시나리오" },
  { href: "/simulator/projects", label: "프로젝트" },
  { href: "/simulator/progress", label: "진행 현황" },
];

export function ReductionSubNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap items-center gap-1">
      {links.map((link) => {
        const active =
          pathname === link.href ||
          (link.href !== "/simulator" && pathname.startsWith(link.href));
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

