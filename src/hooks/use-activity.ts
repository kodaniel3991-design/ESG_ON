"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

async function fetchActivity(facilityId: string, year: string): Promise<number[]> {
  if (!facilityId) return Array(12).fill(0);
  const res = await fetch(`/api/activity?facilityId=${facilityId}&year=${year}`);
  if (!res.ok) throw new Error("활동량 데이터 로드 실패");
  const data = await res.json();
  return data.values as number[];
}

async function saveActivity(facilityId: string, year: string, values: number[]) {
  const res = await fetch("/api/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ facilityId, year: parseInt(year), values }),
  });
  if (!res.ok) throw new Error("활동량 데이터 저장 실패");
  return res.json();
}

export function useActivity(facilityId: string, year: string) {
  return useQuery({
    queryKey: ["activity", facilityId, year],
    queryFn: () => fetchActivity(facilityId, year),
    enabled: !!facilityId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSaveActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ facilityId, year, values }: { facilityId: string; year: string; values: number[] }) =>
      saveActivity(facilityId, year, values),
    onSuccess: (_, { facilityId, year }) => {
      queryClient.invalidateQueries({ queryKey: ["activity", facilityId, year] });
      toast.success("저장되었습니다.");
    },
    onError: () => {
      toast.error("저장에 실패했습니다.");
    },
  });
}
