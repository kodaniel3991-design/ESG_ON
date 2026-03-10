"use client";

import { useQuery } from "@tanstack/react-query";
import { getKpiMaster } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { KpiSubNav } from "@/components/kpi/kpi-sub-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const CAT: Record<string, string> = { environment: "환경", social: "사회", governance: "거버넌스", carbon: "탄소" };

export default function KpiMasterPage() {
  const { data: list, isLoading } = useQuery({ queryKey: ["kpi-master"], queryFn: getKpiMaster });
  return (
    <>
      <PageHeader title="KPI 마스터" description="KPI 지표 정의 및 마스터 데이터를 관리합니다.">
        <KpiSubNav />
      </PageHeader>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">지표 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <Skeleton className="h-48 w-full rounded-lg" />}
            {!isLoading && list && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left">
                      <th className="px-4 py-3 font-medium">코드</th>
                      <th className="px-4 py-3 font-medium">지표명</th>
                      <th className="px-4 py-3 font-medium">카테고리</th>
                      <th className="px-4 py-3 font-medium">보고서 반영</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((row) => (
                      <tr key={row.id} className="border-b border-border/50">
                        <td className="px-4 py-3 font-mono text-xs">{row.code}</td>
                        <td className="px-4 py-3 font-medium">{row.name}</td>
                        <td className="px-4 py-3">{CAT[row.category]}</td>
                        <td className="px-4 py-3">{row.reportIncluded ? <Badge variant="secondary">반영</Badge> : "미반영"}</td>
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
