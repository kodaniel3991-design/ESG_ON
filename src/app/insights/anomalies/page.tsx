"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAiAnomalies } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { AiSubNav } from "@/components/ai/ai-sub-nav";
import { AiAnomalyTable } from "@/components/ai/ai-anomaly-table";
import { AiCauseDrawer } from "@/components/ai/ai-cause-drawer";
import type { AiAnomalyItem } from "@/types";

export default function AiAnomaliesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<AiAnomalyItem | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["ai-anomalies"],
    queryFn: getAiAnomalies,
  });

  return (
    <>
      <PageHeader
        title="이상치/원인 분석"
        description="AI가 탐지한 이상치를 검토하고 원인을 분석합니다."
      >
        <AiSubNav />
      </PageHeader>
      <div className="mt-8">
        <AiAnomalyTable
          data={data ?? []}
          isLoading={isLoading}
          onRowClick={(row) => {
            setSelected(row);
            setDrawerOpen(true);
          }}
        />
      </div>
      <AiCauseDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        anomaly={selected}
      />
    </>
  );
}

