"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsStandardsPage() {
  return (
    <>
      <PageHeader
        title="KPI / 공시 기준"
        description="KPI 정의와 공시 프레임워크, 매핑을 관리합니다."
      />
      <Card className="mt-6 shadow-sm">
        <CardContent className="p-6">
          <p className="mb-4 text-sm text-muted-foreground">
            KPI 및 공시 기준 관련 설정입니다. 기존 마스터 페이지로 이동할 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/settings/framework"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              프레임워크 마스터
            </Link>
            <Link
              href="/settings/mapping"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              매핑 엔진
            </Link>
            <Link
              href="/settings/templates"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              보고서 템플릿
            </Link>
            <Link
              href="/settings/kpi"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              KPI 마스터
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
