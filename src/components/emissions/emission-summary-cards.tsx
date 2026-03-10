"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { EmissionSummary } from "@/types";
import { formatMtCO2e, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface EmissionSummaryCardsProps {
  data: EmissionSummary | null;
  isLoading?: boolean;
}

const SCOPE_LABELS: Record<"scope1" | "scope2" | "scope3", string> = {
  scope1: "Scope 1",
  scope2: "Scope 2",
  scope3: "Scope 3",
};

export function EmissionSummaryCards({
  data,
  isLoading,
}: EmissionSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4 pb-0">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="h-8 w-28 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const scopeCards = (
    ["scope1", "scope2", "scope3"] as const
  ).map((key) => ({
    label: SCOPE_LABELS[key],
    value: data[key],
  }));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card className="overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <p className="text-sm font-medium text-muted-foreground">
            총 배출량
          </p>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <p className="text-xl font-semibold tracking-tight">
            {formatMtCO2e(data.totalMtCO2e)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{data.period}</p>
          {data.yoyChangePercent != null && (
            <span
              className={
                data.yoyChangePercent <= 0
                  ? "mt-1 flex items-center gap-0.5 text-xs text-carbon-success"
                  : "mt-1 flex items-center gap-0.5 text-xs text-carbon-danger"
              }
            >
              {data.yoyChangePercent <= 0 ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5" />
              )}
              {formatPercent(data.yoyChangePercent)} 전년대비
            </span>
          )}
        </CardContent>
      </Card>
      {scopeCards.map(({ label, value }) => (
        <Card key={label} className="overflow-hidden">
          <CardHeader className="p-4 pb-0">
            <p className="text-sm font-medium text-muted-foreground">
              {label}
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-xl font-semibold tracking-tight">
              {formatMtCO2e(value)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
