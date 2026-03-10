import type { CommuteTransportType } from "@/types";

/**
 * 교통수단·연료별 배출계수 (tCO₂e/근무일)
 * 출퇴근 1일 기준 평균 배출량. 실제 거리·연비 반영 시 API/설정에서 조정 가능.
 */
export const COMMUTE_EMISSION_FACTORS: Record<
  CommuteTransportType,
  number
> = {
  public: 0.0045,      // 대중교통 (버스·지하철 등)
  car_gasoline: 0.018, // 자가용(휘발유)
  car_diesel: 0.015,   // 자가용(경유)
  car_lpg: 0.012,      // 자가용(LPG)
  ev: 0.0015,          // 전기·수소
  walk_bike: 0,        // 도보·자전거
};

/** 직원의 교통수단·연료에 따른 배출계수 (tCO₂e/근무일). 미지정 시 defaultFactor 사용 */
export function getEmployeeCommuteFactor(
  transport: CommuteTransportType | undefined,
  fuel: string | undefined,
  defaultFactor: number
): number {
  if (!transport) return defaultFactor;
  return COMMUTE_EMISSION_FACTORS[transport];
}

