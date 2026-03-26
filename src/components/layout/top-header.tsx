"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, LogOut } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  NAV_ITEMS,
  isActivePath,
  type NavItem,
  type NavSectionItem,
} from "@/lib/navigation";

function isSectionActive(pathname: string, section: NavSectionItem): boolean {
  return section.children.some((c) => {
    if ("href" in c) return isActivePath(pathname, c.href);
    return c.children.some((l) => isActivePath(pathname, l.href));
  });
}

function isItemActive(pathname: string, item: NavItem): boolean {
  if (item.type === "link") return isActivePath(pathname, item.href);
  return item.children.some((s) => isSectionActive(pathname, s));
}

export function TopHeader() {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-6">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" aria-label="ENVIO 홈" className="flex items-center gap-2">
          <Logo />
        </Link>
        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="주요 내비게이션"
        >
          {NAV_ITEMS.map((item) => {
            if (item.type === "link") {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            }
            const active = isItemActive(pathname, item);
            return (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium transition-colors outline-none",
                      active
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[200px] max-h-[80vh] overflow-y-auto">
                  {item.children.map((section) => (
                    <DropdownMenuGroup key={section.label || "links"}>
                      {section.label ? (
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {section.label}
                        </div>
                      ) : null}
                      {section.children.map((child) => {
                        if ("href" in child) {
                          return (
                            <DropdownMenuItem key={child.href} asChild>
                              <Link
                                href={child.href}
                                className={cn(
                                  isActivePath(pathname, child.href) && "bg-primary/10 text-primary"
                                )}
                              >
                                {child.label}
                              </Link>
                            </DropdownMenuItem>
                          );
                        }
                        return (
                          <div key={child.label}>
                            <div className="px-2 py-1 pt-2 text-xs font-semibold text-muted-foreground">
                              {child.label}
                            </div>
                            {child.children.map((link) => (
                              <DropdownMenuItem key={link.href} asChild>
                                <Link
                                  href={link.href}
                                  className={cn(
                                    isActivePath(pathname, link.href) && "bg-primary/10 text-primary"
                                  )}
                                >
                                  {link.label}
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        );
                      })}
                    </DropdownMenuGroup>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <span className="h-2 w-2 rounded-full bg-primary" />
          환경부 API 연동 중
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="알림 열기"
        >
          <Bell className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-full border border-border pl-1 pr-3 py-1.5 outline-none hover:bg-muted/50 transition-colors"
              aria-label="사용자 메뉴"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                A
              </div>
              <span className="text-sm font-medium">Admin</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
