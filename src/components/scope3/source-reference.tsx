"use client";

import { useMemo } from "react";

interface ReferenceRow {
  name: string;
  method: string;
  unit: string;
  source: string;
  status: "active" | "inactive";
}

const CATEGORY_LABELS: Record<string, string> = {
  u1: "구입상품 및 서비스",
  u2: "자본재",
  u3: "연료·에너지 관련(기타)",
  u4: "상류 수송 및 유통",
  u5: "사업장 폐기물",
  u6: "출장",
  u7: "직원 통근",
  u8: "상류 임차자산",
  d1: "하류 수송 및 유통",
  d2: "판매제품 가공",
  d3: "판매제품 사용",
  d4: "판매제품 폐기",
  d5: "하류 임차자산",
  d6: "프랜차이즈",
  d7: "투자",
};

const REFERENCE_DATA: Record<string, ReferenceRow[]> = {
  u1: [
    { name: "원재료 구매", method: "Activity Based", unit: "ton", source: "GHG Protocol Cat.1", status: "active" },
    { name: "부품·소모품 구매", method: "Activity Based", unit: "ton", source: "GHG Protocol Cat.1", status: "active" },
    { name: "포장재", method: "Spend Based", unit: "만원", source: "GHG Protocol Cat.1", status: "active" },
    { name: "외주 서비스", method: "Spend Based", unit: "만원", source: "GHG Protocol Cat.1", status: "inactive" },
  ],
  u2: [
    { name: "생산 설비", method: "Activity Based", unit: "ton", source: "GHG Protocol Cat.2", status: "active" },
    { name: "건물·리트로핏", method: "Spend Based", unit: "만원", source: "GHG Protocol Cat.2", status: "active" },
    { name: "차량·장비", method: "Activity Based", unit: "ton", source: "GHG Protocol Cat.2", status: "inactive" },
    { name: "IT·네트워크 인프라", method: "Spend Based", unit: "만원", source: "GHG Protocol Cat.2", status: "active" },
  ],
  u3: [
    { name: "연료 전처리 공정", method: "Activity Based", unit: "GJ", source: "국가 배출계수 DB", status: "active" },
    { name: "송배전 손실", method: "Activity Based", unit: "MWh", source: "국가 배출계수 DB", status: "active" },
    { name: "재생에너지 관련", method: "Activity Based", unit: "MWh", source: "GHG Protocol Cat.3", status: "inactive" },
  ],
  u4: [
    { name: "원자재 수입 수송", method: "Activity Based", unit: "ton·km", source: "DEFRA/국내 계수", status: "active" },
    { name: "물류센터 입고 수송", method: "Activity Based", unit: "ton·km", source: "DEFRA/국내 계수", status: "active" },
    { name: "해상 운송", method: "Activity Based", unit: "ton·km", source: "IMO 기준", status: "active" },
  ],
  u5: [
    { name: "일반 폐기물(매립)", method: "Activity Based", unit: "ton", source: "국내 폐기물 계수", status: "active" },
    { name: "재활용 폐기물", method: "Activity Based", unit: "ton", source: "국내 폐기물 계수", status: "active" },
    { name: "위험 폐기물(소각)", method: "Activity Based", unit: "ton", source: "국내 폐기물 계수", status: "active" },
  ],
  u6: [
    { name: "항공 출장", method: "Activity Based", unit: "person-km", source: "ICAO/DEFRA", status: "active" },
    { name: "철도 출장", method: "Activity Based", unit: "person-km", source: "국내 배출계수", status: "active" },
    { name: "렌터카·택시", method: "Activity Based", unit: "km", source: "IPCC/국내 계수", status: "active" },
    { name: "숙박", method: "Activity Based", unit: "night", source: "GHG Protocol Cat.6", status: "inactive" },
  ],
  u7: [
    { name: "자가용 통근", method: "Activity Based", unit: "km", source: "국내 배출계수", status: "active" },
    { name: "대중교통 통근", method: "Activity Based", unit: "person-km", source: "국내 배출계수", status: "active" },
    { name: "통근버스", method: "Activity Based", unit: "person-km", source: "국내 배출계수", status: "active" },
  ],
  u8: [
    { name: "임차 사무실", method: "Activity Based", unit: "m²", source: "GHG Protocol Cat.8", status: "active" },
    { name: "임차 창고·설비", method: "Activity Based", unit: "m²", source: "GHG Protocol Cat.8", status: "inactive" },
  ],
  d1: [
    { name: "제품 배송(육상)", method: "Activity Based", unit: "ton·km", source: "DEFRA/국내 계수", status: "active" },
    { name: "리테일 물류", method: "Activity Based", unit: "ton·km", source: "DEFRA/국내 계수", status: "active" },
  ],
  d2: [
    { name: "부품 가공(하도급)", method: "Activity Based", unit: "ton", source: "GHG Protocol Cat.10", status: "active" },
    { name: "조립 외주", method: "Spend Based", unit: "만원", source: "GHG Protocol Cat.10", status: "inactive" },
  ],
  d3: [
    { name: "전자제품 사용 전력", method: "Activity Based", unit: "kWh", source: "GHG Protocol Cat.11", status: "active" },
    { name: "연료 사용 제품", method: "Activity Based", unit: "GJ", source: "GHG Protocol Cat.11", status: "active" },
  ],
  d4: [
    { name: "제품 소각 처리", method: "Activity Based", unit: "ton", source: "국내 폐기물 계수", status: "active" },
    { name: "제품 매립 처리", method: "Activity Based", unit: "ton", source: "국내 폐기물 계수", status: "active" },
    { name: "재활용 처리", method: "Activity Based", unit: "ton", source: "국내 폐기물 계수", status: "active" },
  ],
  d5: [
    { name: "임대 매장", method: "Activity Based", unit: "m²", source: "GHG Protocol Cat.13", status: "active" },
    { name: "임대 물류센터", method: "Activity Based", unit: "m²", source: "GHG Protocol Cat.13", status: "inactive" },
  ],
  d6: [
    { name: "가맹점 에너지 사용", method: "Activity Based", unit: "MWh", source: "GHG Protocol Cat.14", status: "active" },
    { name: "가맹점 연료 사용", method: "Activity Based", unit: "GJ", source: "GHG Protocol Cat.14", status: "active" },
  ],
  d7: [
    { name: "지분 투자", method: "Average Based", unit: "억원", source: "GHG Protocol Cat.15", status: "active" },
    { name: "채권 투자", method: "Average Based", unit: "억원", source: "GHG Protocol Cat.15", status: "active" },
    { name: "프로젝트 파이낸싱", method: "Average Based", unit: "억원", source: "GHG Protocol Cat.15", status: "inactive" },
  ],
};

/* ── KPI ↔ Scope 3 매핑 ── */
interface KpiCalcMapping {
  kpiId: string;
  code: string;
  name: string;
  categories?: string[];
}

const KPI_CALC_MAPPINGS: KpiCalcMapping[] = [
  { kpiId: "k1", code: "CARBON-01", name: "총 탄소 배출량" },
  { kpiId: "k2", code: "CARBON-02", name: "Scope 3 비율" },
  { kpiId: "auto-s3", code: "E-S3", name: "Scope 3 배출량" },
  { kpiId: "auto-s3-u1", code: "E-S3U1", name: "구입상품 배출량", categories: ["u1"] },
  { kpiId: "auto-s3-u4", code: "E-S3U4", name: "상류 운송 배출량", categories: ["u4"] },
  { kpiId: "auto-s3-u7", code: "E-S3U7", name: "직원 통근 배출량", categories: ["u7"] },
];

const METHOD_STYLE: Record<string, string> = {
  "Activity Based": "border border-border bg-green-50 text-carbon-success",
  "Spend Based": "border border-sky-100 bg-sky-50 text-sky-700",
  "Average Based": "border border-primary/30 bg-primary/10 text-primary",
  "Supplier Specific": "border border-taupe-200 bg-taupe-50 text-taupe-600",
};

export interface Scope3SourceFacility {
  id: string;
  name: string;
  activityType: string;
  unit: string;
  status?: "active" | "inactive";
}

interface Scope3SourceReferenceProps {
  activeCategoryId: string;
  /** 배출원 정보에서 등록된 시설 목록 — 전달 시 하드코딩 대신 사용 */
  facilities?: Scope3SourceFacility[];
}

export function Scope3SourceReference({ activeCategoryId, facilities }: Scope3SourceReferenceProps) {
  const referenceRows = REFERENCE_DATA[activeCategoryId] ?? [];
  // facilities가 전달되면 등록된 시설 표시, 아니면 참조 데이터 표시
  const hasFacilities = facilities && facilities.length > 0;
  const label = CATEGORY_LABELS[activeCategoryId] ?? activeCategoryId;

  const contributingKpis = useMemo(() => {
    return KPI_CALC_MAPPINGS.filter((kpi) => {
      if (kpi.categories && !kpi.categories.includes(activeCategoryId)) return false;
      return true;
    });
  }, [activeCategoryId]);

  return (
    <section className="flex h-full flex-col space-y-3">
      <div>
        <h2 className="text-sm font-medium text-foreground">배출원 목록</h2>
        <p className="text-xs text-muted-foreground">
          {label} 카테고리의 배출원 목록입니다.
        </p>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card">
        {hasFacilities ? (
          /* ── 등록된 시설 기반 ── */
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[550px]">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">배출원</th>
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">활동 유형</th>
                  <th className="px-2 py-2 text-left font-medium whitespace-nowrap">단위</th>
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">기여 KPI</th>
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">상태</th>
                </tr>
              </thead>
              <tbody>
                {facilities!.map((f) => {
                  const status = f.status ?? "active";
                  return (
                    <tr key={f.id} className="border-b border-border/60 last:border-0">
                      <td className="px-3 py-2 text-xs font-medium whitespace-nowrap">{f.name}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{f.activityType}</td>
                      <td className="px-2 py-2 text-xs text-muted-foreground whitespace-nowrap">{f.unit}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-nowrap gap-1">
                          {contributingKpis.map((kpi) => (
                            <span
                              key={kpi.kpiId}
                              className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border ${
                                status === "active"
                                  ? "bg-primary/10 text-primary border-primary/20"
                                  : "bg-muted text-muted-foreground border-border/50 line-through"
                              }`}
                              title={kpi.name}
                            >
                              {kpi.code}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          status === "active"
                            ? "border border-border bg-green-50 text-carbon-success"
                            : "border border-border/50 bg-muted text-muted-foreground"
                        }`}>
                          {status === "active" ? "활성" : "비활성"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ── 참조 데이터 (시설 미등록 시 fallback) ── */
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">활동명</th>
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">산정방식</th>
                  <th className="px-2 py-2 text-left font-medium whitespace-nowrap">단위</th>
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">기여 KPI</th>
                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">상태</th>
                </tr>
              </thead>
              <tbody>
                {referenceRows.map((row) => (
                  <tr key={row.name} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2 text-xs font-medium whitespace-nowrap">{row.name}</td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${METHOD_STYLE[row.method] ?? ""}`}>
                        {row.method}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs text-muted-foreground whitespace-nowrap">{row.unit}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-nowrap gap-1">
                        {contributingKpis.map((kpi) => (
                          <span
                            key={kpi.kpiId}
                            className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                            title={kpi.name}
                          >
                            {kpi.code}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        row.status === "active"
                          ? "border border-border bg-green-50 text-carbon-success"
                          : "border border-border/50 bg-muted text-muted-foreground"
                      }`}>
                        {row.status === "active" ? "활성" : "비활성"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* KPI 범례 */}
        {contributingKpis.length > 0 && (
          <div className="border-t border-border bg-muted/20 px-3 py-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {contributingKpis.map((kpi) => (
                <span key={kpi.kpiId} className="text-[10px] text-muted-foreground">
                  <span className="font-medium text-primary">{kpi.code}</span>
                  {" "}
                  {kpi.name}
                  <span className="ml-1 text-muted-foreground/60">(자동 집계)</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
