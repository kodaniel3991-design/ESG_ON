"use client";

import { useQuery } from "@tanstack/react-query";
import { getMaterialitySettings } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { MaterialitySubNav } from "@/components/materiality/materiality-sub-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MaterialitySettingsPage() {
  const { data: settings, isLoading } = useQuery({ queryKey: ["materiality-settings"], queryFn: getMaterialitySettings });
  return (
    <>
      <PageHeader title="설정" description="중대성 평가 기본 설정 및 가중치">
        <MaterialitySubNav />
      </PageHeader>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">평가 설정</CardTitle>
            <p className="text-sm text-muted-foreground">평가 기간, 가중치, 매트릭스 기준선</p>
          </CardHeader>
          <CardContent>
            {isLoading && <Skeleton className="h-40 w-full rounded-lg" />}
            {!isLoading && settings && (
              <dl className="grid gap-4 sm:grid-cols-2">
                <div><dt className="text-sm text-muted-foreground">평가 기간</dt><dd className="font-medium">{settings.assessmentPeriod}</dd></div>
                <div><dt className="text-sm text-muted-foreground">전문가 가중치</dt><dd className="font-medium">{settings.expertWeight}</dd></div>
                <div><dt className="text-sm text-muted-foreground">벤치마크 가중치</dt><dd className="font-medium">{settings.benchmarkWeight}</dd></div>
                <div><dt className="text-sm text-muted-foreground">KPI 영향도 가중치</dt><dd className="font-medium">{settings.kpiImpactWeight}</dd></div>
                <div><dt className="text-sm text-muted-foreground">매트릭스 고중대 기준</dt><dd className="font-medium">{settings.matrixThresholdHigh} 이상</dd></div>
                <div><dt className="text-sm text-muted-foreground">매트릭스 중중대 기준</dt><dd className="font-medium">{settings.matrixThresholdMedium} 이상</dd></div>
              </dl>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
