import type { EmployeeRosterItem, CommutingWorkDaysByYear } from "@/types";
import { mockEmployeeRoster } from "@/lib/mock/employee-roster";

// In-memory store for demo (replace with API calls later)
let rosterStore: EmployeeRosterItem[] = [...mockEmployeeRoster];
const commutingStore: Record<string, CommutingWorkDaysByYear> = {};

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getEmployeeRoster(): Promise<EmployeeRosterItem[]> {
  await delay(150);
  return [...rosterStore];
}

export async function saveEmployeeRoster(
  items: EmployeeRosterItem[]
): Promise<EmployeeRosterItem[]> {
  await delay(200);
  rosterStore = items.map((item) => ({ ...item }));
  return [...rosterStore];
}

export async function getCommutingWorkDays(
  year: string
): Promise<CommutingWorkDaysByYear> {
  await delay(120);
  const existing = commutingStore[year];
  if (existing) return { ...existing, workDays: { ...existing.workDays } };
  return { year, workDays: {} };
}

export async function saveCommutingWorkDays(
  data: CommutingWorkDaysByYear
): Promise<void> {
  await delay(180);
  commutingStore[data.year] = {
    year: data.year,
    workDays: JSON.parse(JSON.stringify(data.workDays)),
  };
}
