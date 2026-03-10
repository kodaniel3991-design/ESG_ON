"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SCOPE1_SOURCE_EXAMPLES } from "@/lib/scope1-mock-data";
import type { ScopeCategoryId } from "@/types/scope1";

interface SourceExamplesProps {
  activeCategoryId: ScopeCategoryId;
}

function getCategoryDescription(id: ScopeCategoryId): string {
  switch (id) {
    case "fixed":
      return "보일러, 발전기 등 사업장 내에서 고정된 위치에서 연료를 연소해 발생하는 직접 배출원 예시입니다.";
    case "mobile":
      return "사내 차량, 지게차 등 이동 수단에서 연료를 사용해 발생하는 직접 배출원 예시입니다.";
    case "fugitive":
      return "공정·화학 반응·냉매 누설 등 설비에서 비의도적으로 누출되는 배출원 예시입니다.";
    default:
      return "";
  }
}

export function SourceExamples({ activeCategoryId }: SourceExamplesProps) {
  const examples = SCOPE1_SOURCE_EXAMPLES[activeCategoryId];
  const description = getCategoryDescription(activeCategoryId);

  return (
    <Card className="border-border/60 bg-card/80">
      <CardContent className="py-3 text-xs">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-medium text-foreground">예시 배출원</span>
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

