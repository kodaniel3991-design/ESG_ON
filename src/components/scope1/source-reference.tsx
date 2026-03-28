"use client";

import { cn } from "@/lib/utils";
import { SCOPE1_SOURCES } from "@/lib/scope1-mock-data";
import type { ScopeCategoryId } from "@/types/scope1";

interface SourceReferenceProps {
  activeCategoryId: ScopeCategoryId;
}

const CATEGORY_LABELS: Record<ScopeCategoryId, string> = {
  fixed: "고정연소",
  mobile: "이동연소",
  fugitive: "비가스배출",
};

export function SourceReference({ activeCategoryId }: SourceReferenceProps) {
  const sources = SCOPE1_SOURCES.filter((s) => s.categoryId === activeCategoryId);

  return (
    <section className="flex h-full flex-col space-y-3">
      <div>
        <h2 className="text-sm font-medium text-foreground">배출원 목록</h2>
        <p className="text-xs text-muted-foreground">
          {CATEGORY_LABELS[activeCategoryId]} 카테고리의 배출원 목록입니다.
        </p>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <th className="px-3 py-2 text-left font-medium">배출원</th>
              <th className="px-3 py-2 text-left font-medium">연료</th>
              <th className="px-3 py-2 text-left font-medium">단위</th>
              <th className="px-2 py-2 text-right font-medium">배출계수</th>
              <th className="px-3 py-2 text-left font-medium">출처</th>
              <th className="px-3 py-2 text-left font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr
                key={source.id}
                className="border-b border-border/60 last:border-0"
              >
                <td className="px-3 py-2 text-xs font-medium">{source.name}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{source.fuelType}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{source.unit}</td>
                <td className="px-2 py-2 text-right text-xs text-muted-foreground">
                  {source.emissionFactor.toFixed(3)}
                </td>
                <td className="px-3 py-2 text-[11px] text-muted-foreground">{source.factorSource}</td>
                <td className="px-3 py-2 text-xs">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                      source.status === "active"
                        ? "border border-border bg-green-50 text-carbon-success"
                        : "border border-border/50 bg-muted text-muted-foreground",
                    )}
                  >
                    {source.status === "active" ? "활성" : "비활성"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
