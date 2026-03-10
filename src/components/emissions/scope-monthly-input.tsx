"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatNumber } from "@/lib/utils";

export interface ScopeCategoryConfig {
  id: string;
  label: string;
  /**
   * 배출계수 출처 또는 기준 (예: IPCC 2006, 국가 배출계수 DB 등)
   */
  factorSource?: string;
}

interface ScopeMonthlyInputProps {
  scopeLabel: string;
  categories: ScopeCategoryConfig[];
  unitLabel?: string;
  /**
   * 카테고리별 기본 배출계수 (예: 고정연소, 이동연소 등)
   */
  defaultFactors?: Record<string, number>;
}

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

export function ScopeMonthlyInput({
  scopeLabel,
  categories,
  unitLabel = "tCO₂e",
  defaultFactors,
}: ScopeMonthlyInputProps) {
  const [year, setYear] = useState("2024");
  const [selectedId, setSelectedId] = useState(categories[0]?.id ?? "");
  const [activity, setActivity] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, Array(12).fill(0)]))
  );
  const [factor, setFactor] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      categories.map((c) => [c.id, defaultFactors?.[c.id] ?? 1])
    )
  );
  const [saved, setSaved] = useState(false);

  const selected = categories.find((c) => c.id === selectedId);
  const activityValues = activity[selectedId] ?? Array(12).fill(0);
  const emissionFactor = factor[selectedId] ?? 1;
  const factorSource = selected?.factorSource;

  const emissions = activityValues.map((a) =>
    (Number.isNaN(a) ? 0 : a) * emissionFactor
  );
  const totalEmissions = emissions.reduce((sum, v) => sum + v, 0);

  const handleActivityChange = (monthIndex: number, raw: string) => {
    const v = raw === "" ? 0 : parseFloat(raw);
    setActivity((prev) => {
      const current = prev[selectedId] ?? Array(12).fill(0);
      const next = [...current];
      next[monthIndex] = Number.isNaN(v) ? 0 : v;
      return { ...prev, [selectedId]: next };
    });
    setSaved(false);
  };

  const handleFactorChange = (raw: string) => {
    const v = raw === "" ? 0 : parseFloat(raw);
    setFactor((prev) => ({
      ...prev,
      [selectedId]: Number.isNaN(v) ? 0 : v,
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (categories.length === 0) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <p className="mb-2 text-sm font-semibold text-muted-foreground">
          {scopeLabel} 카테고리
        </p>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedId(cat.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm",
                selectedId === cat.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/70"
              )}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">
              {selected?.label ?? "카테고리를 선택하세요"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              활동량을 입력하면 배출량({unitLabel})이 자동 산출됩니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1 text-sm">
              <label
                htmlFor="scope-year"
                className="mr-2 text-xs font-medium text-muted-foreground"
              >
                기간 (년)
              </label>
              <select
                id="scope-year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-9 w-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
            <div className="space-y-1 text-sm">
              <label
                htmlFor="scope-factor"
                className="mr-2 text-xs font-medium text-muted-foreground"
              >
                배출계수 ({unitLabel}/단위)
              </label>
              <input
                id="scope-factor"
                type="number"
                min={0}
                step="any"
                value={emissionFactor}
                onChange={(e) => handleFactorChange(e.target.value)}
                className="h-9 w-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-right text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {factorSource && (
                <p className="mt-1 max-w-xs text-[11px] leading-snug text-muted-foreground">
                  배출계수 출처: {factorSource}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                  <th className="w-24 px-2 py-3 text-left font-medium">구분</th>
                  {MONTH_LABELS.map((label) => (
                    <th
                      key={label}
                      className="w-20 px-2 py-3 text-right font-medium"
                    >
                      {label}
                    </th>
                  ))}
                  <th className="w-24 px-2 py-3 text-right font-medium">
                    합계
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-2 py-3 font-medium">활동량</td>
                  {MONTH_LABELS.map((_, idx) => (
                    <td key={idx} className="px-2 py-3 text-right">
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={activityValues[idx] ?? 0}
                        onChange={(e) =>
                          handleActivityChange(idx, e.target.value)
                        }
                        className="h-9 w-full min-w-[4rem] rounded-md border border-input bg-transparent px-2 py-2 text-right text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-3 text-right text-muted-foreground">
                    {formatNumber(
                      activityValues.reduce(
                        (s, v) => s + (Number.isNaN(v) ? 0 : v),
                        0
                      ),
                      4
                    )}
                  </td>
                </tr>
                <tr className="border-b border-border/50 font-medium">
                  <td className="px-2 py-3">배출량 ({unitLabel})</td>
                  {emissions.map((v, idx) => (
                    <td key={idx} className="px-2 py-3 text-right">
                      {formatNumber(v, 4)}
                    </td>
                  ))}
                  <td className="px-2 py-3 text-right">
                    {formatNumber(totalEmissions, 4)} {unitLabel}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave}>저장</Button>
            <span className="text-sm text-muted-foreground">
              {saved ? "저장되었습니다." : `${year}년 데이터입니다.`}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
