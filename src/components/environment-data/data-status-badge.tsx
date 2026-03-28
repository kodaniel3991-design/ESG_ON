"use client";

import { cn } from "@/lib/utils";
import type { DataStatus } from "@/types/environment-data";

const STATUS_CONFIG: Record<
  DataStatus,
  { label: string; className: string }
> = {
  verified: {
    label: "Verified",
    className: "bg-green-500/15 text-green-700 dark:text-carbon-success border-green-500/30",
  },
  estimated: {
    label: "Estimated",
    className: "bg-taupe-50/15 text-carbon-warning dark:text-carbon-warning border-border/30",
  },
  pending: {
    label: "Pending",
    className: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
  },
  missing: {
    label: "Missing",
    className: "bg-carbon-danger/15 text-red-700 border-red-500/30",
  },
  ai_anomaly: {
    label: "AI anomaly",
    className: "bg-primary/10 text-primary border-primary/30",
  },
};

interface DataStatusBadgeProps {
  status: DataStatus;
  className?: string;
}

/** 데이터 상태 배지 (Verified / Estimated / Pending / Missing / AI anomaly) */
export function DataStatusBadge({ status, className }: DataStatusBadgeProps) {
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
