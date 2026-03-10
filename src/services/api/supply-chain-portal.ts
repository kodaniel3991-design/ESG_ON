import type {
  PortalVendor,
  PortalInvitation,
  SubmissionByVendor,
  Scope3CategoryPortal,
  VendorEsgScore,
  VerificationItem,
  EvidenceFile,
  PortalSettings,
} from "@/types";
import {
  mockPortalVendors,
  mockPortalInvitations,
  mockSubmissions,
  mockScope3CategoriesPortal,
  mockVendorEsgScores,
  mockVerificationItems,
  mockEvidenceFiles,
  mockPortalSettings,
} from "@/lib/mock";

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getPortalVendors(): Promise<PortalVendor[]> {
  await delay(200);
  return mockPortalVendors;
}

export async function getPortalInvitations(): Promise<PortalInvitation[]> {
  await delay(150);
  return mockPortalInvitations;
}

export async function getSubmissions(): Promise<SubmissionByVendor[]> {
  await delay(200);
  return mockSubmissions;
}

export async function getScope3CategoriesPortal(): Promise<Scope3CategoryPortal[]> {
  await delay(180);
  return mockScope3CategoriesPortal;
}

export async function getVendorEsgScores(): Promise<VendorEsgScore[]> {
  await delay(200);
  return mockVendorEsgScores;
}

export async function getVerificationItems(): Promise<VerificationItem[]> {
  await delay(200);
  return mockVerificationItems;
}

export async function getEvidenceFiles(verificationId?: string): Promise<EvidenceFile[]> {
  await delay(150);
  if (verificationId) {
    return mockEvidenceFiles.filter((e) => e.verificationId === verificationId);
  }
  return mockEvidenceFiles;
}

export async function getPortalSettings(): Promise<PortalSettings> {
  await delay(100);
  return mockPortalSettings;
}
