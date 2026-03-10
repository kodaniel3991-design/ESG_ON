import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DashboardKpiItem, DashboardKpiStatus } from "@/types";
import { TrendingDown, TrendingUp } from "lucide-react";
import { memo } from "react";

const statusConfig: Record<
  DashboardKpiStatus,
  { label: string; variant: "success" | "warning" | "danger" }
> = {
  on_track: { label: "목표 달성 중", variant: "success" },
  attention: { label: "관리 필요", variant: "warning" },
  anomaly: { label: "이상치 감지", variant: "danger" },
};

interface DashboardKpiCardProps {
  item: DashboardKpiItem;
  className?: string;
}

function DashboardKpiCardComponent({ item, className }: DashboardKpiCardProps) {
  const status = item.status ? statusConfig[item.status] : null;
  const isTrendUp = item.trendDirection === "up";

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden bg-card box-border",
        className
      )}
      style={{ height: "7rem", minHeight: "7rem", maxHeight: "7rem" }}
    >
      <CardHeader className="shrink-0 p-3 pb-0">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-1 text-xs font-medium text-muted-foreground">
            {item.label}
          </p>
          {status && (
            <Badge variant={status.variant} className="shrink-0 text-xs">
              {status.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 pt-1">
        <div className="flex min-h-0 flex-col gap-0.5 overflow-hidden">
          <span className="truncate text-xl font-semibold tracking-tight">
            {item.value}
          </span>
          {item.subLabel && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {item.subLabel}
            </p>
          )}
          <div
            className={cn(
              "flex shrink-0 items-center gap-1 text-xs font-medium",
              isTrendUp ? "text-carbon-success" : "text-carbon-danger"
            )}
          >
            {isTrendUp ? (
              <TrendingUp className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="truncate">{item.trendText}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const DashboardKpiCard = memo(DashboardKpiCardComponent);
