"use client";

import { useQuery } from "@tanstack/react-query";
import { getPortalSettings } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { PortalSubNav } from "@/components/portal/portal-sub-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalSettingsPage() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["portal-settings"],
    queryFn: getPortalSettings,
  });

  return (
    <>
      <PageHeader
        title="포털 설정"
        description="공급망 포털 초대·검증·파일 업로드 관련 설정을 관리합니다."
      >
        <PortalSubNav />
      </PageHeader>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">포털 설정</CardTitle>
            <p className="text-sm text-muted-foreground">초대 만료, 증빙 필수 여부 등</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full rounded-lg" />
            ) : settings ? (
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">초대 유효 기간 (일)</dt>
                  <dd className="mt-1 text-sm">{settings.invitationExpiryDays}일</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">만료 전 알림 (일)</dt>
                  <dd className="mt-1 text-sm">{settings.reminderDaysBeforeExpiry}일 전</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">기본 Tier</dt>
                  <dd className="mt-1 text-sm">{settings.defaultTier}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">증빙 필수</dt>
                  <dd className="mt-1 text-sm">{settings.requireEvidence ? "예" : "아니오"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">허용 파일 형식</dt>
                  <dd className="mt-1 text-sm">{settings.allowedFileTypes.join(", ")}</dd>
                </div>
              </dl>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
