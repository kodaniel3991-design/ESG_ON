"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, FileCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type DataStatus = "draft" | "reviewing" | "confirmed";

interface ActionFooterProps {
  year: string;
  status: DataStatus;
  hasErrors: boolean;
  onRequestValidation: () => Promise<void>;
  onSave: () => Promise<void>;
}

const STATUS_CONFIG: Record<DataStatus, { label: string; className: string; icon?: React.ElementType }> = {
  draft: {
    label: "Draft",
    className: "border-border bg-taupe-50 text-carbon-warning dark:border-border dark:bg-taupe-50/40 dark:text-carbon-warning",
  },
  reviewing: {
    label: "검토 중",
    className: "border-primary/30 bg-primary/10 text-primary",
    icon: Clock,
  },
  confirmed: {
    label: "확정됨",
    className: "border-border bg-green-50 text-carbon-success dark:border-border dark:text-carbon-success",
    icon: CheckCircle2,
  },
};

export function ActionFooter({ year, status, hasErrors, onRequestValidation, onSave }: ActionFooterProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["draft"];
  const StatusIcon = cfg.icon;

  const handleRequestValidation = async () => {
    setIsRequesting(true);
    try { await onRequestValidation(); } finally { setIsRequesting(false); }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try { await onSave(); } finally { setIsSaving(false); }
  };

  return (
    <div className="flex flex-col items-stretch justify-between gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{year}년</span> 데이터 상태
        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold", cfg.className)}>
          {StatusIcon && <StatusIcon className="h-3 w-3" />}
          {cfg.label}
        </span>
        {hasErrors && (
          <span className="text-carbon-danger">— 오류를 먼저 수정해 주세요</span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {/* 검증 요청: draft 상태이고 오류 없을 때만 활성 */}
        <Button
          variant="outline"
          size="sm"
          disabled={isRequesting || status !== "draft" || hasErrors}
          onClick={handleRequestValidation}
          title={
            hasErrors
              ? "오류를 먼저 수정해 주세요"
              : status !== "draft"
              ? status === "reviewing" ? "이미 검증 요청됐습니다" : "확정된 데이터입니다"
              : undefined
          }
        >
          {isRequesting ? (
            <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />요청 중...</>
          ) : (
            "검증 요청"
          )}
        </Button>

        {/* 제출: reviewing 상태일 때만 활성 */}
        <Button
          variant="secondary"
          size="sm"
          disabled={status !== "reviewing"}
          title={status !== "reviewing" ? "검증 요청 후 제출 가능합니다" : undefined}
        >
          <FileCheck className="mr-1.5 h-3.5 w-3.5" />
          제출
        </Button>

        {/* 저장: confirmed가 아닐 때 활성 */}
        <Button
          size="sm"
          className="bg-carbon-success text-carbon-success hover:bg-green-50 disabled:opacity-50"
          disabled={isSaving || status === "confirmed"}
          onClick={handleSave}
          title={status === "confirmed" ? "확정된 데이터는 수정할 수 없습니다" : undefined}
        >
          {isSaving ? (
            <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />저장 중...</>
          ) : (
            "저장"
          )}
        </Button>
      </div>
    </div>
  );
}
