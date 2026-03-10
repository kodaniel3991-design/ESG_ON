"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Target, TrendingUp } from "lucide-react";
import type { KpiManagementItem, KpiCategory } from "@/types";
import { KpiStatusBadge } from "./kpi-status-badge";
import { cn } from "@/lib/utils";

const CAT: Record<KpiCategory, string> = { environment: "환경", social: "사회", governance: "거버넌스", carbon: "탄소" };

interface KpiDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: KpiManagementItem | null;
  onSetTarget?: (item: KpiManagementItem) => void;
}

export function KpiDetailDrawer({ open, onOpenChange, item, onSetTarget }: KpiDetailDrawerProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;
  const fmt = (v: number | string) => (typeof v === "number" ? v.toLocaleString() : String(v));

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-border bg-card shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-semibold">KPI 상세</h2>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}><X className="h-5 w-5" /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {!item ? (
              <p className="text-sm text-muted-foreground">항목을 선택하세요.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{CAT[item.category]} · {item.unit}</p>
                  {item.status && <KpiStatusBadge status={item.status} className="mt-2" />}
                </div>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4" /> 목표 vs 실적</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">목표</span><span>{fmt(item.target)} {item.unit}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">실적</span><span>{item.actual != null ? `${fmt(item.actual)} ${item.unit}` : "—"}</span></div>
                    {item.achievementPercent != null && (
                      <div className="flex items-center gap-2 pt-2"><TrendingUp className="h-4 w-4" /> 달성률 {item.achievementPercent.toFixed(1)}%</div>
                    )}
                  </CardContent>
                </Card>
                {onSetTarget && <Button size="sm" onClick={() => onSetTarget(item)}>목표 설정</Button>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
