"use client";

import { Button } from "@/components/ui/button";
import type { PortalVendor } from "@/types";

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: PortalVendor | null;
  isResend?: boolean;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function InviteModal({
  open,
  onOpenChange,
  vendor,
  isResend,
  onConfirm,
  isLoading,
}: InviteModalProps) {
  if (!open || !vendor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h3 className="text-lg font-semibold">
          {isResend ? "초대 재발송" : "협력사 초대"}
        </h3>
        <div className="mt-4 space-y-2 text-sm">
          <p><span className="font-medium">협력사:</span> {vendor.name}</p>
          <p><span className="font-medium">이메일:</span> {vendor.email}</p>
          <p className="text-muted-foreground">
            {isResend
              ? "초대 링크를 다시 발송합니다."
              : "포털 가입 초대 메일을 발송합니다."}
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "발송 중…" : isResend ? "재발송" : "초대 발송"}
          </Button>
        </div>
      </div>
    </div>
  );
}
