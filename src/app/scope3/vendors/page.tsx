"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPortalVendors } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { PortalSubNav } from "@/components/portal/portal-sub-nav";
import { VendorTable } from "@/components/portal/vendor-table";
import { InviteModal } from "@/components/portal/invite-modal";
import type { PortalVendor } from "@/types";

export default function PortalVendorsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<PortalVendor | null>(null);
  const [isResend, setIsResend] = useState(false);
  const { data: vendors, isLoading } = useQuery({
    queryKey: ["portal-vendors"],
    queryFn: getPortalVendors,
  });
  const handleInvite = (v: PortalVendor) => {
    setSelectedVendor(v);
    setIsResend(false);
    setModalOpen(true);
  };
  const handleResend = (v: PortalVendor) => {
    setSelectedVendor(v);
    setIsResend(true);
    setModalOpen(true);
  };
  return (
    <>
      <PageHeader title="협력사 관리" description="협력사를 조회하고 초대/재발송을 관리합니다.">
        <PortalSubNav />
      </PageHeader>
      <div className="mt-8">
        <VendorTable vendors={vendors ?? []} isLoading={isLoading} onInvite={handleInvite} onResendInvite={handleResend} />
      </div>
      <InviteModal open={modalOpen} onOpenChange={setModalOpen} vendor={selectedVendor} isResend={isResend} onConfirm={() => setModalOpen(false)} />
    </>
  );
}
