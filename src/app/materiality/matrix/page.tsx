"use client";

import { useQuery } from "@tanstack/react-query";
import { getMaterialityMatrix, getMaterialityRanking } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { MaterialitySubNav } from "@/components/materiality/materiality-sub-nav";
import { MaterialityMatrix as MatrixChart } from "@/components/materiality/materiality-matrix";
import { MaterialityRanking } from "@/components/materiality/materiality-ranking";

export default function MaterialityMatrixPage() {
  const { data: matrix, isLoading: mLoading } = useQuery({ queryKey: ["materiality-matrix"], queryFn: getMaterialityMatrix });
  const { data: ranking, isLoading: rLoading } = useQuery({ queryKey: ["materiality-ranking"], queryFn: getMaterialityRanking });
  return (
    <>
      <PageHeader title="매트릭스/결과" description="중대성 매트릭스 및 핵심 이슈 랭킹">
        <MaterialitySubNav />
      </PageHeader>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <MatrixChart points={matrix ?? []} isLoading={mLoading} />
        <MaterialityRanking items={ranking ?? []} isLoading={rLoading} />
      </div>
    </>
  );
}
