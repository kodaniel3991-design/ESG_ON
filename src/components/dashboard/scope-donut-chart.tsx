"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface DonutItem {
  name: string;
  value: number;
  tCO2e: number;
  fill: string;
}

interface ScopeDonutChartProps {
  data: DonutItem[];
  totalLabel: string;
  isLoading?: boolean;
  fillHeight?: boolean;
}

const cardClassBase = "flex flex-col overflow-hidden";
const cardClassFill = "flex h-full min-h-0 flex-col overflow-hidden";

export function ScopeDonutChart({
  data,
  totalLabel,
  isLoading,
  fillHeight,
}: ScopeDonutChartProps) {
  const cardClass = fillHeight ? cardClassFill : cardClassBase;
  const cardStyle = fillHeight ? undefined : { height: 300 };

  if (isLoading) {
    return (
      <Card className={cardClass} style={cardStyle ?? { height: 300 }}>
        <CardHeader className="p-4 pb-0">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="mx-auto h-36 w-36 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={cardClass} style={cardStyle ?? { height: 300 }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-0">
          <CardTitle className="text-sm font-medium">Scope 별 비율</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            데이터가 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClass} style={cardStyle}>
      <CardHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 p-3 pb-0">
        <CardTitle className="text-sm font-medium">Scope 별 비율</CardTitle>
        <Link
          href="/analytics"
          className="text-xs font-medium text-primary hover:underline"
        >
          전체보기 &gt;
        </Link>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-3 pt-0">
        <div className="relative h-full min-h-[100px] w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={52}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name} ${value}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                formatter={(value: number, name: string, props: unknown) => {
                  const payload = (props as { payload?: DonutItem })?.payload;
                  return [`${value}% · ${payload?.tCO2e ?? 0} tCO₂e`, name];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="shrink-0 text-center text-xs text-muted-foreground">
          총 {totalLabel}
        </p>
      </CardContent>
    </Card>
  );
}
