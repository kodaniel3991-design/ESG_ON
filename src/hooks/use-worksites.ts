"use client";

import { useQuery } from "@tanstack/react-query";

export interface WorksiteItem {
  id: string;
  name: string;
  address?: string;
  isDefault?: boolean;
}

export function useWorksites() {
  return useQuery({
    queryKey: ["worksites"],
    queryFn: async (): Promise<WorksiteItem[]> => {
      const res = await fetch("/api/organization");
      if (!res.ok) return [];
      const org = await res.json();
      return (org.worksites ?? []).map((w: any) => ({
        id: w.id,
        name: w.name,
        address: w.address,
        isDefault: w.isDefault ?? false,
      }));
    },
    staleTime: 1000 * 60 * 10,
  });
}
