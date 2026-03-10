"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AiScenarioItem } from "@/types";

export function AiScenarioCards({ items, isLoading }: { items: AiScenarioItem[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-24 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((s) => (
        <Card key={s.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{s.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{s.description}</p>
            <p>감축 {s.reductionMtCO2e.toFixed(1)} MtCO₂e ({s.reductionPercent}% )</p>
            <p>비용 영향: {s.costImpact}</p>
            {s.roiYears && <p>ROI 추정: {s.roiYears}년</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

