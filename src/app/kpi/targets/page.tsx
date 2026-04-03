"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { KpiSubNav } from "@/components/kpi/kpi-sub-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardActionBar } from "@/components/ui/card-action-bar";

const inputClass =
  "h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-2 py-1 text-xs ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring text-right";

function genId() {
  return "tgt-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
}

interface KpiMasterRow {
  id: string;
  esgDomain: string;
  code: string;
  name: string;
  category: string;
  unit: string;
}

interface TargetRow {
  id: string;
  kpiId: string;
  kpiName: string;
  kpiCode: string;
  category: string;
  unit: string;
  period: string;
  targetValue: number;
}

const DOMAIN_LABEL: Record<string, string> = {
  environment: "(E)환경",
  social: "(S)사회",
  governance: "(G)거버넌스",
};

const CURRENT_YEAR = String(new Date().getFullYear());
const YEAR_OPTIONS = [
  String(Number(CURRENT_YEAR) - 1),
  CURRENT_YEAR,
  String(Number(CURRENT_YEAR) + 1),
];

export default function KpiTargetsPage() {
  const [period, setPeriod] = useState(CURRENT_YEAR);
  const [isEditing, setIsEditing] = useState(false);
  // kpiId → inputValue (string)
  const [values, setValues] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  const { data: masters = [], isLoading: mastersLoading } = useQuery<KpiMasterRow[]>({
    queryKey: ["kpi-master-all"],
    queryFn: () => fetch("/api/kpi?type=master").then((r) => r.json()),
  });

  const { data: targets = [], isLoading: targetsLoading } = useQuery<TargetRow[]>({
    queryKey: ["kpi-targets", period],
    queryFn: () => fetch(`/api/kpi?type=targets&period=${period}`).then((r) => r.json()),
  });

  // Sync server data → local values whenever period or targets change
  useEffect(() => {
    const map: Record<string, string> = {};
    targets.forEach((t) => {
      map[t.kpiId] = String(t.targetValue);
    });
    setValues(map);
    setIsEditing(false);
  }, [targets]);

  const saveMutation = useMutation({
    mutationFn: async (items: any[]) => {
      const res = await fetch("/api/kpi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-targets", items }),
      });
      if (!res.ok) throw new Error("save failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpi-targets", period] });
      queryClient.invalidateQueries({ queryKey: ["kpi-list"] });
      toast.success("저장되었습니다.");
    },
    onError: () => {
      toast.error("처리에 실패했습니다.");
    },
  });

  const handleSave = async () => {
    const existingMap = Object.fromEntries(targets.map((t) => [t.kpiId, t.id]));
    const items = masters
      .filter((m) => values[m.id] !== "" && values[m.id] !== undefined)
      .map((m) => ({
        id: existingMap[m.id] ?? genId(),
        kpiId: m.id,
        period,
        targetValue: parseFloat(values[m.id]) || 0,
        updatedBy: null,
      }));
    await saveMutation.mutateAsync(items);
    setIsEditing(false);
  };

  const handleCancel = () => {
    const map: Record<string, string> = {};
    targets.forEach((t) => {
      map[t.kpiId] = String(t.targetValue);
    });
    setValues(map);
    setIsEditing(false);
  };

  const isLoading = mastersLoading || targetsLoading;

  // Group masters by domain
  const grouped = masters.reduce<Record<string, KpiMasterRow[]>>((acc, m) => {
    const key = m.esgDomain || "environment";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <>
      <PageHeader title="KPI 목표관리" description="기간별 KPI 목표를 설정하고 관리합니다.">
        <KpiSubNav />
      </PageHeader>

      <div className="mt-6 flex items-center gap-3">
        <label className="text-sm text-muted-foreground">기간</label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader className="flex flex-col space-y-2 pb-3">
            <CardTitle className="text-sm font-semibold">
              목표값 설정{" "}
              <span className="font-normal text-muted-foreground">({period}년)</span>
            </CardTitle>
            <CardActionBar
              isEditing={isEditing}
              hasSelection={true}
              onEdit={() => setIsEditing(true)}
              onCancel={handleCancel}
              onSave={handleSave}
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">불러오는 중...</p>
            ) : masters.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                등록된 KPI가 없습니다. 설정 &gt; KPI 마스터에서 지표를 추가해 주세요.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-2 border-border text-left text-muted-foreground bg-muted/30">
                      <th className="w-8 py-2.5 px-3 font-semibold text-center">#</th>
                      <th className="py-2.5 px-3 font-semibold">지표명</th>
                      <th className="w-20 py-2.5 px-3 font-semibold">구분</th>
                      <th className="w-24 py-2.5 px-3 font-semibold">단위</th>
                      <th className="w-32 py-2.5 px-3 text-right font-semibold">목표값</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(grouped).map(([domain, rows]) => (
                      <React.Fragment key={`group-${domain}`}>
                        <tr>
                          <td colSpan={5} className="bg-muted/50 px-3 py-2 text-xs font-bold text-foreground border-b border-border">
                            {DOMAIN_LABEL[domain] ?? domain}
                            <span className="ml-2 font-normal text-muted-foreground">({rows.length})</span>
                          </td>
                        </tr>
                        {rows.map((m, idx) => {
                          const hasTarget = values[m.id] && values[m.id] !== "0";
                          return (
                            <tr key={m.id} className={`border-b border-border/30 transition-colors ${isEditing ? "hover:bg-primary/[0.02]" : "hover:bg-muted/30"}`}>
                              <td className="py-2 px-3 text-center text-muted-foreground">{idx + 1}</td>
                              <td className="py-2 px-3">
                                <span className="font-medium text-foreground">{m.name}</span>
                              </td>
                              <td className="py-2 px-3 text-muted-foreground">{m.category}</td>
                              <td className="py-2 px-3 text-muted-foreground">{m.unit || "—"}</td>
                              <td className="py-2 px-3">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={values[m.id] ?? ""}
                                    onChange={(e) =>
                                      setValues((prev) => ({ ...prev, [m.id]: e.target.value }))
                                    }
                                    placeholder="목표값 입력"
                                    className={inputClass}
                                  />
                                ) : (
                                  <span className={`block text-right tabular-nums ${hasTarget ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                                    {hasTarget ? Number(values[m.id]).toLocaleString() : "—"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
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
