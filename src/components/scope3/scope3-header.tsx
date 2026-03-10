"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ScopeTabs } from "@/components/scope1/scope-tabs";

interface Scope3HeaderProps {
  year: string;
}

export function Scope3Header({ year }: Scope3HeaderProps) {
  return (
    <div className="space-y-1">
      <PageHeader
        title="Scope 3"
        description="공급망·제품 사용 등 기타 간접 배출 데이터를 관리합니다."
        className="border-b-0 pb-2"
      >
        <div className="flex flex-col items-end gap-2">
          <ScopeTabs />
        </div>
      </PageHeader>
    </div>
  );
}

