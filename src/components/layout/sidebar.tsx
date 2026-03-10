"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  GitBranch,
  Network,
  Sparkles,
  Calculator,
  FileText,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Emission Analytics", icon: BarChart3 },
  { href: "/carbon-flow", label: "Carbon Flow", icon: GitBranch },
  { href: "/scope3", label: "Scope 3 Network", icon: Network },
  { href: "/insights", label: "AI Carbon Insight", icon: Sparkles },
  { href: "/simulator", label: "Reduction Simulator", icon: Calculator },
  { href: "/reports", label: "ESG Reports", icon: FileText },
  { href: "/compliance", label: "Compliance Status", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <span className="text-lg font-semibold tracking-tight text-foreground">
          CarbonOS
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <p className="px-3 py-2 text-xs text-muted-foreground">
          ESG Carbon Management
        </p>
      </div>
    </aside>
  );
}
