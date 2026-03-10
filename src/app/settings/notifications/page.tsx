"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsNotificationsPage() {
  return (
    <>
      <PageHeader
        title="알림 및 워크플로우"
        description="알림 규칙과 업무 워크플로우를 설정합니다."
      />
      <Card className="mt-6 shadow-sm">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            알림 및 워크플로우 설정 콘텐츠가 여기에 표시됩니다.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
