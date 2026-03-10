"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CategoryEmission } from "@/types";
import { formatNumber } from "@/lib/utils";

interface ScopeDataInputFormProps {
  scopeLabel: string;
  categories: CategoryEmission[];
  unit?: string;
}

export function ScopeDataInputForm({
  scopeLabel,
  categories,
  unit = "tCO₂e",
}: ScopeDataInputFormProps) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    categories.reduce(
      (acc, c) => {
        acc[c.category] = c.value;
        return acc;
      },
      {} as Record<string, number>
    )
  );
  const [period, setPeriod] = useState("2024");
  const [saved, setSaved] = useState(false);

  const total = Object.values(values).reduce((sum, v) => sum + (Number.isNaN(v) ? 0 : v), 0);

  const handleChange = (category: string, raw: string) => {
    const v = raw === "" ? 0 : parseFloat(raw);
    setValues((prev) => ({ ...prev, [category]: Number.isNaN(v) ? 0 : v }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{scopeLabel} 배출량 입력</CardTitle>
        <p className="text-sm text-muted-foreground">
          카테고리별 배출량을 입력한 뒤 저장하세요.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-2">
            <label
              htmlFor="period"
              className="text-sm font-medium leading-none"
            >
              기간 (년)
            </label>
            <select
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-9 w-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">카테고리</th>
                <th className="px-4 py-3 font-medium w-[180px] text-right">
                  배출량 ({unit})
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((row) => (
                <tr
                  key={row.category}
                  className="border-b border-border/50 hover:bg-muted/20"
                >
                  <td className="px-4 py-3 font-medium">{row.category}</td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={values[row.category] ?? row.value}
                      onChange={(e) =>
                        handleChange(row.category, e.target.value)
                      }
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-right text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30 font-medium">
                <td className="px-4 py-3">합계</td>
                <td className="px-4 py-3 text-right">
                  {formatNumber(total)} {unit}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>저장</Button>
          {saved && (
            <span className="text-sm text-carbon-success">저장되었습니다.</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
