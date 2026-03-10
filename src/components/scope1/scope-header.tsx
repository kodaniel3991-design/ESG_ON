"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ScopeTabs } from "./scope-tabs";

interface ScopeHeaderProps {
  year: string;
}

export function ScopeHeader({ year }: ScopeHeaderProps) {
  return (
    <div className="space-y-1">
      <PageHeader
        title="Scope 1"
        description="직접 배출(연소·공정 등) 데이터를 관리합니다."
        className="border-b-0 pb-2"
      >
        <div className="flex flex-col items-end gap-2">
          <ScopeTabs />
        </div>
      </PageHeader>
    </div>
  );
}

