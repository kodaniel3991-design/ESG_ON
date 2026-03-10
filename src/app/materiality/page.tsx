"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getMaterialityIssues,
  getMaterialityAiRecommendations,
  getMaterialityMatrix,
  getMaterialityRanking,
} from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { MaterialitySubNav } from "@/components/materiality/materiality-sub-nav";
import { MaterialityIssueTable } from "@/components/materiality/materiality-issue-table";
import { MaterialityAiCard } from "@/components/materiality/materiality-ai-card";
import { MaterialityMatrix } from "@/components/materiality/materiality-matrix";
import { MaterialityRanking } from "@/components/materiality/materiality-ranking";
import { MaterialityIssueDrawer } from "@/components/materiality/materiality-issue-drawer";
import type { MaterialityIssue, MaterialityEsgDimension } from "@/types";

export default function MaterialityDashboardPage() {
  const [dimFilter, setDimFilter] = useState<MaterialityEsgDimension | "all">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<MaterialityIssue | null>(null);
  const openDrawer = (r: MaterialityIssue) => { setSelectedIssue(r); setDrawerOpen(true); };

  const { data: issues, isLoading: issuesLoading } = useQuery({ queryKey: ["materiality-issues"], queryFn: getMaterialityIssues });
  const { data: aiRecs, isLoading: aiLoading } = useQuery({ queryKey: ["materiality-ai"], queryFn: getMaterialityAiRecommendations });
  const { data: matrix, isLoading: matrixLoading } = useQuery({ queryKey: ["materiality-matrix"], queryFn: getMaterialityMatrix });
  const { data: ranking, isLoading: rankLoading } = useQuery({ queryKey: ["materiality-ranking"], queryFn: getMaterialityRanking });

  return (
    <div data-page="materiality-dashboard">
      <PageHeader title="중대성 평가 대시보드" description="내부 전문가·산업 벤치마크·KPI 영향도·AI 추천 기반 중대성 평가">
        <MaterialitySubNav />
      </PageHeader>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <MaterialityIssueTable data={issues ?? []} isLoading={issuesLoading} onRowClick={openDrawer} dimensionFilter={dimFilter} onDimensionFilterChange={setDimFilter} />
        </section>
        <section className="space-y-6">
          <MaterialityAiCard items={aiRecs ?? []} isLoading={aiLoading} />
          <MaterialityRanking items={ranking ?? []} isLoading={rankLoading} />
        </section>
      </div>
      <div className="mt-8">
        <MaterialityMatrix points={matrix ?? []} isLoading={matrixLoading} />
      </div>
      <MaterialityIssueDrawer open={drawerOpen} onOpenChange={setDrawerOpen} item={selectedIssue} />
    </div>
  );
}
