"use client";

import { useQuery } from "@tanstack/react-query";
import { getAiScenarios, getAiForecast, getAiRoi } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { AiSubNav } from "@/components/ai/ai-sub-nav";
import { AiScenarioCards } from "@/components/ai/ai-scenario-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AiScenariosPage() {
  const { data: scenarios, isLoading: sLoading } = useQuery({
    queryKey: ["ai-scenarios"],
    queryFn: getAiScenarios,
  });
  const { data: forecast, isLoading: fLoading } = useQuery({
    queryKey: ["ai-forecast"],
    queryFn: getAiForecast,
  });
  const { data: roi, isLoading: rLoading } = useQuery({
    queryKey: ["ai-roi"],
    queryFn: getAiRoi,
  });

  return (
    <>
      <PageHeader
        title="시나리오/예측"
        description="감축 시나리오와 예측, ROI 관점에서 옵션을 비교합니다."
      >
        <AiSubNav />
      </PageHeader>
      <div className="mt-8 space-y-8">
        <AiScenarioCards items={scenarios ?? []} isLoading={sLoading} />
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">예측 값 요약</CardTitle>
            </CardHeader>
            <CardContent>
              {fLoading || !forecast ? (
                <Skeleton className="h-32 w-full rounded-lg" />
              ) : (
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {forecast.map((p) => (
                    <li key={`${p.scenarioId}-${p.name}`}>
                      {p.scenarioId} / {p.name}: {p.value}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ROI 차트 (요약)</CardTitle>
            </CardHeader>
            <CardContent>
              {rLoading || !roi ? (
                <Skeleton className="h-32 w-full rounded-lg" />
              ) : (
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {roi.map((p) => (
                    <li key={p.label}>
                      {p.label}: 투자 {p.investment} / 편익 {p.benefit} (ROI{" "}
                      {p.roiPercent}%)
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

