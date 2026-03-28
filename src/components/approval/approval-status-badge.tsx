"use client";

import { cn } from "@/lib/utils";
import type { ApprovalStatus } from "@/types/approval-data";

const STATUS_CONFIG: Record<
  ApprovalStatus,
  { label: string; className: string }
> = {
  pending_approval: {
    label: "Pending Approval",
    className: "bg-taupe-50/15 text-carbon-warning dark:text-carbon-warning border-border/30",
  },
  approved: {
    label: "Approved",
    className: "bg-green-500/15 text-green-700 dark:text-carbon-success border-green-500/30",
  },
  rejected: {
    label: "Rejected",
    className: "bg-carbon-danger/15 text-red-700 border-red-500/30",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-carbon-success/15 text-carbon-success dark:text-carbon-success border-border/30",
  },
  reopened: {
    label: "Reopened",
    className: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
  },
};

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
  className?: string;
}

/** 승인 상태 배지 */
export function ApprovalStatusBadge({ status, className }: ApprovalStatusBadgeProps) {
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
