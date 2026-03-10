"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ScopeTabs } from "@/components/scope1/scope-tabs";

interface Scope2HeaderProps {
  year: string;
}

export function Scope2Header({ year }: Scope2HeaderProps) {
  return (
    <div className="space-y-1">
      <PageHeader
        title="Scope 2"
        description="간접 배출(전력·열 등) 데이터를 관리합니다."
        className="border-b-0 pb-2"
      >
        <div className="flex flex-col items-end gap-2">
          <ScopeTabs />
        </div>
      </PageHeader>
    </div>
  );
}

