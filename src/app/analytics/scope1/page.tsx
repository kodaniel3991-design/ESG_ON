"use client";

import { useMemo, useState } from "react";
import { ScopeHeader } from "@/components/scope1/scope-header";
import { CategorySidebar } from "@/components/scope1/category-sidebar";
import { SourceList } from "@/components/scope1/source-list";
import { SourceExamples } from "@/components/scope1/source-examples";
import { MonthlyActivityTable } from "@/components/scope1/monthly-activity-table";
import { ValidationInsightsCard } from "@/components/scope1/validation-insights-card";
import { EmissionTrendCard } from "@/components/scope1/emission-trend-card";
import { AuditLogTable } from "@/components/scope1/audit-log-table";
import { ActionFooter } from "@/components/scope1/action-footer";
import {
  SCOPE1_AUDIT_LOGS,
  SCOPE1_CATEGORIES,
  SCOPE1_SOURCES,
} from "@/lib/scope1-mock-data";
import type { ScopeCategoryId } from "@/types/scope1";
import { SCOPE1_DEFAULT_TREND } from "@/lib/scope1-utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type InputMode = "manual" | "excel" | "api";

export default function Scope1Page() {
  const [year, setYear] = useState("2024");
  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<ScopeCategoryId>("fixed");
  const [selectedSourceId, setSelectedSourceId] = useState<string>(
    SCOPE1_SOURCES[0]?.id ?? "",
  );
  const [activityByMonth, setActivityByMonth] = useState<number[]>(
    () => Array(12).fill(0),
  );

  const selectedCategory = useMemo(
    () => SCOPE1_CATEGORIES.find((c) => c.id === selectedCategoryId),
    [selectedCategoryId],
  );

  const selectedSource = useMemo(
    () => SCOPE1_SOURCES.find((s) => s.id === selectedSourceId),
    [selectedSourceId],
  );

  const visibleSources = useMemo(
    () => SCOPE1_SOURCES.filter((s) => s.categoryId === selectedCategoryId),
    [selectedCategoryId],
  );

  // 데모용: Trend 차트는 항상 기본 데이터로 표시
  const monthlyTotals = SCOPE1_DEFAULT_TREND;

  return (
    <div className="space-y-4">
      <ScopeHeader year={year} />

      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        {/* 좌측 카테고리 패널 */}
        <CategorySidebar
          categories={SCOPE1_CATEGORIES}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />

        {/* 우측 메인 콘텐츠 */}
        <div className="space-y-6">
          {/* 배출원 목록 + 예시 */}
          <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
            <SourceList
              sources={visibleSources}
              selectedSourceId={selectedSource?.id ?? ""}
              onSelectSource={setSelectedSourceId}
            />
            <SourceExamples activeCategoryId={selectedCategoryId} />
          </div>

          {/* C. 월별 데이터 입력 테이블 */}
          <MonthlyActivityTable
            activityByMonth={activityByMonth}
            onChangeActivity={setActivityByMonth}
            fuel={selectedSource?.fuelType ?? "LNG"}
            unitLabel={selectedSource?.unit ?? "Nm3"}
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
                  <Badge
                    variant="outline"
                    className="border-amber-300 bg-amber-50 text-amber-900"
                  >
                    Draft
                  </Badge>
                </div>
              </div>
            }
            headerRight={
              <div className="flex items-center gap-3 text-xs whitespace-nowrap">
                <div className="flex items-center gap-3">
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
              </div>
            }
          />

          {/* G. 하단 액션 바 - 월별 입력 바로 아래 */}
          <ActionFooter year={year} />

          {/* D, E, F 섹션 */}
          <div className="grid gap-4 lg:grid-cols-2 items-stretch">
            <ValidationInsightsCard />
            <div className="h-full">
              <AuditLogTable items={SCOPE1_AUDIT_LOGS} />
            </div>
          </div>

          <EmissionTrendCard monthlyTotals={monthlyTotals} />
        </div>
      </div>
    </div>
  );
}

