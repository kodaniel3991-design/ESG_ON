"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ValidationInsightsCard() {
  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          데이터 검증
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          AI 기반 이상 감지를 통해 입력 데이터를 검증하는 영역입니다. 현재는 예시
          메시지를 보여줍니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-3 text-xs text-foreground">
        <p className="font-medium">
          6월 데이터가 최근 3개월 평균 대비{" "}
          <span className="font-semibold text-amber-700">210% 높습니다.</span>
        </p>
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            가능성 있는 원인 가설
          </p>
          <ul className="ml-4 list-disc space-y-1 text-[11px] text-muted-foreground">
            <li>공급사 변경으로 인해 원단위가 상승</li>
            <li>입력 단위 또는 금액 입력 오류</li>
            <li>특정 프로젝트 발주 증가로 구매량 급증</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

