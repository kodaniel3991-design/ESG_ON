"use client";

import { useQuery } from "@tanstack/react-query";
import { getKpiSettings } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { KpiSubNav } from "@/components/kpi/kpi-sub-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function KpiSettingsPage() {
  const { data: settings, isLoading } = useQuery({ queryKey: ["kpi-settings"], queryFn: getKpiSettings });

  return (
    <>
      <PageHeader title="KPI 설정" description="KPI 기본 설정 및 보고 옵션을 관리합니다.">
        <KpiSubNav />
      </PageHeader>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">기본 설정</CardTitle>
            <p className="text-sm text-muted-foreground">기본 기간, 보고서 반영 기본값, 소수 자릿수 등</p>
          </CardHeader>
          <CardContent>
            {isLoading && <Skeleton className="h-40 w-full rounded-lg" />}
            {!isLoading && settings && (
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">기본 기간</dt>
                  <dd className="font-medium">{settings.defaultPeriod}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">보고서 반영 기본값</dt>
                  <dd className="font-medium">{settings.reportInclusionDefault ? "반영" : "미반영"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">목표 수정 허용</dt>
                  <dd className="font-medium">{settings.targetUpdateAllowed ? "허용" : "비허용"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">소수 자릿수</dt>
                  <dd className="font-medium">{settings.decimalPlaces}</dd>
                </div>
              </dl>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
