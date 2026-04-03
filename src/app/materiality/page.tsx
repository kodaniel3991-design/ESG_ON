"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMaterialityIssues, getMaterialityMatrix, saveMaterialityIssues } from "@/services/api";
import { getMaterialityScoreRecommendation } from "@/lib/ai-recommendations";
import { PageHeader } from "@/components/layout/page-header";
import { MaterialitySubNav } from "@/components/materiality/materiality-sub-nav";
import { MaterialityMatrix } from "@/components/materiality/materiality-matrix";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Users, Scale, Save, RefreshCw, AlertTriangle, Info, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
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

// 질문형 선택지
const SEVERITY_OPTIONS = [
  { value: 1, label: "경미", desc: "거의 영향 없음" },
  { value: 2, label: "보통", desc: "제한적 영향" },
  { value: 3, label: "유의", desc: "눈에 띄는 영향" },
  { value: 4, label: "심각", desc: "상당한 영향" },
  { value: 5, label: "치명적", desc: "극심한 영향" },
];

const QUESTIONS = {
  scale: { label: "규모", question: "이 이슈의 영향이 얼마나 심각한가요?" },
  scope: { label: "범위", question: "영향을 받는 대상 범위가 얼마나 넓은가요?" },
  irremediability: { label: "복구불가성", question: "발생 시 원상복구가 가능한가요?" },
  financial: { label: "재무 영향", question: "기업 재무에 미치는 리스크/기회는 어느 수준인가요?" },
};

const FINANCIAL_OPTIONS = [
  { value: 1, label: "거의 없음", desc: "재무 영향 미미" },
  { value: 2, label: "낮음", desc: "소규모 비용 영향" },
  { value: 3, label: "보통", desc: "관리 필요 수준" },
  { value: 4, label: "높음", desc: "상당한 재무 리스크" },
  { value: 5, label: "매우 높음", desc: "사업 지속성 위협" },
];

interface EditScore {
  scale: number;
  scope: number;
  irremediability: number;
  financial: number;
}

function calcImpact(s: EditScore) {
  return Math.round(((s.scale + s.scope + s.irremediability) / 3) * 100) / 100;
}

function QuestionSelector({ value, onChange, options, accent }: {
  value: number;
  onChange: (v: number) => void;
  options: typeof SEVERITY_OPTIONS;
  accent?: string;
}) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 rounded-md border px-1.5 py-1.5 text-center transition-all",
            value === opt.value
              ? accent ?? "border-primary bg-primary/10 text-primary font-bold"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          <p className="text-[11px] font-semibold">{opt.label}</p>
          <p className="text-[9px] opacity-70">{opt.desc}</p>
        </button>
      ))}
    </div>
  );
}

export default function MaterialityDashboardPage() {
  const queryClient = useQueryClient();
  const [dimFilter, setDimFilter] = useState<MaterialityEsgDimension | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // 조직 산업군 조회
  const [industry, setIndustry] = useState("");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("esg_setup_wizard");
      if (saved) { const parsed = JSON.parse(saved); setIndustry(parsed.organization?.industry ?? ""); }
    } catch { /* noop */ }
  }, []);

  const { data: issues = [], isLoading } = useQuery<MaterialityIssue[]>({
    queryKey: ["materiality-issues"],
    queryFn: getMaterialityIssues,
  });
  const { data: matrix = [] } = useQuery({
    queryKey: ["materiality-matrix"],
    queryFn: getMaterialityMatrix,
  });

  const [editScores, setEditScores] = useState<Record<string, EditScore>>({});
  const [aiApplied, setAiApplied] = useState(false);
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

  // AI 추천 점수 일괄 적용
  const applyAiScores = () => {
    const newScores: Record<string, EditScore> = {};
    for (const issue of issues) {
      const rec = getMaterialityScoreRecommendation(industry, issue.kpiGroup ?? issue.name);
      newScores[issue.id] = rec;
    }
    setEditScores(newScores);
    setAiApplied(true);
    toast.success(`${issues.length}개 이슈에 AI 추천 점수가 적용되었습니다. 검토 후 저장해 주세요.`);
  };

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
        return { ...i, impactScale: s.scale, impactScope: s.scope, impactIrremediability: s.irremediability, impactScore: calcImpact(s), financialScore: s.financial };
      });
    if (updated.length === 0) return;
    saveMutation.mutate(updated);
  };

  const filtered = useMemo(() =>
    dimFilter === "all" ? issues : issues.filter((i) => i.dimension === dimFilter),
    [issues, dimFilter]
  );

  const assessed = issues.filter((i) => i.impactScore != null && i.financialScore != null).length;
  const getImpact = (i: MaterialityIssue) => editScores[i.id] ? calcImpact(editScores[i.id]) : (i.impactScore ?? 0);
  const getFinancial = (i: MaterialityIssue) => editScores[i.id]?.financial ?? i.financialScore ?? 0;

  const dualMaterial = issues.filter((i) => getImpact(i) >= THRESHOLD && getFinancial(i) >= THRESHOLD);
  const impactOnly = issues.filter((i) => getImpact(i) >= THRESHOLD && getFinancial(i) < THRESHOLD);
  const financialOnly = issues.filter((i) => getImpact(i) < THRESHOLD && getFinancial(i) >= THRESHOLD);
  const allMaterial = [...dualMaterial, ...impactOnly, ...financialOnly];

  return (
    <div data-page="materiality-dashboard">
      <PageHeader title="이중 중대성 평가" description="ESG 이슈의 영향 중대성과 재무 중대성을 평가합니다 — CSRD/GRI 기준">
        <MaterialitySubNav />
      </PageHeader>

      {/* CSRD 안내 + AI 추천 */}
      <div className="mt-6 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <strong className="text-foreground">이중 중대성 평가</strong> — 영향 중대성(GRI 3요소) + 재무 중대성 | <strong>둘 중 하나라도 {THRESHOLD} 이상이면 보고 대상</strong> (CSRD)
          </div>
        </div>
        {issues.length > 0 && (
          <Button size="sm" variant="outline" onClick={applyAiScores} disabled={aiApplied && !hasEdits}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
            {aiApplied ? "AI 추천 재적용" : "AI 추천 점수 적용"}
            {industry && <span className="ml-1 text-[10px] opacity-70">({industry})</span>}
          </Button>
        )}
      </div>

      {/* 요약 */}
      <div className="mt-4 grid grid-cols-5 gap-4">
        <Card><CardContent className="py-3"><p className="text-[10px] text-muted-foreground">전체</p><p className="text-xl font-bold">{issues.length}</p></CardContent></Card>
        <Card><CardContent className="py-3"><p className="text-[10px] text-muted-foreground">평가 완료</p><p className="text-xl font-bold text-green-600">{assessed}</p></CardContent></Card>
        <Card><CardContent className="py-3"><p className="text-[10px] text-destructive font-medium">이중 중대</p><p className="text-xl font-bold text-destructive">{dualMaterial.length}</p></CardContent></Card>
        <Card><CardContent className="py-3"><p className="text-[10px] text-muted-foreground">영향/재무 중대</p><p className="text-xl font-bold text-primary">{impactOnly.length + financialOnly.length}</p></CardContent></Card>
        <Card><CardContent className="py-3"><p className="text-[10px] text-muted-foreground">보고 대상</p><p className="text-xl font-bold">{allMaterial.length}</p></CardContent></Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* 왼쪽: 이슈 평가 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">ESG 이슈 평가</CardTitle>
                <p className="text-sm text-muted-foreground">이슈를 클릭하면 질문형 평가가 열립니다.</p>
              </div>
              <div className="flex items-center gap-2">
                {issues.length === 0 && (
                  <Button size="sm" variant="outline" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                    <RefreshCw className="mr-1 h-3.5 w-3.5" /> 이슈 자동 생성
                  </Button>
                )}
                {hasEdits && (
                  <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
                    <Save className="mr-1 h-3.5 w-3.5" /> 저장 ({Object.keys(editScores).length}개)
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* 필터 */}
              <div className="mb-4 flex gap-1">
                {(["all", "environment", "social", "governance"] as const).map((d) => (
                  <button key={d} onClick={() => setDimFilter(d)}
                    className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      dimFilter === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    )}>{d === "all" ? "전체" : DIM_LABEL[d]}</button>
                ))}
              </div>

              {isLoading ? (
                <p className="text-sm text-muted-foreground">불러오는 중...</p>
              ) : filtered.length === 0 ? (
                <div className="py-8 text-center">
                  <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">등록된 이슈가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((issue) => {
                    const Icon = DIM_ICON[issue.dimension];
                    const colorClass = DIM_COLOR[issue.dimension];
                    const s = getEditScore(issue);
                    const impact = calcImpact(s);
                    const isEdited = !!editScores[issue.id];
                    const isMaterial = impact >= THRESHOLD || s.financial >= THRESHOLD;
                    const isDual = impact >= THRESHOLD && s.financial >= THRESHOLD;
                    const isExpanded = expandedId === issue.id;

                    return (
                      <div key={issue.id} className={cn(
                        "rounded-lg border transition-all",
                        isDual ? "border-destructive/40 bg-destructive/[0.03]" :
                        isMaterial ? "border-primary/30 bg-primary/[0.02]" :
                        isEdited ? "border-primary/20" : "border-border"
                      )}>
                        {/* 요약 행 (클릭하면 확장) */}
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left"
                        >
                          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", colorClass)}>
                            <Icon className="mr-0.5 inline h-3 w-3" />{DIM_LABEL[issue.dimension]}
                          </span>
                          <span className="flex-1 text-sm font-semibold">{issue.name}</span>
                          {isDual && <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[9px] font-bold text-destructive">이중 중대</span>}
                          {!isDual && isMaterial && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">보고 대상</span>}
                          <span className="text-xs text-muted-foreground">영향 <strong className="text-foreground">{impact.toFixed(1)}</strong></span>
                          <span className="text-xs text-muted-foreground">재무 <strong className="text-foreground">{s.financial.toFixed(1)}</strong></span>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </button>

                        {/* 질문형 평가 (확장 시) */}
                        {isExpanded && (
                          <div className="border-t border-border px-4 py-4 space-y-4">
                            {issue.description && <p className="text-xs text-muted-foreground">{issue.description}</p>}

                            <div>
                              <p className="text-xs font-semibold text-foreground mb-1.5">{QUESTIONS.scale.question}</p>
                              <QuestionSelector value={s.scale} onChange={(v) => handleChange(issue.id, "scale", v)} options={SEVERITY_OPTIONS} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground mb-1.5">{QUESTIONS.scope.question}</p>
                              <QuestionSelector value={s.scope} onChange={(v) => handleChange(issue.id, "scope", v)} options={SEVERITY_OPTIONS} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground mb-1.5">{QUESTIONS.irremediability.question}</p>
                              <QuestionSelector value={s.irremediability} onChange={(v) => handleChange(issue.id, "irremediability", v)} options={SEVERITY_OPTIONS} />
                            </div>

                            <div className="rounded-lg bg-muted/30 p-3">
                              <p className="text-[10px] text-muted-foreground mb-1">영향 중대성 = (규모 {s.scale} + 범위 {s.scope} + 복구불가성 {s.irremediability}) ÷ 3</p>
                              <p className="text-sm font-bold text-foreground">= {impact.toFixed(2)} {impact >= THRESHOLD ? "✓ 중대" : ""}</p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-foreground mb-1.5">{QUESTIONS.financial.question}</p>
                              <QuestionSelector value={s.financial} onChange={(v) => handleChange(issue.id, "financial", v)} options={FINANCIAL_OPTIONS} accent="border-blue-500 bg-blue-50 text-blue-700 font-bold" />
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                              <span>KPI {issue.kpiLinkedCount}개 연결</span>
                              {isEdited && <span className="text-primary font-medium">• 수정됨</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽: 매트릭스 + 보고 대상 */}
        <div className="lg:col-span-2 space-y-6">
          <MaterialityMatrix points={matrix} />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">보고 대상 이슈 (CSRD)</CardTitle>
              <p className="text-xs text-muted-foreground">영향 또는 재무 ≥ {THRESHOLD}</p>
            </CardHeader>
            <CardContent>
              {allMaterial.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">평가를 완료하면 표시됩니다.</p>
              ) : (
                <div className="space-y-1.5">
                  {dualMaterial.length > 0 && <p className="text-[10px] font-bold text-destructive mt-1 mb-0.5">이중 중대 ({dualMaterial.length})</p>}
                  {dualMaterial.map((i) => <IssueRow key={i.id} issue={i} impact={getImpact(i)} financial={getFinancial(i)} type="dual" />)}
                  {impactOnly.length > 0 && <p className="text-[10px] font-bold text-green-600 mt-2 mb-0.5">영향 중대 ({impactOnly.length})</p>}
                  {impactOnly.map((i) => <IssueRow key={i.id} issue={i} impact={getImpact(i)} financial={getFinancial(i)} type="impact" />)}
                  {financialOnly.length > 0 && <p className="text-[10px] font-bold text-blue-600 mt-2 mb-0.5">재무 중대 ({financialOnly.length})</p>}
                  {financialOnly.map((i) => <IssueRow key={i.id} issue={i} impact={getImpact(i)} financial={getFinancial(i)} type="financial" />)}
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
      <span className={cn("rounded px-1 py-0.5 text-[9px] font-bold", colorClass)}>{DIM_LABEL[issue.dimension].charAt(0)}</span>
      <span className="flex-1 text-xs font-medium">{issue.name}</span>
      <span className={cn("text-[10px]", type !== "financial" ? "font-bold" : "text-muted-foreground")}>영향 {impact.toFixed(1)}</span>
      <span className={cn("text-[10px]", type !== "impact" ? "font-bold" : "text-muted-foreground")}>재무 {financial.toFixed(1)}</span>
    </div>
  );
}
