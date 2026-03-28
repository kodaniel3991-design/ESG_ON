"use client";

interface ReferenceRow {
  name: string;
  method: string;
  unit: string;
  source: string;
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
    { name: "원재료 구매", method: "Activity Based", unit: "ton", source: "GHG Protocol Cat.1" },
    { name: "부품·소모품 구매", method: "Activity Based", unit: "ton", source: "GHG Protocol Cat.1" },
    { name: "포장재", method: "Spend Based", unit: "만원", source: "GHG Protocol Cat.1" },
    { name: "외주 서비스", method: "Spend Based", unit: "만원", source: "GHG Protocol Cat.1" },
  ],
  u2: [
    { name: "생산 설비", method: "Activity Based", unit: "ton", source: "GHG Protocol Cat.2" },
    { name: "건물·리트로핏", method: "Spend Based", unit: "만원", source: "GHG Protocol Cat.2" },
    { name: "차량·장비", method: "Activity Based", unit: "ton", source: "GHG Protocol Cat.2" },
    { name: "IT·네트워크 인프라", method: "Spend Based", unit: "만원", source: "GHG Protocol Cat.2" },
  ],
  u3: [
    { name: "연료 전처리 공정", method: "Activity Based", unit: "GJ", source: "국가 배출계수 DB" },
    { name: "송배전 손실", method: "Activity Based", unit: "MWh", source: "국가 배출계수 DB" },
    { name: "재생에너지 관련", method: "Activity Based", unit: "MWh", source: "GHG Protocol Cat.3" },
  ],
  u4: [
    { name: "원자재 수입 수송", method: "Activity Based", unit: "ton·km", source: "DEFRA/국내 계수" },
    { name: "물류센터 입고 수송", method: "Activity Based", unit: "ton·km", source: "DEFRA/국내 계수" },
    { name: "해상 운송", method: "Activity Based", unit: "ton·km", source: "IMO 기준" },
  ],
  u5: [
    { name: "일반 폐기물(매립)", method: "Activity Based", unit: "ton", source: "국내 폐기물 계수" },
    { name: "재활용 폐기물", method: "Activity Based", unit: "ton", source: "국내 폐기물 계수" },
    { name: "위험 폐기물(소각)", method: "Activity Based", unit: "ton", source: "국내 폐기물 계수" },
  ],
  u6: [
    { name: "항공 출장", method: "Activity Based", unit: "person-km", source: "ICAO/DEFRA" },
    { name: "철도 출장", method: "Activity Based", unit: "person-km", source: "국내 배출계수" },
    { name: "렌터카·택시", method: "Activity Based", unit: "km", source: "IPCC/국내 계수" },
    { name: "숙박", method: "Activity Based", unit: "night", source: "GHG Protocol Cat.6" },
  ],
  u7: [
    { name: "자가용 통근", method: "Activity Based", unit: "km", source: "국내 배출계수" },
    { name: "대중교통 통근", method: "Activity Based", unit: "person-km", source: "국내 배출계수" },
    { name: "통근버스", method: "Activity Based", unit: "person-km", source: "국내 배출계수" },
  ],
  u8: [
    { name: "임차 사무실", method: "Activity Based", unit: "m²", source: "GHG Protocol Cat.8" },
    { name: "임차 창고·설비", method: "Activity Based", unit: "m²", source: "GHG Protocol Cat.8" },
  ],
  d1: [
    { name: "제품 배송(육상)", method: "Activity Based", unit: "ton·km", source: "DEFRA/국내 계수" },
    { name: "리테일 물류", method: "Activity Based", unit: "ton·km", source: "DEFRA/국내 계수" },
  ],
  d2: [
    { name: "부품 가공(하도급)", method: "Activity Based", unit: "ton", source: "GHG Protocol Cat.10" },
    { name: "조립 외주", method: "Spend Based", unit: "만원", source: "GHG Protocol Cat.10" },
  ],
  d3: [
    { name: "전자제품 사용 전력", method: "Activity Based", unit: "kWh", source: "GHG Protocol Cat.11" },
    { name: "연료 사용 제품", method: "Activity Based", unit: "GJ", source: "GHG Protocol Cat.11" },
  ],
  d4: [
    { name: "제품 소각 처리", method: "Activity Based", unit: "ton", source: "국내 폐기물 계수" },
    { name: "제품 매립 처리", method: "Activity Based", unit: "ton", source: "국내 폐기물 계수" },
    { name: "재활용 처리", method: "Activity Based", unit: "ton", source: "국내 폐기물 계수" },
  ],
  d5: [
    { name: "임대 매장", method: "Activity Based", unit: "m²", source: "GHG Protocol Cat.13" },
    { name: "임대 물류센터", method: "Activity Based", unit: "m²", source: "GHG Protocol Cat.13" },
  ],
  d6: [
    { name: "가맹점 에너지 사용", method: "Activity Based", unit: "MWh", source: "GHG Protocol Cat.14" },
    { name: "가맹점 연료 사용", method: "Activity Based", unit: "GJ", source: "GHG Protocol Cat.14" },
  ],
  d7: [
    { name: "지분 투자", method: "Average Based", unit: "억원", source: "GHG Protocol Cat.15" },
    { name: "채권 투자", method: "Average Based", unit: "억원", source: "GHG Protocol Cat.15" },
    { name: "프로젝트 파이낸싱", method: "Average Based", unit: "억원", source: "GHG Protocol Cat.15" },
  ],
};

interface Scope3SourceReferenceProps {
  activeCategoryId: string;
}

const METHOD_STYLE: Record<string, string> = {
  "Activity Based": "border border-border bg-green-50 text-carbon-success",
  "Spend Based": "border border-sky-100 bg-sky-50 text-sky-700",
  "Average Based": "border border-primary/30 bg-primary/10 text-primary",
};

export function Scope3SourceReference({ activeCategoryId }: Scope3SourceReferenceProps) {
  const rows = REFERENCE_DATA[activeCategoryId] ?? [];
  const label = CATEGORY_LABELS[activeCategoryId] ?? activeCategoryId;

  return (
    <section className="flex h-full flex-col space-y-3">
      <div>
        <h2 className="text-sm font-medium text-foreground">배출원 목록</h2>
        <p className="text-xs text-muted-foreground">
          {label} 카테고리의 배출원 목록입니다.
        </p>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <th className="px-3 py-2 text-left font-medium">활동명</th>
              <th className="px-3 py-2 text-left font-medium">산정방식</th>
              <th className="px-3 py-2 text-left font-medium">단위</th>
              <th className="px-3 py-2 text-left font-medium">출처</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-b border-border/60 last:border-0">
                <td className="px-3 py-2 text-xs font-medium">{row.name}</td>
                <td className="px-3 py-2 text-xs">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${METHOD_STYLE[row.method] ?? ""}`}>
                    {row.method}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{row.unit}</td>
                <td className="px-3 py-2 text-[11px] text-muted-foreground">{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
