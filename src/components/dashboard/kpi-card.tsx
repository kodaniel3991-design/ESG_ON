import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn, formatPercent } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  className?: string;
}

export function KpiCard({
  label,
  value,
  change,
  changeLabel,
  className,
}: KpiCardProps) {
  const isPositive = change != null && change < 0; // for emissions, down is good

  return (
    <Card className={cn("bg-card", className)}>
      <CardHeader className="pb-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl font-semibold tracking-tight">
            {value}
          </span>
          {change != null && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                isPositive ? "text-carbon-success" : "text-carbon-danger"
              )}
            >
              {isPositive ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5" />
              )}
              {formatPercent(change)}
              {changeLabel && (
                <span className="text-muted-foreground">{changeLabel}</span>
              )}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
