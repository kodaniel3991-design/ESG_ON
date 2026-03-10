"use client";

import { useMemo, useState } from "react";
import { Scope2Header } from "@/components/scope2/scope2-header";
import { Scope2CategorySidebar } from "@/components/scope2/category-sidebar";
import { Scope2SourceList } from "@/components/scope2/source-list";
import { Scope2SourceExamples } from "@/components/scope2/source-examples";
import { Scope2MonthlyActivityTable } from "@/components/scope2/monthly-activity-table";
import { ValidationInsightsCard } from "@/components/scope1/validation-insights-card";
import { EmissionTrendCard } from "@/components/scope1/emission-trend-card";
import { AuditLogTable } from "@/components/scope1/audit-log-table";
import { ActionFooter } from "@/components/scope1/action-footer";
import {
  SCOPE2_AUDIT_LOGS,
  SCOPE2_CATEGORIES,
  SCOPE2_SOURCES,
} from "@/lib/scope2-mock-data";
import type { Scope2CategoryId, Scope2Unit } from "@/types/scope2";
import { SCOPE1_DEFAULT_TREND } from "@/lib/scope1-utils";
import { Badge } from "@/components/ui/badge";

type InputMode = "manual" | "excel" | "api";

export default function Scope2Page() {
  const [year, setYear] = useState("2024");
  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<Scope2CategoryId>("electricity");
  const [selectedSourceId, setSelectedSourceId] = useState<string>(
    SCOPE2_SOURCES[0]?.id ?? "",
  );
  const [activityByMonth, setActivityByMonth] = useState<number[]>(
    () => Array(12).fill(0),
  );

  const selectedCategory = useMemo(
    () => SCOPE2_CATEGORIES.find((c) => c.id === selectedCategoryId),
    [selectedCategoryId],
  );

  const selectedSource = useMemo(
    () => SCOPE2_SOURCES.find((s) => s.id === selectedSourceId),
    [selectedSourceId],
  );

  const visibleSources = useMemo(
    () => SCOPE2_SOURCES.filter((s) => s.categoryId === selectedCategoryId),
    [selectedCategoryId],
  );

  const monthlyTotals = SCOPE1_DEFAULT_TREND;

  return (
    <div className="space-y-4">
      <Scope2Header year={year} />

      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        {/* 좌측 카테고리 패널 */}
        <Scope2CategorySidebar
          categories={SCOPE2_CATEGORIES}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />

        {/* 우측 메인 콘텐츠 */}
        <div className="space-y-6">
          {/* A. 배출원 목록 + 예시 */}
          <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
            <Scope2SourceList
              sources={visibleSources}
              selectedSourceId={selectedSource?.id ?? ""}
              onSelectSource={setSelectedSourceId}
            />
            <Scope2SourceExamples activeCategoryId={selectedCategoryId} />
          </div>

          {/* C. 월별 데이터 입력 테이블 */}
          <Scope2MonthlyActivityTable
            activityByMonth={activityByMonth}
            onChangeActivity={setActivityByMonth}
            energyType={selectedSource?.energyType ?? "Electricity"}
            unitLabel={(selectedSource?.unit as Scope2Unit) ?? "MWh"}
            metaRight={
              <div className="flex items-center gap-3 text-xs whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">연도</span>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="h-8 w-[110px] rounded-md border border-input bg-transparent px-3 py-1 text-xs"
                  >
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    데이터 상태
                  </span>
                  <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                    Draft
                  </span>
                </div>
              </div>
            }
            headerRight={
              <div className="flex items-center gap-3 text-xs whitespace-nowrap">
                <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-1.5 py-0.5">
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      inputMode === "manual"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setInputMode("manual")}
                  >
                    직접 입력
                  </button>
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      inputMode === "excel"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setInputMode("excel")}
                  >
                    Excel 업로드
                  </button>
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      inputMode === "api"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setInputMode("api")}
                  >
                    API 연동
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="cursor-pointer border-border/70 bg-background text-[11px] text-muted-foreground hover:bg-muted"
                  >
                    Excel 템플릿 다운로드
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer text-[11px]"
                  >
                    Excel 업로드
                  </Badge>
                </div>
              </div>
            }
          />

          {/* G. 하단 액션 바 */}
          <ActionFooter year={year} />

          {/* D, E, F 섹션: Scope 1과 동일한 레이아웃 재사용 */}
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
