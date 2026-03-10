"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialityMatrix(props: { points: { issueId: string; issueName: string; x: number; y: number }[]; isLoading?: boolean }) {
  const { points, isLoading } = props;
  if (isLoading) return <Card><CardContent className="p-4"><div className="h-64 animate-pulse rounded bg-muted" /></CardContent></Card>;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">중대성 매트릭스</CardTitle>
        <p className="text-sm text-muted-foreground">영향도 vs 이해관계자 중요도</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {points.map((p) => (
            <div key={p.issueId} className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
              <span className="font-medium">{p.issueName}</span>
              <span className="ml-2 text-muted-foreground">x={p.x.toFixed(1)} y={p.y.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
