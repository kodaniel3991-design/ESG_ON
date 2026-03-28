"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type IssueType = "error" | "warning" | "info";

type ValidationIssue = {
  type: IssueType;
  month?: number;
  message: string;
  hint?: string;
};

export type HistoricalMonthly = {
  year: string;
  values: number[]; // 12개월 활동량
};

const MONTH_LABELS = [
  "1월","2월","3월","4월","5월","6월",
  "7월","8월","9월","10월","11월","12월",
];

function runValidation(activityByMonth: number[], year: string, historicalMonthly?: HistoricalMonthly[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!activityByMonth || activityByMonth.length === 0) return issues;

  const now = new Date();
  const isCurrentYear = year === String(now.getFullYear());
  const upToMonthIdx = isCurrentYear ? now.getMonth() : 11; // 0-indexed inclusive

  // 1. 음수 값 체크
  activityByMonth.forEach((v, idx) => {
    if (v < 0) {
      issues.push({
        type: "error",
        month: idx + 1,
        message: `${MONTH_LABELS[idx]}에 음수 값이 입력됐습니다.`,
        hint: "0 이상의 값을 입력해 주세요.",
      });
    }
  });

  // 2. 누락 데이터 (현재 연도면 현재 월까지만 체크)
  const relevant = activityByMonth.slice(0, upToMonthIdx + 1);
  const missingIdxs = relevant.map((v, i) => ({ v, i })).filter(({ v }) => v === 0).map(({ i }) => i);

  if (missingIdxs.length === relevant.length && relevant.length > 0) {
    issues.push({
      type: "info",
      message: "입력된 활동량 데이터가 없습니다.",
      hint: "월별 활동량을 입력해 배출량을 계산하세요.",
    });
  } else if (missingIdxs.length > 0 && missingIdxs.length <= 3) {
    issues.push({
      type: "warning",
      message: `${missingIdxs.map((i) => MONTH_LABELS[i]).join(", ")} 데이터가 입력되지 않았습니다.`,
      hint: "누락된 월의 활동량을 확인해 주세요.",
    });
  } else if (missingIdxs.length > 3) {
    issues.push({
      type: "warning",
      message: `${missingIdxs.length}개월 데이터가 누락됐습니다.`,
      hint: "누락된 월의 활동량을 확인해 주세요.",
    });
  }

  // 3. 이상치 감지 — 비zero 값이 3개 이상일 때 연내 월평균 대비 급등/급락 감지
  const nonZero = activityByMonth.map((v, i) => ({ v, i })).filter(({ v }) => v > 0);
  if (nonZero.length >= 3) {
    const avg = nonZero.reduce((s, { v }) => s + v, 0) / nonZero.length;
    nonZero.forEach(({ v, i }) => {
      const pct = Math.round((v / avg) * 100);
      if (pct > 250) {
        issues.push({
          type: "warning",
          month: i + 1,
          message: `${MONTH_LABELS[i]} 값이 연내 월평균(${avg.toFixed(1)}) 대비 ${pct}%로 급증했습니다.`,
          hint: "입력 단위 오류 또는 일시적 급증 여부를 확인해 주세요.",
        });
      } else if (pct < 30) {
        issues.push({
          type: "warning",
          month: i + 1,
          message: `${MONTH_LABELS[i]} 값이 연내 월평균 대비 ${pct}% 수준으로 낮습니다.`,
          hint: "입력 오류 또는 해당 월 휴지기 여부를 확인해 주세요.",
        });
      }
    });
  }

  // 4. 전년도 동월 대비 10% 이상 급증·급감 감지
  if (historicalMonthly && historicalMonthly.length > 0) {
    for (let idx = 0; idx <= upToMonthIdx; idx++) {
      const current = activityByMonth[idx];
      if (current <= 0) continue; // 현재 월 데이터 없으면 skip

      // 해당 월에 데이터가 있는 이전 연도만 추출
      const validHist = historicalMonthly.filter((h) => (h.values[idx] ?? 0) > 0);
      if (validHist.length === 0) continue;

      const histAvg = validHist.reduce((s, h) => s + h.values[idx], 0) / validHist.length;
      const changePct = ((current - histAvg) / histAvg) * 100;

      if (Math.abs(changePct) < 10) continue; // 10% 미만은 무시

      const compLabel =
        validHist.length === 1
          ? `${validHist[0].year}년 동월(${histAvg.toFixed(1)})`
          : `전${validHist.length}년 동월 평균(${histAvg.toFixed(1)})`;

      if (changePct > 0) {
        issues.push({
          type: "warning",
          month: idx + 1,
          message: `${MONTH_LABELS[idx]} ${compLabel} 대비 ${changePct.toFixed(1)}% 급증했습니다.`,
          hint: "배출원 확대 또는 입력 오류 여부를 확인해 주세요.",
        });
      } else {
        issues.push({
          type: "warning",
          month: idx + 1,
          message: `${MONTH_LABELS[idx]} ${compLabel} 대비 ${Math.abs(changePct).toFixed(1)}% 급감했습니다.`,
          hint: "누락 데이터 또는 운영 감소 여부를 확인해 주세요.",
        });
      }
    }
  }

  return issues;
}

const ISSUE_STYLES: Record<IssueType, {
  icon: React.ElementType;
  bg: string;
  border: string;
  iconColor: string;
  textColor: string;
}> = {
  error: {
    icon: XCircle,
    bg: "bg-destructive/10",
    border: "border-red-200 dark:border-red-800",
    iconColor: "text-carbon-danger",
    textColor: "text-red-800",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-taupe-50 dark:bg-taupe-50/20",
    border: "border-border dark:border-border",
    iconColor: "text-carbon-warning",
    textColor: "text-carbon-warning dark:text-carbon-warning",
  },
  info: {
    icon: Info,
    bg: "bg-primary/10",
    border: "border-primary/30",
    iconColor: "text-primary",
    textColor: "text-primary",
  },
};

interface ValidationInsightsCardProps {
  activityByMonth: number[];
  year: string;
  historicalMonthly?: HistoricalMonthly[];
}

export function ValidationInsightsCard({ activityByMonth, year, historicalMonthly }: ValidationInsightsCardProps) {
  const issues = useMemo(() => runValidation(activityByMonth, year, historicalMonthly), [activityByMonth, year, historicalMonthly]);

  const errorCount = issues.filter((i) => i.type === "error").length;
  const warnCount = issues.filter((i) => i.type === "warning").length;
  const allGood = issues.length === 0;

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">데이터 검증</CardTitle>
          {allGood ? (
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-carbon-success dark:text-carbon-success">
              <CheckCircle2 className="h-3 w-3" /> 이상 없음
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              {errorCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                  오류 {errorCount}
                </span>
              )}
              {warnCount > 0 && (
                <span className="rounded-full bg-taupe-50 px-2 py-0.5 text-[11px] font-semibold text-carbon-warning dark:bg-taupe-50/30 dark:text-carbon-warning">
                  경고 {warnCount}
                </span>
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          월별 활동량 데이터의 이상치·누락을 자동 감지합니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {allGood ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-green-50/60 px-3 py-2.5 text-xs text-carbon-success dark:border-border dark:text-carbon-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            입력된 데이터에 이상이 없습니다. 검증 요청을 진행할 수 있습니다.
          </div>
        ) : (
          issues.map((issue, i) => {
            const s = ISSUE_STYLES[issue.type];
            const Icon = s.icon;
            return (
              <div key={i} className={cn("rounded-lg border px-3 py-2.5", s.bg, s.border)}>
                <div className="flex items-start gap-2">
                  <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", s.iconColor)} />
                  <div>
                    <p className={cn("text-xs font-medium", s.textColor)}>{issue.message}</p>
                    {issue.hint && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{issue.hint}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
