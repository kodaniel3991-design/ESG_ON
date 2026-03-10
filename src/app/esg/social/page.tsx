"use client";

import { useQuery } from "@tanstack/react-query";
import { getSocialMetrics, getSocialSummary } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { EsgSubNav } from "@/components/esg/esg-sub-nav";
import { EsgSummaryCards } from "@/components/esg/esg-summary-cards";
import { EsgMetricsTable } from "@/components/esg/esg-metrics-table";
import { Button } from "@/components/ui/button";
import { FileUp, Plus, PenLine } from "lucide-react";

export default function SocialDataPage() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["esg-social-metrics"],
    queryFn: getSocialMetrics,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["esg-social-summary"],
    queryFn: getSocialSummary,
  });

  return (
    <>
      <PageHeader
        title="사회 데이터"
        description="사회(Social) 관련 ESG 지표를 조회하고 관리합니다."
      >
        <div className="flex flex-wrap items-center gap-3">
          <EsgSubNav />
          <div className="flex items-center gap-2">
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
        </div>
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
            title="사회 지표 목록"
          />
        </section>
      </div>
    </>
  );
}
