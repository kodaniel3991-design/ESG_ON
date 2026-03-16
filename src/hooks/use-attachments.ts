"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AttachmentMeta {
  id: number;
  facility_id: string;
  year: number;
  month: number;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

async function fetchAttachments(facilityId: string, year: string): Promise<AttachmentMeta[]> {
  const res = await fetch(`/api/attachments?facilityId=${facilityId}&year=${year}`);
  if (!res.ok) throw new Error("첨부파일 로드 실패");
  return res.json();
}

export function useAttachments(facilityId: string | undefined, year: string) {
  return useQuery({
    queryKey: ["attachments", facilityId, year],
    queryFn: () => fetchAttachments(facilityId!, year),
    enabled: !!facilityId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, facilityId, year, month }: { file: File; facilityId: string; year: string; month: number }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("facilityId", facilityId);
      formData.append("year", year);
      formData.append("month", String(month));
      const res = await fetch("/api/attachments", { method: "POST", body: formData });
      if (!res.ok) throw new Error("업로드 실패");
      return res.json() as Promise<AttachmentMeta>;
    },
    onSuccess: (_, { facilityId, year }) => {
      queryClient.invalidateQueries({ queryKey: ["attachments", facilityId, year] });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: number; facilityId: string; year: string }) => {
      const res = await fetch(`/api/attachments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제 실패");
    },
    onSuccess: (_, { facilityId, year }) => {
      queryClient.invalidateQueries({ queryKey: ["attachments", facilityId, year] });
    },
  });
}
