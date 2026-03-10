"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SummaryCardGridProps<T> {
  items: T[];
  isLoading?: boolean;
  skeletonCount?: number;
  className?: string;
  skeletonClassName?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export function SummaryCardGrid<T>({
  items,
  isLoading,
  skeletonCount = 3,
  className,
  skeletonClassName,
  renderItem,
}: SummaryCardGridProps<T>) {
  const gridClassName = cn("grid gap-4 sm:grid-cols-3", className);
  const skeletonGridClassName = cn(
    "grid gap-4 sm:grid-cols-3",
    skeletonClassName ?? className,
  );

  if (isLoading) {
    return (
      <div className={skeletonGridClassName}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4 pb-0">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={gridClassName}>
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
}
