"use client";

import { Button } from "@/components/ui/button";

interface ActionFooterProps {
  year: string;
}

export function ActionFooter({ year }: ActionFooterProps) {
  return (
    <div className="mt-6 flex flex-col items-stretch justify-between gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{year}년</span> 데이터는{" "}
        <span className="font-semibold text-amber-700">Draft</span> 상태입니다.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm">
          검증 요청
        </Button>
        <Button variant="secondary" size="sm">
          제출
        </Button>
        <Button
          size="sm"
          className="bg-emerald-600 text-emerald-50 hover:bg-emerald-700"
        >
          저장
        </Button>
      </div>
    </div>
  );
}

