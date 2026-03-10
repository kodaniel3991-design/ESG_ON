"use client";

import { useState } from "react";
import { useKpiList } from "@/hooks/use-kpi-list";
import { useKpiSummary } from "@/hooks/use-kpi-summary";
import { ErrorState } from "@/components/common/error-state";
import { PageShell, PageSection } from "@/components/layout/page-shell";
import { KpiSubNav } from "@/components/kpi/kpi-sub-nav";
import { KpiSummaryCards } from "@/components/kpi/kpi-summary-cards";
import { KpiListTable } from "@/components/kpi/kpi-list-table";
import { KpiDetailDrawer } from "@/components/kpi/kpi-detail-drawer";
import { KpiTargetModal } from "@/components/kpi/kpi-target-modal";
import { Button } from "@/components/ui/button";
import { FileUp, Plus, PenLine } from "lucide-react";
import type { KpiManagementItem, KpiCategory } from "@/types";

export default function KPIDashboardPage() {
  const [esgFilter, setEsgFilter] = useState<KpiCategory | "all">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KpiManagementItem | null>(null);
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [targetItem, setTargetItem] = useState<KpiManagementItem | null>(null);

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useKpiSummary();
  const {
    data: list,
    isLoading: listLoading,
    isError: listError,
    refetch: refetchList,
  } = useKpiList();

  const handleRowClick = (row: KpiManagementItem) => {
    setSelectedItem(row);
    setDrawerOpen(true);
  };
  const handleSetTarget = (item: KpiManagementItem) => {
    setTargetItem(item);
    setTargetModalOpen(true);
    setDrawerOpen(false);
  };

  return (
    <PageShell
      title="KPI 대시보드"
      description="ESG·탄소 핵심 성과 지표를 한눈에 확인합니다."
      data-page="kpi-dashboard"
      headerChildren={<KpiSubNav />}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm">
          <PenLine className="mr-1.5 h-4 w-4" />
          데이터 입력
        </Button>
        <Button variant="outline" size="sm">
          <FileUp className="mr-1.5 h-4 w-4" />
          Excel 업로드
        </Button>
        <Button variant="outline" size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          지표 추가
        </Button>
      </div>

      <div className="mt-6 space-y-8">
        <PageSection title="요약">
          {summaryError && (
            <ErrorState onRetry={() => refetchSummary()} />
          )}
          <KpiSummaryCards items={summary ?? []} isLoading={summaryLoading} />
        </PageSection>

        <PageSection>
          {listError && <ErrorState onRetry={() => refetchList()} />}
          <KpiListTable
            data={list ?? []}
            isLoading={listLoading}
            title="KPI 목록"
            onRowClick={handleRowClick}
            esgFilter={esgFilter}
            onEsgFilterChange={setEsgFilter}
          />
        </PageSection>
      </div>

      <KpiDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        item={selectedItem}
        onSetTarget={handleSetTarget}
      />
      <KpiTargetModal
        open={targetModalOpen}
        onOpenChange={setTargetModalOpen}
        item={targetItem}
        onConfirm={() => setTargetModalOpen(false)}
      />
    </PageShell>
  );
}
