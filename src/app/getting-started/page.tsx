"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWizardStore } from "./wizard-store";
import { CheckCircle2, ArrowRight, GitBranch, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const DataFlowMap = dynamic(
  () => import("@/components/getting-started/data-flow-map").then((m) => ({ default: m.DataFlowMap })),
  { ssr: false }
);


function FlowMapSection() {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center gap-2.5 px-5 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <GitBranch className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">데이터 흐름 구조</span>
        <span className="text-xs text-muted-foreground">KPI 설정 → 배출원 등록 → 데이터 입력 → 자동 집계</span>
        <ChevronDown className={cn("ml-auto h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-border px-5 py-4">
          <DataFlowMap />
        </div>
      )}
    </div>
  );
}

export default function GettingStartedPage() {
  const { state, hydrated, markStepComplete } = useWizardStore();

  // DB 데이터 기준으로 완료 상태 동기화
  useEffect(() => {
    if (!hydrated) return;
    fetch("/api/organization")
      .then((r) => r.json())
      .then((org) => {
        if (!org || !org.organizationName) return;
        if (org.organizationName && org.organizationName !== "조직") markStepComplete(1);
        if (org.worksites?.length > 0 || state.facilities?.some((f: any) => f.name?.trim())) markStepComplete(2);
        if (org.scope3Categories !== undefined && org.scope3Categories !== null) markStepComplete(3);
        if (org.selectedFrameworks?.length > 0) markStepComplete(4);
      })
      .catch(() => {});
    fetch("/api/kpi?type=master")
      .then((r) => r.json())
      .then((kpis) => {
        if (Array.isArray(kpis) && kpis.length > 0) markStepComplete(5);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const allDone = state.completedSteps.length === 5;

  return (
    <div className="flex flex-col gap-4">
      {/* 완료 배너 */}
      {allDone && (
        <div className="rounded-xl border border-border bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-carbon-success" />
            <div>
              <p className="font-semibold text-foreground">초기 설정 완료!</p>
              <p className="text-sm text-muted-foreground">
                모든 설정이 완료됐습니다. 대시보드에서 ESG 현황을 확인하세요.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="ml-auto flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              대시보드로 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* 데이터 흐름도 */}
      <FlowMapSection />

    </div>
  );
}
