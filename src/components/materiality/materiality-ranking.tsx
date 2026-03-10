"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MaterialityIssueRanking, MaterialityEsgDimension } from "@/types";

const DIM: Record<MaterialityEsgDimension, string> = { environment: "환경", social: "사회", governance: "거버넌스" };

interface MaterialityRankingProps {
  items: MaterialityIssueRanking[];
  isLoading?: boolean;
}

export function MaterialityRanking({ items, isLoading }: MaterialityRankingProps) {
  if (isLoading) return <Card><CardContent className="p-4"><div className="h-32 animate-pulse rounded bg-muted" /></CardContent></Card>;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">핵심 이슈 랭킹</CardTitle>
        <p className="text-sm text-muted-foreground">종합 점수 기준 우선순위</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((r) => (
            <li key={r.issueId} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{r.rank}</span>
                <span className="font-medium">{r.issueName}</span>
                <Badge variant="secondary" className="text-xs">{DIM[r.dimension]}</Badge>
              </span>
              <span className="text-muted-foreground">종합 {r.compositeScore.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
