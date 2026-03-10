"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ChartDataPoint } from "@/types";
import { ChartShell } from "@/components/common/chart-shell";

const CHART_COLORS = {
  scope1: "hsl(142 76% 36%)",
  scope2: "hsl(200 80% 45%)",
  scope3: "hsl(25 95% 53%)",
};

interface CarbonFootprintChartProps {
  data: ChartDataPoint[];
  totalLabel: string;
  isLoading?: boolean;
  fillHeight?: boolean;
}

export function CarbonFootprintChart({
  data,
  totalLabel,
  isLoading,
  fillHeight,
}: CarbonFootprintChartProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const title = `${totalLabel} — Scope 1-2-3 월별 추이`;

  const scope1Data = data.map((d) => ({ ...d, value: d.scope1 as number }));
  const scope2Data = data.map((d) => ({ ...d, value: d.scope2 as number }));
  const allData = data.map((d) => ({
    ...d,
    scope1: d.scope1,
    scope2: d.scope2,
    scope3: d.scope3,
  }));

  return (
    <ChartShell
      title={title}
      isLoading={isLoading}
      isEmpty={!data || data.length === 0}
      fillHeight={fillHeight}
      aria-label="Scope 1-3 월별 탄소 배출량 추이 라인 차트"
      actions={
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="h-7 w-fit">
            <TabsTrigger value="s1" className="text-xs">
              S1
            </TabsTrigger>
            <TabsTrigger value="s2" className="text-xs">
              S2
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs">
              전체
            </TabsTrigger>
          </TabsList>
          <TabsContent value="s1" className="mt-0" />
          <TabsContent value="s2" className="mt-0" />
          <TabsContent value="all" className="mt-0" />
        </Tabs>
      }
    >
      <div className="relative h-full min-h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === "s1" ? (
              <LineChart
                data={scope1Data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Scope 1"
                  stroke={CHART_COLORS.scope1}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            ) : activeTab === "s2" ? (
              <LineChart
                data={scope2Data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Scope 2"
                  stroke={CHART_COLORS.scope2}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            ) : (
              <LineChart
                data={allData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="scope1"
                  name="Scope 1"
                  stroke={CHART_COLORS.scope1}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="scope2"
                  name="Scope 2"
                  stroke={CHART_COLORS.scope2}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="scope3"
                  name="Scope 3"
                  stroke={CHART_COLORS.scope3}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </ChartShell>
  );
}
