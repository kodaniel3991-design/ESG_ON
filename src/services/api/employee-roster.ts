import type { EmployeeRosterItem, CommutingWorkDaysByYear } from "@/types";
import { apiCall } from "@/lib/api";

// ── 직원명부 ──────────────────────────────────────────────────

export async function getEmployeeRoster(worksiteId?: string | null): Promise<EmployeeRosterItem[]> {
  return apiCall(async () => {
    const url = worksiteId
      ? `/api/employees?worksiteId=${encodeURIComponent(worksiteId)}`
      : `/api/employees`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  });
}

export async function saveEmployeeRoster(
  items: EmployeeRosterItem[],
  worksiteId: string | null
): Promise<EmployeeRosterItem[]> {
  return apiCall(async () => {
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ worksiteId, employees: items }),
    });
    if (!res.ok) throw new Error(await res.text());
    return items;
  });
}

// ── 근무일수 ──────────────────────────────────────────────────

export async function getCommutingWorkDays(
  year: string
): Promise<CommutingWorkDaysByYear> {
  return apiCall(async () => {
    const res = await fetch(`/api/commuting-work-days?year=${encodeURIComponent(year)}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  });
}

export async function saveCommutingWorkDays(
  data: CommutingWorkDaysByYear
): Promise<void> {
  return apiCall(async () => {
    const res = await fetch("/api/commuting-work-days", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: data.year, workDays: data.workDays }),
    });
    if (!res.ok) throw new Error(await res.text());
  });
}
