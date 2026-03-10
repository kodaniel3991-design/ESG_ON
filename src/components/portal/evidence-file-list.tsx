"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EvidenceFile } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";

interface EvidenceFileListProps {
  files: EvidenceFile[];
  isLoading?: boolean;
  verificationId?: string;
}

const STATUS_LABEL: Record<EvidenceFile["status"], string> = {
  pending: "검토대기",
  approved: "승인",
  rejected: "반려",
};

export function EvidenceFileList({ files, isLoading }: EvidenceFileListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">증빙 파일</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-32 w-full rounded-lg" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">증빙 파일 목록</CardTitle>
        <p className="text-sm text-muted-foreground">업로드된 증빙 자료 및 검토 상태</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground">등록된 증빙 파일이 없습니다.</p>
          ) : (
            files.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 rounded-md border border-border p-3"
              >
                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.uploadedBy} · {f.uploadedAt.slice(0, 10)}
                  </p>
                </div>
                <Badge
                  variant={
                    f.status === "approved"
                      ? "success"
                      : f.status === "rejected"
                        ? "danger"
                        : "secondary"
                  }
                  className="shrink-0"
                >
                  {STATUS_LABEL[f.status]}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
