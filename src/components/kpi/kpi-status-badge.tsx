"use client";

import { Badge } from "@/components/ui/badge";
import type { KpiStatus } from "@/types";
import { cn } from "@/lib/utils";

const LABEL: Record<KpiStatus, string> = { on_track: "정상", attention: "주의", anomaly: "이상" };
const VARIANT: Record<KpiStatus, "success" | "warning" | "danger"> = { on_track: "success", attention: "warning", anomaly: "danger" };

export function KpiStatusBadge({ status, className }: { status: KpiStatus; className?: string }) {
  return <Badge variant={VARIANT[status]} className={cn("text-xs", className)}>{LABEL[status]}</Badge>;
}
