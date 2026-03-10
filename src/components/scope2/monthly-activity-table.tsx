"use client";

import { Button } from "@/components/ui/button";
import { cn, formatNumber } from "@/lib/utils";
import type { Scope2EnergyType } from "@/types/scope2";
import { getEmissionFactorForEnergy } from "@/lib/scope2-utils";
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

interface Scope2MonthlyActivityTableProps {
  activityByMonth: number[];
  onChangeActivity: (values: number[]) => void;
  energyType: Scope2EnergyType;
  unitLabel: string;
  metaRight?: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function Scope2MonthlyActivityTable({
  activityByMonth,
  onChangeActivity,
  energyType,
  unitLabel,
  metaRight,
  headerRight,
}: Scope2MonthlyActivityTableProps) {
  const factor = getEmissionFactorForEnergy(energyType);

  const emissions = useMemo(
    () =>
      activityByMonth.map((a) => {
        const safe = Number.isNaN(a) ? 0 : a;
        return safe * factor;
      }),
    [activityByMonth, factor],
  );

  const totalEmission = emissions.reduce((sum, v) => sum + v, 0);

  const handleActivityChange = (index: number, raw: string) => {
    const v = raw === "" ? 0 : parseFloat(raw);
    const next = [...activityByMonth];
    next[index] = Number.isNaN(v) ? 0 : v;
    onChangeActivity(next);
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="text-sm font-medium text-foreground">
            월별 사용량 입력
          </h2>
          <p className="text-xs text-muted-foreground">
            선택된 사용처 기준으로 에너지 사용량과 배출량을 관리합니다.
          </p>
          {metaRight}
        </div>
        {headerRight && <div className="ml-auto">{headerRight}</div>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <th className="w-28 px-3 py-2 text-left font-medium">구분</th>
              {MONTH_LABELS.map((label) => (
                <th
                  key={label}
                  className="w-20 px-2 py-2 text-right font-medium"
                >
                  {label}
                </th>
              ))}
              <th className="w-24 px-3 py-2 text-right font-medium">합계</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/60">
              <td className="px-3 py-2 text-xs font-medium">
                사용량 ({unitLabel})
              </td>
              {MONTH_LABELS.map((_, idx) => (
                <td key={idx} className="px-2 py-2 text-right">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={activityByMonth[idx] ?? 0}
                    onChange={(e) => handleActivityChange(idx, e.target.value)}
                    className={cn(
                      "h-9 w-full min-w-[4rem] rounded-md border border-input bg-transparent px-2 py-1.5 text-right text-xs ring-offset-background",
                      "focus:outline-none focus:ring-1 focus:ring-ring",
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
                  2,
                )}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-xs font-medium">
                배출량 (tCO₂e)
              </td>
              {emissions.map((v, idx) => (
                <td key={idx} className="px-2 py-2 text-right text-xs">
                  {formatNumber(v, 2)}
                </td>
              ))}
              <td className="px-3 py-2 text-right text-xs font-semibold">
                {formatNumber(totalEmission, 2)} tCO₂e
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

