"use client";

import { usePathname } from "next/navigation";
import { DashboardPageClient } from "@/app/dashboard-page-client";

export function ContentSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/dashboard") {
    return <DashboardPageClient />;
  }
  return <>{children}</>;
}
