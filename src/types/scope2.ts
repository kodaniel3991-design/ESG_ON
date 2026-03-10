export type Scope2CategoryId = "electricity" | "heat";

export interface Scope2Category {
  id: Scope2CategoryId;
  label: string;
  factorSource?: string;
}

export type Scope2SourceStatus = "active" | "inactive";

export type Scope2EnergyType = "Electricity" | "Steam";

export type Scope2Unit = "kWh" | "MWh" | "GJ";

export interface Scope2EmissionSource {
  id: string;
  name: string;
  categoryId: Scope2CategoryId;
  energyType: Scope2EnergyType;
  unit: Scope2Unit;
  emissionFactor: number;
  factorSource: string;
  status: Scope2SourceStatus;
}

