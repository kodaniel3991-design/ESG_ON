"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsReportsPage() {
  return (
    <>
      <PageHeader
        title="보고서 설정"
        description="보고서 생성·출력·스케줄 관련 설정을 관리합니다."
      />
      <Card className="mt-6 shadow-sm">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            보고서 설정 콘텐츠가 여기에 표시됩니다.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
