"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { KpiSubNav } from "@/components/kpi/kpi-sub-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardActionBar } from "@/components/ui/card-action-bar";
import { getKpiBenchmark, suggestTargets } from "@/lib/kpi-benchmarks";
import { ChevronDown, ChevronUp, Info, Sparkles, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass =
  "h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-2 py-1 text-xs ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

function genId() {
  return "tgt-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
}

interface KpiMasterRow { id: string; esgDomain: string; code: string; name: string; description: string; category: string; unit: string; managementLevel?: string; }
interface TargetRow { id: string; kpiId: string; kpiName: string; kpiCode: string; category: string; unit: string; period: string; targetValue: number; }

const DOMAIN_LABEL: Record<string, string> = { environment: "(E)환경", social: "(S)사회", governance: "(G)거버넌스" };
const CURRENT_YEAR = String(new Date().getFullYear());
const PREV_YEAR = String(Number(CURRENT_YEAR) - 1);
const YEAR_OPTIONS = [PREV_YEAR, CURRENT_YEAR, String(Number(CURRENT_YEAR) + 1)];

export default function KpiTargetsPage() {
  const [period, setPeriod] = useState(CURRENT_YEAR);
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [industry, setIndustry] = useState("");

  useEffect(() => {
    try { const s = localStorage.getItem("esg_setup_wizard"); if (s) setIndustry(JSON.parse(s).organization?.industry ?? ""); } catch {}
  }, []);

  const queryClient = useQueryClient();
  const { data: masters = [], isLoading: mastersLoading } = useQuery<KpiMasterRow[]>({
    queryKey: ["kpi-master-all"],
    queryFn: () => fetch("/api/kpi?type=master").then((r) => r.json()),
  });
  const { data: targets = [], isLoading: targetsLoading } = useQuery<TargetRow[]>({
    queryKey: ["kpi-targets", period],
    queryFn: () => fetch(`/api/kpi?type=targets&period=${period}`).then((r) => r.json()),
  });
  // 전년도 실적
  const { data: prevPerf = [] } = useQuery<any[]>({
    queryKey: ["kpi-performance", PREV_YEAR],
    queryFn: () => fetch(`/api/kpi?type=performance&period=${PREV_YEAR}`).then((r) => r.json()),
  });
  const prevPerfMap = Object.fromEntries((prevPerf ?? []).map((p: any) => [p.kpiId, p.actualValue]));

  useEffect(() => {
    const map: Record<string, string> = {};
    targets.forEach((t) => { map[t.kpiId] = String(t.targetValue); });
    setValues(map);
    setIsEditing(false);
  }, [targets]);

  const saveMutation = useMutation({
    mutationFn: async (items: any[]) => {
      const res = await fetch("/api/kpi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save-targets", items }) });
      if (!res.ok) throw new Error("save failed");
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["kpi-targets", period] }); queryClient.invalidateQueries({ queryKey: ["kpi-list"] }); toast.success("저장되었습니다."); },
    onError: () => toast.error("처리에 실패했습니다."),
  });

  const handleSave = async () => {
    const existingMap = Object.fromEntries(targets.map((t) => [t.kpiId, t.id]));
    const items = masters.filter((m) => values[m.id] !== "" && values[m.id] !== undefined).map((m) => ({
      id: existingMap[m.id] ?? genId(), kpiId: m.id, period, targetValue: parseFloat(values[m.id]) || 0, updatedBy: null,
    }));
    await saveMutation.mutateAsync(items);
    setIsEditing(false);
  };

  const handleCancel = () => {
    const map: Record<string, string> = {};
    targets.forEach((t) => { map[t.kpiId] = String(t.targetValue); });
    setValues(map);
    setIsEditing(false);
  };

  const applyValue = (kpiId: string, value: number) => {
    setValues((prev) => ({ ...prev, [kpiId]: String(value) }));
    if (!isEditing) setIsEditing(true);
  };

  const isLoading = mastersLoading || targetsLoading;
  const grouped = masters.reduce<Record<string, KpiMasterRow[]>>((acc, m) => {
    const key = m.esgDomain || "environment";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const withTarget = Object.values(values).filter((v) => v && v !== "0").length;

  return (
    <>
      <PageHeader title="KPI 관리" description="ESG·탄소 핵심 성과 지표를 관리합니다.">
        <KpiSubNav />
      </PageHeader>

      <div className="mt-6 flex items-center gap-3">
        <label className="text-sm text-muted-foreground">기간</label>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
          {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}년</option>)}
        </select>
        <span className="text-xs text-muted-foreground">목표 설정: {withTarget}/{masters.length}개 완료</span>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader className="flex flex-col space-y-2 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                목표값 설정 <span className="font-normal text-muted-foreground">({period}년)</span>
              </CardTitle>
              <p className="text-[10px] text-muted-foreground">지표를 클릭하면 산업 벤치마크와 목표 제안을 확인할 수 있습니다.</p>
            </div>
            <CardActionBar isEditing={isEditing} hasSelection={true} onEdit={() => setIsEditing(true)} onCancel={handleCancel} onSave={handleSave} />
          </CardHeader>
          <CardContent>
            {isLoading ? <p className="text-sm text-muted-foreground">불러오는 중...</p> : masters.length === 0 ? (
              <p className="text-sm text-muted-foreground">등록된 KPI가 없습니다.</p>
            ) : (
              <div className="space-y-0">
                {/* 컬럼 헤더 */}
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b-2 border-border text-[10px] font-semibold text-muted-foreground">
                  <span className="w-6 shrink-0 text-center">#</span>
                  <span style={{ width: "18%" }} className="shrink-0">지표명</span>
                  <span style={{ width: "18%" }} className="shrink-0">설명</span>
                  <span className="w-14 shrink-0 text-center">관리 수준</span>
                  <span className="w-20 shrink-0">구분</span>
                  <span style={{ width: "12%" }} className="shrink-0">단위</span>
                  <span className="w-24 shrink-0 text-right">전년 실적</span>
                  <span className="w-28 shrink-0 text-center">목표값</span>
                  <span className="w-20 shrink-0 text-right">전년 대비</span>
                  <span className="w-3.5" />
                  <span className="w-3.5" />
                </div>
                {Object.entries(grouped).map(([domain, rows]) => (
                  <React.Fragment key={`group-${domain}`}>
                    <div className="bg-muted/50 px-3 py-2 text-xs font-bold text-foreground border-b border-border">
                      {DOMAIN_LABEL[domain] ?? domain} <span className="ml-1 font-normal text-muted-foreground">({rows.length})</span>
                    </div>
                    {rows.map((m, idx) => {
                      const hasTarget = values[m.id] && values[m.id] !== "0";
                      const isGeneral = !m.managementLevel || m.managementLevel === "general";
                      const isExpanded = expandedId === m.id;
                      const prevValue = prevPerfMap[m.id] as number | undefined;
                      const benchmark = getKpiBenchmark(m.name, industry);
                      const suggestions = prevValue && benchmark?.suggestedReductions ? suggestTargets(prevValue, benchmark.suggestedReductions) : null;

                      return (
                        <div key={m.id} className={cn("border-b border-border/30", isExpanded ? "bg-primary/[0.02]" : "")}>
                          {/* 메인 행 */}
                          <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => setExpandedId(isExpanded ? null : m.id)}
                          >
                            <span className="w-6 shrink-0 text-center text-xs text-muted-foreground">{idx + 1}</span>
                            <span style={{ width: "18%" }} className="shrink-0 text-xs font-medium truncate">{m.name}</span>
                            <span style={{ width: "18%" }} className="shrink-0 text-xs text-muted-foreground truncate">{m.description || "—"}</span>
                            <span className="w-14 shrink-0 text-center">
                              {m.managementLevel === "critical" ? (
                                <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[9px] font-bold text-destructive">의무</span>
                              ) : m.managementLevel === "material" ? (
                                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">중대</span>
                              ) : (
                                <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">일반</span>
                              )}
                            </span>
                            <span className="w-20 shrink-0 text-xs text-muted-foreground truncate">{m.category}</span>
                            <span style={{ width: "12%" }} className="shrink-0 text-xs text-muted-foreground">{m.unit || "—"}</span>
                            <span className="w-24 shrink-0 text-xs text-muted-foreground text-right">
                              {prevValue != null ? prevValue.toLocaleString() : "—"}
                            </span>
                            <div className="w-28 shrink-0" onClick={(e) => e.stopPropagation()}>
                              {isGeneral ? (
                                <span className="block text-center text-[10px] text-muted-foreground italic">모니터링</span>
                              ) : isEditing ? (
                                (() => {
                                  const defaultReduction = benchmark?.suggestedReductions?.[1] ?? 5;
                                  const suggested = prevValue ? Math.round(prevValue * (1 - defaultReduction / 100) * 1000) / 1000 : null;
                                  return (
                                    <input
                                      type="number" inputMode="decimal" step="any"
                                      value={values[m.id] ?? ""}
                                      onChange={(e) => { const v = e.target.value; if (v === "" || /^-?\d*\.?\d*$/.test(v)) setValues((prev) => ({ ...prev, [m.id]: v })); }}
                                      onFocus={(e) => { if (!values[m.id] && suggested) { setValues((prev) => ({ ...prev, [m.id]: String(suggested) })); e.target.select(); } }}
                                      placeholder={suggested ? `제안: ${suggested.toLocaleString()} (-${defaultReduction}%)` : "숫자 입력"}
                                      className={inputClass}
                                    />
                                  );
                                })()
                              ) : (
                                <span className={`block text-right text-xs tabular-nums ${hasTarget ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                                  {hasTarget ? Number(values[m.id]).toLocaleString() : "—"}
                                </span>
                              )}
                            </div>
                            <span className="w-20 shrink-0 text-right text-xs tabular-nums">
                              {(() => {
                                const targetVal = values[m.id] ? parseFloat(values[m.id]) : null;
                                if (prevValue == null || targetVal == null || prevValue === 0) return <span className="text-muted-foreground">—</span>;
                                const pct = ((targetVal - prevValue) / prevValue) * 100;
                                const sign = pct > 0 ? "+" : "";
                                return (
                                  <span className={cn("font-semibold", pct < 0 ? "text-green-600" : pct > 0 ? "text-destructive" : "text-muted-foreground")}>
                                    {sign}{pct.toFixed(1)}%
                                  </span>
                                );
                              })()}
                            </span>
                            {benchmark ? (
                              <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                            ) : (
                              <span className="w-3.5" />
                            )}
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                          </div>

                          {/* 확장 패널: 벤치마크 + 목표 제안 */}
                          {isExpanded && (
                            <div className="px-12 pb-3 space-y-3">
                              {/* 전년 실적 + 감축 제안 */}
                              {prevValue != null && suggestions && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                                  <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5 mb-2">
                                    <TrendingDown className="h-3.5 w-3.5" /> 전년 실적 기반 목표 제안
                                  </p>
                                  <p className="text-xs text-muted-foreground mb-2">전년도({PREV_YEAR}) 실적: <strong className="text-foreground">{prevValue.toLocaleString()} {m.unit}</strong></p>
                                  <div className="flex gap-2">
                                    {suggestions.map((s) => (
                                      <button key={s.label} type="button" onClick={() => applyValue(m.id, s.value)}
                                        className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-amber-100 transition-colors">
                                        {s.label} → <strong>{s.value.toLocaleString()}</strong>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 산업 벤치마크 */}
                              {benchmark && (
                                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                                  <p className="text-xs font-semibold text-primary flex items-center gap-1.5 mb-2">
                                    <Sparkles className="h-3.5 w-3.5" /> 산업 벤치마크{industry && ` (${industry})`}
                                  </p>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {benchmark.industryAvg && (
                                      <div><span className="text-muted-foreground">산업 평균:</span> <span className="font-medium">{benchmark.industryAvg}</span></div>
                                    )}
                                    {benchmark.bestPractice && (
                                      <div><span className="text-muted-foreground">우수 기업:</span> <span className="font-medium">{benchmark.bestPractice}</span></div>
                                    )}
                                    {benchmark.nationalTarget && (
                                      <div className="col-span-2"><span className="text-muted-foreground">국가/글로벌 목표:</span> <span className="font-medium">{benchmark.nationalTarget}</span></div>
                                    )}
                                  </div>
                                  <p className="mt-2 text-[10px] text-muted-foreground">출처: {benchmark.source}</p>
                                </div>
                              )}

                              {!benchmark && prevValue == null && (
                                <p className="text-xs text-muted-foreground">참고 데이터가 없습니다. 직접 목표값을 입력해 주세요.</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
