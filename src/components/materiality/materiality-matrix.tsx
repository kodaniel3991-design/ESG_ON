"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MatrixPoint {
  issueId: string;
  issueName: string;
  dimension?: string;
  x: number; // 영향 중대성
  y: number; // 재무 중대성
}

const DIM_DOT: Record<string, string> = {
  environment: "bg-green-500",
  social: "bg-blue-500",
  governance: "bg-amber-500",
};

export function MaterialityMatrix({ points, isLoading }: { points: MatrixPoint[]; isLoading?: boolean }) {
  if (isLoading) return <Card><CardContent className="p-4"><div className="h-80 animate-pulse rounded bg-muted" /></CardContent></Card>;

  // 매트릭스 영역: 1~5 범위를 0~100% 좌표로 변환
  const toX = (v: number) => ((v - 1) / 4) * 100;
  const toY = (v: number) => 100 - ((v - 1) / 4) * 100; // Y축 반전 (위가 5)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">이중 중대성 매트릭스</CardTitle>
        <p className="text-xs text-muted-foreground">X: 영향 중대성 (환경·사회 영향) &nbsp;|&nbsp; Y: 재무 중대성 (기업 리스크/기회)</p>
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            이슈 평가를 완료하면 매트릭스가 표시됩니다.
          </div>
        ) : (
          <div className="relative">
            {/* 매트릭스 영역 */}
            <div className="relative aspect-square w-full max-w-md mx-auto border border-border rounded-lg overflow-hidden bg-background">
              {/* 4분면 배경 */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                <div className="bg-muted/20 border-r border-b border-border/30" /> {/* 좌상: 재무 중대 */}
                <div className="bg-destructive/[0.06] border-b border-border/30" /> {/* 우상: 이중 중대 */}
                <div className="bg-muted/10 border-r border-border/30" /> {/* 좌하: 비중대 */}
                <div className="bg-primary/[0.04] border-border/30" /> {/* 우하: 영향 중대 */}
              </div>

              {/* 4분면 레이블 */}
              <span className="absolute left-2 top-2 text-[10px] font-medium text-muted-foreground/60">재무 중대</span>
              <span className="absolute right-2 top-2 text-[10px] font-bold text-destructive/60">이중 중대 (핵심)</span>
              <span className="absolute left-2 bottom-2 text-[10px] text-muted-foreground/40">비중대</span>
              <span className="absolute right-2 bottom-2 text-[10px] font-medium text-primary/60">영향 중대</span>

              {/* 중심선 */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/50" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-border/50" />

              {/* 데이터 포인트 */}
              {points.map((p) => (
                <div
                  key={p.issueId}
                  className="absolute group"
                  style={{
                    left: `${toX(p.x)}%`,
                    top: `${toY(p.y)}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className={cn(
                    "h-3.5 w-3.5 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-150",
                    DIM_DOT[p.dimension ?? "environment"] ?? "bg-gray-400"
                  )} />
                  <div className="absolute left-1/2 -translate-x-1/2 top-5 hidden group-hover:block z-10 whitespace-nowrap rounded bg-foreground px-2 py-1 text-[10px] text-background shadow-lg">
                    {p.issueName} (영향 {p.x.toFixed(1)}, 재무 {p.y.toFixed(1)})
                  </div>
                </div>
              ))}
            </div>

            {/* 축 레이블 */}
            <div className="mt-2 text-center text-xs text-muted-foreground">→ 영향 중대성 (Impact)</div>
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground whitespace-nowrap">↑ 재무 중대성 (Financial)</div>

            {/* 범례 */}
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /> 환경</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> 사회</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> 거버넌스</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
