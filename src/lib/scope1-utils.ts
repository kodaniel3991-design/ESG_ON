import type { MonthlyEmissionData, Scope1FuelType } from "@/types/scope1";

export const SCOPE1_FUEL_FACTORS: Record<Scope1FuelType, number> = {
  LNG: 1.5,
  Diesel: 2.7,
  Gasoline: 2.3,
};

// 데모용 기본 Trend 데이터 (tCO₂e)
// 월별 막대 높낮이가 한눈에 보이도록 강하게 차이를 줌
export const SCOPE1_DEFAULT_TREND: number[] = [
  2,   // 1월: 매우 낮음
  10,  // 2월
  4,   // 3월
  18,  // 4월: 급증
  6,   // 5월
  22,  // 6월: 최고점
  8,   // 7월
  16,  // 8월
  5,   // 9월
  14,  // 10월
  3,   // 11월: 다시 낮음
  12,  // 12월
];

export function getEmissionFactorForFuel(fuel: Scope1FuelType): number {
  return SCOPE1_FUEL_FACTORS[fuel] ?? 1;
}

export function calculateMonthlyEmissions(
  activityByMonth: number[],
  fuel: Scope1FuelType,
): MonthlyEmissionData[] {
  const factor = getEmissionFactorForFuel(fuel);

  return activityByMonth.map((activity, index) => {
    const safeActivity = Number.isNaN(activity) ? 0 : activity;
    const emission = safeActivity * factor;
    return {
      month: index + 1,
      activity: safeActivity,
      emission,
    };
  });
}

export function copyFirstMonthToAll(activityByMonth: number[]): number[] {
  const first = activityByMonth[0] ?? 0;
  return activityByMonth.map(() => first);
}

export function getMonthlyTotals(
  data: MonthlyEmissionData[],
): number[] {
  const totals = Array(12).fill(0);
  for (const row of data) {
    const idx = row.month - 1;
    if (idx >= 0 && idx < 12) {
      totals[idx] += row.emission;
    }
  }
  return totals;
}

