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
import { Leaf, Users, Scale, Save, RefreshCw, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MaterialityIssue, MaterialityEsgDimension } from "@/types";

const DIM_LABEL: Record<MaterialityEsgDimension, string> = { environment: "환경", social: "사회", governance: "거버넌스" };
const DIM_ICON: Record<MaterialityEsgDimension, typeof Leaf> = { environment: Leaf, social: Users, governance: Scale };
const DIM_COLOR: Record<MaterialityEsgDimension, string> = {
  environment: "text-green-600 bg-green-100",
  social: "text-blue-600 bg-blue-100",
  governance: "text-amber-700 bg-amber-100",
};

const THRESHOLD = 3.5;

function ScoreSlider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-xs font-bold text-primary">{value.toFixed(1)}</span>
      </div>
      <input type="range" min={1} max={5} step={0.5} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-primary h-1.5" />
    </div>
  );
}

interface EditScore {
  scale: number;
  scope: number;
  irremediability: number;
  financial: number;
}

function calcImpact(s: EditScore) {
  return Math.round(((s.scale + s.scope + s.irremediability) / 3) * 100) / 100;
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

  const [editScores, setEditScores] = useState<Record<string, EditScore>>({});
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

  const getEditScore = (issue: MaterialityIssue): EditScore => {
    if (editScores[issue.id]) return editScores[issue.id];
    return {
      scale: issue.impactScale ?? 3,
      scope: issue.impactScope ?? 3,
      irremediability: issue.impactIrremediability ?? 3,
      financial: issue.financialScore ?? 3,
    };
  };

  const handleChange = (issueId: string, field: keyof EditScore, value: number) => {
    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return;
    const current = getEditScore(issue);
    setEditScores((prev) => ({ ...prev, [issueId]: { ...current, [field]: value } }));
  };

  const handleSave = () => {
    const updated = issues
      .filter((i) => editScores[i.id])
      .map((i) => {
        const s = editScores[i.id];
        return {
          ...i,
          impactScale: s.scale,
          impactScope: s.scope,
          impactIrremediability: s.irremediability,
          impactScore: calcImpact(s),
          financialScore: s.financial,
        };
      });
    if (updated.length === 0) return;
    saveMutation.mutate(updated);
  };

  const filtered = useMemo(() =>
    dimFilter === "all" ? issues : issues.filter((i) => i.dimension === dimFilter),
    [issues, dimFilter]
  );

  const assessed = issues.filter((i) => i.impactScore != null && i.financialScore != null).length;
  const unassessed = issues.length - assessed;

  // CSRD 기준: 영향 OR 재무 중 하나라도 3.5 이상이면 중대 이슈
  const getIssueImpact = (i: MaterialityIssue) => {
    const s = editScores[i.id];
    return s ? calcImpact(s) : (i.impactScore ?? 0);
  };
  const getIssueFinancial = (i: MaterialityIssue) => {
    return editScores[i.id]?.financial ?? i.financialScore ?? 0;
  };

  const dualMaterial = issues.filter((i) => getIssueImpact(i) >= THRESHOLD && getIssueFinancial(i) >= THRESHOLD);
  const impactOnly = issues.filter((i) => getIssueImpact(i) >= THRESHOLD && getIssueFinancial(i) < THRESHOLD);
  const financialOnly = issues.filter((i) => getIssueImpact(i) < THRESHOLD && getIssueFinancial(i) >= THRESHOLD);
  const allMaterial = [...dualMaterial, ...impactOnly, ...financialOnly];

  return (
    <div data-page="materiality-dashboard">
      <PageHeader title="이중 중대성 평가" description="ESG 이슈의 영향 중대성(Impact)과 재무 중대성(Financial)을 평가합니다 — CSRD/GRI 기준">
        <MaterialitySubNav />
      </PageHeader>

      {/* CSRD 기준 안내 */}
      <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-start gap-2">
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground">
          <strong className="text-foreground">이중 중대성 평가 기준 (CSRD/ESRS)</strong>
          <span className="mx-1.5">|</span>
          영향 중대성: GRI 심각성 3요소(규모·범위·복구불가성) 평균
          <span className="mx-1.5">|</span>
          <strong>둘 중 하나라도 {THRESHOLD} 이상이면 보고 대상</strong> (CSRD 기준)
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="mt-4 grid grid-cols-5 gap-4">
        <Card><CardContent className="py-4"><p className="text-xs text-muted-foreground">전체 이슈</p><p className="text-2xl font-bold">{issues.length}</p></CardContent></Card>
        <Card><CardContent className="py-4"><p className="text-xs text-muted-foreground">평가 완료</p><p className="text-2xl font-bold text-green-600">{assessed}</p></CardContent></Card>
        <Card><CardContent className="py-4"><p className="text-xs text-muted-foreground">미평가</p><p className="text-2xl font-bold text-amber-600">{unassessed}</p></CardContent></Card>
        <Card><CardContent className="py-4"><p className="text-xs text-destructive font-medium">이중 중대</p><p className="text-2xl font-bold text-destructive">{dualMaterial.length}</p></CardContent></Card>
        <Card><CardContent className="py-4"><p className="text-xs text-muted-foreground">보고 대상 (CSRD)</p><p className="text-2xl font-bold text-primary">{allMaterial.length}</p></CardContent></Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* 왼쪽: 이슈 목록 + 평가 입력 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">ESG 이슈 평가</CardTitle>
                <p className="text-sm text-muted-foreground">심각성 3요소(규모·범위·복구불가성)와 재무 중대성을 평가해 주세요.</p>
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
                    const s = getEditScore(issue);
                    const impact = calcImpact(s);
                    const isEdited = !!editScores[issue.id];
                    const isMaterial = impact >= THRESHOLD || s.financial >= THRESHOLD;
                    const isDual = impact >= THRESHOLD && s.financial >= THRESHOLD;

                    return (
                      <div key={issue.id} className={cn(
                        "rounded-lg border p-4 transition-colors",
                        isDual ? "border-destructive/40 bg-destructive/[0.03]" :
                        isMaterial ? "border-primary/30 bg-primary/[0.02]" :
                        isEdited ? "border-primary/20 bg-primary/[0.01]" :
                        "border-border hover:bg-muted/30"
                      )}>
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", colorClass)}>
                              <Icon className="mr-0.5 inline h-3 w-3" />
                              {DIM_LABEL[issue.dimension]}
                            </span>
                            <span className="text-sm font-semibold">{issue.name}</span>
                            {isDual && <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[9px] font-bold text-destructive">이중 중대</span>}
                            {!isDual && isMaterial && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">보고 대상</span>}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>영향 <strong className="text-foreground">{impact.toFixed(1)}</strong></span>
                            <span>재무 <strong className="text-foreground">{s.financial.toFixed(1)}</strong></span>
                            <span>KPI {issue.kpiLinkedCount}개</span>
                          </div>
                        </div>

                        {/* 심각성 3요소 + 재무 중대성 */}
                        <div className="grid grid-cols-4 gap-3">
                          <ScoreSlider label="규모 (Scale)" value={s.scale} onChange={(v) => handleChange(issue.id, "scale", v)} />
                          <ScoreSlider label="범위 (Scope)" value={s.scope} onChange={(v) => handleChange(issue.id, "scope", v)} />
                          <ScoreSlider label="복구불가성" value={s.irremediability} onChange={(v) => handleChange(issue.id, "irremediability", v)} />
                          <ScoreSlider label="재무 중대성" value={s.financial} onChange={(v) => handleChange(issue.id, "financial", v)} />
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

          {/* 보고 대상 이슈 (CSRD 기준) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">보고 대상 이슈 (CSRD 기준)</CardTitle>
              <p className="text-xs text-muted-foreground">영향 또는 재무 중 하나라도 {THRESHOLD} 이상</p>
            </CardHeader>
            <CardContent>
              {allMaterial.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">평가를 완료하면 보고 대상 이슈가 표시됩니다.</p>
              ) : (
                <div className="space-y-1.5">
                  {/* 이중 중대 */}
                  {dualMaterial.length > 0 && (
                    <p className="text-[10px] font-bold text-destructive mt-1 mb-0.5">이중 중대 ({dualMaterial.length})</p>
                  )}
                  {dualMaterial.map((issue) => (
                    <IssueRow key={issue.id} issue={issue} impact={getIssueImpact(issue)} financial={getIssueFinancial(issue)} type="dual" />
                  ))}
                  {/* 영향 중대 */}
                  {impactOnly.length > 0 && (
                    <p className="text-[10px] font-bold text-green-600 mt-2 mb-0.5">영향 중대 ({impactOnly.length})</p>
                  )}
                  {impactOnly.map((issue) => (
                    <IssueRow key={issue.id} issue={issue} impact={getIssueImpact(issue)} financial={getIssueFinancial(issue)} type="impact" />
                  ))}
                  {/* 재무 중대 */}
                  {financialOnly.length > 0 && (
                    <p className="text-[10px] font-bold text-blue-600 mt-2 mb-0.5">재무 중대 ({financialOnly.length})</p>
                  )}
                  {financialOnly.map((issue) => (
                    <IssueRow key={issue.id} issue={issue} impact={getIssueImpact(issue)} financial={getIssueFinancial(issue)} type="financial" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function IssueRow({ issue, impact, financial, type }: { issue: MaterialityIssue; impact: number; financial: number; type: "dual" | "impact" | "financial" }) {
  const colorClass = DIM_COLOR[issue.dimension];
  return (
    <div className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5">
      <span className={cn("rounded px-1 py-0.5 text-[9px] font-bold", colorClass)}>
        {DIM_LABEL[issue.dimension].charAt(0)}
      </span>
      <span className="flex-1 text-xs font-medium">{issue.name}</span>
      <span className={cn("text-[10px]", type === "dual" || type === "impact" ? "font-bold" : "text-muted-foreground")}>
        영향 {impact.toFixed(1)}
      </span>
      <span className={cn("text-[10px]", type === "dual" || type === "financial" ? "font-bold" : "text-muted-foreground")}>
        재무 {financial.toFixed(1)}
      </span>
    </div>
  );
}
