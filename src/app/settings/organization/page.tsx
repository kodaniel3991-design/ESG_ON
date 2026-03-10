"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { OrganizationSettings, WorksiteItem } from "@/types";
import {
  createWorksiteDraft,
  getOrganizationSettings,
  saveOrganizationSettings,
} from "@/services/api";
import { Plus, Save, Trash2, Star } from "lucide-react";

const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring";

function trimOptional(s: string | undefined): string | undefined {
  const t = s?.trim();
  return t === "" ? undefined : t;
}

export default function SettingsOrganizationPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["organization-settings"],
    queryFn: getOrganizationSettings,
  });

  const saveMutation = useMutation({
    mutationFn: saveOrganizationSettings,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["organization-settings"] }),
  });

  const [form, setForm] = useState<OrganizationSettings>({
    organizationName: "",
    worksites: [],
    defaultWorksiteId: undefined,
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      organizationName: data.organizationName ?? "",
      worksites: (data.worksites ?? []).map((w) => ({ ...w })),
      defaultWorksiteId: data.defaultWorksiteId,
    });
  }, [data]);

  const defaultWorksite = useMemo(
    () =>
      form.defaultWorksiteId
        ? form.worksites.find((w) => w.id === form.defaultWorksiteId)
        : undefined,
    [form.defaultWorksiteId, form.worksites]
  );

  const handleAdd = () => {
    setForm((p) => {
      const ws = createWorksiteDraft();
      const next = { ...p, worksites: [...p.worksites, ws] };
      if (!next.defaultWorksiteId) next.defaultWorksiteId = ws.id;
      return next;
    });
  };

  const handleRemove = (id: string) => {
    setForm((p) => {
      const worksites = p.worksites.filter((w) => w.id !== id);
      const defaultWorksiteId =
        p.defaultWorksiteId === id ? worksites[0]?.id : p.defaultWorksiteId;
      return { ...p, worksites, defaultWorksiteId };
    });
  };

  const handleWorksiteChange = (
    id: string,
    field: keyof WorksiteItem,
    value: string
  ) => {
    setForm((p) => ({
      ...p,
      worksites: p.worksites.map((w) =>
        w.id === id ? { ...w, [field]: value } : w
      ),
    }));
  };

  const setDefault = (id: string) => {
    setForm((p) => ({ ...p, defaultWorksiteId: id }));
  };

  const handleSave = async () => {
    const payload: OrganizationSettings = {
      organizationName: form.organizationName.trim() || "조직",
      defaultWorksiteId: form.defaultWorksiteId,
      worksites: form.worksites
        .filter((w) => w.name.trim() !== "" || w.address.trim() !== "")
        .map((w) => ({
          id: w.id,
          name: w.name.trim() || "사업장",
          address: w.address.trim(),
          addressDetail: trimOptional(w.addressDetail),
        })),
    };

    // default가 삭제되었거나 비어있다면 첫 사업장으로 보정
    if (
      payload.defaultWorksiteId &&
      !payload.worksites.some((w) => w.id === payload.defaultWorksiteId)
    ) {
      payload.defaultWorksiteId = payload.worksites[0]?.id;
    }

    await saveMutation.mutateAsync(payload);
  };

  return (
    <>
      <PageHeader
        title="조직 및 사업장"
        description="조직 정보와 사업장 목록을 관리합니다. 기본 사업장은 직원 출퇴근 거리 산출의 출근지로 사용됩니다."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">조직 정보</CardTitle>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saveMutation.isPending || isLoading}
            >
              <Save className="mr-1 h-4 w-4" />
              {saveMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">불러오는 중...</p>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    조직명
                  </label>
                  <input
                    value={form.organizationName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, organizationName: e.target.value }))
                    }
                    placeholder="조직명"
                    className={inputClass}
                  />
                </div>
                <div className="rounded-md border border-border bg-muted/20 p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    기본 사업장 (출근지)
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {defaultWorksite?.name ?? "미지정"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {(defaultWorksite?.address ?? "").trim() || "주소를 입력하세요"}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">사업장 목록</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdd}
              disabled={isLoading}
            >
              <Plus className="mr-1 h-4 w-4" /> 추가
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">불러오는 중...</p>
            ) : form.worksites.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                등록된 사업장이 없습니다. &quot;추가&quot;로 사업장을 등록하세요.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="w-36 pb-2 pr-2 font-medium">사업장명</th>
                      <th className="min-w-[240px] pb-2 pr-2 font-medium">주소</th>
                      <th className="min-w-[200px] pb-2 pr-2 font-medium">
                        상세주소
                      </th>
                      <th className="w-28 pb-2 pr-2 font-medium">기본</th>
                      <th className="w-12 pb-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {form.worksites.map((w) => {
                      const isDefault = w.id === form.defaultWorksiteId;
                      return (
                        <tr key={w.id} className="align-top">
                          <td className="py-2 pr-2">
                            <input
                              value={w.name}
                              onChange={(e) =>
                                handleWorksiteChange(w.id, "name", e.target.value)
                              }
                              placeholder="사업장명"
                              className={inputClass}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              value={w.address}
                              onChange={(e) =>
                                handleWorksiteChange(
                                  w.id,
                                  "address",
                                  e.target.value
                                )
                              }
                              placeholder="주소"
                              className={inputClass}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              value={w.addressDetail ?? ""}
                              onChange={(e) =>
                                handleWorksiteChange(
                                  w.id,
                                  "addressDetail",
                                  e.target.value
                                )
                              }
                              placeholder="층/호수 등"
                              className={inputClass}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <Button
                              type="button"
                              variant={isDefault ? "default" : "outline"}
                              size="sm"
                              onClick={() => setDefault(w.id)}
                              title="기본 사업장으로 설정"
                            >
                              <Star className="mr-1 h-4 w-4" />
                              {isDefault ? "기본" : "설정"}
                            </Button>
                          </td>
                          <td className="py-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => handleRemove(w.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
