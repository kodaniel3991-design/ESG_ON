import type { UserItem, RoleItem } from "@/types";

export const mockRoles: RoleItem[] = [
  { id: "r-admin", name: "관리자", systemCode: "Admin", description: "전체 설정 및 모든 기능 접근" },
  { id: "r-manager", name: "매니저", systemCode: "Manager", description: "데이터 입력/검증 및 보고서 관리" },
  { id: "r-analyst", name: "분석가", systemCode: "Analyst", description: "조회/분석 중심 권한" },
  { id: "r-viewer", name: "뷰어", systemCode: "Viewer", description: "읽기 전용" },
];

export const mockUsers: UserItem[] = [
  {
    id: "u-1",
    name: "홍길동",
    email: "gildong@carbonos.demo",
    department: "ESG",
    jobTitle: "팀장",
    roleId: "r-admin",
    status: "active",
    lastLoginAt: "2026-03-08 10:21",
    createdAt: "2025-12-01",
  },
  {
    id: "u-2",
    name: "김서연",
    email: "seoyeon@carbonos.demo",
    department: "지속가능경영",
    jobTitle: "매니저",
    roleId: "r-manager",
    status: "active",
    lastLoginAt: "2026-03-09 09:05",
    createdAt: "2026-01-10",
  },
  {
    id: "u-3",
    name: "이준호",
    email: "junho@carbonos.demo",
    department: "데이터",
    jobTitle: "분석가",
    roleId: "r-analyst",
    status: "invited",
    createdAt: "2026-03-01",
  },
  {
    id: "u-4",
    name: "박민지",
    email: "minji@carbonos.demo",
    department: "재무",
    jobTitle: "담당",
    roleId: "r-viewer",
    status: "disabled",
    lastLoginAt: "2026-02-10 14:12",
    createdAt: "2026-02-01",
  },
];

