import type {
  Scope2Category,
  Scope2EmissionSource,
  Scope2EnergyType,
  Scope2Unit,
} from "@/types/scope2";
import type { AuditLogItem } from "@/types/scope1";

export const SCOPE2_CATEGORIES: Scope2Category[] = [
  {
    id: "electricity",
    label: "구입전력",
    factorSource:
      "국가 온실가스 배출계수 관리시스템(KUET) - 전력 계수 예시",
  },
  {
    id: "heat",
    label: "증기·난방",
    factorSource:
      "국가 온실가스 배출계수 관리시스템(KUET) - 열 공급 계수 예시",
  },
];

export const SCOPE2_ENERGY_TYPES: Scope2EnergyType[] = [
  "Electricity",
  "Steam",
];

export const SCOPE2_UNITS: Scope2Unit[] = ["kWh", "MWh", "GJ"];

export const SCOPE2_SOURCES: Scope2EmissionSource[] = [
  {
    id: "s2-source-1",
    name: "본사 사무실",
    categoryId: "electricity",
    energyType: "Electricity",
    unit: "MWh",
    emissionFactor: 0.465,
    factorSource: "전력 사용 배출계수 예시 (KUET)",
    status: "active",
  },
  {
    id: "s2-source-2",
    name: "제조 공장 1",
    categoryId: "electricity",
    energyType: "Electricity",
    unit: "MWh",
    emissionFactor: 0.472,
    factorSource: "제조공장 전력 배출계수 예시 (KUET)",
    status: "active",
  },
  {
    id: "s2-source-3",
    name: "지역난방",
    categoryId: "heat",
    energyType: "Steam",
    unit: "GJ",
    emissionFactor: 0.080,
    factorSource: "지역난방 열 공급 배출계수 예시 (KUET)",
    status: "active",
  },
  {
    id: "s2-source-4",
    name: "증기 공급",
    categoryId: "heat",
    energyType: "Steam",
    unit: "GJ",
    emissionFactor: 0.075,
    factorSource: "증기 공급 배출계수 예시 (KUET)",
    status: "active",
  },
  {
    id: "s2-source-5",
    name: "온수 보일러",
    categoryId: "heat",
    energyType: "Steam",
    unit: "GJ",
    emissionFactor: 0.082,
    factorSource: "온수 보일러 배출계수 예시 (KUET)",
    status: "active",
  },
];

export const SCOPE2_SOURCE_EXAMPLES = {
  electricity: [
    "본사 사무실 (Headquarters Office)",
    "제조 공장 (Manufacturing Plant)",
    "창고 (Warehouse)",
    "매장·점포 (Retail Store)",
    "데이터센터 (Data Center)",
  ],
  heat: [
    "지역난방 (District Heating)",
    "증기 공급 (Steam Supply)",
    "온수 보일러 (Hot Water Boiler)",
  ],
} as const;

export const SCOPE2_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "s2-log-1",
    actor: "김OO",
    action: "데이터 입력",
    timestamp: "2026-03-10 09:20",
  },
  {
    id: "s2-log-2",
    actor: "이OO",
    action: "데이터 수정",
    timestamp: "2026-03-11 15:10",
  },
  {
    id: "s2-log-3",
    actor: "박OO",
    action: "검토 완료",
    timestamp: "2026-03-12 18:05",
  },
];

