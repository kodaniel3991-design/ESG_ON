"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, AlertCircle, FileText } from "lucide-react";
import type { KpiManagementItem, KpiCategory } from "@/types";
import { KpiStatusBadge } from "./kpi-status-badge";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<KpiCategory, string> = {
  environment: "환경",
  social: "사회",
  governance: "거버넌스",
  carbon: "탄소",
};

function formatValue(v: number | string): string {
  if (typeof v === "number") return v.toLocaleString();
  return String(v);
}

interface KpiListTableProps {
  data: KpiManagementItem[];
  isLoading?: boolean;
  title?: string;
  onRowClick?: (row: KpiManagementItem) => void;
  esgFilter?: KpiCategory | "all";
  onEsgFilterChange?: (category: KpiCategory | "all") => void;
}

export function KpiListTable({
  data,
  isLoading,
  title = "KPI 목록",
  onRowClick,
  esgFilter = "all",
  onEsgFilterChange,
}: KpiListTableProps) {
  const filtered = useMemo(() => {
    if (esgFilter === "all") return data;
    return data.filter((r) => r.category === esgFilter);
  }, [data, esgFilter]);

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
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 p-4 pb-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">목표·실적·달성률, 상태, 보고서 반영 여부</p>
        </div>
        {onEsgFilterChange && (
          <div className="flex flex-wrap gap-1">
            {(["all", "carbon", "environment", "social", "governance"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onEsgFilterChange(cat)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  esgFilter === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {cat === "all" ? "전체" : CATEGORY_LABEL[cat]}
              </button>
            ))}
          </div>
        )}
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
                <th className="px-4 py-3 font-medium">보고서</th>
                <th className="w-10 px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border/50 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-muted/30"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  <td className="px-4 py-3 font-medium">
                    <span className="flex items-center gap-1.5">
                      {row.isMissing && <span title="누락"><AlertCircle className="h-3.5 w-3.5 text-carbon-warning" /></span>}
                      {row.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{CATEGORY_LABEL[row.category]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.unit}</td>
                  <td className="px-4 py-3 text-right">{formatValue(row.target)}</td>
                  <td className="px-4 py-3 text-right">
                    {row.actual != null ? formatValue(row.actual) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.achievementPercent != null ? `${row.achievementPercent.toFixed(1)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.period}</td>
                  <td className="px-4 py-3">
                    {row.status ? <KpiStatusBadge status={row.status} /> : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.reportIncluded !== false ? (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <FileText className="h-3 w-3" /> 반영
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">미반영</span>
                    )}
                  </td>
                  <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
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
