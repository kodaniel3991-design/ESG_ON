"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface EsgScoreIndicatorProps {
  score: number | null;
  className?: string;
  showBar?: boolean;
}

/** ESG 점수 표시 - 숫자 + progress bar, 미평가 시 — */
export function EsgScoreIndicator({
  score,
  className,
  showBar = true,
}: EsgScoreIndicatorProps) {
  if (score == null) {
    return (
      <span className={cn("text-muted-foreground tabular-nums", className)}>
        —
      </span>
    );
  }

  const color =
    score >= 80
      ? "text-carbon-success dark:text-carbon-success"
      : score >= 60
        ? "text-carbon-warning dark:text-carbon-warning"
        : "text-carbon-danger";

  return (
    <div className={cn("flex items-center gap-2 min-w-[80px]", className)}>
      <span className={cn("tabular-nums font-medium", color)}>{score}점</span>
      {showBar && (
        <Progress
          value={score}
          className="h-1.5 w-12 flex-shrink-0 [&>div]:transition-all"
        />
      )}
    </div>
  );
}
