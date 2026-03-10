"use client";

import { useQuery } from "@tanstack/react-query";
import { getEnvironmentMetrics, getEnvironmentSummary } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { EsgSubNav } from "@/components/esg/esg-sub-nav";
import { EsgSummaryCards } from "@/components/esg/esg-summary-cards";
import { EsgMetricsTable } from "@/components/esg/esg-metrics-table";

export default function EnvironmentDataPage() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["esg-environment-metrics"],
    queryFn: getEnvironmentMetrics,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["esg-environment-summary"],
    queryFn: getEnvironmentSummary,
  });

  return (
    <>
      <PageHeader
        title="환경 데이터"
        description="환경(Environmental) 관련 ESG 지표를 조회하고 관리합니다."
      >
        <EsgSubNav />
      </PageHeader>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">
            요약
          </h2>
          <EsgSummaryCards
            items={summary ?? []}
            isLoading={summaryLoading}
          />
        </section>

        <section>
          <EsgMetricsTable
            data={metrics ?? []}
            isLoading={metricsLoading}
            title="환경 지표 목록"
          />
        </section>
      </div>
    </>
  );
}
