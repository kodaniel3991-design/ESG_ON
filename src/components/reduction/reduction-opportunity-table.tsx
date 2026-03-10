"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReductionOpportunity } from "@/types";

const CATEGORY_LABEL: Record<ReductionOpportunity["category"], string> = {
  energy: "에너지",
  process: "공정",
  fleet: "차량",
  supply_chain: "공급망",
};

export function ReductionOpportunityTable({
  data,
  isLoading,
}: {
  data: ReductionOpportunity[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base">감축 기회</CardTitle>
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
        <CardTitle className="text-base">감축 기회</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">기회명</th>
                <th className="px-4 py-3 font-medium">카테고리</th>
                <th className="px-4 py-3 font-medium text-right">예상 감축량</th>
                <th className="px-4 py-3 font-medium text-right">비용</th>
                <th className="px-4 py-3 font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {CATEGORY_LABEL[row.category]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.estimatedReductionMt.toFixed(1)} MtCO₂e
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.estimatedCostM.toFixed(1)} M
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {row.status}
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

