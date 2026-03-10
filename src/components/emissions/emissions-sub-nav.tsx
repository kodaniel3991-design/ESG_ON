"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/data/emissions/scope1", label: "Scope 1" },
  { href: "/data/emissions/scope2", label: "Scope 2" },
  { href: "/data/emissions/scope3", label: "Scope 3" },
];

export function EmissionsSubNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1 w-fit">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
