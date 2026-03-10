"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function MaterialityAiCard(props: { items: Array<{ id: string; issueName: string; reason: string; suggestedPriority: number; confidence: number }>; isLoading?: boolean }) {
  if (props.isLoading) return <Card><CardContent className="p-4"><div className="h-24 animate-pulse rounded bg-muted" /></CardContent></Card>;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" /> AI 추천</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {props.items.slice(0, 5).map((r) => (
          <div key={r.id} className="rounded border border-border p-2 text-sm">
            <div className="font-medium">{r.issueName}</div>
            <p className="text-xs text-muted-foreground">{r.reason}</p>
            <p className="text-xs text-muted-foreground">순위 {r.suggestedPriority} 신뢰도 {Math.round(r.confidence * 100)}%</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
