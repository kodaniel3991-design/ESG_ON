"use client";

import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/types";
import { cn } from "@/lib/utils";

const LABEL: Record<RiskLevel, string> = {
  low: "낮음",
  medium: "중간",
  high: "높음",
  critical: "심각",
};

const VARIANT: Record<RiskLevel, "success" | "warning" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "danger",
  critical: "danger",
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <Badge variant={VARIANT[level]} className={cn(className)}>
      {LABEL[level]}
    </Badge>
  );
}
