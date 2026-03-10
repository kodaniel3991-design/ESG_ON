"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatNumber } from "@/lib/utils";
import { Scope3CommutingInput } from "./scope3-commuting-input";

type Scope3Group = "upstream" | "downstream";

export interface Scope3CategoryConfig {
  id: string;
  label: string;
  group: Scope3Group;
  /**
   * 배출계수 출처 또는 기준 (예: IPCC, 국가 배출계수 DB 등)
   */
  factorSource?: string;
}

const COMMUTING_CATEGORY_ID = "u7";

interface Scope3MonthlyInputProps {
  categories: Scope3CategoryConfig[];
}

const MONTH_LABELS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

export function Scope3MonthlyInput({ categories }: Scope3MonthlyInputProps) {
  const [year, setYear] = useState("2024");
  const [selectedId, setSelectedId] = useState(
    categories[0]?.id ?? ""
  );
  const [activity, setActivity] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(
      categories.map((c) => [c.id, Array(12).fill(0)])
    )
  );
  const [factor, setFactor] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      categories.map((c) => [c.id, c.id === COMMUTING_CATEGORY_ID ? 0.01 : 1])
    )
  );
  const [saved, setSaved] = useState(false);

  const grouped = useMemo(
    () => ({
      upstream: categories.filter((c) => c.group === "upstream"),
      downstream: categories.filter((c) => c.group === "downstream"),
    }),
    [categories]
  );

  const selected = categories.find((c) => c.id === selectedId);
  const isGoodsCategory = selected?.label === "구입상품 및 서비스";
  const isCommuting = selectedId === COMMUTING_CATEGORY_ID;
  const activityValues = activity[selectedId] ?? Array(12).fill(0);
  const emissionFactor = factor[selectedId] ?? (isCommuting ? 0.01 : 1);
  const factorSource = selected?.factorSource;

  const emissions = useMemo(
    () =>
      activityValues.map((a) => (Number.isNaN(a) ? 0 : a) * emissionFactor),
    [activityValues, emissionFactor]
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

  const handleCommutingFactorChange = (v: number) => {
    setFactor((prev) => ({ ...prev, [COMMUTING_CATEGORY_ID]: v }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <p className="mb-2 text-sm font-semibold text-muted-foreground">
          Scope 3 카테고리
        </p>
        <div className="space-y-3 text-sm">
          <div>
            <p className="mb-1 font-semibold text-muted-foreground">
              업스트림
            </p>
            <div className="space-y-1">
              {grouped.upstream.map((cat) => {
                const isActive = selectedId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedId(cat.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-muted/70"
                    )}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-1 mt-2 font-semibold text-muted-foreground">
              다운스트림
            </p>
            <div className="space-y-1">
              {grouped.downstream.map((cat) => {
                const isActive = selectedId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedId(cat.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-muted/70"
                    )}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {isCommuting ? (
        <Scope3CommutingInput
          year={year}
          onYearChange={setYear}
          factor={emissionFactor}
          onFactorChange={handleCommutingFactorChange}
        />
      ) : (
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">
              {isGoodsCategory
                ? "월별 사용량 입력"
                : selected?.label ?? "카테고리를 선택하세요"}
            </CardTitle>
            {isGoodsCategory ? (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <p>
                  선택된 카테고리 기준으로 사용량과 배출량을 관리합니다.
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">연도</span>
                  <select
                    id="scope3-year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="h-8 w-[110px] rounded-md border border-input bg-transparent px-3 py-1 text-xs"
                  >
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    데이터 상태
                  </span>
                  <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                    Draft
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                활동량을 입력하면 배출량(tCO₂e)이 자동 산출됩니다.
              </p>
            )}
          </div>
          <div className="space-y-1 text-sm">
            <label
              htmlFor="scope3-factor"
              className="mr-2 text-xs font-medium text-muted-foreground"
            >
              배출계수 (tCO₂e/단위)
            </label>
            <input
              id="scope3-factor"
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
                  <td className="px-2 py-3 font-medium">
                    {isGoodsCategory ? "사용량" : "활동량"}
                  </td>
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
                  <td className="px-2 py-3">배출량 (tCO₂e)</td>
                  {emissions.map((v, idx) => (
                    <td key={idx} className="px-2 py-3 text-right">
                      {formatNumber(v, 4)}
                    </td>
                  ))}
                  <td className="px-2 py-3 text-right">
                    {formatNumber(totalEmissions, 4)} tCO₂e
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave}>저장</Button>
            <span className="text-sm text-muted-foreground">
              {saved ? (
                "저장되었습니다."
              ) : (
                <>
                  {year}년 데이터는{" "}
                  <span className="font-semibold text-amber-600">Draft</span>{" "}
                  상태입니다.
                </>
              )}
            </span>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
