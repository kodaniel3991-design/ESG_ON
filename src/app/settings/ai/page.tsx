"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsAIPage() {
  return (
    <>
      <PageHeader
        title="AI 설정"
        description="AI 분석·예측·이상치 탐지 관련 옵션을 관리합니다."
      />
      <Card className="mt-6 shadow-sm">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            AI 설정 콘텐츠가 여기에 표시됩니다.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
