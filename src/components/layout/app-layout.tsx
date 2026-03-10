"use client";

import { TopHeader } from "./top-header";
import { ContentSwitcher } from "./content-switcher";
import { Breadcrumb } from "./breadcrumb";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-background">
      <TopHeader />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px] px-6 py-4">
          <Breadcrumb />
          <ContentSwitcher>{children}</ContentSwitcher>
        </div>
      </main>
    </div>
  );
}
