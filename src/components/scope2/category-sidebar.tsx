"use client";

import { cn } from "@/lib/utils";
import type { Scope2Category, Scope2CategoryId } from "@/types/scope2";

interface Scope2CategorySidebarProps {
  categories: Scope2Category[];
  selectedId: Scope2CategoryId;
  onSelect: (id: Scope2CategoryId) => void;
}

export function Scope2CategorySidebar({
  categories,
  selectedId,
  onSelect,
}: Scope2CategorySidebarProps) {
  return (
    <aside className="rounded-xl border border-border bg-muted/40 p-3">
      <p className="mb-2 text-sm font-semibold text-muted-foreground">
        Scope 2 카테고리
      </p>
      <div className="space-y-1">
        {categories.map((cat) => {
          const isActive = selectedId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
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
    </aside>
  );
}

