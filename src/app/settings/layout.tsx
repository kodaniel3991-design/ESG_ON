import type { Metadata } from "next";
import { SettingsLayoutClient } from "@/components/settings/settings-layout-client";

export const metadata: Metadata = {
  title: "설정 | CarbonOS",
  description: "조직, 사용자, 데이터, 보고서, AI, 시스템 설정",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SettingsLayoutClient>{children}</SettingsLayoutClient>;
}
