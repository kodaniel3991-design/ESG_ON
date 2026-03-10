"use client";

import { SettingsSidebar } from "./settings-sidebar";

export function SettingsLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-8">
      <SettingsSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
