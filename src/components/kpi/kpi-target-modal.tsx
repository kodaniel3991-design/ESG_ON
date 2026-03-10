"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { KpiManagementItem } from "@/types";
import { cn } from "@/lib/utils";

interface KpiTargetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: KpiManagementItem | null;
  onConfirm?: (kpiId: string, targetValue: number | string) => void;
  isLoading?: boolean;
}

export function KpiTargetModal({ open, onOpenChange, item, onConfirm, isLoading }: KpiTargetModalProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!item || !onConfirm) return;
    const num = Number(value);
    if (!Number.isNaN(num)) onConfirm(item.id, num);
    else onConfirm(item.id, value);
    onOpenChange(false);
    setValue("");
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" aria-hidden onClick={() => onOpenChange(false)} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">목표 설정</h2>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        {item && (
          <>
            <p className="text-sm text-muted-foreground mb-2">{item.name} ({item.unit})</p>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={String(item.target)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
          <Button onClick={handleSubmit} disabled={!value || isLoading}>{isLoading ? "저장 중…" : "저장"}</Button>
        </div>
      </div>
    </>
  );
}
