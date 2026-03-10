"use client";

import { useQuery } from "@tanstack/react-query";
import { getKpiChangeHistory } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { KpiSubNav } from "@/components/kpi/kpi-sub-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function KpiHistoryPage() {
  const { data: list, isLoading } = useQuery({ queryKey: ["kpi-change-history"], queryFn: getKpiChangeHistory });
  return (
    <>
      <PageHeader title="KPI 변경이력" description="목표·실적 등 KPI 변경 이력을 조회합니다.">
        <KpiSubNav />
      </PageHeader>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">변경 이력</CardTitle>
            <p className="text-sm text-muted-foreground">필드별 이전값 → 변경값, 변경일시, 변경자</p>
          </CardHeader>
          <CardContent>
            {isLoading && <Skeleton className="h-48 w-full rounded-lg" />}
            {!isLoading && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">KPI</th>
                      <th className="px-4 py-3 font-medium">필드</th>
                      <th className="px-4 py-3 font-medium">이전값</th>
                      <th className="px-4 py-3 font-medium">변경값</th>
                      <th className="px-4 py-3 font-medium">변경일시</th>
                      <th className="px-4 py-3 font-medium">변경자</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list?.map((row) => (
                      <tr key={row.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{row.kpiName}</td>
                        <td className="px-4 py-3">{row.field}</td>
                        <td className="px-4 py-3 text-muted-foreground">{String(row.oldValue)}</td>
                        <td className="px-4 py-3">{String(row.newValue)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.changedAt.replace("T", " ").slice(0, 16)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.changedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
