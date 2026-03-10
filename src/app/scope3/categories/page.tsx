"use client";

import { useQuery } from "@tanstack/react-query";
import { getScope3CategoriesPortal } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { PortalSubNav } from "@/components/portal/portal-sub-nav";
import { Scope3CompletionChart } from "@/components/portal/scope3-completion-chart";

export default function PortalCategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["portal-scope3-categories"],
    queryFn: getScope3CategoriesPortal,
  });
  return (
    <>
      <PageHeader title="Scope 3 카테고리 관리" description="카테고리별 배출량과 완성도를 관리합니다.">
        <PortalSubNav />
      </PageHeader>
      <div className="mt-8">
        <Scope3CompletionChart data={categories ?? []} isLoading={isLoading} />
      </div>
    </>
  );
}
