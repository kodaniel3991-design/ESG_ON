"use client";

import { useQuery } from "@tanstack/react-query";
import { getAiInsightReports } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { AiSubNav } from "@/components/ai/ai-sub-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AiReportsPage() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ["ai-insight-reports"],
    queryFn: getAiInsightReports,
  });

  return (
    <>
      <PageHeader
        title="인사이트 리포트"
        description="경영 보고와 공시 보고서에 바로 활용 가능한 AI 인사이트 리포트"
      >
        <AiSubNav />
      </PageHeader>
      <div className="mt-8">
        {isLoading && <Skeleton className="h-40 w-full rounded-lg" />}
        {!isLoading && reports && (
          <div className="space-y-3">
            {reports.map((r) => (
              <Card key={r.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-base">{r.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      KPI {r.relatedKpiCount}개 · 이슈 {r.relatedIssueCount}개
                    </p>
                  </div>
                  <Badge variant={r.readyForReport ? "success" : "secondary"}>
                    {r.readyForReport ? "보고서 반영 가능" : "초안"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{r.summary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

