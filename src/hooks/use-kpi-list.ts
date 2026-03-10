"use client";

import { useQuery } from "@tanstack/react-query";
import { getKpiList } from "@/services/api";
import { queryKeys } from "@/lib/query-keys";

export function useKpiList() {
  return useQuery({
    queryKey: queryKeys.kpi.list,
    queryFn: getKpiList,
  });
}

