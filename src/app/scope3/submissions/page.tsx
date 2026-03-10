"use client";

import { useQuery } from "@tanstack/react-query";
import { getSubmissions } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { PortalSubNav } from "@/components/portal/portal-sub-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  not_started: "미시작",
  in_progress: "진행중",
  submitted: "제출됨",
  verified: "검증완료",
  rejected: "반려",
};

export default function PortalSubmissionsPage() {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ["portal-submissions"],
    queryFn: getSubmissions,
  });

  return (
    <>
      <PageHeader title="ESG/탄소 데이터 제출 현황" description="협력사별 제출 상태와 Scope 3 완성도를 확인합니다.">
        <PortalSubNav />
      </PageHeader>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">제출 현황</CardTitle>
            <p className="text-sm text-muted-foreground">기간별 협력사 제출 및 검증 상태</p>
          </CardHeader>
          <CardContent>
            {isLoading && <Skeleton className="h-64 w-full rounded-lg" />}
            {!isLoading && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">협력사</th>
                      <th className="px-4 py-3 font-medium">기간</th>
                      <th className="px-4 py-3 font-medium">상태</th>
                      <th className="px-4 py-3 font-medium">Scope3 완성</th>
                      <th className="px-4 py-3 font-medium text-right">배출량</th>
                      <th className="px-4 py-3 font-medium">제출일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions?.map((s) => {
                      const pct = (s.scope3CategoriesCompleted / s.scope3CategoriesTotal) * 100;
                      const emText = s.emissionsTco2e != null ? formatNumber(s.emissionsTco2e) + " tCO2e" : "—";
                      const badgeV = s.status === "verified" ? "success" : s.status === "submitted" ? "warning" : "secondary";
                      return (
                        <tr key={s.vendorId} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="px-4 py-3 font-medium">{s.vendorName}</td>
                          <td className="px-4 py-3">{s.period}</td>
                          <td className="px-4 py-3"><Badge variant={badgeV}>{STATUS_LABEL[s.status] ?? s.status}</Badge></td>
                          <td className="px-4 py-3"><Progress value={pct} className="h-2 w-20" /><span className="ml-2 text-xs">{s.scope3CategoriesCompleted}/{s.scope3CategoriesTotal}</span></td>
                          <td className="px-4 py-3 text-right">{emText}</td>
                          <td className="px-4 py-3 text-muted-foreground">{s.submittedAt ?? "—"}</td>
                        </tr>
                      );
                    })}
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
