"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChartShellProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  fillHeight?: boolean;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  emptyMessage?: string;
  "aria-label"?: string;
}

export function ChartShell({
  title,
  subtitle,
  isLoading,
  isEmpty,
  fillHeight,
  actions,
  children,
  emptyMessage = "데이터가 없습니다.",
  "aria-label": ariaLabel,
}: ChartShellProps) {
  const cardClass = cn(
    "flex flex-col overflow-hidden",
    fillHeight && "h-full min-h-0",
  );
  const cardStyle = fillHeight ? undefined : { height: 300 };

  if (isLoading) {
    return (
      <Card className={cardClass} style={cardStyle}>
        <CardHeader className="p-4 pb-0">
          <Skeleton className="h-5 w-40" />
          {subtitle && <Skeleton className="mt-2 h-4 w-32" />}
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="h-44 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card className={cardClass} style={cardStyle}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-0">
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {actions}
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cardClass}
      style={cardStyle}
      role="img"
      aria-label={ariaLabel ?? title}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-0">
        {title ? (
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        ) : null}
        {actions}
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-4 pt-2">
        {children}
      </CardContent>
    </Card>
  );
}

