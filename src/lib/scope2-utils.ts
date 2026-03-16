import type { Scope2EnergyType } from "@/types/scope2";

export const SCOPE2_ENERGY_FACTORS: Record<Scope2EnergyType, number> = {
  Electricity: 0.45, // tCO2e / MWh (예시 값)
  Steam: 0.20, // tCO2e / GJ (예시 값)
};

export const SCOPE2_FACTOR_SOURCES: Record<Scope2EnergyType, string> = {
  Electricity: "전력 간접배출 계수 (한국 전력 거래소 예시)",
  Steam: "스팀·열 간접배출 계수 (공급자 제공 예시)",
};

export const SCOPE2_UNIT_LABELS: Record<Scope2EnergyType, string> = {
  Electricity: "MWh",
  Steam: "GJ",
};

export const SCOPE2_GAS_FACTORS: Record<Scope2EnergyType, { co2: number; ch4: number; n2o: number }> = {
  Electricity: { co2: 0.440, ch4: 0.007, n2o: 0.003 },
  Steam:       { co2: 0.192, ch4: 0.005, n2o: 0.003 },
};

export function getEmissionFactorForEnergy(type: Scope2EnergyType): number {
  return SCOPE2_ENERGY_FACTORS[type] ?? 0.4;
}

export function calculateScope2GasEmissions(
  activityByMonth: number[],
  energyType: Scope2EnergyType,
): { co2: number[]; ch4: number[]; n2o: number[] } {
  const factors = SCOPE2_GAS_FACTORS[energyType] ?? { co2: 0, ch4: 0, n2o: 0 };
  const safe = (v: number) => (Number.isNaN(v) ? 0 : v);
  return {
    co2: activityByMonth.map((v) => safe(v) * factors.co2),
    ch4: activityByMonth.map((v) => safe(v) * factors.ch4),
    n2o: activityByMonth.map((v) => safe(v) * factors.n2o),
  };
}

