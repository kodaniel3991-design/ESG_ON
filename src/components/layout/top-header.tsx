"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, LogOut, Moon, Search, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export function TopHeader() {
  const router = useRouter();
  const { collapsed } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-6 transition-all duration-200",
        collapsed ? "left-16" : "left-56"
      )}
    >
      {/* 검색창 */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search"
          className="h-9 w-full rounded-md border border-border bg-muted/40 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:bg-background transition-colors"
        />
      </div>

      {/* 우측 영역 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <span className="h-2 w-2 rounded-full bg-primary" />
          환경부 API 연동 중
        </div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
          aria-label="테마 전환"
        >
          <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0 dark:absolute" />
          <Moon className="h-3.5 w-3.5 absolute rotate-90 scale-0 transition-transform dark:relative dark:rotate-0 dark:scale-100" />
          <span className="dark:hidden">Light Mode</span>
          <span className="hidden dark:inline">Dark Mode</span>
        </button>
        <Button variant="ghost" size="icon" className="relative" aria-label="알림">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-full border border-border pl-1 pr-3 py-1.5 outline-none hover:bg-muted/50 transition-colors"
              aria-label="사용자 메뉴"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                {user?.name?.charAt(0) ?? "?"}
              </div>
              <span className="text-sm font-medium">{user?.name ?? "사용자"}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
