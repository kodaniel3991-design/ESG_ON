"use client";

import { useState, useMemo } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, Plus, X, Check, ExternalLink } from "lucide-react";
import {
  useEmissionFactors,
  useCreateEmissionFactor,
  useUpdateEmissionFactor,
  useDeleteEmissionFactor,
  type EmissionFactorRow,
  type EmissionFactorInput,
} from "@/hooks/use-emission-factors";
import {
  useEmissionFactorSources,
  useEmissionFactorSourceOptions,
  useCreateEmissionFactorSource,
  useUpdateEmissionFactorSource,
  useDeleteEmissionFactorSource,
  type EmissionFactorSourceRow,
  type EmissionFactorSourceInput,
} from "@/hooks/use-emission-factor-sources";

const SCOPE_LABELS: Record<number, string> = { 1: "Scope 1", 2: "Scope 2", 3: "Scope 3" };
const SOURCE_TYPE_OPTIONS = ["fixed", "mobile", "fugitive", "electricity", "steam", "activity", "기타"];
const CALC_METHOD_OPTIONS = ["Tier1", "Tier2", "Tier3", "Activity Based", "Spend Based", "Supplier Specific", "Market Based"];

function fmt(v: number | null | undefined, digits = 6) {
  if (v == null) return "-";
  return Number(v).toFixed(digits);
}

// ─────────────────────────────────────────────
// Emission Factor Form
// ─────────────────────────────────────────────

const EMPTY_FORM: Omit<EmissionFactorInput, "id"> = {
  factor_code: "",
  scope: 1,
  category_code: "",
  fuel_code: "",
  source_type: "fixed",
  country: "KR",
  year: 2024,
  source_name: "",
  source_version: "",
  valid_from: "",
  valid_to: "",
  calculation_method: "Tier1",
  co2_factor: null,
  co2_factor_unit: "",
  ch4_factor: null,
  ch4_factor_unit: "",
  n2o_factor: null,
  n2o_factor_unit: "",
  ncv: null,
  ncv_unit: "",
  carbon_content_factor: null,
  oxidation_factor: 1.0,
  gwp_ch4: 21.0,
  gwp_n2o: 310.0,
  source_id: null,
};

function rowToForm(row: EmissionFactorRow): Omit<EmissionFactorInput, "id"> {
  return {
    factor_code: row.factor_code,
    scope: row.scope,
    category_code: row.category_code ?? "",
    fuel_code: row.fuel_code ?? "",
    source_type: row.source_type ?? "fixed",
    country: row.country,
    year: row.year,
    source_name: row.source_name,
    source_version: row.source_version ?? "",
    valid_from: row.valid_from ? row.valid_from.slice(0, 10) : "",
    valid_to: row.valid_to ? row.valid_to.slice(0, 10) : "",
    calculation_method: row.calculation_method ?? "Tier1",
    co2_factor: row.co2_factor,
    co2_factor_unit: row.co2_factor_unit ?? "",
    ch4_factor: row.ch4_factor,
    ch4_factor_unit: row.ch4_factor_unit ?? "",
    n2o_factor: row.n2o_factor,
    n2o_factor_unit: row.n2o_factor_unit ?? "",
    ncv: row.ncv,
    ncv_unit: row.ncv_unit ?? "",
    carbon_content_factor: row.carbon_content_factor,
    oxidation_factor: row.oxidation_factor ?? 1.0,
    gwp_ch4: row.gwp_ch4 ?? 21.0,
    gwp_n2o: row.gwp_n2o ?? 310.0,
    source_id: (row as any).source_id ?? null,
  };
}

type FormState = typeof EMPTY_FORM;

interface FactorFormProps {
  initial: FormState;
  onSave: (form: FormState) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function FactorForm({ initial, onSave, onCancel, isSaving }: FactorFormProps) {
  const [form, setForm] = useState<FormState>(initial);
  const { data: sources = [] } = useEmissionFactorSourceOptions();
  const set = (k: keyof FormState, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  const num = (v: string) => (v === "" ? null : parseFloat(v));

  const inputCls = "h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring";
  const labelCls = "text-[11px] font-medium text-muted-foreground";

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-4">
      <p className="text-xs font-semibold text-foreground">배출계수 정보 입력</p>

      {/* 기본 정보 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="space-y-1">
          <label className={labelCls}>계수 코드 *</label>
          <input className={inputCls} value={form.factor_code} onChange={(e) => set("factor_code", e.target.value)} placeholder="S1-LNG-KR-2024" />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Scope *</label>
          <select className={inputCls} value={form.scope} onChange={(e) => set("scope", parseInt(e.target.value))}>
            <option value={1}>Scope 1</option>
            <option value={2}>Scope 2</option>
            <option value={3}>Scope 3</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelCls}>카테고리 코드</label>
          <input className={inputCls} value={form.category_code ?? ""} onChange={(e) => set("category_code", e.target.value)} placeholder="fixed, u1, u6..." />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>연료/에너지 코드</label>
          <input className={inputCls} value={form.fuel_code ?? ""} onChange={(e) => set("fuel_code", e.target.value)} placeholder="LNG, Diesel..." />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>배출원 유형</label>
          <select className={inputCls} value={form.source_type ?? ""} onChange={(e) => set("source_type", e.target.value)}>
            {SOURCE_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelCls}>국가</label>
          <input className={inputCls} value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="KR" />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>기준연도 *</label>
          <input type="number" className={inputCls} value={form.year} onChange={(e) => set("year", parseInt(e.target.value))} />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>산정방법</label>
          <select className={inputCls} value={form.calculation_method ?? ""} onChange={(e) => set("calculation_method", e.target.value)}>
            {CALC_METHOD_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* 출처 정보 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="space-y-1 sm:col-span-2">
          <label className={labelCls}>출처 (Source) *</label>
          <select
            className={inputCls}
            value={form.source_id ?? ""}
            onChange={(e) => {
              const sid = e.target.value === "" ? null : parseInt(e.target.value);
              const src = sources.find((s) => s.id === sid);
              set("source_id", sid);
              if (src) {
                set("source_name", src.document_name);
                set("source_version", src.version ?? "");
              }
            }}
          >
            <option value="">직접 입력 (출처 미등록)</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.source_code}] {s.publisher} — {s.document_name} ({s.year})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className={labelCls}>출처명 (직접 입력)</label>
          <input
            className={inputCls}
            value={form.source_name}
            onChange={(e) => set("source_name", e.target.value)}
            placeholder="출처를 선택하면 자동 입력됩니다"
          />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>버전</label>
          <input className={inputCls} value={form.source_version ?? ""} onChange={(e) => set("source_version", e.target.value)} placeholder="2024년판" />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>유효 시작일</label>
          <input type="date" className={inputCls} value={form.valid_from ?? ""} onChange={(e) => set("valid_from", e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>유효 종료일</label>
          <input type="date" className={inputCls} value={form.valid_to ?? ""} onChange={(e) => set("valid_to", e.target.value)} />
        </div>
      </div>

      {/* 배출계수 값 */}
      <div className="rounded-lg border border-border bg-card p-3 space-y-3">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">배출계수 (가스별)</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          <div className="space-y-1">
            <label className={labelCls}>CO₂ 계수</label>
            <input type="number" step="any" className={inputCls} value={form.co2_factor ?? ""} onChange={(e) => set("co2_factor", num(e.target.value))} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>CO₂ 단위</label>
            <input className={inputCls} value={form.co2_factor_unit ?? ""} onChange={(e) => set("co2_factor_unit", e.target.value)} placeholder="tCO2/Nm3" />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>CH₄ 계수</label>
            <input type="number" step="any" className={inputCls} value={form.ch4_factor ?? ""} onChange={(e) => set("ch4_factor", num(e.target.value))} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>CH₄ 단위</label>
            <input className={inputCls} value={form.ch4_factor_unit ?? ""} onChange={(e) => set("ch4_factor_unit", e.target.value)} placeholder="tCH4/Nm3" />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>N₂O 계수</label>
            <input type="number" step="any" className={inputCls} value={form.n2o_factor ?? ""} onChange={(e) => set("n2o_factor", num(e.target.value))} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>N₂O 단위</label>
            <input className={inputCls} value={form.n2o_factor_unit ?? ""} onChange={(e) => set("n2o_factor_unit", e.target.value)} placeholder="tN2O/Nm3" />
          </div>
        </div>
      </div>

      {/* 보조 값 */}
      <div className="rounded-lg border border-border bg-card p-3 space-y-3">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">보조 계수</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          <div className="space-y-1">
            <label className={labelCls}>NCV</label>
            <input type="number" step="any" className={inputCls} value={form.ncv ?? ""} onChange={(e) => set("ncv", num(e.target.value))} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>NCV 단위</label>
            <input className={inputCls} value={form.ncv_unit ?? ""} onChange={(e) => set("ncv_unit", e.target.value)} placeholder="MJ/Nm3" />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>탄소함유율</label>
            <input type="number" step="any" className={inputCls} value={form.carbon_content_factor ?? ""} onChange={(e) => set("carbon_content_factor", num(e.target.value))} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>산화율</label>
            <input type="number" step="any" className={inputCls} value={form.oxidation_factor ?? 1} onChange={(e) => set("oxidation_factor", num(e.target.value))} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>GWP CH₄</label>
            <input type="number" step="any" className={inputCls} value={form.gwp_ch4 ?? 21} onChange={(e) => set("gwp_ch4", num(e.target.value))} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>GWP N₂O</label>
            <input type="number" step="any" className={inputCls} value={form.gwp_n2o ?? 310} onChange={(e) => set("gwp_n2o", num(e.target.value))} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
          <X size={13} className="mr-1" /> 취소
        </Button>
        <Button size="sm" onClick={() => onSave(form)} disabled={isSaving || !form.factor_code || !form.source_name}>
          <Check size={13} className="mr-1" /> {isSaving ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Source Management Panel
// ─────────────────────────────────────────────

const EMPTY_SOURCE: EmissionFactorSourceInput = {
  source_code: "",
  publisher: "",
  document_name: "",
  document_url: null,
  country: "KR",
  year: 2024,
  version: null,
  notes: null,
  active: true,
};

function rowToSourceForm(row: EmissionFactorSourceRow): EmissionFactorSourceInput {
  return {
    source_code: row.source_code,
    publisher: row.publisher,
    document_name: row.document_name,
    document_url: row.document_url,
    country: row.country,
    year: row.year,
    version: row.version,
    notes: row.notes,
    active: row.active,
  };
}

function SourcesPanel() {
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [editTarget, setEditTarget] = useState<EmissionFactorSourceRow | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const { data: sources = [], isLoading } = useEmissionFactorSources(showInactive ? {} : { active: true });
  const createMutation = useCreateEmissionFactorSource();
  const updateMutation = useUpdateEmissionFactorSource();
  const deleteMutation = useDeleteEmissionFactorSource();

  const thCls = "px-3 py-2 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap";
  const tdCls = "px-3 py-2 text-xs";
  const inputCls = "h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring";
  const labelCls = "text-[11px] font-medium text-muted-foreground";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="h-3.5 w-3.5 rounded"
          />
          비활성 포함
        </label>
        {mode === "list" && (
          <Button size="sm" onClick={() => setMode("add")}>
            <Plus size={13} className="mr-1" /> 출처 추가
          </Button>
        )}
      </div>

      {/* 출처 폼 */}
      {(mode === "add" || mode === "edit") && (
        <SourceForm
          initial={mode === "edit" && editTarget ? rowToSourceForm(editTarget) : EMPTY_SOURCE}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onCancel={() => { setMode("list"); setEditTarget(null); }}
          onSave={(form) => {
            if (mode === "add") {
              createMutation.mutate(form, { onSuccess: () => setMode("list") });
            } else if (editTarget) {
              updateMutation.mutate({ ...editTarget, ...form }, {
                onSuccess: () => { setMode("list"); setEditTarget(null); },
              });
            }
          }}
        />
      )}

      {/* 출처 테이블 */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm" style={{ minWidth: 900 }}>
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <th className={thCls}>출처 코드</th>
              <th className={thCls}>발행 기관</th>
              <th className={thCls}>문서명</th>
              <th className={thCls}>국가</th>
              <th className={thCls}>연도</th>
              <th className={thCls}>버전</th>
              <th className={thCls}>URL</th>
              <th className={thCls}>비고</th>
              <th className={thCls}>상태</th>
              <th className={cn(thCls, "w-16")} />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-3 py-10 text-center text-xs text-muted-foreground">불러오는 중...</td>
              </tr>
            ) : sources.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-10 text-center text-xs text-muted-foreground">
                  등록된 출처가 없습니다.
                  <br />
                  <span className="mt-1 inline-block text-[11px]">
                    DB 초기화가 필요하면{" "}
                    <button
                      type="button"
                      className="text-primary underline"
                      onClick={() => fetch("/api/db-init", { method: "POST" }).then(() => window.location.reload())}
                    >
                      /api/db-init 실행
                    </button>
                    하세요.
                  </span>
                </td>
              </tr>
            ) : (
              sources.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border/50 last:border-0 transition-colors hover:bg-muted/30",
                    !row.active && "opacity-50",
                  )}
                >
                  <td className={cn(tdCls, "font-mono font-medium text-[11px]")}>{row.source_code}</td>
                  <td className={tdCls}>{row.publisher}</td>
                  <td className={cn(tdCls, "max-w-[260px] truncate")} title={row.document_name}>{row.document_name}</td>
                  <td className={tdCls}>{row.country}</td>
                  <td className={tdCls}>{row.year}</td>
                  <td className={cn(tdCls, "text-muted-foreground")}>{row.version ?? "-"}</td>
                  <td className={tdCls}>
                    {row.document_url ? (
                      <a href={row.document_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        링크 <ExternalLink size={10} />
                      </a>
                    ) : "-"}
                  </td>
                  <td className={cn(tdCls, "max-w-[160px] truncate text-muted-foreground text-[11px]")} title={row.notes ?? ""}>{row.notes ?? "-"}</td>
                  <td className={tdCls}>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                      row.active
                        ? "border border-border bg-green-50 text-carbon-success"
                        : "border border-border/50 bg-muted text-muted-foreground",
                    )}>
                      {row.active ? "활성" : "비활성"}
                    </span>
                  </td>
                  <td className={cn(tdCls, "text-center")}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => { setEditTarget(row); setMode("edit"); }}
                        className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!confirm(`"${row.source_code}" 출처를 비활성화하시겠습니까?`)) return;
                          deleteMutation.mutate(row.id);
                        }}
                        className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-muted-foreground">
        총 {sources.length}개 출처 · 삭제 버튼은 비활성 처리(soft delete)합니다 · 출처는 배출계수에 FK로 연결됩니다.
      </p>
    </div>
  );
}

interface SourceFormProps {
  initial: EmissionFactorSourceInput;
  onSave: (form: EmissionFactorSourceInput) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function SourceForm({ initial, onSave, onCancel, isSaving }: SourceFormProps) {
  const [form, setForm] = useState<EmissionFactorSourceInput>(initial);
  const set = (k: keyof EmissionFactorSourceInput, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  const inputCls = "h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring";
  const labelCls = "text-[11px] font-medium text-muted-foreground";

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-4">
      <p className="text-xs font-semibold text-foreground">출처 정보 입력</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="space-y-1">
          <label className={labelCls}>출처 코드 *</label>
          <input className={inputCls} value={form.source_code} onChange={(e) => set("source_code", e.target.value)} placeholder="NIER-2023" />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>발행 기관 *</label>
          <input className={inputCls} value={form.publisher} onChange={(e) => set("publisher", e.target.value)} placeholder="국립환경과학원" />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>국가</label>
          <input className={inputCls} value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="KR" />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>발행연도 *</label>
          <input type="number" className={inputCls} value={form.year} onChange={(e) => set("year", parseInt(e.target.value))} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className={labelCls}>문서명 *</label>
          <input className={inputCls} value={form.document_name} onChange={(e) => set("document_name", e.target.value)} placeholder="국가 고유 배출계수 목록" />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>버전</label>
          <input className={inputCls} value={form.version ?? ""} onChange={(e) => set("version", e.target.value || null)} placeholder="2023년판" />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>상태</label>
          <select className={inputCls} value={form.active ? "1" : "0"} onChange={(e) => set("active", e.target.value === "1")}>
            <option value="1">활성</option>
            <option value="0">비활성</option>
          </select>
        </div>
        <div className="space-y-1 sm:col-span-4">
          <label className={labelCls}>문서 URL</label>
          <input className={inputCls} value={form.document_url ?? ""} onChange={(e) => set("document_url", e.target.value || null)} placeholder="https://..." />
        </div>
        <div className="space-y-1 sm:col-span-4">
          <label className={labelCls}>비고</label>
          <input className={inputCls} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value || null)} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
          <X size={13} className="mr-1" /> 취소
        </Button>
        <Button size="sm" onClick={() => onSave(form)} disabled={isSaving || !form.source_code || !form.publisher || !form.document_name}>
          <Check size={13} className="mr-1" /> {isSaving ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Factors Panel (main list)
// ─────────────────────────────────────────────

function FactorsPanel() {
  const [scopeFilter, setScopeFilter] = useState<number | "all">("all");
  const [showInactive, setShowInactive] = useState(false);
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [editTarget, setEditTarget] = useState<EmissionFactorRow | null>(null);
  const { data: sources = [] } = useEmissionFactorSourceOptions();

  const queryParams = useMemo(
    () => ({
      scope: scopeFilter !== "all" ? scopeFilter : undefined,
      active: showInactive ? undefined : true,
    }),
    [scopeFilter, showInactive],
  );

  const { data: factors = [], isLoading } = useEmissionFactors(queryParams);
  const createMutation = useCreateEmissionFactor();
  const updateMutation = useUpdateEmissionFactor();
  const deleteMutation = useDeleteEmissionFactor();

  const sourceMap = useMemo(() => {
    const m: Record<number, EmissionFactorSourceRow> = {};
    for (const s of sources) m[s.id] = s;
    return m;
  }, [sources]);

  const handleSaveNew = (form: FormState) => {
    createMutation.mutate({ ...form, active: true }, { onSuccess: () => setMode("list") });
  };

  const handleSaveEdit = (form: FormState) => {
    if (!editTarget) return;
    updateMutation.mutate({ ...editTarget, ...form }, {
      onSuccess: () => { setMode("list"); setEditTarget(null); },
    });
  };

  const handleDelete = (row: EmissionFactorRow) => {
    if (!confirm(`"${row.factor_code}" 계수를 비활성화하시겠습니까?`)) return;
    deleteMutation.mutate(row.id);
  };

  const thCls = "px-3 py-2 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap";
  const tdCls = "px-3 py-2 text-xs";

  return (
    <div className="space-y-4">
      {/* 필터 + 액션 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5">
            {(["all", 1, 2, 3] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScopeFilter(s)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  scopeFilter === s
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s === "all" ? "전체" : SCOPE_LABELS[s]}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-3.5 w-3.5 rounded"
            />
            비활성 포함
          </label>
        </div>
        {mode === "list" && (
          <Button size="sm" onClick={() => setMode("add")}>
            <Plus size={13} className="mr-1" /> 배출계수 추가
          </Button>
        )}
      </div>

      {/* 추가 폼 */}
      {mode === "add" && (
        <FactorForm
          initial={EMPTY_FORM}
          onSave={handleSaveNew}
          onCancel={() => setMode("list")}
          isSaving={createMutation.isPending}
        />
      )}

      {/* 수정 폼 */}
      {mode === "edit" && editTarget && (
        <FactorForm
          initial={rowToForm(editTarget)}
          onSave={handleSaveEdit}
          onCancel={() => { setMode("list"); setEditTarget(null); }}
          isSaving={updateMutation.isPending}
        />
      )}

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm" style={{ minWidth: 1500 }}>
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <th className={thCls}>계수 코드</th>
              <th className={thCls}>Scope</th>
              <th className={thCls}>카테고리</th>
              <th className={thCls}>연료/에너지</th>
              <th className={thCls}>배출원 유형</th>
              <th className={thCls}>기준연도</th>
              <th className={thCls}>산정방법</th>
              <th className={cn(thCls, "text-right")}>CO₂ 계수</th>
              <th className={thCls}>CO₂ 단위</th>
              <th className={cn(thCls, "text-right")}>CH₄ 계수</th>
              <th className={cn(thCls, "text-right")}>N₂O 계수</th>
              <th className={cn(thCls, "text-right")}>GWP CH₄</th>
              <th className={cn(thCls, "text-right")}>GWP N₂O</th>
              <th className={cn(thCls, "text-right")}>NCV</th>
              <th className={thCls}>출처</th>
              <th className={thCls}>유효기간</th>
              <th className={thCls}>상태</th>
              <th className={cn(thCls, "w-16")} />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={18} className="px-3 py-10 text-center text-xs text-muted-foreground">
                  불러오는 중...
                </td>
              </tr>
            ) : factors.length === 0 ? (
              <tr>
                <td colSpan={18} className="px-3 py-10 text-center text-xs text-muted-foreground">
                  등록된 배출계수가 없습니다.
                  <br />
                  <span className="mt-1 inline-block text-[11px]">
                    DB 초기화가 필요하면{" "}
                    <button
                      type="button"
                      className="text-primary underline"
                      onClick={() => fetch("/api/db-init", { method: "POST" }).then(() => window.location.reload())}
                    >
                      /api/db-init 실행
                    </button>
                    하세요.
                  </span>
                </td>
              </tr>
            ) : (
              factors.map((row) => {
                const src = (row as any).source_id ? sourceMap[(row as any).source_id] : null;
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-border/50 last:border-0 transition-colors hover:bg-muted/30",
                      !row.active && "opacity-50",
                    )}
                  >
                    <td className={cn(tdCls, "font-mono font-medium text-[11px]")}>{row.factor_code}</td>
                    <td className={tdCls}>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                        row.scope === 1 ? "bg-taupe-50 text-carbon-warning border border-border" :
                        row.scope === 2 ? "bg-primary/10 text-primary border border-primary/30" :
                        "bg-primary/10 text-primary border border-primary/30",
                      )}>
                        S{row.scope}
                      </span>
                    </td>
                    <td className={cn(tdCls, "text-muted-foreground")}>{row.category_code ?? "-"}</td>
                    <td className={tdCls}>{row.fuel_code ?? "-"}</td>
                    <td className={cn(tdCls, "text-muted-foreground")}>{row.source_type ?? "-"}</td>
                    <td className={tdCls}>{row.year}</td>
                    <td className={cn(tdCls, "text-muted-foreground")}>{row.calculation_method ?? "-"}</td>
                    <td className={cn(tdCls, "text-right font-mono")}>{fmt(row.co2_factor, 6)}</td>
                    <td className={cn(tdCls, "text-muted-foreground text-[11px]")}>{row.co2_factor_unit ?? "-"}</td>
                    <td className={cn(tdCls, "text-right font-mono text-muted-foreground")}>{fmt(row.ch4_factor, 6)}</td>
                    <td className={cn(tdCls, "text-right font-mono text-muted-foreground")}>{fmt(row.n2o_factor, 6)}</td>
                    <td className={cn(tdCls, "text-right text-muted-foreground")}>{fmt(row.gwp_ch4, 1)}</td>
                    <td className={cn(tdCls, "text-right text-muted-foreground")}>{fmt(row.gwp_n2o, 1)}</td>
                    <td className={cn(tdCls, "text-right text-muted-foreground")}>{row.ncv != null ? `${fmt(row.ncv, 2)} ${row.ncv_unit ?? ""}` : "-"}</td>
                    <td className={cn(tdCls, "max-w-[200px]")}>
                      {src ? (
                        <span className="flex flex-col gap-0" title={`${src.publisher} — ${src.document_name}`}>
                          <span className="font-mono text-[10px] text-primary">{src.source_code}</span>
                          <span className="truncate text-[10px] text-muted-foreground">{src.publisher}</span>
                        </span>
                      ) : (
                        <span className="truncate text-[11px] text-muted-foreground" title={row.source_name}>{row.source_name || "-"}</span>
                      )}
                    </td>
                    <td className={cn(tdCls, "text-[11px] text-muted-foreground whitespace-nowrap")}>
                      {row.valid_from ? row.valid_from.slice(0, 10) : "-"}
                      {row.valid_to ? ` ~ ${row.valid_to.slice(0, 10)}` : ""}
                    </td>
                    <td className={tdCls}>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                        row.active
                          ? "border border-border bg-green-50 text-carbon-success"
                          : "border border-border/50 bg-muted text-muted-foreground",
                      )}>
                        {row.active ? "활성" : "비활성"}
                      </span>
                    </td>
                    <td className={cn(tdCls, "text-center")}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => { setEditTarget(row); setMode("edit"); }}
                          className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-muted-foreground">
        총 {factors.length}개 계수 · 삭제 버튼은 비활성 처리(soft delete)합니다 · DB 변경 후 각 Scope 페이지에서 자동 반영됩니다.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

type PageTab = "factors" | "sources";

export default function EmissionFactorMasterPage() {
  const [activeTab, setActiveTab] = useState<PageTab>("factors");

  return (
    <PageShell
      title="배출계수 마스터"
      description="Scope 1·2·3 배출량 산정에 사용되는 배출계수 및 출처를 등록·관리합니다."
    >
      {/* 탭 */}
      <div className="mb-5 inline-flex rounded-lg border border-border bg-muted/30 p-0.5">
        {(["factors", "sources"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-medium transition-colors",
              activeTab === tab
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab === "factors" ? "배출계수" : "출처 관리"}
          </button>
        ))}
      </div>

      {activeTab === "factors" ? <FactorsPanel /> : <SourcesPanel />}
    </PageShell>
  );
}
