"use client";

import { useMemo, useState } from "react";
import { Scope2Header } from "@/components/scope2/scope2-header";
import { Scope2CategorySidebar } from "@/components/scope2/category-sidebar";
import {
  Scope2SourceInfoCard,
  INITIAL_SCOPE2_ROWS,
  type Scope2FacilityRow,
} from "@/components/scope2/source-info-card";
import { Scope2SourceExamples } from "@/components/scope2/source-examples";
import { Scope2MonthlyActivityTable } from "@/components/scope2/monthly-activity-table";
import { ValidationInsightsCard } from "@/components/scope1/validation-insights-card";
import { EmissionTrendCard } from "@/components/scope1/emission-trend-card";
import { AuditLogTable } from "@/components/scope1/audit-log-table";
import { ActionFooter } from "@/components/scope1/action-footer";
import { SCOPE2_AUDIT_LOGS, SCOPE2_CATEGORIES } from "@/lib/scope2-mock-data";
import type { Scope2CategoryId } from "@/types/scope2";
import { SCOPE1_DEFAULT_TREND } from "@/lib/scope1-utils";
import { Badge } from "@/components/ui/badge";
import { useFacilities, useSaveFacilities, type DbFacilityRow } from "@/hooks/use-facilities";
import { useActivity, useSaveActivity } from "@/hooks/use-activity";

type InputMode = "manual" | "excel" | "api";

function dbRowsToScope2(rows: DbFacilityRow[]): Scope2FacilityRow[] {
  return rows.map((r) => ({
    id: r.id,
    facilityName: r.facility_name,
    energyType: r.energy_type ?? "Electricity",
    unit: r.unit,
    dataMethod: r.data_method,
  }));
}

function scope2ToDbRows(rows: Scope2FacilityRow[]): DbFacilityRow[] {
  return rows.map((r, i) => ({
    id: r.id,
    scope: 2,
    facility_name: r.facilityName,
    fuel_type: null,
    energy_type: r.energyType,
    activity_type: null,
    unit: r.unit,
    data_method: r.dataMethod,
    sort_order: i,
  }));
}

export default function Scope2Page() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => String(currentYear - i));
  const [year, setYear] = useState(String(currentYear));
  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [selectedCategoryId, setSelectedCategoryId] = useState<Scope2CategoryId>("electricity");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    INITIAL_SCOPE2_ROWS[0]?.id ?? "",
  );

  const { data: dbFacilities } = useFacilities(2);
  const saveFacilitiesMutation = useSaveFacilities(2, "");

  const facilities: Scope2FacilityRow[] = useMemo(
    () => (dbFacilities && dbFacilities.length > 0 ? dbRowsToScope2(dbFacilities) : INITIAL_SCOPE2_ROWS),
    [dbFacilities],
  );
  const [localFacilities, setLocalFacilities] = useState<Scope2FacilityRow[]>([]);
  const effectiveFacilities = localFacilities.length > 0 ? localFacilities : facilities;

  const { data: dbActivity } = useActivity(selectedFacilityId, year);
  const saveActivityMutation = useSaveActivity();
  const [localActivity, setLocalActivity] = useState<Record<string, number[]>>({});

  const currentActivity = useMemo(() => {
    if (localActivity[selectedFacilityId]) return localActivity[selectedFacilityId];
    if (dbActivity) return dbActivity;
    return Array(12).fill(0);
  }, [localActivity, selectedFacilityId, dbActivity]);

  const selectedFacility = useMemo(
    () => effectiveFacilities.find((f) => f.id === selectedFacilityId),
    [effectiveFacilities, selectedFacilityId],
  );

  const handleActivityChange = (values: number[]) => {
    setLocalActivity((prev) => ({ ...prev, [selectedFacilityId]: values }));
  };

  const handleSaveActivity = () => {
    if (!selectedFacilityId) return;
    saveActivityMutation.mutate({ facilityId: selectedFacilityId, year, values: currentActivity });
  };

  const handleSaveFacilities = (rows: Scope2FacilityRow[]) => {
    saveFacilitiesMutation.mutate(scope2ToDbRows(rows));
    setLocalFacilities(rows);
  };

  const monthlyTotals = SCOPE1_DEFAULT_TREND;

  return (
    <div className="space-y-4">
      <Scope2Header year={year} />

      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <Scope2CategorySidebar
          categories={SCOPE2_CATEGORIES}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />

        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2 items-stretch">
            <Scope2SourceInfoCard
              rows={effectiveFacilities}
              onRowsChange={setLocalFacilities}
              selectedId={selectedFacilityId}
              onSelect={setSelectedFacilityId}
              onSave={handleSaveFacilities}
              isSaving={saveFacilitiesMutation.isPending}
            />
            <Scope2SourceExamples activeCategoryId={selectedCategoryId} />
          </div>

          <Scope2MonthlyActivityTable
            energyType={(selectedFacility?.energyType === "Electricity" ? "Electricity" : "Steam") as any}
            unitLabel={selectedFacility?.unit ?? "MWh"}
            facilityName={selectedFacility?.facilityName || "배출시설 미선택"}
            facilityId={selectedFacilityId}
            year={year}
            activityByMonth={currentActivity}
            onChangeActivity={handleActivityChange}
            metaRight={
              <div className="flex items-center gap-3 text-xs whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">연도</span>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="h-8 w-[110px] rounded-md border border-input bg-transparent px-3 py-1 text-xs"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">데이터 상태</span>
                  <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                    Draft
                  </span>
                </div>
              </div>
            }
            headerRight={
              <div className="flex items-center gap-3 text-xs whitespace-nowrap">
                <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-1.5 py-0.5">
                  {(["manual", "excel", "api"] as InputMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        inputMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                      }`}
                      onClick={() => setInputMode(mode)}
                    >
                      {mode === "manual" ? "직접 입력" : mode === "excel" ? "Excel 업로드" : "API 연동"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="cursor-pointer border-border/70 bg-background text-[11px] text-muted-foreground hover:bg-muted">
                    Excel 템플릿 다운로드
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer text-[11px]">
                    Excel 업로드
                  </Badge>
                  <button
                    type="button"
                    onClick={handleSaveActivity}
                    disabled={saveActivityMutation.isPending}
                    className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saveActivityMutation.isPending ? "저장 중..." : "활동량 저장"}
                  </button>
                </div>
              </div>
            }
          />

          <ActionFooter year={year} />

          <div className="grid gap-4 lg:grid-cols-2 items-stretch">
            <ValidationInsightsCard />
            <div className="h-full">
              <AuditLogTable items={SCOPE2_AUDIT_LOGS} />
            </div>
          </div>

          <EmissionTrendCard monthlyTotals={monthlyTotals} />
        </div>
      </div>
    </div>
  );
}
