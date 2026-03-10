"use client";

import dynamic from "next/dynamic";

function MinimalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

const FullApp = dynamic(
  () =>
    import("./full-app").then((m) => ({ default: m.FullApp })),
  { ssr: false, loading: MinimalLoading }
);

export function RootShell({ children }: { children: React.ReactNode }) {
  return <FullApp>{children}</FullApp>;
}
