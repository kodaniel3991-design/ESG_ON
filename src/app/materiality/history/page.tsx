"use client";

import { useQuery } from "@tanstack/react-query";
import { getMaterialityVersionHistory } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { MaterialitySubNav } from "@/components/materiality/materiality-sub-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MaterialityHistoryPage() {
  const { data: history, isLoading } = useQuery({ queryKey: ["materiality-history"], queryFn: getMaterialityVersionHistory });
  return (
    <>
      <PageHeader title="이력" description="중대성 평가 버전 이력">
        <MaterialitySubNav />
      </PageHeader>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">버전 이력</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <Skeleton className="h-40 w-full rounded-lg" />}
            {!isLoading && history && (
              <ul className="space-y-3">
                {history.map((v) => (
                  <li key={v.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">{v.version}</p>
                      <p className="text-sm text-muted-foreground">{v.description}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">{v.createdAt} · {v.createdBy}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
