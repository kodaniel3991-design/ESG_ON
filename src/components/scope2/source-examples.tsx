"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Scope2CategoryId } from "@/types/scope2";

/* ── 시설 데이터 (부모에서 전달) ── */
export interface Scope2SourceFacility {
  id: string;
  name: string;
  energyType: string;
  unit: string;
  emissionFactor?: number;
  status?: "active" | "inactive";
}

interface Scope2SourceExamplesProps {
  activeCategoryId: Scope2CategoryId;
  facilities?: Scope2SourceFacility[];
}

const CATEGORY_LABELS: Record<Scope2CategoryId, string> = {
  electricity: "구입전력",
  heat: "증기·난방",
};

/* ── KPI ↔ Scope 2 매핑 ── */
interface KpiCalcMapping {
  kpiId: string;
  code: string;
  name: string;
  categories?: string[];
}

const KPI_CALC_MAPPINGS: KpiCalcMapping[] = [
  { kpiId: "k1", code: "CARBON-01", name: "총 탄소 배출량" },
  { kpiId: "auto-s2", code: "E-S2", name: "Scope 2 배출량" },
  { kpiId: "auto-s2-elec", code: "E-S2E", name: "Scope 2 구입전력", categories: ["electricity"] },
  { kpiId: "auto-s2-heat", code: "E-S2H", name: "Scope 2 증기·열", categories: ["heat"] },
  { kpiId: "k8", code: "ENV-01", name: "에너지 사용량" },
];

export function Scope2SourceExamples({ activeCategoryId, facilities = [] }: Scope2SourceExamplesProps) {
  const contributingKpis = useMemo(() => {
    return KPI_CALC_MAPPINGS.filter((kpi) => {
      if (kpi.categories && !kpi.categories.includes(activeCategoryId)) return false;
      return true;
    });
  }, [activeCategoryId]);

  return (
    <section className="flex h-full flex-col space-y-3">
      <div>
        <h2 className="text-sm font-medium text-foreground">배출원 목록</h2>
        <p className="text-xs text-muted-foreground">
          {CATEGORY_LABELS[activeCategoryId]} 카테고리에 등록된 배출원입니다.
        </p>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card">
        {facilities.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
            좌측 배출원 정보에서 시설을 등록하세요
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[550px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                    <th className="px-3 py-2 text-left font-medium whitespace-nowrap">사용처</th>
                    <th className="px-3 py-2 text-left font-medium whitespace-nowrap">에너지</th>
                    <th className="px-2 py-2 text-left font-medium whitespace-nowrap">단위</th>
                    <th className="px-2 py-2 text-right font-medium whitespace-nowrap">배출계수</th>
                    <th className="px-3 py-2 text-left font-medium whitespace-nowrap">기여 KPI</th>
                    <th className="px-3 py-2 text-left font-medium whitespace-nowrap">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((f) => {
                    const status = f.status ?? "active";
                    return (
                      <tr key={f.id} className="border-b border-border/60 last:border-0">
                        <td className="px-3 py-2 text-xs font-medium whitespace-nowrap">{f.name}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{f.energyType}</td>
                        <td className="px-2 py-2 text-xs text-muted-foreground whitespace-nowrap">{f.unit}</td>
                        <td className="px-2 py-2 text-right text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                          {f.emissionFactor != null ? f.emissionFactor.toFixed(3) : "—"}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-nowrap gap-1">
                            {contributingKpis.map((kpi) => (
                              <span
                                key={kpi.kpiId}
                                className={cn(
                                  "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border",
                                  status === "active"
                                    ? "bg-primary/10 text-primary border-primary/20"
                                    : "bg-muted text-muted-foreground border-border/50 line-through"
                                )}
                                title={kpi.name}
                              >
                                {kpi.code}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                              status === "active"
                                ? "border border-border bg-green-50 text-carbon-success"
                                : "border border-border/50 bg-muted text-muted-foreground"
                            )}
                          >
                            {status === "active" ? "활성" : "비활성"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* KPI 범례 */}
            {contributingKpis.length > 0 && (
              <div className="border-t border-border bg-muted/20 px-3 py-2">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {contributingKpis.map((kpi) => (
                    <span key={kpi.kpiId} className="text-[10px] text-muted-foreground">
                      <span className="font-medium text-primary">{kpi.code}</span>
                      {" "}
                      {kpi.name}
                      <span className="ml-1 text-muted-foreground/60">(자동 집계)</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
