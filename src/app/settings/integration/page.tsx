"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsIntegrationPage() {
  return (
    <>
      <PageHeader
        title="데이터 연동"
        description="외부 시스템·API와의 데이터 연동을 설정합니다."
      />
      <Card className="mt-6 shadow-sm">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            데이터 연동 설정 콘텐츠가 여기에 표시됩니다.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
