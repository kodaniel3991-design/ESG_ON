"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  calculateDistanceKm,
  getDistanceApiSettings,
  getEmployeeRoster,
  getWorksiteLocation,
  saveDistanceApiSettings,
  saveEmployeeRoster,
  saveWorksiteLocation,
} from "@/services/api";
import type {
  DistanceApiProvider,
  DistanceApiSettings,
  EmployeeRosterItem,
  CommuteTransportType,
  WorksiteLocation,
} from "@/types";
import { Plus, Trash2, Ruler, Save } from "lucide-react";

const COMMUTE_TRANSPORT_OPTIONS: { value: CommuteTransportType; label: string }[] = [
  { value: "public", label: "대중교통" },
  { value: "car_gasoline", label: "자가용(휘발유)" },
  { value: "car_diesel", label: "자가용(경유)" },
  { value: "car_lpg", label: "자가용(LPG)" },
  { value: "ev", label: "전기·수소" },
  { value: "walk_bike", label: "도보·자전거" },
];

const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring";

function trimOptional(s: string | undefined): string | undefined {
  const t = s?.trim();
  return t === "" ? undefined : t;
}

export default function SettingsEmployeeRosterPage() {
  const queryClient = useQueryClient();
  const { data: roster, isLoading } = useQuery({
    queryKey: ["employee-roster"],
    queryFn: getEmployeeRoster,
  });
  const { data: worksite } = useQuery({
    queryKey: ["commute-worksite"],
    queryFn: getWorksiteLocation,
  });
  const { data: distanceSettings } = useQuery({
    queryKey: ["commute-distance-api-settings"],
    queryFn: getDistanceApiSettings,
  });

  const saveMutation = useMutation({
    mutationFn: saveEmployeeRoster,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["employee-roster"] }),
  });
  const saveWorksiteMutation = useMutation({
    mutationFn: saveWorksiteLocation,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["commute-worksite"] }),
  });
  const saveDistanceSettingsMutation = useMutation({
    mutationFn: saveDistanceApiSettings,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["commute-distance-api-settings"],
      }),
  });

  const [list, setList] = useState<EmployeeRosterItem[]>([]);
  useEffect(() => {
    if (roster) setList(roster.map((e) => ({ ...e })));
  }, [roster]);

  const [worksiteForm, setWorksiteForm] = useState<WorksiteLocation>({
    name: "",
    address: "",
    addressDetail: "",
  });
  useEffect(() => {
    if (!worksite) return;
    setWorksiteForm({
      name: worksite.name ?? "",
      address: worksite.address ?? "",
      addressDetail: worksite.addressDetail ?? "",
    });
  }, [worksite]);

  const [distanceSettingsForm, setDistanceSettingsForm] =
    useState<DistanceApiSettings>({
      provider: "none",
      enabled: false,
      baseUrl: "",
      apiKey: "",
    });
  useEffect(() => {
    if (!distanceSettings) return;
    setDistanceSettingsForm({
      provider: distanceSettings.provider ?? "none",
      enabled: !!distanceSettings.enabled,
      baseUrl: distanceSettings.baseUrl ?? "",
      apiKey: distanceSettings.apiKey ?? "",
    });
  }, [distanceSettings]);

  const handleAdd = () => {
    setList((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name: "",
        department: "",
        jobTitle: "",
        employeeId: "",
        commuteTransport: undefined,
        fuel: "",
        address: "",
        addressDetail: "",
        commuteDistanceKm: undefined,
      },
    ]);
  };

  const handleRemove = (id: string) => {
    setList((prev) => prev.filter((e) => e.id !== id));
  };

  const handleChange = (
    id: string,
    field: keyof EmployeeRosterItem,
    value: string | undefined
  ) => {
    setList((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              [field]:
                field === "commuteTransport"
                  ? (value as CommuteTransportType) || undefined
                  : value ?? "",
            }
          : e
      )
    );
  };

  const handleSave = async () => {
    const toSave = list
      .filter((e) => e.name.trim() !== "")
      .map((e) => ({
        ...e,
        department: trimOptional(e.department),
        name: e.name.trim(),
        jobTitle: trimOptional(e.jobTitle),
        employeeId: trimOptional(e.employeeId),
        commuteTransport: e.commuteTransport,
        fuel: trimOptional(e.fuel),
        address: trimOptional(e.address),
        addressDetail: trimOptional(e.addressDetail),
        commuteDistanceKm: e.commuteDistanceKm,
      }));
    await saveMutation.mutateAsync(toSave);
    setList(toSave);
  };

  const handleSaveWorksite = async () => {
    const payload: WorksiteLocation = {
      name: worksiteForm.name.trim() || "사업장",
      address: worksiteForm.address.trim(),
      addressDetail: trimOptional(worksiteForm.addressDetail),
    };
    await saveWorksiteMutation.mutateAsync(payload);
  };

  const handleSaveDistanceSettings = async () => {
    const payload: DistanceApiSettings = {
      provider: distanceSettingsForm.provider,
      enabled: !!distanceSettingsForm.enabled,
      baseUrl:
        distanceSettingsForm.provider === "custom"
          ? trimOptional(distanceSettingsForm.baseUrl)
          : trimOptional(distanceSettingsForm.baseUrl),
      apiKey: trimOptional(distanceSettingsForm.apiKey),
    };
    await saveDistanceSettingsMutation.mutateAsync(payload);
  };

  const calcEmployeeDistance = async (emp: EmployeeRosterItem) => {
    if (!worksiteForm.address.trim() || !(emp.address ?? "").trim()) return 0;
    const km = await calculateDistanceKm({
      originAddress: emp.address ?? "",
      originDetail: emp.addressDetail,
      destinationAddress: worksiteForm.address,
      destinationDetail: worksiteForm.addressDetail,
    });
    setList((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, commuteDistanceKm: km } : e))
    );
    return km;
  };

  const calcAllDistances = async () => {
    for (const emp of list) {
      if (!(emp.address ?? "").trim()) continue;
      await calcEmployeeDistance(emp);
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="직원명부"
          description="Scope 3 직원 출퇴근 배출량 산출 시 사용할 직원 목록을 등록합니다."
        />
        <Card className="mt-6">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">불러오는 중...</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="직원명부"
        description="Scope 3 직원 출퇴근에 사용할 직원 정보를 입력합니다. 상세주소/사업장 주소를 등록하고 거리 산출 API를 설정하면 직원별 주소 ↔ 사업장 거리(km)를 산출할 수 있습니다."
      />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">사업장(출근지) 주소</CardTitle>
            <Button
              size="sm"
              onClick={handleSaveWorksite}
              disabled={saveWorksiteMutation.isPending}
            >
              <Save className="mr-1 h-4 w-4" />
              {saveWorksiteMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  사업장명
                </label>
                <input
                  value={worksiteForm.name}
                  onChange={(e) =>
                    setWorksiteForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="예: 본사"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  주소
                </label>
                <input
                  value={worksiteForm.address}
                  onChange={(e) =>
                    setWorksiteForm((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="사업장 주소"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                상세주소
              </label>
              <input
                value={worksiteForm.addressDetail ?? ""}
                onChange={(e) =>
                  setWorksiteForm((p) => ({
                    ...p,
                    addressDetail: e.target.value,
                  }))
                }
                placeholder="층/호수 등"
                className={inputClass}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              직원명부의 주소(기본/상세)와 이 사업장 주소를 이용해 거리(km)를 산출합니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">거리 산출 API 설정</CardTitle>
            <Button
              size="sm"
              onClick={handleSaveDistanceSettings}
              disabled={saveDistanceSettingsMutation.isPending}
            >
              <Save className="mr-1 h-4 w-4" />
              {saveDistanceSettingsMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                id="distance-api-enabled"
                type="checkbox"
                checked={distanceSettingsForm.enabled}
                onChange={(e) =>
                  setDistanceSettingsForm((p) => ({
                    ...p,
                    enabled: e.target.checked,
                  }))
                }
                className="h-4 w-4"
              />
              <label
                htmlFor="distance-api-enabled"
                className="text-sm font-medium"
              >
                거리 산출 API 사용
              </label>
              <span className="text-xs text-muted-foreground">
                (현재는 demo 값으로 산출되며, 추후 실제 API 호출로 교체 가능)
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Provider
                </label>
                <select
                  value={distanceSettingsForm.provider}
                  onChange={(e) =>
                    setDistanceSettingsForm((p) => ({
                      ...p,
                      provider: e.target.value as DistanceApiProvider,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="none">미사용</option>
                  <option value="kakao">Kakao</option>
                  <option value="naver">Naver</option>
                  <option value="google">Google</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  API Key
                </label>
                <input
                  value={distanceSettingsForm.apiKey ?? ""}
                  onChange={(e) =>
                    setDistanceSettingsForm((p) => ({
                      ...p,
                      apiKey: e.target.value,
                    }))
                  }
                  placeholder="API Key"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Base URL (Custom)
              </label>
              <input
                value={distanceSettingsForm.baseUrl ?? ""}
                onChange={(e) =>
                  setDistanceSettingsForm((p) => ({
                    ...p,
                    baseUrl: e.target.value,
                  }))
                }
                placeholder="예: https://example.com/distance"
                className={inputClass}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">직원 목록</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={calcAllDistances}>
              <Ruler className="mr-1 h-4 w-4" /> 거리 일괄 계산
            </Button>
            <Button variant="outline" size="sm" onClick={handleAdd}>
              <Plus className="mr-1 h-4 w-4" /> 추가
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              등록된 직원이 없습니다. &quot;추가&quot;로 직원을 등록한 뒤
              &quot;저장&quot;하세요.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="w-24 pb-2 pr-2 font-medium">부서</th>
                    <th className="w-24 pb-2 pr-2 font-medium">이름</th>
                    <th className="w-24 pb-2 pr-2 font-medium">직책</th>
                    <th className="w-24 pb-2 pr-2 font-medium">사원번호</th>
                    <th className="w-32 pb-2 pr-2 font-medium">
                      출퇴근 교통수단
                    </th>
                    <th className="w-24 pb-2 pr-2 font-medium">연료</th>
                    <th className="min-w-[200px] pb-2 pr-2 font-medium">주소</th>
                    <th className="min-w-[160px] pb-2 pr-2 font-medium">
                      상세주소
                    </th>
                    <th className="w-28 pb-2 pr-2 font-medium">거리(km)</th>
                    <th className="w-24 pb-2 pr-2 font-medium">거리계산</th>
                    <th className="w-12 pb-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {list.map((emp) => (
                    <tr key={emp.id} className="align-top">
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={emp.department ?? ""}
                          onChange={(e) =>
                            handleChange(emp.id, "department", e.target.value)
                          }
                          placeholder="부서"
                          className={inputClass}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={emp.name}
                          onChange={(e) =>
                            handleChange(emp.id, "name", e.target.value)
                          }
                          placeholder="이름"
                          className={inputClass}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={emp.jobTitle ?? ""}
                          onChange={(e) =>
                            handleChange(emp.id, "jobTitle", e.target.value)
                          }
                          placeholder="직책"
                          className={inputClass}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={emp.employeeId ?? ""}
                          onChange={(e) =>
                            handleChange(emp.id, "employeeId", e.target.value)
                          }
                          placeholder="사원번호"
                          className={inputClass}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <select
                          value={emp.commuteTransport ?? ""}
                          onChange={(e) =>
                            handleChange(
                              emp.id,
                              "commuteTransport",
                              e.target.value || undefined
                            )
                          }
                          className={inputClass}
                        >
                          <option value="">선택</option>
                          {COMMUTE_TRANSPORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={emp.fuel ?? ""}
                          onChange={(e) =>
                            handleChange(emp.id, "fuel", e.target.value)
                          }
                          placeholder="연료"
                          className={inputClass}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={emp.address ?? ""}
                          onChange={(e) =>
                            handleChange(emp.id, "address", e.target.value)
                          }
                          placeholder="주소"
                          className={inputClass}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={emp.addressDetail ?? ""}
                          onChange={(e) =>
                            handleChange(
                              emp.id,
                              "addressDetail",
                              e.target.value
                            )
                          }
                          placeholder="상세주소"
                          className={inputClass}
                        />
                      </td>
                      <td className="py-2 pr-2 text-right">
                        <span className="text-sm font-medium">
                          {emp.commuteDistanceKm != null
                            ? emp.commuteDistanceKm.toFixed(2)
                            : "-"}
                        </span>
                      </td>
                      <td className="py-2 pr-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => calcEmployeeDistance(emp)}
                          disabled={
                            !(emp.address ?? "").trim() ||
                            !worksiteForm.address.trim()
                          }
                        >
                          <Ruler className="mr-1 h-4 w-4" />
                          계산
                        </Button>
                      </td>
                      <td className="py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={() => handleRemove(emp.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
