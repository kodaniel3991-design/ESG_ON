"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { EsgSummaryCard } from "@/types";
import { MetricChangeBadge } from "@/components/common/metric-change-badge";
import {
  SummaryCardGrid,
  type SummaryCardGridProps,
} from "@/components/common/summary-card-grid";

interface EsgSummaryCardsProps {
  items: EsgSummaryCard[];
  isLoading?: boolean;
}

export function EsgSummaryCards({ items, isLoading }: EsgSummaryCardsProps) {
  const renderItem: SummaryCardGridProps<EsgSummaryCard>["renderItem"] = (
    item,
    index,
  ) => (
    <Card key={index} className="overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <p className="text-sm font-medium text-muted-foreground">
          {item.label}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xl font-semibold tracking-tight">
            {typeof item.value === "number"
              ? item.value.toLocaleString()
              : item.value}
            {item.unit ? ` ${item.unit}` : ""}
          </span>
          {item.changePercent != null && (
            <MetricChangeBadge value={item.changePercent} />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SummaryCardGrid items={items} isLoading={isLoading} renderItem={renderItem} />
  );
}
