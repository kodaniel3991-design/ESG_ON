"use client";

import { useQuery } from "@tanstack/react-query";
import { getKpiCategories } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { KpiSubNav } from "@/components/kpi/kpi-sub-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ESG: Record<string, string> = { environment: "환경", social: "사회", governance: "거버넌스", carbon: "탄소" };

export default function KpiCategoriesPage() {
  const { data: list, isLoading } = useQuery({ queryKey: ["kpi-categories"], queryFn: getKpiCategories });
  return (
    <>
      <PageHeader title="KPI 카테고리" description="KPI 분류 체계 및 ESG 영역을 관리합니다.">
        <KpiSubNav />
      </PageHeader>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">카테고리 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <Skeleton className="h-40 w-full rounded-lg" />}
            {!isLoading && list && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left">
                      <th className="px-4 py-3 font-medium">코드</th>
                      <th className="px-4 py-3 font-medium">명칭</th>
                      <th className="px-4 py-3 font-medium">ESG 영역</th>
                      <th className="px-4 py-3 font-medium">정렬</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((row) => (
                      <tr key={row.id} className="border-b border-border/50">
                        <td className="px-4 py-3 font-mono text-xs">{row.code}</td>
                        <td className="px-4 py-3 font-medium">{row.name}</td>
                        <td className="px-4 py-3">{ESG[row.esgArea]}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.sortOrder}</td>
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
