"use client";

import { cn } from "@/lib/utils";
import type { ValidationStatus } from "@/types/validation-data";

const STATUS_CONFIG: Record<
  ValidationStatus,
  { label: string; className: string }
> = {
  submitted: {
    label: "Submitted",
    className: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
  },
  under_review: {
    label: "Under Review",
    className: "bg-taupe-50/15 text-carbon-warning dark:text-carbon-warning border-border/30",
  },
  verified: {
    label: "Verified",
    className: "bg-green-500/15 text-green-700 dark:text-carbon-success border-green-500/30",
  },
  missing: {
    label: "Missing",
    className: "bg-carbon-danger/15 text-red-700 border-red-500/30",
  },
  needs_evidence: {
    label: "Needs Evidence",
    className: "bg-taupe-50/15 text-carbon-warning dark:text-carbon-warning border-border/30",
  },
  ai_anomaly: {
    label: "AI Anomaly",
    className: "bg-primary/10 text-primary border-primary/30",
  },
};

interface ValidationStatusBadgeProps {
  status: ValidationStatus;
  className?: string;
}

/** 검증 상태 배지 */
export function ValidationStatusBadge({ status, className }: ValidationStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
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
