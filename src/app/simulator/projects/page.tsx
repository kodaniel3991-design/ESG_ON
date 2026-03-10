"use client";

import { useQuery } from "@tanstack/react-query";
import { getReductionProjects } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { ReductionSubNav } from "@/components/reduction/reduction-sub-nav";
import { ReductionProjectTable } from "@/components/reduction/reduction-project-table";

export default function ReductionProjectsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["reduction-projects"],
    queryFn: getReductionProjects,
  });

  return (
    <>
      <PageHeader
        title="프로젝트"
        description="감축 프로젝트의 일정과 감축 성과를 관리합니다."
      >
        <ReductionSubNav />
      </PageHeader>
      <div className="mt-8">
        <ReductionProjectTable data={data ?? []} isLoading={isLoading} />
      </div>
    </>
  );
}

