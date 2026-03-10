"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";

interface EmissionTrendCardProps {
  monthlyTotals: number[]; // length 12
}

export function EmissionTrendCard({
  monthlyTotals,
}: EmissionTrendCardProps) {
  const max = Math.max(...monthlyTotals, 1);

  return (
    <Card className="border border-emerald-100 bg-emerald-25/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-emerald-900">
          Scope 1 Emission Trend
        </CardTitle>
        <p className="text-xs text-emerald-900/70">
          월별 배출량 추이를 한눈에 확인합니다.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col justify-between gap-2">
        <div className="flex h-32 items-end gap-1.5 rounded-lg bg-emerald-50/70 p-2">
          {monthlyTotals.map((value, index) => {
            const rawPercent = (value / max) * 100;
            // 막대가 너무 낮게 보이지 않도록 최소 높이를 강제로 보장
            const heightPercent = Math.max(rawPercent, 25);
            return (
              <div
                key={index}
                className="flex flex-1 flex-col items-center justify-end gap-1"
              >
                <div
                  className={cn(
                    "w-full rounded-full bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] transition-all",
                  )}
                  style={{ height: `${heightPercent || 8}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-right text-[11px] text-muted-foreground">
          연간 합계:{" "}
          <span className="font-semibold text-foreground">
            {formatNumber(
              monthlyTotals.reduce((sum, v) => sum + (Number.isNaN(v) ? 0 : v), 0),
              2,
            )}{" "}
            tCO₂e
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

