"use client";

import { useRouter } from "next/navigation";
import { useWizardStore } from "../wizard-store";
import { SCOPE3_GROUPS, getAiRecommendation } from "@/lib/ai-recommendations";
import { ArrowLeft, ArrowRight, Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const SCOPE_INFO = {
  1: { label: "Scope 1 — 직접 배출", desc: "사업장에서 직접 발생하는 온실가스 (연료 연소, 공정 배출 등)" },
  2: { label: "Scope 2 — 간접 배출 (에너지)", desc: "구매 전력·열 사용에 의한 간접 배출" },
  3: { label: "Scope 3 — 기타 간접 배출", desc: "공급망, 제품 사용, 임직원 통근 등 가치사슬 전반" },
};

export default function ScopePage() {
  const router = useRouter();
const { state, updateScope, markStepComplete } = useWizardStore();
  const { scope, organization } = state;

  const aiRec = organization.industry ? getAiRecommendation(organization.industry) : null;
  const recommendedCategories = aiRec?.scope3Categories ?? [];

  const toggleCategory = (cat: string) => {
    const current = scope.scope3Categories;
    updateScope({
      scope3Categories: current.includes(cat)
        ? current.filter((c) => c !== cat)
        : [...current, cat],
    });
  };

  const handleNext = async () => {
    await fetch("/api/organization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationName: state.organization.companyName || "조직",
        scope1Enabled: scope.scope1,
        scope2Enabled: scope.scope2,
        scope3Enabled: scope.scope3,
        scope3Categories: scope.scope3Categories,
      }),
    });
    markStepComplete(3);
    router.push("/getting-started/framework");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h2 className="text-base font-bold text-foreground">③ Scope 설정</h2>
        <p className="text-sm text-muted-foreground">배출량 수집 범위를 설정합니다. Scope 3는 선택형으로 AI가 추천합니다.</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Scope 1 */}
        <div className={cn("rounded-xl border p-4", scope.scope1 ? "border-primary/30 bg-primary/5" : "border-border")}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-foreground">{SCOPE_INFO[1].label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{SCOPE_INFO[1].desc}</p>
            </div>
            <button
              onClick={() => updateScope({ scope1: !scope.scope1 })}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                scope.scope1 ? "bg-primary" : "bg-muted"
              )}
            >
              <span className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
                scope.scope1 ? "left-[22px]" : "left-0.5"
              )} />
            </button>
          </div>
        </div>

        {/* Scope 2 */}
        <div className={cn("rounded-xl border p-4", scope.scope2 ? "border-primary/30 bg-primary/5" : "border-border")}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-foreground">{SCOPE_INFO[2].label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{SCOPE_INFO[2].desc}</p>
            </div>
            <button
              onClick={() => updateScope({ scope2: !scope.scope2 })}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                scope.scope2 ? "bg-primary" : "bg-muted"
              )}
            >
              <span className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
                scope.scope2 ? "left-[22px]" : "left-0.5"
              )} />
            </button>
          </div>
        </div>

        {/* Scope 3 카테고리 */}
        <div className={cn("rounded-xl border p-4", scope.scope3 ? "border-primary/30 bg-primary/5" : "border-border")}>
          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="font-semibold text-foreground">{SCOPE_INFO[3].label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{SCOPE_INFO[3].desc}</p>
            </div>
            <button
              onClick={() => updateScope({ scope3: !scope.scope3 })}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                scope.scope3 ? "bg-primary" : "bg-muted"
              )}
            >
              <span className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
                scope.scope3 ? "left-[22px]" : "left-0.5"
              )} />
            </button>
          </div>

          {scope.scope3 && (
            <>
              {aiRec && (
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  {organization.industry} 산업 AI 추천 카테고리가 강조 표시됩니다
                </div>
              )}

              {/* Upstream / Downstream 섹션 */}
              <div className="flex flex-col gap-3">
                {SCOPE3_GROUPS.map((group) => {
                  const selectedCount = group.categories.filter((c) => scope.scope3Categories.includes(c)).length;
                  return (
                    <div key={group.key} className="rounded-lg border border-border overflow-hidden">
                      {/* 섹션 헤더 */}
                      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">{group.label}</span>
                          <span className="text-[10px] text-muted-foreground">{group.desc}</span>
                        </div>
                        {selectedCount > 0 && (
                          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                            {selectedCount}개 선택
                          </span>
                        )}
                      </div>
                      {/* 카테고리 버튼 */}
                      <div className="flex flex-wrap gap-2 p-3">
                        {group.categories.map((cat) => {
                          const selected = scope.scope3Categories.includes(cat);
                          const recommended = recommendedCategories.includes(cat);
                          return (
                            <button
                              key={cat}
                              onClick={() => toggleCategory(cat)}
                              className={cn(
                                "rounded-lg border px-3 py-1.5 text-xs transition-all",
                                selected
                                  ? "border-primary bg-primary/10 font-semibold text-primary"
                                  : recommended
                                  ? "border-secondary bg-secondary/10 text-secondary-foreground hover:border-secondary"
                                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                              )}
                            >
                              {recommended && !selected && (
                                <Sparkles className="mr-1 inline h-3 w-3 text-secondary" />
                              )}
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {scope.scope3Categories.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  선택된 카테고리: {scope.scope3Categories.length}개
                  {" "}(상류 {SCOPE3_GROUPS[0].categories.filter((c) => scope.scope3Categories.includes(c)).length}개 · 하류 {SCOPE3_GROUPS[1].categories.filter((c) => scope.scope3Categories.includes(c)).length}개)
                </p>
              )}
            </>
          )}
        </div>

        {/* 안내 */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Scope 3는 이후 언제든지 추가·변경할 수 있습니다.
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => router.push("/getting-started/facility")}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> 이전
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          다음: 공시 기준 선택 <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
