"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { MaterialityIssue, MaterialityEsgDimension } from "@/types";

const DIM: Record<MaterialityEsgDimension, string> = { environment: "환경", social: "사회", governance: "거버넌스" };

interface MaterialityIssueDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MaterialityIssue | null;
}

export function MaterialityIssueDrawer({ open, onOpenChange, item }: MaterialityIssueDrawerProps) {
  const [tab, setTab] = useState<"eval" | "kpi" | "report">("eval");
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-border bg-card shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-semibold">이슈 상세</h2>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}><X className="h-5 w-5" /></Button>
          </div>
          <div className="flex gap-1 border-b border-border px-4">
            {(["eval", "kpi", "report"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-t px-3 py-2 text-sm font-medium ${tab === t ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                {t === "eval" ? "평가" : t === "kpi" ? "KPI 연결" : "보고서"}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {!item ? <p className="text-sm text-muted-foreground">항목을 선택하세요.</p> : (
              <>
                <div className="mb-4">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.code} · {DIM[item.dimension]}</p>
                </div>
                {tab === "eval" && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">평가 점수</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">내부 전문가</span><span>{item.expertScore}/5</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">산업 벤치마크</span><span>{item.benchmarkScore}/5</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">영향도</span><span>{item.impactScore}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">이해관계자</span><span>{item.stakeholderScore}</span></div>
                    </CardContent>
                  </Card>
                )}
                {tab === "kpi" && <p className="text-sm text-muted-foreground">KPI 연결: {item.kpiLinkedCount}개 ({item.kpiConnectionStatus})</p>}
                {tab === "report" && <p className="text-sm text-muted-foreground">보고서 연계: {item.reportLinkedCount}건</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
