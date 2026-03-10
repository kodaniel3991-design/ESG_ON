import type { Scope2EnergyType } from "@/types/scope2";

export const SCOPE2_ENERGY_FACTORS: Record<Scope2EnergyType, number> = {
  Electricity: 0.45, // tCO2e / MWh (예시 값)
  Steam: 0.20, // tCO2e / GJ (예시 값)
};

export function getEmissionFactorForEnergy(type: Scope2EnergyType): number {
  return SCOPE2_ENERGY_FACTORS[type] ?? 0.4;
}

