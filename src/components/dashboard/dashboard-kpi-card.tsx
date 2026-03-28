import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DashboardKpiItem, DashboardKpiStatus } from "@/types";
import { BarChart3 } from "lucide-react";
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
        "overflow-hidden border-border/80 transition-all hover:shadow-md hover:-translate-y-0.5",
        className
      )}
    >
      <CardContent className="p-4">
        {/* 상단: 아이콘 + 배지 */}
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-navy-50 text-navy-500">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-1.5">
            {status && (
              <Badge variant={status.variant} className="shrink-0 text-[10px]">
                {status.label}
              </Badge>
            )}
            {item.trendText && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  isTrendUp ? "bg-green-50 text-carbon-success" : "bg-destructive/10 text-carbon-danger"
                )}
              >
                {isTrendUp ? "↑" : "↓"} {item.trendText}
              </span>
            )}
          </div>
        </div>

        {/* 라벨 */}
        <p className="mt-3 line-clamp-1 text-xs font-medium text-muted-foreground">
          {item.label}
        </p>

        {/* 값 */}
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="font-display text-[28px] font-bold tracking-[-0.04em] text-foreground">
            {item.value}
          </span>
        </div>

        {/* 보조 텍스트 */}
        {item.subLabel && (
          <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
            {item.subLabel}
          </p>
        )}

        {/* 악센트 바 */}
        <div className="mt-3 h-1 w-full rounded-full bg-muted">
          <div className="h-full rounded-full bg-navy-500" style={{ width: "60%" }} />
        </div>
      </CardContent>
    </Card>
  );
}

export const DashboardKpiCard = memo(DashboardKpiCardComponent);
