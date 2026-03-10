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
import type { Scope3CategoryConfig } from "@/components/emissions/scope3-monthly-input";
import type {
  PurchasedGoodsActivity,
  DataEntryMode,
} from "@/types/scope3-purchased";
import type { AuditLogItem } from "@/types/scope1";

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

interface ActivityListProps {
  activities: PurchasedGoodsActivity[];
  activeCategoryId: string;
  selectedId: string;
  onSelect: (id: string) => void;
  onClickAdd: () => void;
}

function ActivityList({
  activities,
  activeCategoryId,
  selectedId,
  onSelect,
  onClickAdd,
}: ActivityListProps) {
  const description =
    activeCategoryId === "u2"
      ? "자본재(설비, 기계, 차량 등) 관련 활동 데이터를 추가하고 월별 활동량을 관리합니다."
      : activeCategoryId === "u3"
        ? "연료·에너지 관련(기타) 활동 데이터를 추가하고 월별 활동량을 관리합니다."
        : activeCategoryId === "u5"
          ? "사업장 폐기물(일반·재활용·위험 폐기물 등) 관련 활동 데이터를 추가하고 월별 활동량을 관리합니다."
          : activeCategoryId === "u4"
            ? "상류 수송 및 유통 관련 활동 데이터를 추가하고 월별 활동량을 관리합니다."
            : activeCategoryId === "u6"
              ? "출장(육상 교통, 항공, 숙박 등)과 관련된 활동 데이터를 추가하고 월별 활동량을 관리합니다."
              : activeCategoryId === "u7"
                ? "직원 출퇴근(자가용, 대중교통, 통근버스 등) 관련 활동 데이터를 추가하고 월별 활동량을 관리합니다."
          : activeCategoryId === "u8"
            ? "상류 임차자산(사무실, 창고, 설비 등) 사용과 관련된 활동 데이터를 추가하고 월별 활동량을 관리합니다."
            : activeCategoryId === "d1"
              ? "하류 수송 및 유통(제품 배송, 리테일 물류 등) 관련 활동 데이터를 추가하고 월별 활동량을 관리합니다."
              : activeCategoryId === "d2"
                ? "판매제품 가공(부품 가공, 하도급 생산 등) 관련 활동 데이터를 추가하고 월별 활동량을 관리합니다."
                : activeCategoryId === "d3"
                  ? "판매제품 사용(제품 사용 단계에서의 에너지·연료 사용 등) 관련 활동 데이터를 추가하고 월별 활동량을 관리합니다."
                  : activeCategoryId === "d4"
                    ? "판매제품 폐기(재활용, 소각, 매립 등) 관련 활동 데이터를 추가하고 월별 활동량을 관리합니다."
                    : activeCategoryId === "d5"
                      ? "하류 임차자산(리테일 매장, 물류센터, 차량 등) 사용과 관련된 활동 데이터를 추가하고 월별 활동량을 관리합니다."
                      : activeCategoryId === "d6"
                        ? "프랜차이즈(가맹점 운영, 에너지 사용 등) 관련 활동 데이터를 추가하고 월별 활동량을 관리합니다."
                        : activeCategoryId === "d7"
                          ? "투자(주식·채권·프로젝트 파이낸싱 등) 포트폴리오에서 발생하는 배출 데이터를 추가하고 월별 활동량을 관리합니다."
                          : "구매 상품 및 서비스 데이터를 추가하고 월별 활동량을 관리합니다.";

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-foreground">활동 데이터 목록</h2>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={onClickAdd}>
          + 활동 추가
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <th className="px-4 py-2 text-left font-medium">활동명</th>
              <th className="px-4 py-2 text-left font-medium">공급사</th>
              <th className="px-4 py-2 text-left font-medium">산정방식</th>
              <th className="px-4 py-2 text-left font-medium">단위</th>
              <th className="px-2 py-2 text-right font-medium">배출계수</th>
              <th className="px-4 py-2 text-left font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => {
              const isSelected = activity.id === selectedId;
              return (
                <tr
                  key={activity.id}
                  onClick={() => onSelect(activity.id)}
                  className={cn(
                    "cursor-pointer border-b border-border/60 last:border-0 transition-colors",
                    isSelected ? "bg-primary/5" : "hover:bg-muted/50",
                  )}
                >
                  <td className="px-4 py-2 text-sm font-medium">
                    {activity.name}
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {activity.supplier}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                        activity.method === "Activity Based"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : activity.method === "Spend Based"
                            ? "bg-sky-50 text-sky-700 border border-sky-100"
                            : "bg-violet-50 text-violet-700 border border-violet-100",
                      )}
                    >
                      {activity.method}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {activity.unit}
                  </td>
                  <td className="px-2 py-2 text-xs text-right text-muted-foreground">
                    {activity.emissionFactor.toFixed(5)}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                        activity.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-muted text-muted-foreground border border-border/50",
                      )}
                    >
                      {activity.status === "active" ? "활성" : "비활성"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ExampleActivitiesCard({ categoryId }: { categoryId: string }) {
  const isCapitalGoods = categoryId === "u2";
  const isFuelEnergyOther = categoryId === "u3";
  const isUpstreamTransport = categoryId === "u4";
  const isSiteWaste = categoryId === "u5";
  const isBusinessTravel = categoryId === "u6";
  const isEmployeeCommute = categoryId === "u7";
  const isUpstreamLeasedAssets = categoryId === "u8";
  const isDownstreamTransport = categoryId === "d1";
  const isDownstreamProcessing = categoryId === "d2";
  const isDownstreamUse = categoryId === "d3";
  const isDownstreamEndOfLife = categoryId === "d4";
  const isDownstreamLeasedAssets = categoryId === "d5";
  const isFranchise = categoryId === "d6";
  const isInvestment = categoryId === "d7";

  return (
    <Card className="border-border/60 bg-card/80">
      <CardContent className="py-3 text-xs">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-medium text-foreground">예시 활동</span>
          <span className="text-[11px] text-muted-foreground">
            카테고리별 대표 예시
          </span>
        </div>
        <p className="mb-2 text-[11px] text-muted-foreground">
          {isCapitalGoods
            ? "기계·설비, 건물, 차량 등 자본재 투자와 관련된 배출 데이터 예시입니다."
            : isFuelEnergyOther
              ? "연료·에너지 관련(기타) 카테고리에 속하는 연료 공급망 및 송배전 손실 등 간접 배출 데이터 예시입니다."
              : isUpstreamTransport
                ? "상류 수송 및 유통 과정(원자재 수입, 물류센터 이전 등)에서 발생하는 배출 데이터 예시입니다."
                : isSiteWaste
                  ? "사업장 내에서 발생하는 일반·재활용·위험 폐기물 처리와 관련된 배출 데이터 예시입니다."
                  : isBusinessTravel
                    ? "직원 출장(항공, 철도, 차량, 숙박 등)으로 인해 발생하는 배출 데이터 예시입니다."
                    : isEmployeeCommute
                      ? "직원 출퇴근(자가용, 대중교통, 통근버스 등)으로 인해 발생하는 배출 데이터 예시입니다."
                      : isUpstreamLeasedAssets
                        ? "상류 임차자산(사무실, 창고, 설비 등) 사용과 관련된 배출 데이터 예시입니다."
                        : isDownstreamTransport
                          ? "하류 수송 및 유통(제품 배송, 리테일 물류 등)에서 발생하는 배출 데이터 예시입니다."
                          : isDownstreamProcessing
                            ? "판매제품 가공(부품 가공, 하도급 생산 등)에서 발생하는 배출 데이터 예시입니다."
                            : isDownstreamUse
                              ? "판매제품 사용(제품 사용 단계에서의 에너지·연료 사용 등)에서 발생하는 배출 데이터 예시입니다."
                              : isDownstreamEndOfLife
                                ? "판매제품 폐기(재활용, 소각, 매립 등)에서 발생하는 배출 데이터 예시입니다."
                                : isDownstreamLeasedAssets
                                  ? "하류 임차자산(리테일 매장, 물류센터, 차량 등) 사용과 관련된 배출 데이터 예시입니다."
                                  : isFranchise
                                    ? "프랜차이즈(가맹점 매장 운영, 설비·조리 에너지 사용 등)에서 발생하는 배출 데이터 예시입니다."
                                    : isInvestment
                                      ? "투자 포트폴리오(주식·채권·프로젝트 파이낸싱 등)에서 발생하는 배출 데이터 예시입니다."
                                      : "구매한 원재료, 부품, 포장재, 소모품, 외주 가공 서비스 등에서 발생하는 배출 데이터 예시입니다."}
        </p>
        <ul className="ml-4 list-disc space-y-0.5 text-[11px] text-muted-foreground">
          {isCapitalGoods ? (
            <>
              <li>생산 설비 (Production Equipment)</li>
              <li>건물 리트로핏 (Building Retrofit)</li>
              <li>차량·장비 (Vehicle Fleet)</li>
              <li>창고 랙 시스템 (Warehouse Racking System)</li>
              <li>IT·네트워크 인프라 (IT &amp; Network Infrastructure)</li>
            </>
          ) : isFuelEnergyOther ? (
            <>
              <li>연료 전처리 공정 (Upstream Fuel Processing)</li>
              <li>정제·수송 단계 배출 (Well-to-Tank Emissions)</li>
              <li>송·배전 손실 (Transmission &amp; Distribution Losses)</li>
              <li>에너지 저장 손실 (Energy Storage Losses)</li>
              <li>계통 서비스 계약 (Grid Service Contracts)</li>
            </>
          ) : isUpstreamTransport ? (
            <>
              <li>원자재 해상 운송 (Ocean Freight for Raw Materials)</li>
              <li>긴급 항공 운송 (Air Freight for Urgent Shipments)</li>
              <li>공장 간 내륙 운송 (Domestic Trucking to Plants)</li>
              <li>입고 창고 이동 (Inbound Warehouse Transfers)</li>
              <li>컨테이너 운송 (Container Drayage)</li>
            </>
          ) : isSiteWaste ? (
            <>
              <li>사무실 일반폐기물 수거 (General Office Waste Collection)</li>
              <li>생산 스크랩 재활용 (Production Scrap Recycling)</li>
              <li>위험 폐기물 소각 (Hazardous Waste Incineration)</li>
              <li>폐수 처리 슬러지 (On-site Wastewater Treatment Sludge)</li>
              <li>외부 매립 위탁 (Contracted Landfill Disposal)</li>
            </>
          ) : isBusinessTravel ? (
            <>
              <li>국내 철도 출장 (Domestic Rail Travel)</li>
              <li>단거리 항공편 (Short-haul Flights)</li>
              <li>장거리 항공편 (Long-haul Flights)</li>
              <li>호텔 숙박 (Hotel Nights)</li>
              <li>렌터카 이용 (Rental Car Use)</li>
            </>
          ) : isEmployeeCommute ? (
            <>
              <li>자가용 출퇴근 (Single-occupancy Car Commute)</li>
              <li>카풀 출퇴근 (Carpool Commute)</li>
              <li>버스·지하철 출퇴근 (Bus &amp; Subway Commute)</li>
              <li>회사 통근버스 (Company Shuttle Bus)</li>
              <li>환승 주차장 이용 (Park-and-Ride Usage)</li>
            </>
          ) : isUpstreamLeasedAssets ? (
            <>
              <li>임차 사무실 층 (Leased Office Floors)</li>
              <li>임차 창고 공간 (Leased Warehouse Space)</li>
              <li>임차 생산 설비 (Leased Production Equipment)</li>
              <li>임차 차량 (Leased Vehicle Fleet)</li>
              <li>공유 오피스 (Shared Co-working Spaces)</li>
            </>
          ) : isDownstreamTransport ? (
            <>
              <li>제품 해상 운송 (Downstream Ocean Shipping)</li>
              <li>매장 납품 (Retail Store Deliveries)</li>
              <li>지역 물류센터 이동 (Regional Distribution Center Transfers)</li>
              <li>라스트마일 배송 (Courier Last-mile Delivery)</li>
              <li>반품·회수 물류 (Reverse Logistics for Returns)</li>
            </>
          ) : isDownstreamProcessing ? (
            <>
              <li>부품 가공 (Component Machining)</li>
              <li>금속 프레스/스탬핑 (Metal Stamping)</li>
              <li>플라스틱 사출성형 (Plastic Injection Molding)</li>
              <li>전자 부품 조립 (Electronics Sub-assembly)</li>
              <li>도장·코팅 공정 (Painting &amp; Coating)</li>
            </>
          ) : isDownstreamUse ? (
            <>
              <li>가전제품 전기사용 (Home Appliance Electricity Use)</li>
              <li>산업설비 가동 (Industrial Equipment Runtime)</li>
              <li>차량 연료 사용 (Vehicle Fuel Consumption)</li>
              <li>전자제품 대기전력 (Consumer Electronics Standby Power)</li>
              <li>상업용 냉난방 운전 (Commercial HVAC Operation)</li>
            </>
          ) : isDownstreamEndOfLife ? (
            <>
              <li>지자체 폐기물 처리 (Municipal Waste Disposal)</li>
              <li>판매제품 재활용 (Recycling of Sold Products)</li>
              <li>폐제품 매립 (Landfill of End-of-life Products)</li>
              <li>에너지 회수 소각 (Energy-from-Waste Incineration)</li>
              <li>회수·역물류 (Take-back &amp; Reverse Logistics)</li>
            </>
          ) : isDownstreamLeasedAssets ? (
            <>
              <li>임차 리테일 매장 (Leased Retail Stores)</li>
              <li>임차 물류센터 (Leased Distribution Centers)</li>
              <li>임차 배송 차량 (Leased Downstream Vehicle Fleet)</li>
              <li>팝업 스토어 임대 (Pop-up Store Leases)</li>
              <li>3자 보관창고 (Third-party Storage Units)</li>
            </>
          ) : isFranchise ? (
            <>
              <li>프랜차이즈 매장 전기사용 (Franchise Store Electricity Use)</li>
              <li>조리용 가스 사용 (Gas Consumption for Cooking)</li>
              <li>냉동·냉장 설비 부하 (Refrigeration &amp; Freezer Loads)</li>
              <li>간판·조명 전력 (Franchise Signage &amp; Lighting)</li>
              <li>브랜드 공용 설비 (Shared Brand-owned Equipment)</li>
            </>
          ) : isInvestment ? (
            <>
              <li>고배출 업종 지분투자 (Equity Investments in High-emitting Sectors)</li>
              <li>인프라 프로젝트 파이낸싱 (Project Finance for Infrastructure)</li>
              <li>기업채 투자 (Corporate Bond Investments)</li>
              <li>그린·브라운 포트폴리오 전환 (Green vs. Brown Portfolio Shifts)</li>
              <li>대출에 따른 파이낸스드 배출 (Financed Emissions from Loans)</li>
            </>
          ) : (
            <>
              <li>강판 구매 (Steel Coil)</li>
              <li>플라스틱 수지 구매 (Plastic Resin)</li>
              <li>포장재 (Packaging Material)</li>
              <li>전자 부품 (Electronic Parts)</li>
              <li>외주 가공 서비스 (Outsourced Processing)</li>
            </>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

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
  const [year, setYear] = useState("2024");
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
          {/* 상단 카드 영역 */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
            <ActivityList
              activities={visibleActivities}
              activeCategoryId={selectedCategoryId}
              selectedId={selectedActivity?.id ?? ""}
              onSelect={setSelectedActivityId}
              onClickAdd={() => setIsAddModalOpen(true)}
            />
            <ExampleActivitiesCard categoryId={selectedCategoryId} />
          </div>

          {/* 월별 입력 영역 */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-sm font-medium text-foreground">
                  월별 활동량 입력
                </h2>
                <p className="text-xs text-muted-foreground">
                  선택된 활동 기준으로 월별 활동량과 배출량을 관리합니다.
                </p>
                <div className="flex items-center gap-3 text-xs whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">연도</span>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="h-8 w-[110px] rounded-md border border-input bg-transparent px-3 py-1 text-xs"
                    >
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
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

            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                    <th className="w-28 px-3 py-2 text-left font-medium">구분</th>
                    {MONTH_LABELS.map((label) => (
                      <th
                        key={label}
                        className="w-20 px-2 py-2 text-right font-medium"
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
                      <td key={idx} className="px-2 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={activityValues[idx] ?? 0}
                          onChange={(e) =>
                            handleActivityValueChange(idx, e.target.value)
                          }
                          className={cn(
                            "h-9 w-full min-w-[4rem] rounded-md border border-input bg-transparent px-2 py-1.5 text-right text-xs ring-offset-background",
                            "focus:outline-none focus:ring-1 focus:ring-ring",
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
                  <tr>
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

