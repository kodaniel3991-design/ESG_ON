import { prisma } from "@/lib/db";

/* ── KPI 이름 → 자동 집계 규칙 매핑 ── */
interface AutoCalcRule {
  scope: number | number[];
  categories?: string[];
  formula: "emission" | "activity";
}

/** KPI 이름(부분 일치)에 따른 자동 calcRule 매핑. 순서대로 첫 매치 적용. */
const AUTO_CALC_RULES: { match: (name: string) => boolean; rule: AutoCalcRule }[] = [
  // 탄소/기후 — Scope 1+2
  { match: (n) => n.includes("Scope 1+2") || n === "온실가스 배출량(Scope 1+2)", rule: { scope: [1, 2], formula: "emission" } },
  // Scope 3
  { match: (n) => n.includes("Scope 3") || n.includes("Scope3") || n.includes("공급망 탄소"), rule: { scope: 3, formula: "emission" } },
  // 탄소 집약도, 배출 감축률 — Scope 1+2 기반
  { match: (n) => n === "탄소 집약도" || n === "배출 감축률" || n === "탄소중립 목표 달성률", rule: { scope: [1, 2], formula: "emission" } },
  // 에너지 — Scope 1+2 활동량 합산
  { match: (n) => n === "총 에너지 사용량", rule: { scope: [1, 2], formula: "activity" } },
  { match: (n) => n === "에너지 집약도" || n === "에너지 절감량" || n === "에너지 효율", rule: { scope: [1, 2], formula: "activity" } },
  // 재생에너지 — Scope 2 전력
  { match: (n) => n.includes("재생에너지"), rule: { scope: 2, categories: ["electricity"], formula: "activity" } },
];

/** KPI 이름으로 자동 calcRule 결정 */
export function resolveAutoCalcRule(name: string): { calcType: string; calcRule: string | null } {
  for (const entry of AUTO_CALC_RULES) {
    if (entry.match(name)) {
      return { calcType: "auto", calcRule: JSON.stringify(entry.rule) };
    }
  }
  return { calcType: "manual", calcRule: null };
}

/**
 * calcRule이 없는 KPI 중 자동 매핑 가능한 것들을 일괄 업데이트.
 * 시설 저장 시 호출하여 배출원 등록과 KPI 매핑을 자동 연결합니다.
 */
export async function autoMapUnlinkedKpis(): Promise<number> {
  const allKpis = await prisma.kpiMaster.findMany();
  let updated = 0;
  for (const kpi of allKpis) {
    if (kpi.calcRule) continue; // 이미 설정된 KPI는 건너뜀
    const { calcType, calcRule } = resolveAutoCalcRule(kpi.name);
    if (calcType === "auto") {
      await prisma.kpiMaster.update({
        where: { id: kpi.id },
        data: { calcType, calcRule },
      });
      updated++;
    }
  }
  return updated;
}
