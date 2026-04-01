"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface SavingProgressModalProps {
  open: boolean;
  progress: number; // 0–100
  status: "saving" | "success" | "error";
  message?: string;
}

export function SavingProgressModal({
  open,
  progress,
  status,
  message,
}: SavingProgressModalProps) {
  return (
    <DialogPrimitive.Root open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center gap-4">
            {status === "saving" && (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-8 w-8 text-destructive" />
            )}

            <p className="text-sm font-medium text-foreground">
              {status === "saving" && (message || "저장 중...")}
              {status === "success" && "저장이 완료되었습니다."}
              {status === "error" && "저장에 실패했습니다."}
            </p>

            <div className="w-full space-y-1">
              <Progress value={progress} className="h-2.5" />
              <p className="text-xs text-muted-foreground text-right">
                {Math.round(progress)}%
              </p>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
