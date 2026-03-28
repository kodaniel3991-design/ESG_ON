"use client";

import { cn } from "@/lib/utils";
import type { EmissionSource } from "@/types/scope1";
import { Button } from "@/components/ui/button";

interface SourceListProps {
  sources: EmissionSource[];
  selectedSourceId: string;
  onSelectSource: (id: string) => void;
}

export function SourceList({
  sources,
  selectedSourceId,
  onSelectSource,
}: SourceListProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-foreground">
            배출원 목록
          </h2>
          <p className="text-xs text-muted-foreground">
            배출원을 추가하고 월별 활동량을 관리합니다.
          </p>
        </div>
        <Button size="sm" variant="outline">
          + 배출원 추가
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <th className="px-4 py-2 text-left font-medium">배출원</th>
              <th className="px-4 py-2 text-left font-medium">연료</th>
              <th className="px-4 py-2 text-left font-medium">단위</th>
              <th className="px-2 py-2 text-right font-medium">배출계수</th>
              <th className="px-4 py-2 text-left font-medium">출처</th>
              <th className="px-4 py-2 text-left font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => {
              const isSelected = source.id === selectedSourceId;
              return (
                <tr
                  key={source.id}
                  onClick={() => onSelectSource(source.id)}
                  className={cn(
                    "cursor-pointer border-b border-border/60 last:border-0 transition-colors",
                    isSelected ? "bg-primary/5" : "hover:bg-muted/50",
                  )}
                >
                  <td className="px-4 py-2 text-sm font-medium">
                    {source.name}
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {source.fuelType}
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {source.unit}
                  </td>
                  <td className="px-2 py-2 text-xs text-right text-muted-foreground">
                    {source.emissionFactor.toFixed(3)}
                  </td>
                  <td className="px-4 py-2 text-[11px] text-muted-foreground">
                    {source.factorSource}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                        source.status === "active"
                          ? "bg-green-50 text-carbon-success border border-border"
                          : "bg-muted text-muted-foreground border border-border/50",
                      )}
                    >
                      {source.status === "active" ? "활성" : "비활성"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

