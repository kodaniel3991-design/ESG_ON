"use client";

import { useQuery } from "@tanstack/react-query";
import { getReductionOpportunities } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { ReductionSubNav } from "@/components/reduction/reduction-sub-nav";
import { ReductionOpportunityTable } from "@/components/reduction/reduction-opportunity-table";

export default function ReductionOpportunitiesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["reduction-opportunities"],
    queryFn: getReductionOpportunities,
  });

  return (
    <>
      <PageHeader
        title="감축 기회"
        description="예상 감축량·비용·ROI를 기준으로 감축 기회를 관리합니다."
      >
        <ReductionSubNav />
      </PageHeader>
      <div className="mt-8">
        <ReductionOpportunityTable data={data ?? []} isLoading={isLoading} />
      </div>
    </>
  );
}

