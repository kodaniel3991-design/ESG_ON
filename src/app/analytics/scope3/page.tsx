 "use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ScopeTabs } from "@/components/scope1/scope-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber } from "@/lib/utils";
import { ValidationInsightsCard } from "@/components/scope1/validation-insights-card";
import { AuditLogTable } from "@/components/scope1/audit-log-table";
import { ActionFooter } from "@/components/scope1/action-footer";
import { EmissionTrendCard } from "@/components/scope1/emission-trend-card";
import { SCOPE1_DEFAULT_TREND } from "@/lib/scope1-utils";
import { Scope3CategorySidebar } from "@/components/scope3/category-sidebar";
import {
  Scope3SourceInfoCard,
  INITIAL_SCOPE3_ROWS,
  type Scope3FacilityRow,
} from "@/components/scope3/source-info-card";
import { Scope3SourceReference } from "@/components/scope3/source-reference";
import type { Scope3CategoryConfig } from "@/components/emissions/scope3-monthly-input";
import type {
  PurchasedGoodsActivity,
  DataEntryMode,
} from "@/types/scope3-purchased";
import type { AuditLogItem } from "@/types/scope1";
import { useFacilities, useSaveFacilities } from "@/hooks/use-facilities";

const MONTH_LABELS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

const SCOPE3_CATEGORIES: Scope3CategoryConfig[] = [
  {
    id: "u1",
    label: "구입상품 및 서비스",
    group: "upstream",
    factorSource: "GHG Protocol Scope 3 Standard - Category 1 예시 계수",
  },
  {
    id: "u2",
    label: "자본재",
    group: "upstream",
    factorSource: "GHG Protocol Scope 3 Standard - Category 2 예시 계수",
  },
  {
    id: "u3",
    label: "연료·에너지 관련(기타)",
    group: "upstream",
    factorSource: "국가 배출계수 DB 또는 사내 기준 예시",
  },
  {
    id: "u4",
    label: "상류 수송 및 유통",
    group: "upstream",
    factorSource: "GHG Protocol Scope 3 Standard - Category 4 예시 계수",
  },
  {
    id: "u5",
    label: "사업장 폐기물",
    group: "upstream",
    factorSource: "GHG Protocol Scope 3 Standard - Category 5 예시 계수",
  },
  {
    id: "u6",
    label: "출장",
    group: "upstream",
    factorSource: "GHG Protocol Scope 3 Standard - Category 6 예시 계수",
  },
  {
    id: "u7",
    label: "직원 출퇴근",
    group: "upstream",
    factorSource: "GHG Protocol Scope 3 Standard - Category 7 예시 계수",
  },
  {
    id: "u8",
    label: "상류 임차자산",
    group: "upstream",
    factorSource: "GHG Protocol Scope 3 Standard - Category 8 예시 계수",
  },
  {
    id: "d1",
    label: "하류 수송 및 유통",
    group: "downstream",
    factorSource: "GHG Protocol Scope 3 Standard - Category 9 예시 계수",
  },
  {
    id: "d2",
    label: "판매제품 가공",
    group: "downstream",
    factorSource: "GHG Protocol Scope 3 Standard - Category 10 예시 계수",
  },
  {
    id: "d3",
    label: "판매제품 사용",
    group: "downstream",
    factorSource: "GHG Protocol Scope 3 Standard - Category 11 예시 계수",
  },
  {
    id: "d4",
    label: "판매제품 폐기",
    group: "downstream",
    factorSource: "GHG Protocol Scope 3 Standard - Category 12 예시 계수",
  },
  {
    id: "d5",
    label: "하류 임차자산",
    group: "downstream",
    factorSource: "GHG Protocol Scope 3 Standard - Category 13 예시 계수",
  },
  {
    id: "d6",
    label: "프랜차이즈",
    group: "downstream",
    factorSource: "GHG Protocol Scope 3 Standard - Category 14 예시 계수",
  },
  {
    id: "d7",
    label: "투자",
    group: "downstream",
    factorSource: "GHG Protocol Scope 3 Standard - Category 15 예시 계수",
  },
];

const INITIAL_ACTIVITIES: PurchasedGoodsActivity[] = [
  {
    id: "pg-1",
    categoryId: "u1",
    name: "강판 구매",
    supplier: "POSCO",
    method: "Activity Based",
    unit: "ton",
    emissionFactor: 2.1,
    status: "active",
  },
  {
    id: "pg-2",
    categoryId: "u1",
    name: "플라스틱 수지 구매",
    supplier: "LG Chem",
    method: "Spend Based",
    unit: "KRW",
    emissionFactor: 0.00045,
    status: "active",
  },
  {
    id: "pg-3",
    categoryId: "u1",
    name: "PCB 어셈블리 외주",
    supplier: "Supplier A",
    method: "Supplier Specific",
    unit: "kg",
    emissionFactor: 1.8,
    status: "active",
  },
  {
    id: "pg-4",
    categoryId: "u2",
    name: "CNC 가공 설비",
    supplier: "Machine Vendor A",
    method: "Activity Based",
    unit: "unit",
    emissionFactor: 35.5,
    status: "active",
  },
  {
    id: "pg-5",
    categoryId: "u2",
    name: "지게차 장비",
    supplier: "Logistics Provider",
    method: "Spend Based",
    unit: "KRW",
    emissionFactor: 0.00032,
    status: "active",
  },
  {
    id: "pg-6",
    categoryId: "u2",
    name: "건물 리트로핏",
    supplier: "Construction Co.",
    method: "Supplier Specific",
    unit: "m²",
    emissionFactor: 0.85,
    status: "active",
  },
  {
    id: "pg-7",
    categoryId: "u3",
    name: "연료 전처리 공정",
    supplier: "Energy Supplier A",
    method: "Activity Based",
    unit: "GJ",
    emissionFactor: 0.19,
    status: "active",
  },
  {
    id: "pg-8",
    categoryId: "u3",
    name: "송·배전 손실",
    supplier: "Grid Operator",
    method: "Spend Based",
    unit: "KRW",
    emissionFactor: 0.00012,
    status: "active",
  },
  {
    id: "pg-9",
    categoryId: "u3",
    name: "정제·수송 단계 배출",
    supplier: "Fuel Trader",
    method: "Supplier Specific",
    unit: "ton",
    emissionFactor: 0.35,
    status: "active",
  },
  {
    id: "pg-10",
    categoryId: "u4",
    name: "원자재 해상 운송",
    supplier: "Global Carrier",
    method: "Activity Based",
    unit: "ton·km",
    emissionFactor: 0.00023,
    status: "active",
  },
  {
    id: "pg-11",
    categoryId: "u4",
    name: "긴급 항공 운송",
    supplier: "Air Cargo Provider",
    method: "Spend Based",
    unit: "KRW",
    emissionFactor: 0.00018,
    status: "active",
  },
  {
    id: "pg-12",
    categoryId: "u4",
    name: "공장 간 내륙 운송",
    supplier: "Trucking Company",
    method: "Supplier Specific",
    unit: "pallet",
    emissionFactor: 0.42,
    status: "active",
  },
  {
    id: "pg-13",
    categoryId: "u5",
    name: "사무실 일반폐기물 수거",
    supplier: "Waste Contractor",
    method: "Activity Based",
    unit: "ton",
    emissionFactor: 0.85,
    status: "active",
  },
  {
    id: "pg-14",
    categoryId: "u5",
    name: "생산 스크랩 재활용",
    supplier: "Recycling Vendor",
    method: "Spend Based",
    unit: "KRW",
    emissionFactor: 0.00027,
    status: "active",
  },
  {
    id: "pg-15",
    categoryId: "u5",
    name: "위험 폐기물 소각",
    supplier: "Incineration Facility",
    method: "Supplier Specific",
    unit: "ton",
    emissionFactor: 1.95,
    status: "active",
  },
  {
    id: "pg-16",
    categoryId: "u6",
    name: "국내 출장 이동",
    supplier: "Travel Agency",
    method: "Activity Based",
    unit: "km",
    emissionFactor: 0.00018,
    status: "active",
  },
  {
    id: "pg-17",
    categoryId: "u6",
    name: "해외 항공 출장",
    supplier: "Airline",
    method: "Spend Based",
    unit: "KRW",
    emissionFactor: 0.00025,
    status: "active",
  },
  {
    id: "pg-18",
    categoryId: "u6",
    name: "출장 중 숙박",
    supplier: "Hotel Chain",
    method: "Supplier Specific",
    unit: "night",
    emissionFactor: 0.012,
    status: "active",
  },
  {
    id: "pg-19",
    categoryId: "u7",
    name: "자가용 출퇴근",
    supplier: "Employees",
    method: "Activity Based",
    unit: "km",
    emissionFactor: 0.00021,
    status: "active",
  },
  {
    id: "pg-20",
    categoryId: "u7",
    name: "대중교통 출퇴근",
    supplier: "Transit Operator",
    method: "Spend Based",
    unit: "KRW",
    emissionFactor: 0.00009,
    status: "active",
  },
  {
    id: "pg-21",
    categoryId: "u7",
    name: "회사 통근버스",
    supplier: "Shuttle Service",
    method: "Supplier Specific",
    unit: "km",
    emissionFactor: 0.00016,
    status: "active",
  },
  {
    id: "pg-22",
    categoryId: "u8",
    name: "임차 사무실",
    supplier: "Property Owner",
    method: "Activity Based",
    unit: "m²",
    emissionFactor: 0.055,
    status: "active",
  },
  {
    id: "pg-23",
    categoryId: "u8",
    name: "임차 물류창고",
    supplier: "Logistics Real Estate",
    method: "Spend Based",
    unit: "KRW",
    emissionFactor: 0.00014,
    status: "active",
  },
  {
    id: "pg-24",
    categoryId: "u8",
    name: "임차 설비·차량",
    supplier: "Leasing Company",
    method: "Supplier Specific",
    unit: "unit",
    emissionFactor: 0.62,
    status: "active",
  },
  {
    id: "pg-25",
    categoryId: "d1",
    name: "제품 해상 운송",
    supplier: "Global Carrier",
    method: "Activity Based",
    unit: "ton·km",
    emissionFactor: 0.00024,
    status: "active",
  },
  {
    id: "pg-26",
    categoryId: "d1",
    name: "리테일 유통",
    supplier: "Retail Logistics",
    method: "Spend Based",
    unit: "KRW",
    emissionFactor: 0.00019,
    status: "active",
  },
  {
    id: "pg-27",
    categoryId: "d1",
    name: "라스트마일 배송",
    supplier: "Courier Service",
    method: "Supplier Specific",
    unit: "stop",
    emissionFactor: 0.37,
    status: "active",
  },
  {
    id: "pg-28",
    categoryId: "d2",
    name: "부품 가공",
    supplier: "Tier-1 Supplier",
    method: "Activity Based",
    unit: "ton",
    emissionFactor: 1.25,
    status: "active",
  },
  {
    id: "pg-29",
    categoryId: "d2",
    name: "하도급 조립 생산",
    supplier: "Contract Manufacturer",
    method: "Spend Based",
    unit: "KRW",
    emissionFactor: 0.00031,
    status: "active",
  },
  {
    id: "pg-30",
    categoryId: "d2",
    name: "도장·코팅 공정",
    supplier: "Surface Treatment Vendor",
    method: "Supplier Specific",
    unit: "m²",
    emissionFactor: 0.73,
    status: "active",
  },
  {
    id: "pg-31",
    categoryId: "d3",
    name: "가전제품 전기사용",
    supplier: "End Customers",
    method: "Activity Based",
    unit: "kWh",
    emissionFactor: 0.00041,
    status: "active",
  },
  {
    id: "pg-32",
    categoryId: "d3",
    name: "산업설비 가동",
    supplier: "B2B Clients",
    method: "Spend Based",
    unit: "KRW",
    emissionFactor: 0.00029,
    status: "active",
  },
  {
    id: "pg-33",
    categoryId: "d3",
    name: "차량 연료 사용",
    supplier: "Fleet Customers",
    method: "Supplier Specific",
    unit: "km",
    emissionFactor: 0.00021,
    status: "active",
  },
  {
    id: "pg-34",
    categoryId: "d4",
    name: "지자체 폐기물 처리",
    supplier: "Local Waste Authority",
    method: "Activity Based",
    unit: "ton",
    emissionFactor: 0.92,
    status: "active",
  },
  {
    id: "pg-35",
    categoryId: "d4",
    name: "판매제품 재활용",
    supplier: "Recycling Partner",
    method: "Spend Based",
    unit: "KRW",
    emissionFactor: 0.00021,
    status: "active",
  },
  {
    id: "pg-36",
    categoryId: "d4",
    name: "폐제품 매립",
    supplier: "Landfill Operator",
    method: "Supplier Specific",
    unit: "ton",
    emissionFactor: 1.45,
    status: "active",
  },
  {
    id: "pg-37",
    categoryId: "d5",
    name: "임차 리테일 매장",
    supplier: "Retail Property Owner",
    method: "Activity Based",
    unit: "m²",
    emissionFactor: 0.047,
    status: "active",
  },
  {
    id: "pg-38",
    categoryId: "d5",
    name: "임차 물류센터",
    supplier: "Logistics Real Estate",
    method: "Spend Based",
    unit: "KRW",
    emissionFactor: 0.00016,
    status: "active",
  },
  {
    id: "pg-39",
    categoryId: "d5",
    name: "임차 배송 차량",
    supplier: "Leasing Company",
    method: "Supplier Specific",
    unit: "unit",
    emissionFactor: 0.58,
    status: "active",
  },
  {
    id: "pg-40",
    categoryId: "d6",
    name: "프랜차이즈 매장 전기사용",
    supplier: "Franchisees",
    method: "Activity Based",
    unit: "kWh",
    emissionFactor: 0.00039,
    status: "active",
  },
  {
    id: "pg-41",
    categoryId: "d6",
    name: "조리용 가스 사용",
    supplier: "Franchisees",
    method: "Spend Based",
    unit: "KRW",
    emissionFactor: 0.00027,
    status: "active",
  },
  {
    id: "pg-42",
    categoryId: "d6",
    name: "냉동·냉장 설비 부하",
    supplier: "Franchise Stores",
    method: "Supplier Specific",
    unit: "kWh",
    emissionFactor: 0.00044,
    status: "active",
  },
  {
    id: "pg-43",
    categoryId: "d7",
    name: "고배출 업종 지분투자",
    supplier: "Portfolio Companies",
    method: "Spend Based",
    unit: "KRW",
    emissionFactor: 0.00033,
    status: "active",
  },
  {
    id: "pg-44",
    categoryId: "d7",
    name: "인프라 프로젝트 파이낸싱",
    supplier: "Project SPVs",
    method: "Activity Based",
    unit: "ton",
    emissionFactor: 1.75,
    status: "active",
  },
  {
    id: "pg-45",
    categoryId: "d7",
    name: "기업채 투자",
    supplier: "Issuing Companies",
    method: "Supplier Specific",
    unit: "KRW",
    emissionFactor: 0.00027,
    status: "active",
  },
];

const AUDIT_LOG_ITEMS: AuditLogItem[] = [
  {
    id: "s3-log-1",
    actor: "김OO",
    action: "데이터 입력",
    timestamp: "2026-03-10 09:20",
  },
  {
    id: "s3-log-2",
    actor: "이OO",
    action: "데이터 수정",
    timestamp: "2026-03-11 15:10",
  },
  {
    id: "s3-log-3",
    actor: "박OO",
    action: "검토 완료",
    timestamp: "2026-03-12 18:05",
  },
];

interface AddActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (activity: PurchasedGoodsActivity) => void;
}

function AddActivityModal({ open, onClose, onSave }: AddActivityModalProps) {
  const [name, setName] = useState("");
  const [supplier, setSupplier] = useState("");
  const [method, setMethod] = useState<PurchasedGoodsActivity["method"]>(
    "Activity Based",
  );
  const [unit, setUnit] = useState("ton");
  const [factor, setFactor] = useState("0");
  const [source, setSource] = useState("");

  if (!open) return null;

  const handleSave = () => {
    const parsedFactor = parseFloat(factor || "0");
    const newActivity: PurchasedGoodsActivity = {
      id: `pg-${Date.now()}`,
      name: name || "New Activity",
      supplier: supplier || "-",
      method,
      unit: unit || "unit",
      emissionFactor: Number.isNaN(parsedFactor) ? 0 : parsedFactor,
      status: "active",
      source: source || undefined,
    };
    onSave(newActivity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            활동 데이터 추가
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                활동명
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                공급사
              </label>
              <input
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                산정방식
              </label>
              <select
                value={method}
                onChange={(e) =>
                  setMethod(e.target.value as PurchasedGoodsActivity["method"])
                }
                className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs"
              >
                <option value="Activity Based">Activity Based</option>
                <option value="Spend Based">Spend Based</option>
                <option value="Supplier Specific">Supplier Specific</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                단위
              </label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                배출계수
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={factor}
                onChange={(e) => setFactor(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                출처
              </label>
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs"
              />
            </div>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              취소
            </Button>
            <Button size="sm" onClick={handleSave}>
              저장
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Scope3Page() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => String(currentYear - i));
  const [year, setYear] = useState(String(currentYear));
  const [mode, setMode] = useState<DataEntryMode>("manual");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("u1");
  const [activities, setActivities] =
    useState<PurchasedGoodsActivity[]>(INITIAL_ACTIVITIES);
  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    INITIAL_ACTIVITIES[0]?.id ?? "",
  );
  const [monthlyActivityById, setMonthlyActivityById] = useState<
    Record<string, number[]>
  >(() =>
    Object.fromEntries(
      INITIAL_ACTIVITIES.map((a) => [a.id, Array(12).fill(0)]),
    ),
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 배출원 정보 상태 (DB 연동)
  const { data: dbScope3Facilities } = useFacilities(3);
  const saveFacilitiesMutation = useSaveFacilities(3, "");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    INITIAL_SCOPE3_ROWS[0]?.id ?? "",
  );
  const [localScope3Facilities, setLocalScope3Facilities] = useState<Scope3FacilityRow[]>([]);
  const scope3Facilities: Scope3FacilityRow[] = useMemo(() => {
    if (localScope3Facilities.length > 0) return localScope3Facilities;
    if (dbScope3Facilities && dbScope3Facilities.length > 0) {
      return dbScope3Facilities.map((r) => ({
        id: r.id,
        facilityName: r.facility_name,
        activityType: r.activity_type ?? "구입상품·서비스",
        unit: r.unit,
        dataMethod: r.data_method,
      }));
    }
    return INITIAL_SCOPE3_ROWS;
  }, [localScope3Facilities, dbScope3Facilities]);
  const selectedFacility = scope3Facilities.find((f) => f.id === selectedFacilityId);

  const handleSaveScope3Facilities = (rows: Scope3FacilityRow[]) => {
    saveFacilitiesMutation.mutate(rows.map((r, i) => ({
      id: r.id,
      scope: 3,
      facility_name: r.facilityName,
      fuel_type: null,
      energy_type: null,
      activity_type: r.activityType,
      unit: r.unit,
      data_method: r.dataMethod,
      sort_order: i,
    })));
    setLocalScope3Facilities(rows);
  };

  const filteredByCategory = activities.filter(
    (a) => (a.categoryId ?? "u1") === selectedCategoryId,
  );

  // 카테고리별로 최대 3개의 예시만 노출
  const visibleActivities =
    filteredByCategory.length > 0
      ? filteredByCategory.slice(0, 3)
      : activities.slice(0, 3);

  const selectedActivity =
    visibleActivities.find((a) => a.id === selectedActivityId) ??
    visibleActivities[0] ??
    activities[0];

  useEffect(() => {
    if (!selectedActivity && visibleActivities[0]) {
      setSelectedActivityId(visibleActivities[0].id);
    }
  }, [selectedActivity, visibleActivities]);

  const activityValues =
    (selectedActivity &&
      monthlyActivityById[selectedActivity.id] &&
      monthlyActivityById[selectedActivity.id]) ||
    Array(12).fill(0);

  const emissionFactor = selectedActivity?.emissionFactor ?? 0;

  const emissions = useMemo(
    () =>
      activityValues.map((v) => {
        const safe = Number.isNaN(v) ? 0 : v;
        return safe * emissionFactor;
      }),
    [activityValues, emissionFactor],
  );

  const totalEmission = emissions.reduce((sum, v) => sum + v, 0);

  // CO₂ 95%, CH₄ 3%, N₂O 2% 비율로 가스별 배출량 산출
  const gasEmissions = useMemo(() => ({
    co2: emissions.map((v) => v * 0.95),
    ch4: emissions.map((v) => v * 0.03),
    n2o: emissions.map((v) => v * 0.02),
  }), [emissions]);

  const handleActivityValueChange = (index: number, raw: string) => {
    const v = raw === "" ? 0 : parseFloat(raw);
    setMonthlyActivityById((prev) => {
      const current = prev[selectedActivity.id] ?? Array(12).fill(0);
      const next = [...current];
      next[index] = Number.isNaN(v) ? 0 : v;
      return { ...prev, [selectedActivity.id]: next };
    });
  };

  const handleAddActivity = (activity: PurchasedGoodsActivity) => {
    const withCategory: PurchasedGoodsActivity = {
      ...activity,
      categoryId: selectedCategoryId,
    };
    setActivities((prev) => [...prev, withCategory]);
    setMonthlyActivityById((prev) => ({
      ...prev,
      [withCategory.id]: Array(12).fill(0),
    }));
    setSelectedActivityId(withCategory.id);
  };

  return (
    <div className="space-y-4">
      {/* 상단 헤더 */}
      <div className="space-y-1">
        <PageHeader
          title="Scope 3"
          description="구매한 원재료, 부품, 소모품 및 외주 서비스 데이터를 월별로 관리합니다."
          className="border-b-0 pb-2"
        >
          <div className="flex flex-col items-end gap-2">
            <ScopeTabs />
          </div>
        </PageHeader>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        {/* 좌측 Scope 3 카테고리 트리 (Scope 2와 유사한 위치/형태) */}
        <Scope3CategorySidebar
          categories={SCOPE3_CATEGORIES}
          selectedId={selectedCategoryId as any}
          onSelect={(id) => setSelectedCategoryId(id)}
        />

        {/* 우측 메인 콘텐츠 */}
        <div className="space-y-6">
          {/* 배출원 정보 + 배출원 목록 */}
          <div className="grid gap-3 md:grid-cols-2 items-stretch">
            <Scope3SourceInfoCard
              rows={scope3Facilities}
              onRowsChange={setLocalScope3Facilities}
              selectedId={selectedFacilityId}
              onSelect={setSelectedFacilityId}
              onSave={handleSaveScope3Facilities}
              isSaving={saveFacilitiesMutation.isPending}
            />
            <Scope3SourceReference activeCategoryId={selectedCategoryId} />
          </div>

          {/* 월별 입력 영역 */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-sm font-medium text-foreground">
                  월별 활동량 입력
                </h2>
                {selectedFacility?.facilityName && (
                  <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary">
                    {selectedFacility.facilityName}
                  </span>
                )}
                <p className="text-xs text-muted-foreground">
                </p>
                <div className="flex items-center gap-3 text-xs whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">연도</span>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="h-8 w-[110px] rounded-md border border-input bg-transparent px-3 py-1 text-xs"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      데이터 상태
                    </span>
                    <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                      Draft
                    </span>
                  </div>
                </div>
              </div>
              <div className="ml-auto flex flex-wrap items-center gap-3 text-xs">
                <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-1.5 py-0.5">
                  <button
                    type="button"
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      mode === "manual"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                    onClick={() => setMode("manual")}
                  >
                    직접 입력
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      mode === "excel"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                    onClick={() => setMode("excel")}
                  >
                    Excel 업로드
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      mode === "api"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                    onClick={() => setMode("api")}
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

            {/* 계산 근거 */}
            {selectedActivity && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2 text-xs dark:border-blue-900/50 dark:bg-blue-950/20">
                <span className="shrink-0 font-semibold text-blue-700 dark:text-blue-400">계산 근거</span>
                <span className="shrink-0 text-muted-foreground">
                  활동량
                  <span className="mx-1 text-muted-foreground/60">({selectedActivity.unit})</span>
                  <span className="mx-1.5 text-foreground">×</span>
                  배출계수
                  <span className="mx-1 rounded bg-blue-100 px-1.5 py-0.5 font-semibold text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    {emissionFactor.toFixed(5)} tCO₂e/{selectedActivity.unit}
                  </span>
                  <span className="mx-1.5 text-foreground">=</span>
                  배출량
                  <span className="ml-1 text-muted-foreground/60">(tCO₂e)</span>
                </span>
                <span className="h-3 w-px shrink-0 bg-blue-200 dark:bg-blue-800" />
                <span className="text-muted-foreground">CO₂: <span className="ml-1 font-medium text-foreground">95%</span></span>
                <span className="text-muted-foreground">CH₄: <span className="ml-1 font-medium text-foreground">3%</span></span>
                <span className="text-muted-foreground">N₂O: <span className="ml-1 font-medium text-foreground">2%</span></span>
                <span className="h-3 w-px shrink-0 bg-blue-200 dark:bg-blue-800" />
                <span className="text-muted-foreground">
                  출처:
                  <span className="ml-1 text-foreground">
                    {selectedActivity.source ?? SCOPE3_CATEGORIES.find((c) => c.id === selectedCategoryId)?.factorSource ?? "-"}
                  </span>
                </span>
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                    <th className="w-24 px-3 py-2 text-left font-medium">구분</th>
                    {MONTH_LABELS.map((label) => (
                      <th
                        key={label}
                        className="px-1 py-2 text-right font-medium"
                      >
                        {label}
                      </th>
                    ))}
                    <th className="w-24 px-3 py-2 text-right font-medium">
                      합계
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/60">
                    <td className="px-3 py-2 text-xs font-medium">
                      활동량{" "}
                      {selectedActivity
                        ? `(${selectedActivity.unit})`
                        : undefined}
                    </td>
                    {MONTH_LABELS.map((_, idx) => (
                      <td key={idx} className="px-1 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={activityValues[idx] ?? 0}
                          onChange={(e) =>
                            handleActivityValueChange(idx, e.target.value)
                          }
                          className={cn(
                            "h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-1 py-1 text-right text-xs ring-offset-background",
                            "focus:outline-none focus:ring-1 focus:ring-ring",
                            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                          )}
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                      {formatNumber(
                        activityValues.reduce(
                          (sum, v) => sum + (Number.isNaN(v) ? 0 : v),
                          0,
                        ),
                        2,
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-3 py-2 text-xs font-medium">
                      배출량 (tCO₂e)
                    </td>
                    {emissions.map((v, idx) => (
                      <td key={idx} className="px-2 py-2 text-right text-xs">
                        {formatNumber(v, 2)}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right text-xs font-semibold">
                      {formatNumber(totalEmission, 2)} tCO₂e
                    </td>
                  </tr>
                  <tr className="border-b border-border/60 bg-muted/20">
                    <td className="px-3 py-2 text-xs text-muted-foreground pl-5">CO₂ (tCO₂)</td>
                    {gasEmissions.co2.map((v, idx) => (
                      <td key={idx} className="px-2 py-2 text-right text-xs text-muted-foreground">
                        {formatNumber(v, 3)}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                      {formatNumber(gasEmissions.co2.reduce((s, v) => s + v, 0), 3)}
                    </td>
                  </tr>
                  <tr className="border-b border-border/60 bg-muted/20">
                    <td className="px-3 py-2 text-xs text-muted-foreground pl-5">CH₄ (tCH₄)</td>
                    {gasEmissions.ch4.map((v, idx) => (
                      <td key={idx} className="px-2 py-2 text-right text-xs text-muted-foreground">
                        {formatNumber(v, 3)}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                      {formatNumber(gasEmissions.ch4.reduce((s, v) => s + v, 0), 3)}
                    </td>
                  </tr>
                  <tr className="bg-muted/20">
                    <td className="px-3 py-2 text-xs text-muted-foreground pl-5">N₂O (tN₂O)</td>
                    {gasEmissions.n2o.map((v, idx) => (
                      <td key={idx} className="px-2 py-2 text-right text-xs text-muted-foreground">
                        {formatNumber(v, 3)}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                      {formatNumber(gasEmissions.n2o.reduce((s, v) => s + v, 0), 3)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 상태 문구 + 액션 버튼 */}
          <ActionFooter year={year} />

          {/* 하단 카드 2개 */}
          <div className="grid gap-4 lg:grid-cols-2 items-stretch">
            <ValidationInsightsCard />
            <div className="h-full">
              <AuditLogTable items={AUDIT_LOG_ITEMS} />
            </div>
          </div>

      {/* Emission Trend (Scope 1/2와 동일 스타일) */}
      <EmissionTrendCard monthlyTotals={SCOPE1_DEFAULT_TREND} />
        </div>
      </div>

      <AddActivityModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddActivity}
      />
    </div>
  );
}

