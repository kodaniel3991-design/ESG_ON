"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SETTINGS_GROUPS } from "@/lib/settings-config";

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 rounded-lg border border-border bg-card py-4 pr-4 pl-3 shadow-sm">
      <nav className="flex flex-col gap-6">
        {SETTINGS_GROUPS.map((group) => (
          <div key={group.label || "main"}>
            {group.label ? (
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </h3>
            ) : null}
            <ul className="space-y-0.5">
              {group.children.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/settings" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
