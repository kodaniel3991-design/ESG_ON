"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMaterialityIssues, getMaterialityMatrix, saveMaterialityIssues } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { MaterialitySubNav } from "@/components/materiality/materiality-sub-nav";
import { MaterialityMatrix } from "@/components/materiality/materiality-matrix";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Users, Scale, Save, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MaterialityIssue, MaterialityEsgDimension } from "@/types";

const DIM_LABEL: Record<MaterialityEsgDimension, string> = { environment: "환경", social: "사회", governance: "거버넌스" };
const DIM_ICON: Record<MaterialityEsgDimension, typeof Leaf> = { environment: Leaf, social: Users, governance: Scale };
const DIM_COLOR: Record<MaterialityEsgDimension, string> = {
  environment: "text-green-600 bg-green-100",
  social: "text-blue-600 bg-blue-100",
  governance: "text-amber-700 bg-amber-100",
};

function ScoreSlider({ value, onChange, label, description }: { value: number | null; onChange: (v: number) => void; label: string; description: string }) {
  const v = value ?? 3;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-sm font-bold text-primary">{v.toFixed(1)}</span>
      </div>
      <input
        type="range" min={1} max={5} step={0.5} value={v}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-primary"
      />
      <p className="text-[10px] text-muted-foreground">{description}</p>
    </div>
  );
}

export default function MaterialityDashboardPage() {
  const queryClient = useQueryClient();
  const [dimFilter, setDimFilter] = useState<MaterialityEsgDimension | "all">("all");

  const { data: issues = [], isLoading } = useQuery<MaterialityIssue[]>({
    queryKey: ["materiality-issues"],
    queryFn: getMaterialityIssues,
  });
  const { data: matrix = [] } = useQuery({
    queryKey: ["materiality-matrix"],
    queryFn: getMaterialityMatrix,
  });

  // 로컬 편집 상태
  const [editScores, setEditScores] = useState<Record<string, { impact: number; financial: number }>>({});
  const hasEdits = Object.keys(editScores).length > 0;

  const saveMutation = useMutation({
    mutationFn: saveMaterialityIssues,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materiality-issues"] });
      queryClient.invalidateQueries({ queryKey: ["materiality-matrix"] });
      setEditScores({});
      toast.success("평가 점수가 저장되었습니다.");
    },
    onError: () => toast.error("저장에 실패했습니다."),
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/materiality?type=generate");
      if (!res.ok) throw new Error("생성 실패");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["materiality-issues"] });
      toast.success(`${data.count}개 이슈가 생성되었습니다.`);
    },
  });

  const handleScoreChange = (issueId: string, field: "impact" | "financial", value: number) => {
    setEditScores((prev) => ({
      ...prev,
      [issueId]: { impact: prev[issueId]?.impact ?? 3, financial: prev[issueId]?.financial ?? 3, [field]: value },
    }));
  };

  const handleSave = () => {
    const updated = issues
      .filter((i) => editScores[i.id])
      .map((i) => ({
        ...i,
        impactScore: editScores[i.id].impact,
        financialScore: editScores[i.id].financial,
      }));
    if (updated.length === 0) return;
    saveMutation.mutate(updated);
  };

  const filtered = useMemo(() =>
    dimFilter === "all" ? issues : issues.filter((i) => i.dimension === dimFilter),
    [issues, dimFilter]
  );

  // 평가 완료/미완료 통계
  const assessed = issues.filter((i) => i.impactScore != null && i.financialScore != null).length;
  const unassessed = issues.length - assessed;

  // 핵심 이슈 (두 축 모두 3.5 이상)
  const criticalIssues = issues.filter((i) => {
    const impact = editScores[i.id]?.impact ?? i.impactScore ?? 0;
    const financial = editScores[i.id]?.financial ?? i.financialScore ?? 0;
    return impact >= 3.5 && financial >= 3.5;
  });

  return (
    <div data-page="materiality-dashboard">
      <PageHeader title="이중 중대성 평가" description="ESG 이슈의 영향 중대성(Impact)과 재무 중대성(Financial)을 평가합니다.">
        <MaterialitySubNav />
      </PageHeader>

      {/* 요약 카드 */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">전체 이슈</p>
            <p className="text-2xl font-bold">{issues.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">평가 완료</p>
            <p className="text-2xl font-bold text-green-600">{assessed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">미평가</p>
            <p className="text-2xl font-bold text-amber-600">{unassessed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">핵심 이슈 (이중 중대)</p>
            <p className="text-2xl font-bold text-destructive">{criticalIssues.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* 왼쪽: 이슈 목록 + 평가 입력 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">ESG 이슈 평가</CardTitle>
                <p className="text-sm text-muted-foreground">각 이슈의 영향 중대성과 재무 중대성을 평가해 주세요.</p>
              </div>
              <div className="flex items-center gap-2">
                {issues.length === 0 && (
                  <Button size="sm" variant="outline" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                    <RefreshCw className="mr-1 h-3.5 w-3.5" /> 이슈 자동 생성
                  </Button>
                )}
                {hasEdits && (
                  <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
                    <Save className="mr-1 h-3.5 w-3.5" /> 저장
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* 도메인 필터 */}
              <div className="mb-4 flex gap-1">
                {(["all", "environment", "social", "governance"] as const).map((d) => (
                  <button key={d} onClick={() => setDimFilter(d)}
                    className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      dimFilter === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {d === "all" ? "전체" : DIM_LABEL[d]}
                  </button>
                ))}
              </div>

              {isLoading ? (
                <p className="text-sm text-muted-foreground">불러오는 중...</p>
              ) : filtered.length === 0 ? (
                <div className="py-8 text-center">
                  <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">등록된 이슈가 없습니다. "이슈 자동 생성" 버튼을 클릭하세요.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((issue) => {
                    const Icon = DIM_ICON[issue.dimension];
                    const colorClass = DIM_COLOR[issue.dimension];
                    const currentImpact = editScores[issue.id]?.impact ?? issue.impactScore ?? 3;
                    const currentFinancial = editScores[issue.id]?.financial ?? issue.financialScore ?? 3;
                    const isEdited = !!editScores[issue.id];

                    return (
                      <div key={issue.id} className={cn(
                        "rounded-lg border border-border p-4 transition-colors",
                        isEdited ? "border-primary/30 bg-primary/[0.02]" : "hover:bg-muted/30"
                      )}>
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", colorClass)}>
                              <Icon className="mr-0.5 inline h-3 w-3" />
                              {DIM_LABEL[issue.dimension]}
                            </span>
                            <span className="text-sm font-semibold">{issue.name}</span>
                            <span className="text-xs text-muted-foreground">({issue.code})</span>
                          </div>
                          <span className="text-xs text-muted-foreground">KPI {issue.kpiLinkedCount}개 연결</span>
                        </div>
                        {issue.description && (
                          <p className="mb-3 text-xs text-muted-foreground">{issue.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <ScoreSlider
                            value={currentImpact}
                            onChange={(v) => handleScoreChange(issue.id, "impact", v)}
                            label="영향 중대성 (Impact)"
                            description="환경·사회에 미치는 실제 영향 정도"
                          />
                          <ScoreSlider
                            value={currentFinancial}
                            onChange={(v) => handleScoreChange(issue.id, "financial", v)}
                            label="재무 중대성 (Financial)"
                            description="기업 재무에 미치는 리스크/기회"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽: 매트릭스 + 핵심 이슈 */}
        <div className="lg:col-span-2 space-y-6">
          <MaterialityMatrix points={matrix} />

          {/* 핵심 이슈 목록 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">핵심 이슈 (이중 중대)</CardTitle>
              <p className="text-xs text-muted-foreground">영향 + 재무 모두 3.5 이상</p>
            </CardHeader>
            <CardContent>
              {criticalIssues.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">평가를 완료하면 핵심 이슈가 표시됩니다.</p>
              ) : (
                <div className="space-y-2">
                  {criticalIssues.map((issue, idx) => {
                    const colorClass = DIM_COLOR[issue.dimension];
                    const impact = editScores[issue.id]?.impact ?? issue.impactScore ?? 0;
                    const financial = editScores[issue.id]?.financial ?? issue.financialScore ?? 0;
                    return (
                      <div key={issue.id} className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
                        <span className="text-sm font-bold text-destructive">{idx + 1}</span>
                        <span className={cn("rounded px-1 py-0.5 text-[9px] font-bold", colorClass)}>
                          {DIM_LABEL[issue.dimension].charAt(0)}
                        </span>
                        <span className="flex-1 text-sm font-medium">{issue.name}</span>
                        <span className="text-xs text-muted-foreground">
                          영향 {impact.toFixed(1)} · 재무 {financial.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
