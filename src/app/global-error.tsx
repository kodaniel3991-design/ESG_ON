"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased bg-background">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
          <h1 className="text-xl font-semibold text-destructive">오류가 발생했습니다</h1>
          <p className="max-w-md text-center text-sm text-muted-foreground">
            {error?.message || "알 수 없는 오류"}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
