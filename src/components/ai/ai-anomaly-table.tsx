"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal } from "lucide-react";

import type { AiAnomalyItem } from "@/types";

const DIM_LABEL: Record<AiAnomalyItem["dimension"], string> = {
  carbon: "탄소",
  esg: "ESG",
  supply_chain: "공급망",
};

const SEVERITY_LABEL: Record<AiAnomalyItem["severity"], string> = {
  low: "낮음",
  medium: "중간",
  high: "높음",
};

const SEVERITY_VARIANT: Record<AiAnomalyItem["severity"], "secondary" | "warning" | "danger"> =
  { low: "secondary", medium: "warning", high: "danger" };

export function AiAnomalyTable(props: {
  data: AiAnomalyItem[];
  isLoading?: boolean;
  onRowClick?: (row: AiAnomalyItem) => void;
}) {
  const { data, isLoading, onRowClick } = props;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base">이상치 탐지</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="h-48 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
        <div>
          <CardTitle className="text-base">이상치 탐지</CardTitle>
          <p className="text-sm text-muted-foreground">
            ESG · 탄소 · 공급망 데이터 기반 자동 탐지
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">데이터 소스</th>
                <th className="px-4 py-3 font-medium">영역</th>
                <th className="px-4 py-3 font-medium text-right">편차</th>
                <th className="px-4 py-3 font-medium">기간</th>
                <th className="px-4 py-3 font-medium">심각도</th>
                <th className="px-4 py-3 font-medium">요약</th>
                <th className="w-10 px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.id}
                  className={
                    "border-b border-border/50 cursor-pointer hover:bg-muted/30"
                  }
                  onClick={() => onRowClick?.(row)}
                >
                  <td className="px-4 py-3 font-medium">{row.source}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{DIM_LABEL[row.dimension]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.deviationPercent.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.period}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={SEVERITY_VARIANT[row.severity]}>
                      {SEVERITY_LABEL[row.severity]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {row.causeSummary}
                  </td>
                  <td
                    className="px-2 py-3"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

