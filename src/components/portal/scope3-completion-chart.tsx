"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Scope3CategoryPortal } from "@/types";
import { formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface P {
  data: Scope3CategoryPortal[];
  isLoading?: boolean;
}

export function Scope3CompletionChart({ data, isLoading }: P) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Scope 3 카테고리</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-48 w-full rounded-lg" /></CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Scope 3 카테고리별 배출량/완성도</CardTitle>
        <p className="text-sm text-muted-foreground">카테고리별 총 배출량 및 완성도</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((row) => (
          <div key={row.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{row.name}</span>
              <span className="text-muted-foreground">{formatNumber(row.totalEmissionsTco2e)} tCO2e / {row.completionPercent}%</span>
            </div>
            <Progress value={row.completionPercent} className="h-2" />
            <p className="text-xs text-muted-foreground">검증 {row.verifiedCount}/{row.vendorCount}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
