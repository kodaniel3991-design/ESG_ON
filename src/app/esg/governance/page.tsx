"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { EsgSubNav } from "@/components/esg/esg-sub-nav";
import { GovernanceDataTable } from "@/components/governance-data/governance-data-table";
import type { GovernanceDataRow } from "@/types/governance-data";

async function fetchGovernanceKpis(): Promise<GovernanceDataRow[]> {
  const period = String(new Date().getFullYear());
  const res = await fetch(`/api/kpi?type=list&domain=governance&period=${period}`);
  if (!res.ok) throw new Error("fetch failed");
  const items = await res.json();
  return items.map((item: any) => ({
    id: item.id,
    category: item.category,
    indicatorName: item.name,
    value: item.actual ?? 0,
    unit: item.unit,
    period: item.period,
    source: "KPI 마스터",
    evidenceCount: 0,
    status: item.isMissing ? "pending" : item.status === "on_track" ? "verified" : item.status === "attention" ? "review" : "ai_anomaly",
  }));
}

export default function GovernanceDataPage() {
  const { data: rows = [], isLoading } = useQuery<GovernanceDataRow[]>({
    queryKey: ["kpi-list-governance"],
    queryFn: fetchGovernanceKpis,
  });

  return (
    <>
      <PageHeader
        title="거버넌스 데이터"
        description="거버넌스(Governance) 관련 ESG 지표를 조회하고 관리합니다."
      >
        <EsgSubNav />
      </PageHeader>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            거버넌스 데이터 목록
          </h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">불러오는 중...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              등록된 거버넌스(G) KPI가 없습니다. 설정 &gt; KPI 마스터에서 지표를 추가해 주세요.
            </p>
          ) : (
            <GovernanceDataTable rows={rows} />
          )}
        </section>
      </div>
    </>
  );
}
