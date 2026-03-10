"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getPortalVendors,
  getSubmissions,
  getScope3CategoriesPortal,
  getVerificationItems,
} from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { PortalSubNav } from "@/components/portal/portal-sub-nav";
import { Scope3CompletionChart } from "@/components/portal/scope3-completion-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, FileCheck, CheckCircle, Clock } from "lucide-react";

export default function PortalDashboardPage() {
  const { data: vendors, isLoading: vLoading } = useQuery({
    queryKey: ["portal-vendors"],
    queryFn: getPortalVendors,
  });
  const { data: submissions, isLoading: sLoading } = useQuery({
    queryKey: ["portal-submissions"],
    queryFn: getSubmissions,
  });
  const { data: categories, isLoading: cLoading } = useQuery({
    queryKey: ["portal-scope3-categories"],
    queryFn: getScope3CategoriesPortal,
  });
  const { data: verifications } = useQuery({
    queryKey: ["portal-verification"],
    queryFn: getVerificationItems,
  });

  const verified = submissions?.filter((s) => s.status === "verified").length ?? 0;
  const pending = submissions?.filter((s) => s.status === "in_progress" || s.status === "submitted").length ?? 0;

  return (
    <div data-page="portal-dashboard" className="min-h-0">
      <PageHeader
        title="공급망 포털 대시보드"
        description="협력사 연동, ESG/탄소 데이터 제출·검증 현황을 한눈에 확인합니다."
      >
        <PortalSubNav />
      </PageHeader>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">요약</h2>
          {vLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">협력사</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{vendors?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">전체 등록</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">검증 완료</CardTitle>
                  <CheckCircle className="h-4 w-4 text-carbon-success" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{verified}</p>
                  <p className="text-xs text-muted-foreground">제출 검증됨</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">진행 중</CardTitle>
                  <Clock className="h-4 w-4 text-carbon-warning" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{pending}</p>
                  <p className="text-xs text-muted-foreground">제출/검토 중</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">검증 건수</CardTitle>
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{verifications?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">워크플로우</p>
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        <section>
          <Scope3CompletionChart data={categories ?? []} isLoading={cLoading} />
        </section>
      </div>
    </div>
  );
}
