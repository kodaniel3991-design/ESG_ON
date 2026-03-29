"use client";

import { useQueries } from "@tanstack/react-query";

interface DbFacilityRow {
  id: string;
  facility_name: string;
  fuel_type: string | null;
  energy_type: string | null;
  unit: string;
  category_id?: string;
}

async function fetchFacilities(scope: number, category: string): Promise<DbFacilityRow[]> {
  const res = await fetch(`/api/facilities?scope=${scope}&category=${category}`);
  if (!res.ok) return [];
  return res.json();
}

async function fetchActivity(facilityId: string, year: string): Promise<number[]> {
  if (!facilityId) return Array(12).fill(0);
  const res = await fetch(`/api/activity?facilityId=${facilityId}&year=${year}`);
  if (!res.ok) return Array(12).fill(0);
  const data = await res.json();
  return (data.values as number[]) ?? Array(12).fill(0);
}

interface CategoryDef {
  id: string;
  label: string;
}

/**
 * Scope 1/2/3 공통 — 전체 카테고리의 시설 + 활동량을 로드하여
 * 시설별/카테고리별/YoY 비교 데이터를 구성합니다.
 */
export function useScopeComparison(
  scope: number,
  categoryDefs: CategoryDef[],
  currentCategoryId: string,
  year: string,
  getFactorCombined: (fuelOrEnergy: string) => number,
) {
  const years = [year, String(Number(year) - 1), String(Number(year) - 2)];

  // 1. 전체 카테고리의 시설 목록 로드
  const facilityQueries = useQueries({
    queries: categoryDefs.map((cat) => ({
      queryKey: ["facilities", scope, cat.id],
      queryFn: () => fetchFacilities(scope, cat.id),
      staleTime: 1000 * 60 * 5,
    })),
  });

  const allFacilitiesByCategory: Record<string, DbFacilityRow[]> = {};
  categoryDefs.forEach((cat, i) => {
    allFacilitiesByCategory[cat.id] = facilityQueries[i]?.data ?? [];
  });

  const allFacilities = categoryDefs.flatMap((cat) =>
    (allFacilitiesByCategory[cat.id] ?? []).map((f) => ({ ...f, categoryId: cat.id }))
  );

  // 2. 모든 시설 × 모든 연도의 활동량 로드
  const activityQueries = useQueries({
    queries: allFacilities.flatMap((f) =>
      years.map((y) => ({
        queryKey: ["activity", f.id, y],
        queryFn: () => fetchActivity(f.id, y),
        enabled: !!f.id,
        staleTime: 1000 * 60 * 5,
      }))
    ),
  });

  const activityMap: Record<string, number[]> = {};
  let queryIdx = 0;
  allFacilities.forEach((f) => {
    years.forEach((y) => {
      activityMap[`${f.id}-${y}`] = activityQueries[queryIdx]?.data ?? Array(12).fill(0);
      queryIdx++;
    });
  });

  const isLoading = facilityQueries.some((q) => q.isLoading) || activityQueries.some((q) => q.isLoading);

  // 3. 현재 카테고리의 시설별 배출량
  const currentCatFacilities = allFacilitiesByCategory[currentCategoryId] ?? [];
  const facilityEmissions = currentCatFacilities.map((f) => {
    const activity = activityMap[`${f.id}-${year}`] ?? Array(12).fill(0);
    const fuelOrEnergy = f.fuel_type ?? f.energy_type ?? "LNG";
    const factor = getFactorCombined(fuelOrEnergy);
    const monthly = activity.map((v) => (Number.isNaN(v) ? 0 : v) * factor);
    return {
      id: f.id,
      name: f.facility_name,
      fuel: fuelOrEnergy,
      unit: f.unit,
      monthly,
      total: monthly.reduce((s, v) => s + v, 0),
    };
  });

  // 4. 카테고리별 배출량
  const categoryEmissions = categoryDefs.map((cat) => {
    const catFacilities = allFacilitiesByCategory[cat.id] ?? [];
    const monthlyAgg = Array(12).fill(0) as number[];
    catFacilities.forEach((f) => {
      const activity = activityMap[`${f.id}-${year}`] ?? Array(12).fill(0);
      const fuelOrEnergy = f.fuel_type ?? f.energy_type ?? "LNG";
      const factor = getFactorCombined(fuelOrEnergy);
      activity.forEach((v, mi) => {
        monthlyAgg[mi] += (Number.isNaN(v) ? 0 : v) * factor;
      });
    });
    return {
      categoryId: cat.id as any,
      label: cat.label,
      monthly: monthlyAgg,
      total: monthlyAgg.reduce((s, v) => s + v, 0),
      facilityCount: catFacilities.length,
    };
  });

  // 5. 연도별 비교
  const yearComparisons = years.map((y) => {
    const monthlyAgg = Array(12).fill(0) as number[];
    allFacilities.forEach((f) => {
      const activity = activityMap[`${f.id}-${y}`] ?? Array(12).fill(0);
      const fuelOrEnergy = f.fuel_type ?? f.energy_type ?? "LNG";
      const factor = getFactorCombined(fuelOrEnergy);
      activity.forEach((v, mi) => {
        monthlyAgg[mi] += (Number.isNaN(v) ? 0 : v) * factor;
      });
    });
    return { year: y, monthly: monthlyAgg, total: monthlyAgg.reduce((s, v) => s + v, 0) };
  });

  return { isLoading, facilityEmissions, categoryEmissions, yearComparisons };
}
