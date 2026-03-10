"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { AiAnomalyItem } from "@/types";

export function AiCauseDrawer(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anomaly: AiAnomalyItem | null;
}) {
  const { open, onOpenChange, anomaly } = props;
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-border bg-card shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-semibold">원인 분석</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {!anomaly ? (
              <p className="text-sm text-muted-foreground">
                이상치를 선택하면 상세 분석이 표시됩니다.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">데이터 소스</p>
                  <p className="font-medium">{anomaly.source}</p>
                  {anomaly.kpiName && (
                    <p className="text-xs text-muted-foreground">
                      연결 KPI: {anomaly.kpiName}
                    </p>
                  )}
                </div>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">요약</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {anomaly.causeSummary}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">연결 영향도</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm text-muted-foreground">
                    <p>KPI {anomaly.linkedKpiCount}개에 영향</p>
                    <p>공급사 {anomaly.linkedVendorCount}개에 영향</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

