import type {
  AuditLogItem,
  EmissionSource,
  Scope1FuelType,
  Scope1Unit,
  ScopeCategory,
} from "@/types/scope1";

export const SCOPE1_CATEGORIES: ScopeCategory[] = [
  {
    id: "fixed",
    label: "고정연소",
    factorSource:
      "환경부 온실가스 배출계수 관리시스템(KUET) - 고정연소 연료 계수 예시",
  },
  {
    id: "mobile",
    label: "이동연소",
    factorSource:
      "환경부 온실가스 배출계수 관리시스템(KUET) - 수송 연료 계수 예시",
  },
  {
    id: "fugitive",
    label: "비가스배출",
    factorSource:
      "IPCC 가이드라인 또는 사내 기준에 기반한 예시 계수",
  },
];

export const SCOPE1_FUELS: Scope1FuelType[] = [
  "LNG",
  "Diesel",
  "Gasoline",
];

export const SCOPE1_UNITS: Scope1Unit[] = ["Nm3", "L", "kg"];

export const SCOPE1_SOURCES: EmissionSource[] = [
  {
    id: "source-1",
    name: "보일러",
    categoryId: "fixed",
    fuelType: "LNG",
    unit: "Nm3",
    status: "active",
    emissionFactor: 1.5,
    factorSource: "LNG 고정연소 KUET 계수 예시",
  },
  {
    id: "source-2",
    name: "발전기",
    categoryId: "fixed",
    fuelType: "Diesel",
    unit: "L",
    status: "active",
    emissionFactor: 2.7,
    factorSource: "경유 연소 KUET 계수 예시",
  },
  {
    id: "source-3",
    name: "업무용 승용차",
    categoryId: "mobile",
    fuelType: "Gasoline",
    unit: "L",
    status: "active",
    emissionFactor: 2.3,
    factorSource: "휘발유 수송연소 KUET 계수 예시",
  },
  {
    id: "source-9",
    name: "용해로",
    categoryId: "fixed",
    fuelType: "LNG",
    unit: "Nm3",
    status: "active",
    emissionFactor: 1.5,
    factorSource: "LNG 고정연소 KUET 계수 예시",
  },
  {
    id: "source-4",
    name: "배송 밴",
    categoryId: "mobile",
    fuelType: "Diesel",
    unit: "L",
    status: "active",
    emissionFactor: 2.7,
    factorSource: "경유 연소 KUET 계수 예시",
  },
  {
    id: "source-5",
    name: "화물 트럭",
    categoryId: "mobile",
    fuelType: "Diesel",
    unit: "L",
    status: "active",
    emissionFactor: 2.7,
    factorSource: "경유 연소 KUET 계수 예시",
  },
  {
    id: "source-6",
    name: "공정 배출 설비",
    categoryId: "fugitive",
    fuelType: "LNG",
    unit: "Nm3",
    status: "active",
    emissionFactor: 1.5,
    factorSource: "공정 연소·배출 계수 예시",
  },
  {
    id: "source-7",
    name: "냉동·냉장 설비",
    categoryId: "fugitive",
    fuelType: "Gasoline",
    unit: "kg",
    status: "active",
    emissionFactor: 2.3,
    factorSource: "냉매 누설 계수 예시",
  },
  {
    id: "source-8",
    name: "산업용 가스 저장탱크",
    categoryId: "fugitive",
    fuelType: "LNG",
    unit: "Nm3",
    status: "active",
    emissionFactor: 1.5,
    factorSource: "산업용 가스 누출 계수 예시",
  },
];

export const SCOPE1_SOURCE_EXAMPLES = {
  fixed: [
    "보일러 (Boiler)",
    "발전기 (Generator)",
    "용해로 (Furnace)",
    "히터 (Heater)",
    "건조기 (Dryer)",
    "소성로 (Kiln)",
  ],
  mobile: [
    "업무용 승용차 (Company Car)",
    "배송 밴 (Delivery Van)",
    "화물 트럭 (Truck)",
    "지게차 (Forklift)",
    "굴착기 (Excavator)",
    "통근·셔틀 버스 (Company Bus)",
  ],
  fugitive: [
    "공정 배출 (Process Emission)",
    "화학 반응 배출 (Chemical Reaction)",
    "냉매 누설 (Refrigerant Leakage)",
    "산업용 가스 누출 (Industrial Gas Release)",
    "기타 공정 배출 (Other Process Emission)",
  ],
} as const;

export const SCOPE1_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "log-1",
    actor: "김OO",
    action: "데이터 입력",
    timestamp: "2026-03-10 09:20",
  },
  {
    id: "log-2",
    actor: "이OO",
    action: "데이터 수정",
    timestamp: "2026-03-11 14:05",
  },
  {
    id: "log-3",
    actor: "박OO",
    action: "검토 완료",
    timestamp: "2026-03-12 17:40",
  },
];

