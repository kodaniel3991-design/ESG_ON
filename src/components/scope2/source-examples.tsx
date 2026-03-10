"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SCOPE2_SOURCE_EXAMPLES } from "@/lib/scope2-mock-data";
import type { Scope2CategoryId } from "@/types/scope2";

interface Scope2SourceExamplesProps {
  activeCategoryId: Scope2CategoryId;
}

function getScope2Description(id: Scope2CategoryId): string {
  switch (id) {
    case "electricity":
      return "사무실, 공장, 창고, 데이터센터 등에서 구매한 전력 사용처 예시입니다.";
    case "heat":
      return "지역난방, 증기·온수 공급 등 외부에서 공급받는 열 에너지 사용처 예시입니다.";
    default:
      return "";
  }
}

export function Scope2SourceExamples({
  activeCategoryId,
}: Scope2SourceExamplesProps) {
  const examples = SCOPE2_SOURCE_EXAMPLES[activeCategoryId];
  const description = getScope2Description(activeCategoryId);

  return (
    <Card className="border-border/60 bg-card/80">
      <CardContent className="py-3 text-xs">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-medium text-foreground">예시 사용처</span>
          <span className="text-[11px] text-muted-foreground">
            카테고리별 대표 예시
          </span>
        </div>
        {description && (
          <p className="mb-2 text-[11px] text-muted-foreground">
            {description}
          </p>
        )}
        <ul className="ml-4 list-disc space-y-0.5 text-[11px] text-muted-foreground">
          {examples.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

