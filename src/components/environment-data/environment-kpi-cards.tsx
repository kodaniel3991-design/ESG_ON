"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatChangePercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EnvironmentKpiItem } from "@/types/environment-data";
import {
  Factory,
  Flame,
  Zap,
  Truck,
  Sun,
  Recycle,
  type LucideIcon,
} from "lucide-react";

/* ── 카드별 아이콘 · 악센트 바 색상 매핑 ── */
const CARD_META: Record<
  string,
  { icon: LucideIcon; accent: string; iconBg: string }
> = {
  "ghg-total": {
    icon: Factory,
    accent: "bg-navy-500",
    iconBg: "bg-navy-50 text-navy-500",
  },
  scope1: {
    icon: Flame,
    accent: "bg-navy-400",
    iconBg: "bg-navy-50 text-navy-400",
  },
  scope2: {
    icon: Zap,
    accent: "bg-carbon-success",
    iconBg: "bg-green-50 text-carbon-success",
  },
  scope3: {
    icon: Truck,
    accent: "bg-navy-300",
    iconBg: "bg-navy-50 text-navy-300",
  },
  renewable: {
    icon: Sun,
    accent: "bg-carbon-success",
    iconBg: "bg-green-50 text-carbon-success",
  },
  "waste-recycle": {
    icon: Recycle,
    accent: "bg-carbon-warning",
    iconBg: "bg-green-50 text-carbon-warning",
  },
};

const DEFAULT_META = {
  icon: Factory,
  accent: "bg-navy-500",
  iconBg: "bg-navy-50 text-navy-500",
};

interface EnvironmentKpiCardsProps {
  items: EnvironmentKpiItem[];
}

/** KPI 요약 카드 6개: 총 GHG, Scope 1·2·3, 재생에너지 비율, 폐기물 재활용률 */
export function EnvironmentKpiCards({ items }: EnvironmentKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => {
        const meta = CARD_META[item.id] ?? DEFAULT_META;
        const Icon = meta.icon;

        return (
          <Card
            key={item.id}
            className="overflow-hidden border-border/80 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <CardContent className="p-4">
              {/* 상단: 아이콘 + 변화율 배지 */}
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-[10px]",
                    meta.iconBg
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                {item.changePercent != null && (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      item.changePercent > 0
                        ? "bg-green-50 text-carbon-success"
                        : item.changePercent < 0
                          ? "bg-destructive/10 text-carbon-danger"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.changePercent > 0
                      ? "↑"
                      : item.changePercent < 0
                        ? "↓"
                        : "—"}{" "}
                    {formatChangePercent(item.changePercent)}
                  </span>
                )}
              </div>

              {/* 라벨 */}
              <p className="mt-3 text-xs font-medium text-muted-foreground">
                {item.label}
              </p>

              {/* 값 */}
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-display text-[28px] font-bold tracking-[-0.04em] text-foreground">
                  {typeof item.value === "number"
                    ? item.value.toLocaleString("ko-KR")
                    : item.value}
                </span>
                {item.unit && (
                  <span className="text-sm font-medium text-muted-foreground">
                    {item.unit}
                  </span>
                )}
              </div>

              {/* 악센트 바 */}
              <div className="mt-3 h-1 w-full rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", meta.accent)}
                  style={{ width: "60%" }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
