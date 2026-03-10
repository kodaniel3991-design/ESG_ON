"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditLogItem } from "@/types/scope1";

interface AuditLogTableProps {
  items: AuditLogItem[];
}

export function AuditLogTable({ items }: AuditLogTableProps) {
  return (
    <Card className="h-full border-border/70 bg-card flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">변경 이력</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 text-left font-medium">사용자</th>
                <th className="px-3 py-2 text-left font-medium">작업</th>
                <th className="px-3 py-2 text-left font-medium">일시</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="px-3 py-2">{item.actor}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {item.action}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {item.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

