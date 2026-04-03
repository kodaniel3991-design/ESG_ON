"use client";

import { PageHeader } from "@/components/layout/page-header";
import { MaterialitySubNav } from "@/components/materiality/materiality-sub-nav";
import { MaterialityFlowMap } from "@/components/materiality/materiality-flow-map";

export default function MaterialityFlowPage() {
  return (
    <div>
      <PageHeader
        title="중대성 평가 흐름도"
        description="KPI 카탈로그 기반 이슈 도출부터 이중 중대성 평가, KPI 연결, 공시 반영까지의 전체 프로세스"
      >
        <MaterialitySubNav />
      </PageHeader>
      <div className="mt-6">
        <MaterialityFlowMap />
      </div>
    </div>
  );
}
