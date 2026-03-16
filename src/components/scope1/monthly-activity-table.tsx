 "use client";

import { cn, formatNumber } from "@/lib/utils";
import type { Scope1FuelType } from "@/types/scope1";
import {
  calculateMonthlyEmissions,
  calculateGasEmissions,
  getEmissionFactorForFuel,
  SCOPE1_GAS_FACTORS,
  SCOPE1_FACTOR_SOURCES,
} from "@/lib/scope1-utils";
import { useMemo } from "react";

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

interface MonthlyActivityTableProps {
  activityByMonth: number[];
  onChangeActivity: (values: number[]) => void;
  fuel: Scope1FuelType;
  unitLabel: string;
  facilityName?: string;
  metaRight?: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function MonthlyActivityTable({
  activityByMonth,
  onChangeActivity,
  fuel,
  unitLabel,
  facilityName,
  metaRight,
  headerRight,
}: MonthlyActivityTableProps) {
  const factor = getEmissionFactorForFuel(fuel);
  const gasFactors = SCOPE1_GAS_FACTORS[fuel];
  const factorSource = SCOPE1_FACTOR_SOURCES[fuel];

  const emissionData = useMemo(
    () => calculateMonthlyEmissions(activityByMonth, fuel),
    [activityByMonth, fuel],
  );

  const totalEmission = emissionData.reduce(
    (sum, row) => sum + row.emission,
    0,
  );

  const gasEmissions = useMemo(
    () => calculateGasEmissions(activityByMonth, fuel),
    [activityByMonth, fuel],
  );

  const round3 = (n: number) => Math.round(n * 1000) / 1000;

  const handleActivityChange = (index: number, raw: string) => {
    const v = raw === "" ? 0 : parseFloat(raw);
    const next = [...activityByMonth];
    next[index] = Number.isNaN(v) ? 0 : round3(v);
    onChangeActivity(next);
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="text-sm font-medium text-foreground">
            월별 데이터 입력
          </h2>
          {facilityName && (
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary">
              {facilityName}
            </span>
          )}
          {metaRight}
        </div>
        {headerRight && (
          <div className="ml-auto">{headerRight}</div>
        )}
      </div>

      {/* 계산 근거 */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2 text-xs dark:border-blue-900/50 dark:bg-blue-950/20">
        <span className="shrink-0 font-semibold text-blue-700 dark:text-blue-400">계산 근거</span>
        <span className="shrink-0 text-muted-foreground">
          활동량
          <span className="mx-1 text-muted-foreground/60">({unitLabel})</span>
          <span className="mx-1.5 text-foreground">×</span>
          배출계수
          <span className="mx-1 rounded bg-blue-100 px-1.5 py-0.5 font-semibold text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
            {factor.toExponential(4)} tCO₂e/{unitLabel}
          </span>
          <span className="mx-1.5 text-foreground">=</span>
          배출량
          <span className="ml-1 text-muted-foreground/60">(tCO₂e)</span>
        </span>
        <span className="h-3 w-px shrink-0 bg-blue-200 dark:bg-blue-800" />
        <span className="text-muted-foreground">
          CO₂:
          <span className="ml-1 font-mono font-medium text-foreground">{gasFactors.co2.toExponential(3)} tCO₂/{unitLabel}</span>
        </span>
        <span className="text-muted-foreground">
          CH₄:
          <span className="ml-1 font-mono font-medium text-foreground">{gasFactors.ch4.toExponential(3)} tCH₄/{unitLabel}</span>
          <span className="ml-0.5 text-[10px] text-blue-600/70">(×{gasFactors.gwp_ch4})</span>
        </span>
        <span className="text-muted-foreground">
          N₂O:
          <span className="ml-1 font-mono font-medium text-foreground">{gasFactors.n2o.toExponential(3)} tN₂O/{unitLabel}</span>
          <span className="ml-0.5 text-[10px] text-blue-600/70">(×{gasFactors.gwp_n2o})</span>
        </span>
        <span className="h-3 w-px shrink-0 bg-blue-200 dark:bg-blue-800" />
        <span className="text-muted-foreground">
          출처:
          <span className="ml-1 text-foreground">{factorSource}</span>
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <th className="w-24 px-3 py-2 text-left font-medium">구분</th>
              {MONTH_LABELS.map((label) => (
                <th
                  key={label}
                  className="px-1 py-2 text-right font-medium"
                >
                  {label}
                </th>
              ))}
              <th className="w-24 px-3 py-2 text-right font-medium">합계</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/60">
              <td className="px-3 py-2 text-xs font-medium">활동량 ({unitLabel})</td>
              {MONTH_LABELS.map((_, idx) => (
                <td key={idx} className="px-1 py-2 text-right">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={activityByMonth[idx] ?? 0}
                    onChange={(e) => handleActivityChange(idx, e.target.value)}
                    className={cn(
                      "h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-1 py-1 text-right text-xs ring-offset-background",
                      "focus:outline-none focus:ring-1 focus:ring-ring",
                      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    )}
                  />
                </td>
              ))}
              <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                {formatNumber(
                  activityByMonth.reduce(
                    (sum, v) => sum + (Number.isNaN(v) ? 0 : v),
                    0,
                  ),
                  3,
                )}
              </td>
            </tr>
            <tr className="border-b border-border/60">
              <td className="px-3 py-2 text-xs font-medium">
                배출량 (tCO₂e)
              </td>
              {emissionData.map((row) => (
                <td key={row.month} className="px-2 py-2 text-right text-xs">
                  {formatNumber(row.emission, 2)}
                </td>
              ))}
              <td className="px-3 py-2 text-right text-xs font-semibold">
                {formatNumber(totalEmission, 2)} tCO₂e
              </td>
            </tr>
            <tr className="border-b border-border/60 bg-muted/20">
              <td className="px-3 py-2 text-xs text-muted-foreground pl-5">CO₂ (tCO₂)</td>
              {gasEmissions.co2.map((v, idx) => (
                <td key={idx} className="px-2 py-2 text-right text-xs text-muted-foreground">
                  {formatNumber(v, 3)}
                </td>
              ))}
              <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                {formatNumber(gasEmissions.co2.reduce((s, v) => s + v, 0), 3)}
              </td>
            </tr>
            <tr className="border-b border-border/60 bg-muted/20">
              <td className="px-3 py-2 text-xs text-muted-foreground pl-5">CH₄ (tCH₄)</td>
              {gasEmissions.ch4.map((v, idx) => (
                <td key={idx} className="px-2 py-2 text-right text-xs text-muted-foreground">
                  {formatNumber(v, 3)}
                </td>
              ))}
              <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                {formatNumber(gasEmissions.ch4.reduce((s, v) => s + v, 0), 3)}
              </td>
            </tr>
            <tr className="bg-muted/20">
              <td className="px-3 py-2 text-xs text-muted-foreground pl-5">N₂O (tN₂O)</td>
              {gasEmissions.n2o.map((v, idx) => (
                <td key={idx} className="px-2 py-2 text-right text-xs text-muted-foreground">
                  {formatNumber(v, 3)}
                </td>
              ))}
              <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                {formatNumber(gasEmissions.n2o.reduce((s, v) => s + v, 0), 3)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

