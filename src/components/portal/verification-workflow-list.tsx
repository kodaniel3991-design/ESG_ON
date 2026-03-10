"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VerificationItem } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const STEP_LABEL: Record<VerificationItem["step"], string> = {
  data_review: "데이터 검토",
  evidence_check: "증빙 확인",
  approval: "승인",
};

const STEP_STATUS: Record<VerificationItem["stepStatus"], string> = {
  pending: "대기",
  in_review: "검토중",
  approved: "승인",
  rejected: "반려",
};

export function VerificationWorkflowList({ items, isLoading }: { items: VerificationItem[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">검증 워크플로우</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-48 w-full rounded-lg" /></CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">검증 워크플로우</CardTitle>
        <p className="text-sm text-muted-foreground">협력사별 제출 데이터 검증 단계</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
            <div>
              <p className="font-medium">{item.vendorName}</p>
              <p className="text-xs text-muted-foreground">{item.period} {item.completedAt ? "완료 " + item.completedAt : "요청 " + item.requestedAt}</p>
            </div>
            <Badge variant="outline">{STEP_LABEL[item.step]}</Badge>
            <Badge variant={item.stepStatus === "approved" ? "success" : item.stepStatus === "rejected" ? "danger" : item.stepStatus === "in_review" ? "warning" : "secondary"}>{STEP_STATUS[item.stepStatus]}</Badge>
            {item.assignedTo && <span className="text-xs text-muted-foreground">담당: {item.assignedTo}</span>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
