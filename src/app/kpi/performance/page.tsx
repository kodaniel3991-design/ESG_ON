"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { KpiSubNav } from "@/components/kpi/kpi-sub-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardActionBar } from "@/components/ui/card-action-bar";

const inputClass =
  "h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-2 py-1 text-xs ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring text-right";

function genId() {
  return "prf-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
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
  targetValue: number;
}

interface PerfRow {
  id: string;
  kpiId: string;
  actualValue: number;
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

function calcAchievement(actual: string, targetVal: number | undefined): string {
  if (!actual || !targetVal) return "—";
  const pct = (parseFloat(actual) / targetVal) * 100;
  if (isNaN(pct)) return "—";
  return pct.toFixed(1) + "%";
}

export default function KpiPerformancePage() {
  const [period, setPeriod] = useState(CURRENT_YEAR);
  const [isEditing, setIsEditing] = useState(false);
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

  const { data: perfs = [], isLoading: perfsLoading } = useQuery<PerfRow[]>({
    queryKey: ["kpi-performance", period],
    queryFn: () => fetch(`/api/kpi?type=performance&period=${period}`).then((r) => r.json()),
  });

  useEffect(() => {
    const map: Record<string, string> = {};
    perfs.forEach((p) => {
      map[p.kpiId] = String(p.actualValue);
    });
    setValues(map);
    setIsEditing(false);
  }, [perfs]);

  const saveMutation = useMutation({
    mutationFn: async (items: any[]) => {
      const res = await fetch("/api/kpi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-performance", items }),
      });
      if (!res.ok) throw new Error("save failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpi-performance", period] });
      queryClient.invalidateQueries({ queryKey: ["kpi-list"] });
      toast.success("저장되었습니다.");
    },
    onError: () => {
      toast.error("처리에 실패했습니다.");
    },
  });

  const handleSave = async () => {
    const existingMap = Object.fromEntries(perfs.map((p) => [p.kpiId, p.id]));
    const items = masters
      .filter((m) => values[m.id] !== "" && values[m.id] !== undefined)
      .map((m) => ({
        id: existingMap[m.id] ?? genId(),
        kpiId: m.id,
        period,
        actualValue: parseFloat(values[m.id]) || 0,
        updatedBy: null,
      }));
    await saveMutation.mutateAsync(items);
    setIsEditing(false);
  };

  const handleCancel = () => {
    const map: Record<string, string> = {};
    perfs.forEach((p) => {
      map[p.kpiId] = String(p.actualValue);
    });
    setValues(map);
    setIsEditing(false);
  };

  const targetMap = Object.fromEntries(targets.map((t) => [t.kpiId, t.targetValue]));

  const isLoading = mastersLoading || targetsLoading || perfsLoading;

  const grouped = masters.reduce<Record<string, KpiMasterRow[]>>((acc, m) => {
    const key = m.esgDomain || "environment";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <>
      <PageHeader title="KPI 실적관리" description="기간별 KPI 실적을 입력하고 관리합니다.">
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
              실적값 입력{" "}
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
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="w-16 pb-2 pr-2 font-medium">코드</th>
                      <th className="pb-2 pr-2 font-medium">지표명</th>
                      <th className="w-28 pb-2 pr-2 font-medium">구분</th>
                      <th className="w-16 pb-2 pr-2 font-medium">단위</th>
                      <th className="w-28 pb-2 pr-2 text-right font-medium">목표값</th>
                      <th className="w-28 pb-2 pr-2 text-right font-medium">실적값</th>
                      <th className="w-20 pb-2 text-right font-medium">달성률</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {Object.entries(grouped).map(([domain, rows]) => (
                      <>
                        <tr key={`header-${domain}`}>
                          <td
                            colSpan={7}
                            className="bg-muted/40 px-1 py-1.5 text-xs font-semibold text-muted-foreground"
                          >
                            {DOMAIN_LABEL[domain] ?? domain}
                          </td>
                        </tr>
                        {rows.map((m) => {
                          const targetVal = targetMap[m.id];
                          const achievement = calcAchievement(values[m.id] ?? "", targetVal);
                          return (
                            <tr key={m.id} className="align-middle">
                              <td className="py-1.5 pr-2 font-mono text-muted-foreground">{m.code}</td>
                              <td className="py-1.5 pr-2 font-medium">{m.name || "—"}</td>
                              <td className="py-1.5 pr-2 text-muted-foreground">{m.category}</td>
                              <td className="py-1.5 pr-2 text-muted-foreground">{m.unit}</td>
                              <td className="py-1.5 pr-2 text-right tabular-nums text-muted-foreground">
                                {targetVal != null ? Number(targetVal).toLocaleString() : "—"}
                              </td>
                              <td className="py-1.5 pr-2">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={values[m.id] ?? ""}
                                    onChange={(e) =>
                                      setValues((prev) => ({ ...prev, [m.id]: e.target.value }))
                                    }
                                    placeholder="실적값 입력"
                                    className={inputClass}
                                  />
                                ) : (
                                  <span className="block text-right tabular-nums">
                                    {values[m.id] ? Number(values[m.id]).toLocaleString() : "—"}
                                  </span>
                                )}
                              </td>
                              <td className="py-1.5 text-right tabular-nums">
                                <span
                                  className={
                                    achievement === "—"
                                      ? "text-muted-foreground"
                                      : parseFloat(achievement) >= 90
                                      ? "text-carbon-success"
                                      : parseFloat(achievement) >= 70
                                      ? "text-yellow-600"
                                      : "text-carbon-danger"
                                  }
                                >
                                  {achievement}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </>
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
