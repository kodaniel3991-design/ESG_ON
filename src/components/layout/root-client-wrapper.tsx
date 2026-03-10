"use client";

import { Suspense } from "react";
import { Providers } from "@/app/providers";
import { AppLayout } from "./app-layout";

function LayoutFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export function RootClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Suspense fallback={<LayoutFallback />}>
        <AppLayout>
          <Suspense fallback={<LayoutFallback />}>{children}</Suspense>
        </AppLayout>
      </Suspense>
    </Providers>
  );
}
