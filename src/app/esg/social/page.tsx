"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { EsgSubNav } from "@/components/esg/esg-sub-nav";
import { SocialDataTable } from "@/components/social-data/social-data-table";
import type { SocialDataRow } from "@/types/social-data";

async function fetchSocialKpis(): Promise<SocialDataRow[]> {
  const period = String(new Date().getFullYear());
  const res = await fetch(`/api/kpi?type=list&domain=social&period=${period}`);
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

export default function SocialDataPage() {
  const { data: rows = [], isLoading } = useQuery<SocialDataRow[]>({
    queryKey: ["kpi-list-social"],
    queryFn: fetchSocialKpis,
  });

  return (
    <>
      <PageHeader
        title="사회 데이터"
        description="사회(Social) 관련 ESG 지표를 조회하고 관리합니다."
      >
        <EsgSubNav />
      </PageHeader>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            사회 데이터 목록
          </h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">불러오는 중...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              등록된 사회(S) KPI가 없습니다. 설정 &gt; KPI 마스터에서 지표를 추가해 주세요.
            </p>
          ) : (
            <SocialDataTable rows={rows} />
          )}
        </section>
      </div>
    </>
  );
}
