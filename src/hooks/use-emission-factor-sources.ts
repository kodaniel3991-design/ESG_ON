"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface EmissionFactorSourceRow {
  id: number;
  source_code: string;
  publisher: string;
  document_name: string;
  document_url: string | null;
  country: string;
  year: number;
  version: string | null;
  notes: string | null;
  active: boolean;
}

export type EmissionFactorSourceInput = Omit<EmissionFactorSourceRow, "id" | "active"> & {
  active?: boolean;
};

async function fetchSources(params: { country?: string; active?: boolean }) {
  const url = new URL("/api/emission-factor-sources", window.location.origin);
  if (params.country) url.searchParams.set("country", params.country);
  if (params.active !== undefined) url.searchParams.set("active", params.active ? "1" : "0");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<EmissionFactorSourceRow[]>;
}

export function useEmissionFactorSources(
  params: { country?: string; active?: boolean } = {}
) {
  return useQuery({
    queryKey: ["emission-factor-sources", params],
    queryFn: () => fetchSources(params),
  });
}

/** 폼 select 옵션용 — 활성 출처만 반환 */
export function useEmissionFactorSourceOptions() {
  return useQuery({
    queryKey: ["emission-factor-sources", { active: true }],
    queryFn: () => fetchSources({ active: true }),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateEmissionFactorSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: EmissionFactorSourceInput) => {
      const res = await fetch("/api/emission-factor-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emission-factor-sources"] }),
  });
}

export function useUpdateEmissionFactorSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: EmissionFactorSourceRow) => {
      const res = await fetch(`/api/emission-factor-sources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emission-factor-sources"] }),
  });
}

export function useDeleteEmissionFactorSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/emission-factor-sources/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emission-factor-sources"] }),
  });
}
