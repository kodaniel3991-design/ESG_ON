"use client";

import { cn } from "@/lib/utils";
import type { AiVerificationResult } from "@/types/validation-data";

const AI_CONFIG: Record<
  AiVerificationResult,
  { label: string; className: string }
> = {
  normal: {
    label: "정상",
    className: "bg-green-500/15 text-green-700 dark:text-carbon-success border-green-500/30",
  },
  anomaly: {
    label: "이상치",
    className: "bg-primary/10 text-primary border-primary/30",
  },
  missing_risk: {
    label: "누락 가능성",
    className: "bg-taupe-50/15 text-carbon-warning dark:text-carbon-warning border-border/30",
  },
};

interface ValidationAiBadgeProps {
  result: AiVerificationResult;
  className?: string;
}

/** AI 검증 결과 배지 */
export function ValidationAiBadge({ result, className }: ValidationAiBadgeProps) {
  const config = AI_CONFIG[result] ?? {
    label: result,
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
