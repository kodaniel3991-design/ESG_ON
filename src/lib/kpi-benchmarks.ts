/**
 * KPI별 산업 벤치마크 및 목표 제안 데이터
 * 출처: 환경부 온실가스 종합정보센터, K-ESG 가이드라인, CDP 산업 평균, NDC 2030 목표
 */

export interface KpiBenchmark {
  /** 산업 평균 */
  industryAvg?: string;
  /** 우수 기업 수준 */
  bestPractice?: string;
  /** 국가/글로벌 목표 */
  nationalTarget?: string;
  /** 참고 출처 */
  source: string;
  /** 권장 감축률 (전년 대비 %) */
  suggestedReductions?: number[];
}

/** KPI명 → 벤치마크 데이터 */
const BASE_BENCHMARKS: Record<string, KpiBenchmark> = {
  // ── 환경 ──
  "온실가스 배출량(Scope 1+2)": {
    industryAvg: "제조업 평균 원단위 0.45 tCO2e/억원",
    bestPractice: "선도 기업 0.20 tCO2e/억원",
    nationalTarget: "NDC 2030: 2018년 대비 40% 감축",
    source: "환경부 온실가스 종합정보센터, NDC 로드맵",
    suggestedReductions: [3, 5, 10],
  },
  "공급망 탄소(Scope 3)": {
    industryAvg: "전체 배출의 70~90% 수준",
    bestPractice: "주요 협력사 50% 이상 탄소 데이터 수집",
    nationalTarget: "SBTi: 2030년까지 Scope 3 25% 감축",
    source: "GHG Protocol Scope 3 Standard, SBTi",
    suggestedReductions: [5, 10, 15],
  },
  "배출 감축률": {
    industryAvg: "연간 3~5% 감축",
    bestPractice: "연간 7% 이상 감축 (SBTi 1.5°C 경로)",
    nationalTarget: "NDC: 연평균 4.17% 감축 필요",
    source: "SBTi, NDC 로드맵",
    suggestedReductions: [3, 5, 7],
  },
  "총 에너지 사용량": {
    industryAvg: "제조업 원단위 1.2 GJ/백만원",
    bestPractice: "에너지 효율 상위 10% 기업 0.7 GJ/백만원",
    source: "에너지경제연구원",
    suggestedReductions: [2, 5, 8],
  },
  "재생에너지 비율": {
    industryAvg: "국내 기업 평균 5~8%",
    bestPractice: "RE100 가입 기업 30% 이상",
    nationalTarget: "RE100: 2030년 60%, 2050년 100%",
    source: "RE100, 한국에너지공단",
  },
  "용수 사용량": {
    industryAvg: "제조업 원단위 15 m³/백만원",
    bestPractice: "수자원 재이용률 30% 이상",
    source: "환경부 물관리 종합계획",
    suggestedReductions: [3, 5, 10],
  },
  "폐기물 발생량": {
    industryAvg: "제조업 재활용률 65%",
    bestPractice: "Zero Waste to Landfill 인증 기업 95%+",
    source: "환경부 자원순환정보시스템",
    suggestedReductions: [3, 5, 10],
  },
  "기후 리스크 영향도": {
    bestPractice: "TCFD 권고안 4대 영역 전체 공시",
    source: "TCFD",
  },
  "탄소중립 목표": {
    nationalTarget: "국가 목표: 2050 탄소중립",
    bestPractice: "SBTi 인증 넷제로 목표 보유",
    source: "NDC, SBTi",
  },
  // ── 사회 ──
  "산업재해율": {
    industryAvg: "제조업 평균 0.49%",
    bestPractice: "선도 기업 0.1% 이하",
    nationalTarget: "산업안전보건법: 사고사망 만인율 50% 감소",
    source: "고용노동부 산업재해 통계",
    suggestedReductions: [10, 20, 30],
  },
  "사망 사고 건수": {
    bestPractice: "Zero Fatality 목표",
    nationalTarget: "중대재해처벌법: 사망 시 경영책임자 처벌",
    source: "고용노동부, 중대재해처벌법",
  },
  "총 직원 수": {
    source: "GRI 102-8",
  },
  "여성 고용 비율": {
    industryAvg: "제조업 평균 20~25%",
    bestPractice: "30% 이상 (양성평등 기업 인증)",
    source: "여성가족부 양성평등 실태조사",
  },
  "여성 관리자 비율": {
    industryAvg: "국내 기업 평균 15~20%",
    bestPractice: "30% 이상 (글로벌 상위 기업)",
    source: "GRI 405, MSCI ESG",
  },
  "교육훈련 시간": {
    industryAvg: "1인당 연 40~60시간",
    bestPractice: "80시간 이상",
    source: "GRI 404-1, 한국직업능력연구원",
  },
  "이직률": {
    industryAvg: "제조업 평균 12~15%",
    bestPractice: "8% 이하",
    source: "GRI 401, 한국경영자총협회",
    suggestedReductions: [5, 10, 15],
  },
  "성별 임금 격차": {
    industryAvg: "국내 평균 31% 격차",
    bestPractice: "5% 이내 (유럽 선도 기업)",
    nationalTarget: "EU Pay Transparency Directive: 격차 공시 의무",
    source: "GRI 405, OECD",
    suggestedReductions: [5, 10, 20],
  },
  "아동노동 발생 여부": {
    bestPractice: "Zero Tolerance + 공급망 실사",
    source: "ILO, UN Guiding Principles",
  },
  "강제노동 발생 여부": {
    bestPractice: "Zero Tolerance + 공급망 실사",
    source: "ILO, Modern Slavery Act",
  },
  // ── 거버넌스 ──
  "사외이사 비율": {
    industryAvg: "국내 상장사 평균 40~50%",
    bestPractice: "과반수 이상 (글로벌 기준)",
    nationalTarget: "자산 2조 이상: 과반수 의무",
    source: "상법, 코리아 거버넌스 포럼",
  },
  "여성 이사 비율": {
    industryAvg: "국내 평균 5~10%",
    bestPractice: "30% 이상 (EU 기준)",
    nationalTarget: "자산 2조 이상: 1인 이상 의무",
    source: "자본시장법, EU Board Gender Diversity",
  },
  "ESG 위원회 존재 여부": {
    industryAvg: "국내 상장사 30% 보유",
    bestPractice: "이사회 산하 독립 ESG 위원회",
    source: "K-ESG, KCGS",
  },
  "반부패 정책 존재 여부": {
    bestPractice: "UNGC 10원칙 + 반부패 교육 100%",
    source: "GRI 205, UNGC",
  },
  "윤리강령 존재 여부": {
    bestPractice: "전 임직원 서약 + 연 1회 교육",
    source: "GRI 205, EcoVadis",
  },
  "ESG 보고서 발간 여부": {
    industryAvg: "코스피200 기업 95% 발간",
    bestPractice: "GRI Standards 준수 + 제3자 검증",
    source: "GRI, KPMG Survey of Sustainability Reporting",
  },
  "외부 검증 여부": {
    industryAvg: "국내 ESG 보고서 60% 검증",
    bestPractice: "Limited 이상 검증 + ISAE 3000",
    source: "GRI, KPMG",
  },
  "법규 위반 건수": {
    bestPractice: "Zero Violation 목표",
    source: "GRI 206",
  },
  "정보보안 사고 건수": {
    bestPractice: "Zero Incident + ISO 27001 인증",
    source: "GRI, ISMS-P",
  },
};

/** 산업군별 가중치 조정 */
const INDUSTRY_OVERRIDES: Record<string, Record<string, Partial<KpiBenchmark>>> = {
  자동차: {
    "온실가스 배출량(Scope 1+2)": { industryAvg: "자동차 산업 원단위 0.35 tCO2e/억원", bestPractice: "전기차 전환 기업 0.15 tCO2e/억원" },
    "산업재해율": { industryAvg: "자동차 산업 평균 0.62%" },
  },
  "IT/소프트웨어": {
    "온실가스 배출량(Scope 1+2)": { industryAvg: "IT 산업 원단위 0.08 tCO2e/억원", bestPractice: "탄소중립 달성 기업 0 tCO2e" },
    "총 에너지 사용량": { industryAvg: "데이터센터 PUE 1.6 평균", bestPractice: "PUE 1.2 이하 (Google/Meta 수준)" },
  },
  금융: {
    "온실가스 배출량(Scope 1+2)": { industryAvg: "금융 산업 원단위 0.02 tCO2e/억원 (Scope 1+2 직접 배출 적음)" },
  },
  건설: {
    "산업재해율": { industryAvg: "건설업 평균 0.95% (전 산업 최고)", bestPractice: "해외 선도 건설사 0.3%" },
    "폐기물 발생량": { industryAvg: "건설 폐기물 재활용률 70%", bestPractice: "90% 이상 재활용" },
  },
};

/** KPI명 + 산업군으로 벤치마크 조회 */
export function getKpiBenchmark(kpiName: string, industry?: string): KpiBenchmark | null {
  const base = BASE_BENCHMARKS[kpiName];
  if (!base) return null;

  if (industry) {
    const override = INDUSTRY_OVERRIDES[industry]?.[kpiName];
    if (override) return { ...base, ...override };
  }

  return base;
}

/** 전년 실적 기반 감축 목표 제안 */
export function suggestTargets(prevValue: number, reductions?: number[]): { label: string; value: number }[] {
  const rates = reductions ?? [3, 5, 10];
  return rates.map((r) => ({
    label: `전년 대비 -${r}%`,
    value: Math.round(prevValue * (1 - r / 100) * 1000) / 1000,
  }));
}
