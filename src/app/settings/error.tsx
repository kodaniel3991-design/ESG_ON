"use client";

import { useEffect } from "react";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Settings segment error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-lg font-semibold text-destructive">설정을 불러올 수 없습니다</h2>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        {error?.message || "일시적인 오류가 발생했습니다."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        다시 시도
      </button>
    </div>
  );
}
