"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EsgMetricItem } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface EsgMetricsTableProps {
  data: EsgMetricItem[];
  isLoading?: boolean;
  title?: string;
}

const statusLabel: Record<NonNullable<EsgMetricItem["status"]>, string> = {
  verified: "검증됨",
  estimated: "추정",
  pending: "입력대기",
};

const statusVariant: Record<
  NonNullable<EsgMetricItem["status"]>,
  "success" | "warning" | "secondary"
> = {
  verified: "success",
  estimated: "warning",
  pending: "secondary",
};

export function EsgMetricsTable({
  data,
  isLoading,
  title = "지표 목록",
}: EsgMetricsTableProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          기간·출처·검증 상태를 확인할 수 있습니다.
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">구분</th>
                <th className="px-4 py-3 font-medium">지표명</th>
                <th className="px-4 py-3 font-medium">값</th>
                <th className="px-4 py-3 font-medium">단위</th>
                <th className="px-4 py-3 font-medium">기간</th>
                <th className="px-4 py-3 font-medium">출처</th>
                <th className="px-4 py-3 font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/50 transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">{row.category}</td>
                  <td className="px-4 py-3">{row.indicatorName}</td>
                  <td className="px-4 py-3">
                    {typeof row.value === "number"
                      ? row.value.toLocaleString()
                      : row.value}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.unit || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.period}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {row.source || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.status ? (
                      <Badge
                        variant={statusVariant[row.status]}
                        className="text-xs"
                      >
                        {statusLabel[row.status]}
                      </Badge>
                    ) : (
                      "—"
                    )}
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
