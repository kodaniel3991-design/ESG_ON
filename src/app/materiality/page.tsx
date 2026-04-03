"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMaterialityIssues, getMaterialityMatrix, saveMaterialityIssues } from "@/services/api";
import { getMaterialityScoreRecommendation } from "@/lib/ai-recommendations";
import { PageHeader } from "@/components/layout/page-header";
import { MaterialitySubNav } from "@/components/materiality/materiality-sub-nav";
import { MaterialityMatrix } from "@/components/materiality/materiality-matrix";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Users, Scale, Save, RefreshCw, AlertTriangle, Sparkles, ChevronDown, ChevronUp, ArrowLeft, ArrowRight, Check, ClipboardCheck, BarChart3, FileText } from "lucide-react";
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

const STEPS = [
  { step: 1, title: "이슈 확인", subtitle: "평가 대상 ESG 이슈", icon: ClipboardCheck },
  { step: 2, title: "영향 중대성", subtitle: "규모·범위·복구불가성", icon: Leaf },
  { step: 3, title: "재무 중대성", subtitle: "기업 리스크/기회", icon: BarChart3 },
  { step: 4, title: "결과 확인", subtitle: "매트릭스 · 보고 대상", icon: FileText },
];

const SEVERITY_OPTIONS = [
  { value: 1, label: "경미", desc: "거의 영향 없음" },
  { value: 2, label: "보통", desc: "제한적 영향" },
  { value: 3, label: "유의", desc: "눈에 띄는 영향" },
  { value: 4, label: "심각", desc: "상당한 영향" },
  { value: 5, label: "치명적", desc: "극심한 영향" },
];
const FINANCIAL_OPTIONS = [
  { value: 1, label: "거의 없음", desc: "재무 영향 미미" },
  { value: 2, label: "낮음", desc: "소규모 비용 영향" },
  { value: 3, label: "보통", desc: "관리 필요 수준" },
  { value: 4, label: "높음", desc: "상당한 재무 리스크" },
  { value: 5, label: "매우 높음", desc: "사업 지속성 위협" },
];

interface EditScore { scale: number; scope: number; irremediability: number; financial: number; }
function calcImpact(s: EditScore) { return Math.round(((s.scale + s.scope + s.irremediability) / 3) * 100) / 100; }

function QuestionSelector({ value, onChange, options, accent }: {
  value: number; onChange: (v: number) => void; options: typeof SEVERITY_OPTIONS; accent?: string;
}) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
          className={cn("flex-1 rounded-md border px-1 py-1.5 text-center transition-all",
            value === opt.value ? accent ?? "border-primary bg-primary/10 text-primary font-bold" : "border-border text-muted-foreground hover:border-primary/40"
          )}>
          <p className="text-[11px] font-semibold">{opt.label}</p>
          <p className="text-[9px] opacity-70">{opt.desc}</p>
        </button>
      ))}
    </div>
  );
}

export default function MaterialityDashboardPage() {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [industry, setIndustry] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("esg_setup_wizard");
      if (saved) { const parsed = JSON.parse(saved); setIndustry(parsed.organization?.industry ?? ""); }
    } catch { /* noop */ }
  }, []);

  const { data: issues = [], isLoading } = useQuery<MaterialityIssue[]>({
    queryKey: ["materiality-issues"], queryFn: getMaterialityIssues,
  });
  const { data: matrix = [] } = useQuery({ queryKey: ["materiality-matrix"], queryFn: getMaterialityMatrix });

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
    mutationFn: async () => { const r = await fetch("/api/materiality?type=generate"); if (!r.ok) throw new Error(""); return r.json(); },
    onSuccess: (d) => { queryClient.invalidateQueries({ queryKey: ["materiality-issues"] }); toast.success(`${d.count}개 이슈 생성`); },
  });

  const getScore = (issue: MaterialityIssue): EditScore => {
    if (editScores[issue.id]) return editScores[issue.id];
    return { scale: issue.impactScale ?? 3, scope: issue.impactScope ?? 3, irremediability: issue.impactIrremediability ?? 3, financial: issue.financialScore ?? 3 };
  };

  const handleChange = (id: string, field: keyof EditScore, value: number) => {
    const issue = issues.find((i) => i.id === id);
    if (!issue) return;
    setEditScores((prev) => ({ ...prev, [id]: { ...getScore(issue), [field]: value } }));
  };

  const applyAiScores = () => {
    const scores: Record<string, EditScore> = {};
    for (const issue of issues) {
      scores[issue.id] = getMaterialityScoreRecommendation(industry, issue.kpiGroup ?? issue.name);
    }
    setEditScores(scores);
    toast.success(`${issues.length}개 이슈에 AI 추천 점수 적용됨`);
  };

  const handleSave = () => {
    const updated = issues.filter((i) => editScores[i.id]).map((i) => {
      const s = editScores[i.id];
      return { ...i, impactScale: s.scale, impactScope: s.scope, impactIrremediability: s.irremediability, impactScore: calcImpact(s), financialScore: s.financial };
    });
    if (updated.length > 0) saveMutation.mutate(updated);
  };

  const getImpact = (i: MaterialityIssue) => editScores[i.id] ? calcImpact(editScores[i.id]) : (i.impactScore ?? 0);
  const getFinancial = (i: MaterialityIssue) => editScores[i.id]?.financial ?? i.financialScore ?? 0;

  const dualMaterial = issues.filter((i) => getImpact(i) >= THRESHOLD && getFinancial(i) >= THRESHOLD);
  const impactOnly = issues.filter((i) => getImpact(i) >= THRESHOLD && getFinancial(i) < THRESHOLD);
  const financialOnly = issues.filter((i) => getImpact(i) < THRESHOLD && getFinancial(i) >= THRESHOLD);
  const allMaterial = [...dualMaterial, ...impactOnly, ...financialOnly];
  const assessed = issues.filter((i) => i.impactScore != null && i.financialScore != null).length;
  const completionPct = issues.length > 0 ? Math.round((currentStep / STEPS.length) * 100) : 0;

  return (
    <div data-page="materiality-dashboard">
      <PageHeader title="이중 중대성 평가" description="ESG 이슈의 영향 중대성과 재무 중대성을 단계별로 평가합니다.">
        <MaterialitySubNav />
      </PageHeader>

      {/* 진행률 + 스텝 표시 */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">중대성 평가 진행</h2>
            <p className="text-sm text-muted-foreground">
              {issues.length}개 이슈 · 평가 완료 {assessed}개 · 보고 대상 {allMaterial.length}개
            </p>
          </div>
          <span className="text-2xl font-bold text-primary">{completionPct}%</span>
        </div>
        <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-2.5 rounded-full bg-primary transition-all duration-500" style={{ width: `${completionPct}%` }} />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = currentStep === s.step;
            const isDone = currentStep > s.step;
            return (
              <div key={s.step} className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setCurrentStep(s.step)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium transition-colors",
                    isActive ? "bg-primary text-primary-foreground" :
                    isDone ? "bg-primary/10 text-primary border border-primary/20" :
                    "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  <div className="text-left">
                    <p className="font-bold">{s.step}. {s.title}</p>
                    <p className="text-[10px] opacity-80">{s.subtitle}</p>
                  </div>
                </button>
                {i < STEPS.length - 1 && <span className="text-muted-foreground">›</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: 이슈 확인 */}
      {currentStep === 1 && (
        <div className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">① 평가 대상 ESG 이슈 확인</CardTitle>
                <p className="text-sm text-muted-foreground">KPI 카탈로그 그룹 기반으로 {issues.length}개 이슈가 자동 생성되었습니다.</p>
              </div>
              <div className="flex gap-2">
                {issues.length === 0 && (
                  <Button size="sm" variant="outline" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                    <RefreshCw className="mr-1 h-3.5 w-3.5" /> 이슈 자동 생성
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={applyAiScores}>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" /> AI 추천 점수 적용{industry && ` (${industry})`}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? <p className="text-sm text-muted-foreground">불러오는 중...</p> : issues.length === 0 ? (
                <div className="py-8 text-center"><AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-2 text-sm text-muted-foreground">이슈가 없습니다.</p></div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {["environment", "social", "governance"].map((dim) => {
                    const dimIssues = issues.filter((i) => i.dimension === dim);
                    const Icon = DIM_ICON[dim as MaterialityEsgDimension];
                    const color = DIM_COLOR[dim as MaterialityEsgDimension];
                    return (
                      <div key={dim} className="rounded-lg border border-border p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={cn("rounded px-2 py-1 text-xs font-bold", color)}><Icon className="mr-1 inline h-3.5 w-3.5" />{DIM_LABEL[dim as MaterialityEsgDimension]}</span>
                          <span className="text-sm text-muted-foreground">{dimIssues.length}개 이슈</span>
                        </div>
                        <div className="space-y-1.5">
                          {dimIssues.map((issue) => (
                            <div key={issue.id} className="flex items-center justify-between rounded border border-border/50 px-3 py-1.5 text-xs">
                              <span className="font-medium">{issue.name}</span>
                              <span className="text-muted-foreground">KPI {issue.kpiLinkedCount}개</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: 영향 중대성 평가 */}
      {currentStep === 2 && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">② 영향 중대성 평가 (GRI 심각성 3요소)</CardTitle>
              <p className="text-sm text-muted-foreground">각 이슈가 환경·사회에 미치는 영향의 규모, 범위, 복구불가성을 평가해 주세요.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {issues.map((issue) => {
                const Icon = DIM_ICON[issue.dimension];
                const color = DIM_COLOR[issue.dimension];
                const s = getScore(issue);
                const impact = calcImpact(s);
                const isExpanded = expandedId === issue.id;

                return (
                  <div key={issue.id} className={cn("rounded-lg border transition-all", impact >= THRESHOLD ? "border-green-300 bg-green-50/30" : "border-border")}>
                    <button type="button" onClick={() => setExpandedId(isExpanded ? null : issue.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                      <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", color)}><Icon className="mr-0.5 inline h-3 w-3" />{DIM_LABEL[issue.dimension]}</span>
                      <span className="flex-1 text-sm font-semibold">{issue.name}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", impact >= THRESHOLD ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground")}>
                        영향 {impact.toFixed(1)}
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    {isExpanded && (
                      <div className="border-t border-border px-4 py-4 space-y-4">
                        <div><p className="text-xs font-semibold mb-1.5">이 이슈의 영향이 얼마나 심각한가요? <span className="text-muted-foreground font-normal">(규모)</span></p>
                          <QuestionSelector value={s.scale} onChange={(v) => handleChange(issue.id, "scale", v)} options={SEVERITY_OPTIONS} /></div>
                        <div><p className="text-xs font-semibold mb-1.5">영향을 받는 대상 범위가 얼마나 넓은가요? <span className="text-muted-foreground font-normal">(범위)</span></p>
                          <QuestionSelector value={s.scope} onChange={(v) => handleChange(issue.id, "scope", v)} options={SEVERITY_OPTIONS} /></div>
                        <div><p className="text-xs font-semibold mb-1.5">발생 시 원상복구가 가능한가요? <span className="text-muted-foreground font-normal">(복구불가성)</span></p>
                          <QuestionSelector value={s.irremediability} onChange={(v) => handleChange(issue.id, "irremediability", v)} options={SEVERITY_OPTIONS} /></div>
                        <div className="rounded-lg bg-muted/30 p-3">
                          <p className="text-[10px] text-muted-foreground">({s.scale} + {s.scope} + {s.irremediability}) ÷ 3</p>
                          <p className="text-sm font-bold">= {impact.toFixed(2)} {impact >= THRESHOLD ? "✓ 중대" : ""}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: 재무 중대성 평가 */}
      {currentStep === 3 && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">③ 재무 중대성 평가</CardTitle>
              <p className="text-sm text-muted-foreground">각 이슈가 기업 재무에 미치는 리스크와 기회 수준을 평가해 주세요.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {issues.map((issue) => {
                const Icon = DIM_ICON[issue.dimension];
                const color = DIM_COLOR[issue.dimension];
                const s = getScore(issue);
                const isExpanded = expandedId === issue.id;

                return (
                  <div key={issue.id} className={cn("rounded-lg border transition-all", s.financial >= THRESHOLD ? "border-blue-300 bg-blue-50/30" : "border-border")}>
                    <button type="button" onClick={() => setExpandedId(isExpanded ? null : issue.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                      <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", color)}><Icon className="mr-0.5 inline h-3 w-3" />{DIM_LABEL[issue.dimension]}</span>
                      <span className="flex-1 text-sm font-semibold">{issue.name}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", s.financial >= THRESHOLD ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground")}>
                        재무 {s.financial.toFixed(1)}
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    {isExpanded && (
                      <div className="border-t border-border px-4 py-4 space-y-4">
                        {issue.description && <p className="text-xs text-muted-foreground">{issue.description}</p>}
                        <div><p className="text-xs font-semibold mb-1.5">이 이슈가 기업 재무에 미치는 리스크/기회는 어느 수준인가요?</p>
                          <QuestionSelector value={s.financial} onChange={(v) => handleChange(issue.id, "financial", v)} options={FINANCIAL_OPTIONS} accent="border-blue-500 bg-blue-50 text-blue-700 font-bold" /></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: 결과 확인 */}
      {currentStep === 4 && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <MaterialityMatrix points={matrix} />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">④ 보고 대상 이슈 (CSRD 기준)</CardTitle>
                <p className="text-xs text-muted-foreground">영향 또는 재무 ≥ {THRESHOLD} → 보고 대상</p>
              </div>
              {hasEdits && (
                <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
                  <Save className="mr-1 h-3.5 w-3.5" /> 평가 결과 저장
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {allMaterial.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">평가를 완료하면 보고 대상이 표시됩니다.</p>
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

              {/* 요약 통계 */}
              <div className="mt-4 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
                <p>전체 {issues.length}개 이슈 중 <strong className="text-foreground">{allMaterial.length}개</strong> 보고 대상</p>
                <p>이중 중대 <strong className="text-destructive">{dualMaterial.length}</strong> · 영향 중대 <strong className="text-green-600">{impactOnly.length}</strong> · 재무 중대 <strong className="text-blue-600">{financialOnly.length}</strong></p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 네비게이션 버튼 */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentStep((p) => Math.max(1, p - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors disabled:opacity-30"
        >
          <ArrowLeft className="h-4 w-4" /> 이전
        </button>
        <div className="flex items-center gap-3">
          {hasEdits && currentStep < 4 && (
            <Button size="sm" variant="outline" onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="mr-1 h-3.5 w-3.5" /> 중간 저장
            </Button>
          )}
          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep((p) => Math.min(4, p + 1))}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              다음: {STEPS[currentStep]?.title} <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <Button onClick={handleSave} disabled={saveMutation.isPending || !hasEdits}>
              <Save className="mr-1.5 h-4 w-4" /> 평가 완료 및 저장
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function IssueRow({ issue, impact, financial, type }: { issue: MaterialityIssue; impact: number; financial: number; type: "dual" | "impact" | "financial" }) {
  const color = DIM_COLOR[issue.dimension];
  return (
    <div className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5">
      <span className={cn("rounded px-1 py-0.5 text-[9px] font-bold", color)}>{DIM_LABEL[issue.dimension].charAt(0)}</span>
      <span className="flex-1 text-xs font-medium">{issue.name}</span>
      <span className={cn("text-[10px]", type !== "financial" ? "font-bold" : "text-muted-foreground")}>영향 {impact.toFixed(1)}</span>
      <span className={cn("text-[10px]", type !== "impact" ? "font-bold" : "text-muted-foreground")}>재무 {financial.toFixed(1)}</span>
    </div>
  );
}
