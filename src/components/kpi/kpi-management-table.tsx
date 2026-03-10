"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { KpiManagementItem, KpiCategory, KpiStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal } from "lucide-react";

interface KpiManagementTableProps {
  data: KpiManagementItem[];
  isLoading?: boolean;
  title?: string;
}

const CATEGORY_LABEL: Record<KpiCategory, string> = {
  environment: "환경",
  social: "사회",
  governance: "거버넌스",
  carbon: "탄소",
};

const STATUS_LABEL: Record<KpiStatus, string> = {
  on_track: "정상",
  attention: "주의",
  anomaly: "이상",
};

const STATUS_VARIANT: Record<KpiStatus, "success" | "warning" | "danger"> = {
  on_track: "success",
  attention: "warning",
  anomaly: "danger",
};

function formatValue(v: number | string): string {
  if (typeof v === "number") return v.toLocaleString();
  return String(v);
}

export function KpiManagementTable({
  data,
  isLoading,
  title = "KPI 목록",
}: KpiManagementTableProps) {
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
          목표·실적·달성률과 상태를 확인할 수 있습니다.
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">지표명</th>
                <th className="px-4 py-3 font-medium">카테고리</th>
                <th className="px-4 py-3 font-medium">단위</th>
                <th className="px-4 py-3 font-medium text-right">목표</th>
                <th className="px-4 py-3 font-medium text-right">실적</th>
                <th className="px-4 py-3 font-medium text-right">달성률</th>
                <th className="px-4 py-3 font-medium">기간</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="w-10 px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/50 transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {CATEGORY_LABEL[row.category]}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.unit}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatValue(row.target)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.actual != null ? formatValue(row.actual) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.achievementPercent != null
                      ? `${row.achievementPercent.toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.period}
                  </td>
                  <td className="px-4 py-3">
                    {row.status ? (
                      <Badge
                        variant={STATUS_VARIANT[row.status]}
                        className="text-xs"
                      >
                        {STATUS_LABEL[row.status]}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-2 py-3">
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
