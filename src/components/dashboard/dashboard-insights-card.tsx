"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardInsightItem } from "@/types";
import { AlertCircle, Sun, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap = {
  anomaly: AlertCircle,
  recommendation: Sun,
  report: FileText,
};

const iconColorMap = {
  anomaly: "text-carbon-danger",
  recommendation: "text-amber-500",
  report: "text-carbon-success",
};

interface DashboardInsightsCardProps {
  items: DashboardInsightItem[];
  isLoading?: boolean;
  fillHeight?: boolean;
}

export function DashboardInsightsCard({
  items,
  isLoading,
  fillHeight,
}: DashboardInsightsCardProps) {
  const cardClass = fillHeight
    ? "flex h-full min-h-0 flex-col overflow-hidden"
    : "overflow-hidden";

  if (isLoading) {
    return (
      <Card className={cardClass}>
        <CardHeader className="shrink-0 p-3 pb-0">
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent className="p-3">
          <Skeleton className="h-24 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClass}>
      <CardHeader className="shrink-0 p-3 pb-0">
        <CardTitle className="text-sm font-medium">
          이상치 감지·감축 추천
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-auto p-3 pt-0">
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = iconMap[item.type as keyof typeof iconMap] ?? AlertCircle;
            const colorClass = iconColorMap[item.type as keyof typeof iconColorMap] ?? "text-muted-foreground";
            return (
              <li
                key={item.id}
                className="flex gap-2 rounded-md border border-border bg-muted/20 p-2"
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted ${colorClass}`}
                >
                  <Icon className="h-3 w-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {item.detail}
                  </p>
                  <Link
                    href={item.actionHref ?? "#"}
                    className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                  >
                    {item.actionLabel} &gt;
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
