"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ChartDataPoint } from "@/types";

const SCOPE_COLORS = {
  scope1: "hsl(142 76% 36%)",
  scope2: "hsl(200 80% 45%)",
  scope3: "hsl(280 60% 50%)",
};

interface EmissionTrendChartProps {
  data: ChartDataPoint[];
  height?: number;
}

export function EmissionTrendChart({
  data,
  height = 320,
}: EmissionTrendChartProps) {
  if (!data?.length) return null;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          stackOffset="sign"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-border"
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            formatter={(value: number) => [`${value} tCO₂e`]}
          />
          <Legend />
          <Bar
            dataKey="scope1"
            name="Scope 1"
            fill={SCOPE_COLORS.scope1}
            stackId="a"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="scope2"
            name="Scope 2"
            fill={SCOPE_COLORS.scope2}
            stackId="a"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="scope3"
            name="Scope 3"
            fill={SCOPE_COLORS.scope3}
            stackId="a"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
