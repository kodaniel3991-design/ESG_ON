"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsSystemPage() {
  return (
    <>
      <PageHeader
        title="시스템 관리"
        description="시스템 점검, 로그, 백업 등 관리자 기능을 제공합니다."
      />
      <Card className="mt-6 shadow-sm">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            시스템 관리 콘텐츠가 여기에 표시됩니다.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
