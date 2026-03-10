"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DashboardNotification } from "@/types";
import { FileText, Building2, CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap = {
  report: FileText,
  data: Building2,
  system: CheckCircle2,
};

interface NotificationsCardProps {
  items: DashboardNotification[];
  isLoading?: boolean;
  fillHeight?: boolean;
}

export function NotificationsCard({
  items,
  isLoading,
  fillHeight,
}: NotificationsCardProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = items.filter((n) => !dismissed.has(n.id));
  const cardClass = fillHeight
    ? "flex h-full min-h-0 flex-col overflow-hidden"
    : "overflow-hidden";

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  if (isLoading) {
    return (
      <Card className={cardClass}>
        <CardHeader className="shrink-0 p-3 pb-0">
          <Skeleton className="h-5 w-16" />
        </CardHeader>
        <CardContent className="p-3">
          <Skeleton className="h-24 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClass}>
      <CardHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 p-3 pb-1">
        <CardTitle className="text-sm font-medium">알림</CardTitle>
        <Link
          href="#"
          className="text-xs font-medium text-primary hover:underline"
        >
          View all &gt;
        </Link>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-auto p-3 pt-0">
        <ul className="space-y-2">
          {visible.map((item) => {
            const Icon = iconMap[item.type];
            return (
              <li
                key={item.id}
                className="flex gap-2 rounded-md border border-border bg-muted/20 p-2"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                  <Icon className="h-3 w-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{item.body}</p>
                  <p className="mt-0.5 text-xs font-medium text-foreground">
                    {item.title}
                  </p>
                  {item.timestamp && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {item.timestamp}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    {item.actionLabel && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        asChild={!!item.actionHref}
                      >
                        {item.actionHref ? (
                          <Link href={item.actionHref}>
                            {item.actionLabel}
                          </Link>
                        ) : (
                          <span>{item.actionLabel}</span>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                {item.dismissible && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => handleDismiss(item.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
