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

export const mockPortalVendors: PortalVendor[] = [
  { id: "v1", name: "(주)한국부품소재", email: "contact@koreaparts.co.kr", status: "active", tier: 1, category: "구입상품 및 서비스", linkedAt: "2024-01-15", submissionStatus: "verified", esgScore: 82, riskLevel: "low" },
  { id: "v2", name: "글로벌로지스틱스", email: "esg@globallogistics.com", status: "active", tier: 1, category: "상류 수송 및 유통", linkedAt: "2024-02-01", submissionStatus: "submitted", esgScore: 75, riskLevel: "medium" },
  { id: "v3", name: "에너지서비스코리아", email: "data@energyco.kr", status: "invited", tier: 2, category: "연료·에너지 관련", invitedAt: "2024-03-01", submissionStatus: "in_progress", riskLevel: "medium" },
  { id: "v4", name: "대한화학", email: "sustainability@dhchem.co.kr", status: "pending", tier: 2, category: "구입상품 및 서비스", submissionStatus: "not_started", riskLevel: "high" },
  { id: "v5", name: "시티물류", email: "portal@citylogistics.kr", status: "active", tier: 1, category: "상류 수송 및 유통", linkedAt: "2024-01-20", submissionStatus: "verified", esgScore: 88, riskLevel: "low" },
];

export const mockPortalInvitations: PortalInvitation[] = [
  { id: "inv1", vendorId: "v3", vendorName: "에너지서비스코리아", email: "data@energyco.kr", sentAt: "2024-03-01T09:00:00Z", expiresAt: "2024-03-31T23:59:59Z", status: "pending" },
  { id: "inv2", vendorId: "v4", vendorName: "대한화학", email: "sustainability@dhchem.co.kr", sentAt: "2024-02-15T10:00:00Z", expiresAt: "2024-03-15T23:59:59Z", status: "pending" },
];

export const mockSubmissions: SubmissionByVendor[] = [
  { vendorId: "v1", vendorName: "(주)한국부품소재", period: "2024", status: "verified", submittedAt: "2024-02-20", scope3CategoriesCompleted: 8, scope3CategoriesTotal: 8, emissionsTco2e: 101.1 },
  { vendorId: "v2", vendorName: "글로벌로지스틱스", period: "2024", status: "submitted", submittedAt: "2024-03-05", scope3CategoriesCompleted: 6, scope3CategoriesTotal: 8, emissionsTco2e: 87.5 },
  { vendorId: "v3", vendorName: "에너지서비스코리아", period: "2024", status: "in_progress", scope3CategoriesCompleted: 2, scope3CategoriesTotal: 8 },
  { vendorId: "v4", vendorName: "대한화학", period: "2024", status: "not_started", scope3CategoriesCompleted: 0, scope3CategoriesTotal: 8 },
  { vendorId: "v5", vendorName: "시티물류", period: "2024", status: "verified", submittedAt: "2024-02-18", scope3CategoriesCompleted: 8, scope3CategoriesTotal: 8, emissionsTco2e: 32.1 },
];

export const mockScope3CategoriesPortal: Scope3CategoryPortal[] = [
  { id: "c1", name: "구입상품 및 서비스", code: "U1", totalEmissionsTco2e: 3200, completionPercent: 100, vendorCount: 12, verifiedCount: 10 },
  { id: "c2", name: "자본재", code: "U2", totalEmissionsTco2e: 600, completionPercent: 75, vendorCount: 4, verifiedCount: 3 },
  { id: "c3", name: "상류 수송 및 유통", code: "U4", totalEmissionsTco2e: 1680, completionPercent: 90, vendorCount: 8, verifiedCount: 7 },
  { id: "c4", name: "출장", code: "U6", totalEmissionsTco2e: 850, completionPercent: 100, vendorCount: 1, verifiedCount: 1 },
  { id: "c5", name: "직원 출퇴근", code: "U7", totalEmissionsTco2e: 420, completionPercent: 100, vendorCount: 1, verifiedCount: 1 },
  { id: "c6", name: "하류 수송 및 유통", code: "D1", totalEmissionsTco2e: 540, completionPercent: 60, vendorCount: 5, verifiedCount: 3 },
];

export const mockVendorEsgScores: VendorEsgScore[] = [
  { vendorId: "v1", vendorName: "(주)한국부품소재", overallScore: 82, environmentScore: 85, socialScore: 80, governanceScore: 81, riskLevel: "low", trend: "up", lastUpdated: "2024-03-01" },
  { vendorId: "v2", vendorName: "글로벌로지스틱스", overallScore: 75, environmentScore: 78, socialScore: 72, governanceScore: 75, riskLevel: "medium", trend: "stable", lastUpdated: "2024-03-05" },
  { vendorId: "v5", vendorName: "시티물류", overallScore: 88, environmentScore: 90, socialScore: 86, governanceScore: 88, riskLevel: "low", trend: "up", lastUpdated: "2024-02-18" },
];

export const mockVerificationItems: VerificationItem[] = [
  { id: "ver1", vendorId: "v1", vendorName: "(주)한국부품소재", period: "2024", step: "data_review", stepStatus: "approved", requestedAt: "2024-02-20", completedAt: "2024-02-22", assignedTo: "김검증" },
  { id: "ver2", vendorId: "v2", vendorName: "글로벌로지스틱스", period: "2024", step: "evidence_check", stepStatus: "in_review", requestedAt: "2024-03-05", assignedTo: "이검증" },
  { id: "ver3", vendorId: "v5", vendorName: "시티물류", period: "2024", step: "approval", stepStatus: "approved", requestedAt: "2024-02-18", completedAt: "2024-02-19", assignedTo: "김검증" },
];

export const mockEvidenceFiles: EvidenceFile[] = [
  { id: "e1", verificationId: "ver1", fileName: "한국부품소재_2024_배출량보고.pdf", fileType: "application/pdf", uploadedAt: "2024-02-21T14:00:00Z", uploadedBy: "(주)한국부품소재", status: "approved" },
  { id: "e2", verificationId: "ver1", fileName: "에너지사용량_증빙.xlsx", fileType: "application/vnd.ms-excel", uploadedAt: "2024-02-21T14:05:00Z", uploadedBy: "(주)한국부품소재", status: "approved" },
  { id: "e3", verificationId: "ver2", fileName: "글로벌로지스_Scope3_2024.pdf", fileType: "application/pdf", uploadedAt: "2024-03-06T09:00:00Z", uploadedBy: "글로벌로지스틱스", status: "pending" },
];

export const mockPortalSettings: PortalSettings = {
  invitationExpiryDays: 30,
  reminderDaysBeforeExpiry: 7,
  defaultTier: 1,
  requireEvidence: true,
  allowedFileTypes: [".pdf", ".xlsx", ".xls", ".csv"],
};
