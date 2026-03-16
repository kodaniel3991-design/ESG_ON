import type { MonthlyEmissionData, Scope1FuelType } from "@/types/scope1";

// ─── NIER-2023 실제 배출계수 (국립환경과학원 국가 온실가스 배출·흡수계수 2023년판) ───
// 단위: tGas/연료단위 (co2: tCO₂, ch4: tCH₄, n2o: tN₂O)
// GWP AR5: CH₄=28, N₂O=265
// 합산계수(combined) = co2 + ch4×28 + n2o×265  (tCO₂e/연료단위)

export const SCOPE1_GAS_FACTORS: Record<Scope1FuelType, { co2: number; ch4: number; n2o: number; gwp_ch4: number; gwp_n2o: number }> = {
  // LNG 고정연소  (tGas/Nm3)  — NIER 2023, factor_code: S1-LNG-KR-2024
  LNG:      { co2: 0.002244,   ch4: 2.0e-7,    n2o: 4.0e-9,    gwp_ch4: 28, gwp_n2o: 265 },
  // 경유 이동연소 (tGas/L)    — NIER 2023, factor_code: S1-DIESEL-MOBILE-KR-2024
  Diesel:   { co2: 0.0026128,  ch4: 1.375e-7,  n2o: 1.375e-7,  gwp_ch4: 28, gwp_n2o: 265 },
  // 휘발유 이동연소 (tGas/L)  — NIER 2023, factor_code: S1-GASOLINE-MOBILE-KR-2024
  Gasoline: { co2: 0.0022204,  ch4: 9.612e-7,  n2o: 9.61e-8,   gwp_ch4: 28, gwp_n2o: 265 },
};

// 합산 배출계수: co2 + ch4×gwp + n2o×gwp  (tCO₂e/연료단위)
export const SCOPE1_FUEL_FACTORS: Record<Scope1FuelType, number> = {
  LNG:      0.002244  + 2.0e-7   * 28 + 4.0e-9   * 265, // 0.002251  tCO₂e/Nm3
  Diesel:   0.0026128 + 1.375e-7 * 28 + 1.375e-7 * 265, // 0.002653  tCO₂e/L
  Gasoline: 0.0022204 + 9.612e-7 * 28 + 9.61e-8  * 265, // 0.002273  tCO₂e/L
};

export const SCOPE1_FACTOR_SOURCES: Record<Scope1FuelType, string> = {
  LNG:      "국립환경과학원 국가 온실가스 배출·흡수계수 (NIER-2023, S1-LNG-KR-2024)",
  Diesel:   "국립환경과학원 국가 온실가스 배출·흡수계수 (NIER-2023, S1-DIESEL-MOBILE-KR-2024)",
  Gasoline: "국립환경과학원 국가 온실가스 배출·흡수계수 (NIER-2023, S1-GASOLINE-MOBILE-KR-2024)",
};

export function calculateGasEmissions(
  activityByMonth: number[],
  fuel: Scope1FuelType,
): { co2: number[]; ch4: number[]; n2o: number[] } {
  const factors = SCOPE1_GAS_FACTORS[fuel] ?? { co2: 0, ch4: 0, n2o: 0, gwp_ch4: 28, gwp_n2o: 265 };
  const safe = (v: number) => (Number.isNaN(v) ? 0 : v);
  return {
    co2: activityByMonth.map((v) => safe(v) * factors.co2),
    ch4: activityByMonth.map((v) => safe(v) * factors.ch4),
    n2o: activityByMonth.map((v) => safe(v) * factors.n2o),
  };
}

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

