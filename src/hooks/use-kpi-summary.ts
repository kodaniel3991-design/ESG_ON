"use client";

import { useQuery } from "@tanstack/react-query";
import { getKpiSummary } from "@/services/api";
import { queryKeys } from "@/lib/query-keys";

export function useKpiSummary() {
  return useQuery({
    queryKey: queryKeys.kpi.summary,
    queryFn: getKpiSummary,
  });
}

