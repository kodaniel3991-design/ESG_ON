// 설정 메뉴 구조 (최종 메뉴 트리 기준)

export type SettingsLink = { href: string; label: string };

export type SettingsGroup = {
  label: string;
  children: SettingsLink[];
};

export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    label: "",
    children: [
      { href: "/settings/organization", label: "조직 관리" },
      { href: "/settings/users", label: "사용자 관리" },
      { href: "/settings/roles", label: "권한 관리" },
      { href: "/settings/integrations", label: "데이터 연동 설정" },
      { href: "/settings/employee-roster", label: "임/직원 관리" },
      { href: "/settings/api-keys", label: "API 키 관리" },
      { href: "/settings/system", label: "시스템 설정" },
    ],
  },
];

export const ALL_SETTINGS_LINKS = SETTINGS_GROUPS.flatMap((g) => g.children);
