import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공급망 포털 | CarbonOS",
  description: "협력사 관리, ESG/탄소 데이터 제출·검증, Scope 3 카테고리 관리",
};

export default function Scope3PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
