export type ScopeCategoryId = "fixed" | "mobile" | "fugitive";

export interface ScopeCategory {
  id: ScopeCategoryId;
  label: string;
  factorSource?: string;
}

export type EmissionSourceStatus = "active" | "inactive";

export type Scope1FuelType = "LNG" | "Diesel" | "Gasoline";

export type Scope1Unit = "Nm3" | "L" | "kg";

export interface EmissionSource {
  id: string;
  name: string;
  categoryId: ScopeCategoryId;
  fuelType: Scope1FuelType;
  unit: Scope1Unit;
  status: EmissionSourceStatus;
  emissionFactor: number;
  factorSource: string;
}

export interface MonthlyEmissionData {
  month: number; // 1-12
  activity: number;
  emission: number;
}

export interface AuditLogItem {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
}

