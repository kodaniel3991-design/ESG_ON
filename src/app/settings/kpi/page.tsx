"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardActionBar } from "@/components/ui/card-action-bar";

const inputClass = "h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-2 py-1 text-xs ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring";
type EsgDomain = "environment" | "social" | "governance";
interface KpiItem { id: string; esgDomain: string; code: string; name: string; category: string; unit: string; description: string; reportIncluded: boolean; }
const TABS: { domain: EsgDomain; label: string }[] = [
  { domain: "environment", label: "(E)환경" },
  { domain: "social",      label: "(S)사회" },
  { domain: "governance",  label: "(G)거버넌스" },
];
const CATEGORY_OPTIONS: Record<EsgDomain, string[]> = {
  environment: ["에너지","온실가스","폐기물","물","생물다양성","기타"],
  social:      ["인력","안전보건","교육훈련","다양성","인권","지역사회","기타"],
  governance:  ["이사회","윤리경영","리스크관리","공시","주주","기타"],
};
function genId() { return "kpi-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,6); }
function genCode(domain: EsgDomain, items: KpiItem[]) {
  const prefix = domain === "environment" ? "E" : domain === "social" ? "S" : "G";
  const max = items.reduce((n,it) => { const m = it.code.match(/\d+$/); return m ? Math.max(n,parseInt(m[0])) : n; }, 0);
  return prefix + "-" + String(max+1).padStart(3,"0");
}
async function fetchKpis(domain: EsgDomain): Promise<KpiItem[]> {
  const res = await fetch("/api/kpi?type=master&domain=" + domain);
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}
async function saveKpis(items: KpiItem[]) {
  const res = await fetch("/api/kpi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save-master", items }) });
  if (!res.ok) throw new Error("save failed");
}
async function deleteKpi(id: string) {
  const res = await fetch("/api/kpi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete-master", id }) });
  if (!res.ok) throw new Error("delete failed");
}

export default function SettingsKPIPage() {
  const [activeDomain, setActiveDomain] = useState<EsgDomain>("environment");
  const queryClient = useQueryClient();
  const { data: serverKpis = [], isLoading } = useQuery<KpiItem[]>({
    queryKey: ["kpi-master", activeDomain],
    queryFn: () => fetchKpis(activeDomain),
  });
  const [localKpis, setLocalKpis] = useState<KpiItem[]>([]);
  const [localDomain, setLocalDomain] = useState<EsgDomain | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const items = localDomain === activeDomain ? localKpis : serverKpis;
  if (localDomain !== activeDomain && !isLoading) { setLocalKpis(serverKpis); setLocalDomain(activeDomain); }
  const saveMutation = useMutation({ mutationFn: saveKpis, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kpi-master", activeDomain] }) });
  const deleteMutation = useMutation({ mutationFn: deleteKpi, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kpi-master", activeDomain] }) });
  const switchDomain = (domain: EsgDomain) => { setActiveDomain(domain); setSelectedId(null); setEditingId(null); setLocalDomain(null); };
  const handleAdd = () => {
    const newItem: KpiItem = { id: genId(), esgDomain: activeDomain, code: genCode(activeDomain, items), name: "", category: CATEGORY_OPTIONS[activeDomain][0], unit: "", description: "", reportIncluded: true };
    setLocalKpis([...items, newItem]); setLocalDomain(activeDomain); setSelectedId(newItem.id); setEditingId(newItem.id);
  };
  const handleEdit = () => { if (selectedId) setEditingId(selectedId); };
  const handleCancel = () => { setEditingId(null); setLocalKpis(serverKpis); setLocalDomain(activeDomain); };
  const handleSave = async () => { await saveMutation.mutateAsync(items); setEditingId(null); };
  const handleDelete = async () => {
    if (!selectedId) return;
    const isNew = !serverKpis.find((k) => k.id === selectedId);
    if (!isNew) await deleteMutation.mutateAsync(selectedId);
    setLocalKpis(items.filter((k) => k.id !== selectedId)); setLocalDomain(activeDomain); setSelectedId(null); setEditingId(null);
  };
  const updateItem = (id: string, field: keyof KpiItem, value: any) => {
    setLocalKpis(items.map((k) => (k.id === id ? { ...k, [field]: value } : k))); setLocalDomain(activeDomain);
  };

  return (
    <>
      <PageHeader title="KPI 마스터" description="ESG 도메인별 KPI 지표를 정의하고 관리합니다." />
      <div className="mt-6 flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button key={tab.domain} onClick={() => switchDomain(tab.domain)}
            className={"px-4 py-2 text-sm font-medium transition-colors " + (activeDomain === tab.domain ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground")}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <Card>
          <CardHeader className="flex flex-col space-y-2 pb-3">
            <CardTitle className="text-sm font-semibold">
              {TABS.find((t) => t.domain === activeDomain)?.label} 지표 목록{" "}
              <span className="font-normal text-muted-foreground">({items.length})</span>
            </CardTitle>
            <CardActionBar isEditing={!!editingId} hasSelection={!!selectedId} onEdit={handleEdit} onCancel={handleCancel} onDelete={handleDelete} onSave={handleSave} adds={[{ label: "추가", onClick: handleAdd }]} />
          </CardHeader>
          <CardContent>
            {isLoading ? <p className="text-sm text-muted-foreground">불러오는 중...</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="w-24 pb-2 pr-2 font-medium">코드</th>
                      <th className="pb-2 pr-2 font-medium">지표명</th>
                      <th className="w-28 pb-2 pr-2 font-medium">카테고리</th>
                      <th className="w-20 pb-2 pr-2 font-medium">단위</th>
                      <th className="pb-2 pr-2 font-medium">설명</th>
                      <th className="w-20 pb-2 text-center font-medium">보고서포함</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {items.length === 0 ? (
                      <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">지표를 추가해 주세요.</td></tr>
                    ) : items.map((kpi) => {
                      const isEditing = editingId === kpi.id;
                      const isSelected = selectedId === kpi.id;
                      return (
                        <tr key={kpi.id} onClick={() => { if (!isEditing) setSelectedId(kpi.id); }}
                          className={"cursor-pointer align-middle transition-colors " + (isSelected ? "bg-accent" : "hover:bg-muted/50")}>
                          <td className="py-1.5 pr-2">
                            {isEditing ? <input value={kpi.code} onChange={(e) => updateItem(kpi.id,"code",e.target.value)} className={inputClass} onClick={(e) => e.stopPropagation()} /> : <span className="font-mono text-muted-foreground">{kpi.code}</span>}
                          </td>
                          <td className="py-1.5 pr-2">
                            {isEditing ? <input autoFocus value={kpi.name} onChange={(e) => updateItem(kpi.id,"name",e.target.value)} placeholder="지표명 입력" className={inputClass} onClick={(e) => e.stopPropagation()} /> : <span className="font-medium">{kpi.name || "—"}</span>}
                          </td>
                          <td className="py-1.5 pr-2">
                            {isEditing ? (
                              <select value={kpi.category} onChange={(e) => updateItem(kpi.id,"category",e.target.value)} className={inputClass} onClick={(e) => e.stopPropagation()}>
                                {CATEGORY_OPTIONS[activeDomain].map((c) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            ) : kpi.category}
                          </td>
                          <td className="py-1.5 pr-2">
                            {isEditing ? <input value={kpi.unit} onChange={(e) => updateItem(kpi.id,"unit",e.target.value)} placeholder="단위" className={inputClass} onClick={(e) => e.stopPropagation()} /> : (kpi.unit || "—")}
                          </td>
                          <td className="py-1.5 pr-2">
                            {isEditing ? <input value={kpi.description} onChange={(e) => updateItem(kpi.id,"description",e.target.value)} placeholder="설명 (선택)" className={inputClass} onClick={(e) => e.stopPropagation()} /> : <span className="text-muted-foreground">{kpi.description || "—"}</span>}
                          </td>
                          <td className="py-1.5 text-center">
                            {isEditing ? (
                              <input type="checkbox" checked={kpi.reportIncluded} onChange={(e) => updateItem(kpi.id,"reportIncluded",e.target.checked)} className="h-4 w-4 cursor-pointer accent-primary" onClick={(e) => e.stopPropagation()} />
                            ) : <span className={kpi.reportIncluded ? "text-primary" : "text-muted-foreground"}>{kpi.reportIncluded ? "✓" : "—"}</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}