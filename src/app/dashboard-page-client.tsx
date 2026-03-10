"use client";

import { DashboardContent } from "./dashboard-content";

export function DashboardPageClient() {
  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-0 flex-col">
      <DashboardContent />
    </div>
  );
}
