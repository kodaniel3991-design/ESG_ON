"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getAiKpiCards,
  getAiAnomalies,
  getAIInsights,
  getAiRiskSummary,
  getAiSupplyChainRisk,
} from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { AiSubNav } from "@/components/ai/ai-sub-nav";
import { AiKpiCards } from "@/components/ai/ai-kpi-cards";
import { AiAnomalyTable } from "@/components/ai/ai-anomaly-table";
import { AiCauseDrawer } from "@/components/ai/ai-cause-drawer";
import { MaterialityAiCard } from "@/components/materiality/materiality-ai-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AiAnomalyItem } from "@/types";

export default function AiDashboardPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<AiAnomalyItem | null>(null);

  const { data: kpiCards, isLoading: kpiLoading } = useQuery({
    queryKey: ["ai-kpis"],
    queryFn: getAiKpiCards,
  });
  const { data: anomalies, isLoading: anomalyLoading } = useQuery({
    queryKey: ["ai-anomalies"],
    queryFn: getAiAnomalies,
  });
  const { data: insights, isLoading: insightLoading } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: getAIInsights,
  });
  const { data: riskSummary, isLoading: riskLoading } = useQuery({
    queryKey: ["ai-risk-summary"],
    queryFn: getAiRiskSummary,
  });
  const { data: supplyRisk } = useQuery({
    queryKey: ["ai-supply-risk"],
    queryFn: getAiSupplyChainRisk,
  });

  return (
    <div data-page="ai-dashboard">
      <PageHeader
        title="AI분석 대시보드"
        description="ESG·탄소·공급망 데이터를 기반으로 이상치 탐지와 감축 인사이트를 제공합니다."
      >
        <AiSubNav />
      </PageHeader>

      <div className="mt-8 space-y-8">
        <section>
          <AiKpiCards items={kpiCards ?? []} isLoading={kpiLoading} />
        </section>

        <section className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AiAnomalyTable
              data={anomalies ?? []}
              isLoading={anomalyLoading}
              onRowClick={(row) => {
                setSelected(row);
                setDrawerOpen(true);
              }}
            />
          </div>
          <div className="space-y-4">
            <MaterialityAiCard
              items={
                (insights ?? []).map((x) => ({
                  id: x.id,
                  issueName: x.title,
                  reason: x.summary,
                  suggestedPriority: 1,
                  confidence: x.confidence,
                })) ?? []
              }
              isLoading={insightLoading}
            />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">KPI·공급망 리스크 요약</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                {riskLoading || !riskSummary ? (
                  <Skeleton className="h-16 w-full rounded-lg" />
                ) : (
                  <>
                    <p>KPI 리스크 {riskSummary.kpiAtRiskCount}개</p>
                    <p>이상치 {riskSummary.anomalyCount}건</p>
                    <p>공급망 고위험 공급사 {riskSummary.highRiskVendors}개사</p>
                  </>
                )}
                {supplyRisk && (
                  <p className="text-xs">
                    대표 공급망 리스크:{" "}
                    {supplyRisk.map((v) => v.vendorName).join(", ")}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      <AiCauseDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        anomaly={selected}
      />
    </div>
  );
}

