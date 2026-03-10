"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReductionProject } from "@/types";

export function ReductionProjectTable({
  data,
  isLoading,
}: {
  data: ReductionProject[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base">감축 프로젝트</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="h-48 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-base">감축 프로젝트</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">프로젝트명</th>
                <th className="px-4 py-3 font-medium">담당자</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium text-right">
                  예상 감축량
                </th>
                <th className="px-4 py-3 font-medium text-right">
                  실제 감축량
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.owner}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{row.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.expectedReductionMt.toFixed(1)} MtCO₂e
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.actualReductionMt != null
                      ? `${row.actualReductionMt.toFixed(1)} MtCO₂e`
                      : "—"}
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

