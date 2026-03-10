"use client";

import { cn } from "@/lib/utils";
import type { Scope3CategoryConfig } from "@/components/emissions/scope3-monthly-input";

interface Scope3CategorySidebarProps {
  categories: Scope3CategoryConfig[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function Scope3CategorySidebar({
  categories,
  selectedId,
  onSelect,
}: Scope3CategorySidebarProps) {
  const upstream = categories.filter((c) => c.group === "upstream");
  const downstream = categories.filter((c) => c.group === "downstream");

  return (
    <aside className="rounded-xl border border-border bg-muted/40 p-3">
      <p className="mb-2 text-sm font-semibold text-muted-foreground">
        Scope 3 카테고리
      </p>
      <div className="space-y-3 text-sm">
        <div>
          <p className="mb-1 font-semibold text-muted-foreground">
            업스트림
          </p>
          <div className="space-y-1">
            {upstream.map((cat) => {
              const isActive = selectedId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelect(cat.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold shadow-sm"
                      : "text-muted-foreground hover:bg-muted/70",
                  )}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="mb-1 mt-2 font-semibold text-muted-foreground">
            다운스트림
          </p>
          <div className="space-y-1">
            {downstream.map((cat) => {
              const isActive = selectedId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelect(cat.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold shadow-sm"
                      : "text-muted-foreground hover:bg-muted/70",
                  )}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

