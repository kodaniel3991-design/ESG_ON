"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMaterialityIssues, getMaterialitySettings } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { MaterialitySubNav } from "@/components/materiality/materiality-sub-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MaterialityIssue, MaterialityEsgDimension } from "@/types";

const DIM_LABEL: Record<MaterialityEsgDimension, string> = { environment: "환경", social: "사회", governance: "거버넌스" };
const DIM_COLOR: Record<MaterialityEsgDimension, string> = { environment: "text-green-600 bg-green-100", social: "text-blue-600 bg-blue-100", governance: "text-amber-700 bg-amber-100" };

const inputClass = "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

interface Settings {
  threshold: number;
  period: string;
  year: number;
  assessmentName: string;
}

export default function MaterialitySettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery<Settings>({ queryKey: ["materiality-settings"], queryFn: getMaterialitySettings });
  const { data: issues = [] } = useQuery<MaterialityIssue[]>({ queryKey: ["materiality-issues"], queryFn: getMaterialityIssues });

  const [form, setForm] = useState<Settings | null>(null);
  const currentForm = form ?? settings ?? { threshold: 3.5, period: "annual", year: 2026, assessmentName: "" };

  const [addForm, setAddForm] = useState({ name: "", dimension: "environment" as string, description: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  // 설정 저장
  const saveMutation = useMutation({
    mutationFn: async (s: Settings) => {
      const res = await fetch("/api/materiality", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save-settings", settings: s }) });
      if (!res.ok) throw new Error("");
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["materiality-settings"] }); setForm(null); toast.success("설정이 저장되었습니다."); },
    onError: () => toast.error("저장에 실패했습니다."),
  });

  // 이슈 삭제
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/materiality", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete-issue", id }) });
      if (!res.ok) throw new Error("");
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["materiality-issues"] }); toast.success("이슈가 삭제되었습니다."); },
  });

  // 이슈 추가
  const addMutation = useMutation({
    mutationFn: async (item: { name: string; dimension: string; description: string }) => {
      const code = `${item.dimension === "environment" ? "ENV" : item.dimension === "social" ? "SOC" : "GOV"}-C${Date.now().toString(36).slice(-4).toUpperCase()}`;
      const id = `mat-custom-${code}`;
      const res = await fetch("/api/materiality", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ id, code, name: item.name, dimension: item.dimension, description: item.description, expertScore: 3, benchmarkScore: 3 }] }),
      });
      if (!res.ok) throw new Error("");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materiality-issues"] });
      setShowAddForm(false);
      setAddForm({ name: "", dimension: "environment", description: "" });
      toast.success("이슈가 추가되었습니다.");
    },
  });

  const handleFormChange = (field: keyof Settings, value: any) => {
    setForm({ ...currentForm, [field]: value });
  };

  return (
    <div>
      <PageHeader title="이중 중대성 평가" description="ESG 이슈의 영향 중대성과 재무 중대성을 단계별로 평가합니다 — CSRD/GRI 기준">
        <MaterialitySubNav />
      </PageHeader>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 평가 기준 설정 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">평가 기준 설정</CardTitle>
              <p className="text-xs text-muted-foreground">보고 대상 기준선, 평가 주기, 기준 연도</p>
            </div>
            {form && (
              <Button size="sm" onClick={() => saveMutation.mutate(currentForm)} disabled={saveMutation.isPending}>
                <Save className="mr-1 h-3.5 w-3.5" /> 저장
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">평가명</label>
              <input value={currentForm.assessmentName} onChange={(e) => handleFormChange("assessmentName", e.target.value)} placeholder="예: 2026년 중대성 평가" className={inputClass} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">보고 대상 기준선</label>
                <select value={currentForm.threshold} onChange={(e) => handleFormChange("threshold", parseFloat(e.target.value))} className={inputClass}>
                  <option value={3}>3.0 이상</option>
                  <option value={3.5}>3.5 이상 (CSRD 권장)</option>
                  <option value={4}>4.0 이상</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">평가 주기</label>
                <select value={currentForm.period} onChange={(e) => handleFormChange("period", e.target.value)} className={inputClass}>
                  <option value="annual">연 1회</option>
                  <option value="semi-annual">반기</option>
                  <option value="quarterly">분기</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">기준 연도</label>
                <select value={currentForm.year} onChange={(e) => handleFormChange("year", parseInt(e.target.value))} className={inputClass}>
                  {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}년</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 평가 이력 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">평가 이력</CardTitle>
            <p className="text-xs text-muted-foreground">과거 평가 결과 요약</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{currentForm.year}년 평가</p>
                  <p className="text-xs text-muted-foreground">{issues.length}개 이슈 · 평가 완료 {issues.filter((i) => i.impactScore != null).length}개</p>
                </div>
                <span className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">현재</span>
              </div>
              <p className="text-center text-xs text-muted-foreground py-2">이전 평가 이력이 없습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 이슈 관리 */}
      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">이슈 관리</CardTitle>
              <p className="text-xs text-muted-foreground">평가 대상 이슈를 추가하거나 불필요한 이슈를 삭제할 수 있습니다.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)} disabled={showAddForm}>
              <Plus className="mr-1 h-3.5 w-3.5" /> 커스텀 이슈 추가
            </Button>
          </CardHeader>
          <CardContent>
            {/* 추가 폼 */}
            {showAddForm && (
              <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                <p className="text-xs font-semibold text-primary">새 이슈 추가</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">영역</label>
                    <select value={addForm.dimension} onChange={(e) => setAddForm((p) => ({ ...p, dimension: e.target.value }))} className={inputClass}>
                      <option value="environment">환경 (E)</option>
                      <option value="social">사회 (S)</option>
                      <option value="governance">거버넌스 (G)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">이슈명 *</label>
                    <input value={addForm.name} onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))} placeholder="예: 기후 적응" className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">설명</label>
                    <input value={addForm.description} onChange={(e) => setAddForm((p) => ({ ...p, description: e.target.value }))} placeholder="이슈 설명" className={inputClass} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => addMutation.mutate(addForm)} disabled={!addForm.name.trim() || addMutation.isPending}>추가</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>취소</Button>
                </div>
              </div>
            )}

            {/* 이슈 목록 */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-2 font-medium">영역</th>
                    <th className="py-2 pr-2 font-medium">코드</th>
                    <th className="py-2 pr-2 font-medium">이슈명</th>
                    <th className="py-2 pr-2 font-medium">설명</th>
                    <th className="py-2 pr-2 font-medium text-center">KPI 연결</th>
                    <th className="py-2 pr-2 font-medium text-center">영향</th>
                    <th className="py-2 pr-2 font-medium text-center">재무</th>
                    <th className="py-2 font-medium w-16">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {issues.map((issue) => {
                    const color = DIM_COLOR[issue.dimension];
                    return (
                      <tr key={issue.id} className="hover:bg-muted/30">
                        <td className="py-2 pr-2"><span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold", color)}>{DIM_LABEL[issue.dimension].charAt(0)}</span></td>
                        <td className="py-2 pr-2 text-muted-foreground">{issue.code}</td>
                        <td className="py-2 pr-2 font-medium">{issue.name}</td>
                        <td className="py-2 pr-2 text-muted-foreground truncate max-w-[200px]">{issue.description}</td>
                        <td className="py-2 pr-2 text-center">{issue.kpiLinkedCount}</td>
                        <td className="py-2 pr-2 text-center">{issue.impactScore?.toFixed(1) ?? "—"}</td>
                        <td className="py-2 pr-2 text-center">{issue.financialScore?.toFixed(1) ?? "—"}</td>
                        <td className="py-2">
                          <button
                            onClick={() => { if (confirm(`"${issue.name}" 이슈를 삭제하시겠습니까?`)) deleteMutation.mutate(issue.id); }}
                            className="rounded p-1 hover:bg-destructive/10" title="삭제"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
