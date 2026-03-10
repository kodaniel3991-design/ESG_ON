import type { ComplianceItem } from "@/types";

export const mockComplianceItems: ComplianceItem[] = [
  {
    id: "c1",
    framework: "CSRD / ESRS",
    requirement: "ESRS E1 – Climate change",
    status: "compliant",
    lastChecked: "2024-03-01",
  },
  {
    id: "c2",
    framework: "CSRD / ESRS",
    requirement: "ESRS E2 – Pollution",
    status: "partial",
    dueDate: "2025-01-31",
    lastChecked: "2024-02-15",
  },
  {
    id: "c3",
    framework: "EU ETS",
    requirement: "Phase IV surrender obligation",
    status: "compliant",
    lastChecked: "2024-04-30",
  },
  {
    id: "c4",
    framework: "SEC",
    requirement: "Climate-related disclosure (proposed)",
    status: "not_applicable",
    lastChecked: "2024-01-10",
  },
];
