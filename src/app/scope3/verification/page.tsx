"use client";

import { useQuery } from "@tanstack/react-query";
import { getVerificationItems, getEvidenceFiles } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { PortalSubNav } from "@/components/portal/portal-sub-nav";
import { VerificationWorkflowList } from "@/components/portal/verification-workflow-list";
import { EvidenceFileList } from "@/components/portal/evidence-file-list";

export default function PortalVerificationPage() {
  const { data: items, isLoading: vLoading } = useQuery({ queryKey: ["portal-verification"], queryFn: getVerificationItems });
  const { data: files, isLoading: fLoading } = useQuery({ queryKey: ["portal-evidence-files"], queryFn: () => getEvidenceFiles() });

  return (
    <>
      <PageHeader title="데이터 검증" description="검증 워크플로우와 증빙 파일을 관리합니다.">
        <PortalSubNav />
      </PageHeader>
      <div className="mt-8 space-y-8">
        <VerificationWorkflowList items={items ?? []} isLoading={vLoading} />
        <EvidenceFileList files={files ?? []} isLoading={fLoading} />
      </div>
    </>
  );
}
