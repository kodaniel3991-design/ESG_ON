"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import type { OffsetSummary } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface OffsetDonutChartProps {
  data: OffsetSummary;
  isLoading?: boolean;
  fillHeight?: boolean;
}

export function OffsetDonutChart({ data, isLoading, fillHeight }: OffsetDonutChartProps) {
  const remaining = data.totalEmissionsT - data.offsetT;
  const cardClass = fillHeight
    ? "flex h-full min-h-0 flex-col overflow-hidden"
    : "flex flex-col overflow-hidden";
  const cardStyle = fillHeight ? undefined : { height: 300 };
  const chartData = [
    {
      name: "배출 총량",
      value: remaining,
      fill: "hsl(var(--carbon-success))",
    },
    {
      name: "OFFSET",
      value: data.offsetT,
      fill: "hsl(var(--carbon-warning))",
    },
  ];

  if (isLoading) {
    return (
      <Card className={cardClass} style={cardStyle ?? { height: 300 }}>
        <CardHeader className="p-4 pb-0">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="mx-auto h-36 w-36 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClass} style={cardStyle}>
      <CardHeader className="shrink-0 p-3 pb-0">
        <CardTitle className="text-sm font-medium">
          배출 총량 대비 상쇄 현황
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-3 pt-0">
        <div className="relative h-full min-h-[100px] w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={52}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend
                formatter={(value, entry) =>
                  value === "OFFSET"
                    ? `OFFSET (${data.offsetT} t)`
                    : `배출 총량 (${data.totalEmissionsT}t)`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
