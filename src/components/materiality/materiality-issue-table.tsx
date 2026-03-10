"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal } from "lucide-react";
import type { MaterialityIssue, MaterialityEsgDimension } from "@/types";

const DIM: Record<MaterialityEsgDimension, string> = { environment: "환경", social: "사회", governance: "거버넌스" };
const KPI_STATUS: Record<string, string> = { none: "미연결", partial: "일부", full: "연결" };

interface MaterialityIssueTableProps {
  data: MaterialityIssue[];
  isLoading?: boolean;
  onRowClick?: (row: MaterialityIssue) => void;
  dimensionFilter?: MaterialityEsgDimension | "all";
  onDimensionFilterChange?: (v: MaterialityEsgDimension | "all") => void;
}

export function MaterialityIssueTable({ data, isLoading, onRowClick, dimensionFilter = "all", onDimensionFilterChange }: MaterialityIssueTableProps) {
  const filtered = useMemo(() => (dimensionFilter === "all" ? data : data.filter((r) => r.dimension === dimensionFilter)), [data, dimensionFilter]);

  if (isLoading) return <Card><CardHeader><CardTitle className="text-base">ESG 이슈</CardTitle></CardHeader><CardContent><Skeleton className="h-48 w-full rounded-lg" /></CardContent></Card>;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base">ESG 이슈</CardTitle>
          <p className="text-sm text-muted-foreground">전문가·벤치마크·KPI 연결 상태</p>
        </div>
        {onDimensionFilterChange && (
          <div className="flex gap-1">
            {(["all", "environment", "social", "governance"] as const).map((d) => (
              <button key={d} type="button" onClick={() => onDimensionFilterChange(d)} className={`rounded-md px-2.5 py-1 text-xs font-medium ${dimensionFilter === d ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {d === "all" ? "전체" : DIM[d]}
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">이슈</th>
                <th className="px-4 py-3 font-medium">영역</th>
                <th className="px-4 py-3 font-medium text-center">전문가</th>
                <th className="px-4 py-3 font-medium text-center">벤치마크</th>
                <th className="px-4 py-3 font-medium">KPI 연결</th>
                <th className="px-4 py-3 font-medium">보고서</th>
                <th className="w-10 px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className={`border-b border-border/50 ${onRowClick ? "cursor-pointer hover:bg-muted/30" : ""}`} onClick={() => onRowClick?.(row)}>
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{DIM[row.dimension]}</Badge></td>
                  <td className="px-4 py-3 text-center">{row.expertScore}</td>
                  <td className="px-4 py-3 text-center">{row.benchmarkScore}</td>
                  <td className="px-4 py-3">{KPI_STATUS[row.kpiConnectionStatus]} ({row.kpiLinkedCount})</td>
                  <td className="px-4 py-3">{row.reportLinkedCount}건</td>
                  <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
