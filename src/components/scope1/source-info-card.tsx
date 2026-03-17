"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export interface FacilityRow {
  id: string;
  facilityName: string;
  fuelName: string;
  unit: string;
  dataMethod: string;
}

export const FUEL_OPTIONS = ["LNG", "Diesel", "Gasoline", "중유", "LPG", "석탄", "기타"];
export const UNIT_OPTIONS = ["Nm3", "L", "kg", "ton", "MJ", "kWh", "기타"];
export const DATA_METHOD_OPTIONS = [
  "직접측정", "구매영수증", "청구서", "고지서", "거래명세서", "미터기", "계산값", "추정값", "기타",
];

function genId() {
  return `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export const INITIAL_FACILITY_ROWS_BY_CATEGORY: Record<string, FacilityRow[]> = {
  fixed: [
    { id: "f-1", facilityName: "보일러", fuelName: "LNG", unit: "Nm3", dataMethod: "청구서" },
    { id: "f-2", facilityName: "발전기", fuelName: "Diesel", unit: "L", dataMethod: "구매영수증" },
    { id: "f-3", facilityName: "용해로", fuelName: "LNG", unit: "Nm3", dataMethod: "미터기" },
  ],
  mobile: [
    { id: "f-m1", facilityName: "업무용 승용차", fuelName: "Gasoline", unit: "L", dataMethod: "구매영수증" },
    { id: "f-m2", facilityName: "배송 밴", fuelName: "Diesel", unit: "L", dataMethod: "구매영수증" },
    { id: "f-m3", facilityName: "화물 트럭", fuelName: "Diesel", unit: "L", dataMethod: "청구서" },
  ],
  fugitive: [
    { id: "f-g1", facilityName: "공정 배출 설비", fuelName: "LNG", unit: "Nm3", dataMethod: "계산값" },
    { id: "f-g2", facilityName: "냉동·냉장 설비", fuelName: "기타", unit: "kg", dataMethod: "추정값" },
  ],
};

// Keep backward compat alias
export const INITIAL_FACILITY_ROWS: FacilityRow[] = INITIAL_FACILITY_ROWS_BY_CATEGORY.fixed;

interface SourceInfoCardProps {
  rows: FacilityRow[];
  onRowsChange: (rows: FacilityRow[]) => void;
  selectedId: string;
  onSelect: (id: string) => void;
  onSave?: (rows: FacilityRow[]) => void;
  isSaving?: boolean;
  savedFromDb?: boolean;
}

export function SourceInfoCard({
  rows,
  onRowsChange,
  selectedId,
  onSelect,
  onSave,
  isSaving = false,
  savedFromDb = false,
}: SourceInfoCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (savedFromDb) setIsSaved(true);
  }, [savedFromDb]);

  const updateRow = (id: string, field: keyof FacilityRow, value: string) => {
    onRowsChange(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const addRow = () => {
    const newRow: FacilityRow = {
      id: genId(),
      facilityName: "",
      fuelName: "LNG",
      unit: "Nm3",
      dataMethod: "청구서",
    };
    onRowsChange([...rows, newRow]);
    onSelect(newRow.id);
    setIsSaved(false);
  };

  const deleteRow = (id: string) => {
    const next = rows.filter((r) => r.id !== id);
    onRowsChange(next);
    if (selectedId === id) onSelect(next[0]?.id ?? "");
    setIsSaved(false);
  };

  return (
    <section className="flex h-full flex-col space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-foreground">배출원 정보</h2>
          <p className="text-xs text-muted-foreground">
            배출시설을 선택하면 해당 시설의 월별 데이터를 입력할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSaved ? (
            <Button size="sm" variant="outline" onClick={() => setIsSaved(false)}>
              수정
            </Button>
          ) : (
            <Button
              size="sm"
              variant="default"
              onClick={() => { setIsSaved(true); onSave?.(rows); }}
              disabled={rows.length === 0 || isSaving}
            >
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          )}
          {!isSaved && (
            <Button size="sm" variant="outline" onClick={addRow}>
              + 행 추가
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <th className="px-3 py-2 text-left font-medium">배출시설명</th>
              <th className="px-3 py-2 text-left font-medium">연료명</th>
              <th className="px-3 py-2 text-left font-medium">단위</th>
              <th className="px-3 py-2 text-left font-medium">자료 수집방법</th>
              {!isSaved && <th className="w-8 px-2 py-2" />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-xs text-muted-foreground">
                  배출시설을 추가해 주세요.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isSelected = row.id === selectedId;
                return (
                  <tr
                    key={row.id}
                    onClick={() => onSelect(row.id)}
                    className={cn(
                      "cursor-pointer border-b border-border/50 last:border-0 transition-colors",
                      isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : "hover:bg-muted/40",
                    )}
                  >
                    {/* 배출시설명 */}
                    <td className="px-2 py-1.5" onClick={() => onSelect(row.id)}>
                      {isSaved ? (
                        <span className="block px-2 py-1.5 text-xs">{row.facilityName || "—"}</span>
                      ) : (
                        <input
                          type="text"
                          value={row.facilityName}
                          onChange={(e) => updateRow(row.id, "facilityName", e.target.value)}
                          placeholder="시설명 입력"
                          className={cn(
                            "h-8 w-full rounded-md border bg-transparent px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring",
                            isSelected ? "border-primary/40" : "border-input",
                          )}
                        />
                      )}
                    </td>
                    {/* 연료명 */}
                    <td className="px-2 py-1.5" onClick={() => onSelect(row.id)}>
                      {isSaved ? (
                        <span className="block px-2 py-1.5 text-xs text-muted-foreground">{row.fuelName}</span>
                      ) : (
                        <select
                          value={row.fuelName}
                          onChange={(e) => updateRow(row.id, "fuelName", e.target.value)}
                          className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          {FUEL_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      )}
                    </td>
                    {/* 단위 */}
                    <td className="px-2 py-1.5" onClick={() => onSelect(row.id)}>
                      {isSaved ? (
                        <span className="block px-2 py-1.5 text-xs text-muted-foreground">{row.unit}</span>
                      ) : (
                        <select
                          value={row.unit}
                          onChange={(e) => updateRow(row.id, "unit", e.target.value)}
                          className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                      )}
                    </td>
                    {/* 자료 수집방법 */}
                    <td className="px-2 py-1.5" onClick={() => onSelect(row.id)}>
                      {isSaved ? (
                        <span className="block px-2 py-1.5 text-xs text-muted-foreground">{row.dataMethod}</span>
                      ) : (
                        <select
                          value={row.dataMethod}
                          onChange={(e) => updateRow(row.id, "dataMethod", e.target.value)}
                          className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          {DATA_METHOD_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      )}
                    </td>
                    {/* 삭제 */}
                    {!isSaved && (
                      <td className="px-2 py-1.5 text-center" onClick={() => onSelect(row.id)}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); deleteRow(row.id); }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
