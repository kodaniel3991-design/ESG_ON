"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface EmissionFactorRow {
  id: number;
  factor_code: string;
  scope: number;
  category_code: string | null;
  fuel_code: string | null;
  source_type: string | null;
  country: string;
  year: number;
  source_name: string;
  source_version: string | null;
  valid_from: string | null;
  valid_to: string | null;
  calculation_method: string | null;
  co2_factor: number | null;
  co2_factor_unit: string | null;
  ch4_factor: number | null;
  ch4_factor_unit: string | null;
  n2o_factor: number | null;
  n2o_factor_unit: string | null;
  ncv: number | null;
  ncv_unit: string | null;
  carbon_content_factor: number | null;
  oxidation_factor: number | null;
  gwp_ch4: number | null;
  gwp_n2o: number | null;
  source_id: number | null;
  active: boolean;
}

export type EmissionFactorInput = Omit<EmissionFactorRow, "id" | "active"> & { active?: boolean };

async function fetchFactors(params: { scope?: number; fuel_code?: string; active?: boolean }) {
  const url = new URL("/api/emission-factors", window.location.origin);
  if (params.scope !== undefined) url.searchParams.set("scope", String(params.scope));
  if (params.fuel_code) url.searchParams.set("fuel_code", params.fuel_code);
  if (params.active !== undefined) url.searchParams.set("active", params.active ? "1" : "0");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<EmissionFactorRow[]>;
}

export function useEmissionFactors(params: { scope?: number; fuel_code?: string; active?: boolean } = {}) {
  return useQuery({
    queryKey: ["emission-factors", params],
    queryFn: () => fetchFactors(params),
  });
}

export function useCreateEmissionFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: EmissionFactorInput) => {
      const res = await fetch("/api/emission-factors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emission-factors"] }),
  });
}

export function useUpdateEmissionFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: EmissionFactorRow) => {
      const res = await fetch(`/api/emission-factors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emission-factors"] }),
  });
}

export function useDeleteEmissionFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/emission-factors/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emission-factors"] }),
  });
}
