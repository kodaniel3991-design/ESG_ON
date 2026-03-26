"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UserItem, UserStatus, RoleItem } from "@/types";
import {
  deleteUser,
  getRoles,
  getUsers,
  inviteUser,
  setUserStatus,
  upsertUser,
} from "@/services/api";
import { Check, Plus, Trash2, X } from "lucide-react";
import { USER_STATUS_LABEL } from "@/lib/constants/status-badges";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationBar } from "@/components/common/pagination-bar";

const inputClass =
  "h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-2 py-1 text-xs ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring";

const emptyForm = { name: "", email: "", department: "", jobTitle: "", roleId: "" };

function trimOptional(s: string | undefined): string | undefined {
  const t = s?.trim();
  return t === "" ? undefined : t;
}

export default function SettingsUsersPage() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading: usersLoading } = useQuery<UserItem[]>({
    queryKey: ["settings-users"],
    queryFn: getUsers,
  });
  const { data: roles = [], isLoading: rolesLoading } = useQuery<RoleItem[]>({
    queryKey: ["settings-roles"],
    queryFn: getRoles,
  });

  const inviteMutation = useMutation({
    mutationFn: inviteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings-users"] }),
  });
  const upsertMutation = useMutation({
    mutationFn: upsertUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings-users"] }),
  });
  const statusMutation = useMutation({
    mutationFn: setUserStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings-users"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings-users"] }),
  });

  const [query, setQueryState] = useState(() =>
    typeof window !== "undefined" ? (sessionStorage.getItem("users-search-q") ?? "") : ""
  );
  const setQuery = (val: string) => {
    setQueryState(val);
    sessionStorage.setItem("users-search-q", val);
  };
  const [showAddRow, setShowAddRow] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.email, u.department ?? "", u.jobTitle ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [users, query]);

  const pagination = usePagination({ totalItems: filtered.length, pageSize: 10 });
  const visibleUsers = pagination.paginate(filtered);

  const handleAdd = async () => {
    const payload = {
      name: addForm.name.trim(),
      email: addForm.email.trim(),
      department: trimOptional(addForm.department),
      jobTitle: trimOptional(addForm.jobTitle),
      roleId: trimOptional(addForm.roleId),
    };
    if (!payload.name || !payload.email) return;
    await inviteMutation.mutateAsync(payload);
    setAddForm(emptyForm);
    setShowAddRow(false);
  };

  const handleRoleChange = (user: UserItem, roleId: string) => {
    upsertMutation.mutate({ ...user, roleId: roleId || undefined });
  };

  const handleStatusChange = (userId: string, status: UserStatus) => {
    statusMutation.mutate({ userId, status });
  };

  return (
    <>
      <PageHeader
        title="사용자 및 권한"
        description="사용자 계정과 역할·권한을 관리합니다."
      />

      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">사용자 목록</CardTitle>
              <p className="text-sm text-muted-foreground">
                역할 할당, 상태 변경, 삭제를 수행할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색 (이름/이메일/부서/직책)"
                className={inputClass}
              />
              <Button
                size="sm"
                onClick={() => { setShowAddRow(true); setAddForm(emptyForm); }}
                disabled={showAddRow}
              >
                <Plus className="mr-1 h-4 w-4" />
                사용자 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <p className="text-sm text-muted-foreground">불러오는 중...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs" aria-label="사용자 목록">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="w-24 pb-2 pr-2 font-medium">이름</th>
                      <th className="w-32 pb-2 pr-2 font-medium">이메일</th>
                      <th className="w-24 pb-2 pr-2 font-medium">부서</th>
                      <th className="w-24 pb-2 pr-2 font-medium">직책</th>
                      <th className="w-28 pb-2 pr-2 font-medium">역할</th>
                      <th className="w-20 pb-2 pr-2 font-medium">상태</th>
                      <th className="w-28 pb-2 pr-2 font-medium">최근 로그인</th>
                      <th className="w-16 pb-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {/* 인라인 추가 행 */}
                    {showAddRow && (
                      <tr className="bg-muted/30">
                        <td className="py-1.5 pr-2">
                          <input
                            autoFocus
                            value={addForm.name}
                            onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="이름"
                            className={inputClass}
                          />
                        </td>
                        <td className="py-1.5 pr-2">
                          <input
                            value={addForm.email}
                            onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
                            placeholder="이메일"
                            className={inputClass}
                          />
                        </td>
                        <td className="py-1.5 pr-2">
                          <input
                            value={addForm.department}
                            onChange={(e) => setAddForm((p) => ({ ...p, department: e.target.value }))}
                            placeholder="부서"
                            className={inputClass}
                          />
                        </td>
                        <td className="py-1.5 pr-2">
                          <input
                            value={addForm.jobTitle}
                            onChange={(e) => setAddForm((p) => ({ ...p, jobTitle: e.target.value }))}
                            placeholder="직책"
                            className={inputClass}
                          />
                        </td>
                        <td className="py-1.5 pr-2">
                          <select
                            value={addForm.roleId}
                            onChange={(e) => setAddForm((p) => ({ ...p, roleId: e.target.value }))}
                            className={inputClass}
                          >
                            <option value="">미지정</option>
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1.5 pr-2 text-muted-foreground">-</td>
                        <td className="py-1.5 pr-2 text-muted-foreground">-</td>
                        <td className="py-1.5">
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-primary"
                              onClick={handleAdd}
                              disabled={inviteMutation.isPending || !addForm.name || !addForm.email}
                              title="저장"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground"
                              onClick={() => setShowAddRow(false)}
                              title="취소"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {filtered.length === 0 && !showAddRow ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-muted-foreground">
                          표시할 사용자가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      visibleUsers.map((u) => (
                        <tr key={u.id}>
                          <td className="py-2 pr-2 font-medium">{u.name}</td>
                          <td className="py-2 pr-2 text-muted-foreground">{u.email}</td>
                          <td className="py-2 pr-2">{u.department ?? "-"}</td>
                          <td className="py-2 pr-2">{u.jobTitle ?? "-"}</td>
                          <td className="py-2 pr-2">
                            <select
                              value={u.roleId ?? ""}
                              onChange={(e) => handleRoleChange(u, e.target.value)}
                              className={inputClass}
                              disabled={rolesLoading || upsertMutation.isPending}
                            >
                              <option value="">미지정</option>
                              {roles.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 pr-2">
                            <select
                              value={u.status}
                              onChange={(e) => handleStatusChange(u.id, e.target.value as UserStatus)}
                              className={inputClass}
                              disabled={statusMutation.isPending}
                            >
                              <option value="active">{USER_STATUS_LABEL["active"]}</option>
                              <option value="invited">{USER_STATUS_LABEL["invited"]}</option>
                              <option value="disabled">{USER_STATUS_LABEL["disabled"]}</option>
                            </select>
                          </td>
                          <td className="py-2 pr-2 text-muted-foreground">{u.lastLoginAt ?? "-"}</td>
                          <td className="py-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => deleteMutation.mutate(u.id)}
                              disabled={deleteMutation.isPending}
                              title="삭제"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <PaginationBar pagination={pagination} totalItems={filtered.length} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
