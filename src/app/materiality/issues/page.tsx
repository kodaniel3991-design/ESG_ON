"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMaterialityIssues } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { MaterialitySubNav } from "@/components/materiality/materiality-sub-nav";
import { MaterialityIssueTable } from "@/components/materiality/materiality-issue-table";
import { MaterialityIssueDrawer } from "@/components/materiality/materiality-issue-drawer";
import type { MaterialityIssue, MaterialityEsgDimension } from "@/types";

export default function MaterialityIssuesPage() {
  const [dimFilter, setDimFilter] = useState<MaterialityEsgDimension | "all">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<MaterialityIssue | null>(null);
  const { data: issues, isLoading } = useQuery({ queryKey: ["materiality-issues"], queryFn: getMaterialityIssues });
  const openDrawer = (r: MaterialityIssue) => { setSelected(r); setDrawerOpen(true); };
  return (
    <>
      <PageHeader title="이슈 평가" description="ESG 이슈별 내부 전문가·벤치마크·KPI 연결 평가">
        <MaterialitySubNav />
      </PageHeader>
      <div className="mt-8">
        <MaterialityIssueTable data={issues ?? []} isLoading={isLoading} onRowClick={openDrawer} dimensionFilter={dimFilter} onDimensionFilterChange={setDimFilter} />
      </div>
      <MaterialityIssueDrawer open={drawerOpen} onOpenChange={setDrawerOpen} item={selected} />
    </>
  );
}
