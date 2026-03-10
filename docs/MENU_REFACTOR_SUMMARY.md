# CarbonOS 메뉴 구조 리팩토링 요약

## 1. 현재 구조 분석 요약 (리팩토링 전)

- **1depth**: 대시보드(/) + ESG 데이터, 배출량 관리, 공급망 포털, KPI 관리, 중대성 평가, AI 분석, 보고서, 감축 허브, 설정 (드롭다운 9개)
- **라우트**: `/`, `/esg/*`, `/analytics/scope1|2|3`, `/scope3/*`, `/kpi/*`, `/materiality/*`, `/insights/*`, `/reports/*`, `/simulator/*`, `/settings/*`, `/carbon-flow`, `/compliance`
- **설정**: 별도 그룹(기본/데이터/운영/시스템), 사이드바 사용
- **서브네비**: EsgSubNav, EmissionsSubNav, PortalSubNav, KpiSubNav 등 경로가 구 라우트 기준

## 2. Old route → New route 매핑표

| 구 경로 | 신 경로 |
|--------|--------|
| `/` | `/dashboard` (redirect) |
| `/esg/environment` | `/data/esg/environment` |
| `/esg/social` | `/data/esg/social` |
| `/esg/governance` | `/data/esg/governance` |
| `/analytics/scope1` | `/data/emissions/scope1` |
| `/analytics/scope2` | `/data/emissions/scope2` |
| `/analytics/scope3` | `/data/emissions/scope3` |
| `/scope3`, `/scope3/vendors` | `/data/supply-chain/vendors` |
| `/scope3/invite` | `/data/supply-chain/invitations` |
| `/scope3/submissions` | `/data/supply-chain/submissions` |
| `/scope3/verification` | `/data/supply-chain/verification` |
| `/kpi` | `/kpi/dashboard` |
| `/insights` | `/analytics/emissions` |
| `/insights/anomalies` | `/analytics/anomalies` |
| `/insights/scenarios` | `/analytics/scenarios` |
| `/carbon-flow` | `/analytics/carbon-flow` |
| `/simulator`, `/simulator/opportunities` | `/action/targets` |
| `/simulator/projects`, `/simulator/scenarios` | `/action/projects` |
| `/simulator/progress` | `/action/progress` |
| `/reports` | `/reports/esg` |
| `/reports/framework` | `/reports/frameworks/k-esg` |
| `/reports/databook`, `/reports/mapping` | `/reports/esg` |
| `/settings` | `/settings/organization` |
| `/settings/integration` | `/settings/integrations` |

## 3. 새 App Router 폴더 구조

```
app/
├── page.tsx                    # redirect → /dashboard (next.config)
├── dashboard/
│   └── page.tsx               # 대시보드 (DashboardSlot)
├── data/
│   ├── esg/
│   │   ├── environment/       # re-export esg/environment
│   │   ├── social/
│   │   └── governance/
│   ├── emissions/
│   │   ├── scope1/            # re-export analytics/scope1
│   │   ├── scope2/
│   │   └── scope3/
│   ├── supply-chain/
│   │   ├── vendors/          # re-export scope3/vendors
│   │   ├── invitations/      # re-export scope3/invite
│   │   ├── submissions/
│   │   └── verification/
│   └── integrations/
│       ├── erp/               # placeholder
│       ├── iot/               # placeholder
│       └── excel/             # placeholder
├── kpi/
│   ├── page.tsx               # redirect → /kpi/dashboard
│   └── dashboard/             # re-export kpi/page
│   ├── categories/, targets/, performance/, history/
├── analytics/
│   ├── emissions/             # re-export insights/page
│   ├── anomalies/             # re-export insights/anomalies
│   ├── scenarios/             # re-export insights/scenarios
│   └── carbon-flow/           # re-export carbon-flow/page
├── action/
│   ├── targets/               # re-export simulator/opportunities
│   ├── projects/              # re-export simulator/projects
│   ├── progress/              # re-export simulator/progress
│   └── credits/              # placeholder
├── reports/
│   ├── esg/                   # re-export reports/page
│   ├── generated/             # placeholder
│   ├── templates/             # 기존 유지
│   └── frameworks/
│       ├── k-esg/             # re-export reports/framework
│       ├── gri/, issb/, csrd/ # placeholder
├── settings/
│   ├── organization/, users/, system/, integrations/  # 기존/재배치
│   ├── roles/                 # placeholder
│   └── api-keys/              # placeholder
```

## 4. 메뉴 설정 (src/lib/navigation.ts)

- `NAV_ITEMS`: 1depth 7개(대시보드, 데이터 관리, KPI 관리, 분석, 감축 허브, 보고서, 설정)
- 데이터 관리: 2depth(ESG 데이터, 배출량 관리, 공급망 포털, 데이터 연동) + 3depth 링크
- 보고서: 2depth(ESG 보고서/생성된 보고서/템플릿 + 공시 프레임워크(K-ESG, GRI, ISSB, CSRD))
- `ROUTE_LABELS`: pathname → 한글 메뉴명
- `getBreadcrumbs(pathname)`, `isActivePath(pathname, href)` 유틸

## 5. 상단 네비게이션 (src/components/layout/top-header.tsx)

- `NAV_ITEMS` 기반 렌더링
- 1depth 링크: 대시보드 → `/dashboard`
- 1depth 섹션: 드롭다운 + DropdownMenuGroup, 2depth 라벨(div), 3depth(공시 프레임워크 하위) 라벨+링크
- `isItemActive` / `isSectionActive`: pathname 기준 active 표시

## 6. Breadcrumb (src/components/layout/breadcrumb.tsx)

- `getBreadcrumbs(pathname)` 사용, 한글 라벨
- 세그먼트 2개 이상일 때만 표시, 마지막 항목은 현재 페이지(비링크)
- AppLayout 본문 상단에 배치

## 7. Active 메뉴 처리

- `isActivePath(pathname, href)`: `pathname === href` 또는 `pathname.startsWith(href + "/")`
- `/dashboard`는 `pathname === "/" || pathname === "/dashboard"` 동일 처리(ContentSwitcher)
- 상단: `isItemActive`(섹션) / `isSectionActive`(2depth 그룹)로 드롭다운 버튼·메뉴항목 강조
- 서브네비(EsgSubNav, EmissionsSubNav, PortalSubNav, KpiSubNav): href를 신 경로로 변경

## 8. Placeholder / Redirect 생성 파일

**Placeholder 페이지**
- `app/data/integrations/erp/page.tsx`
- `app/data/integrations/iot/page.tsx`
- `app/data/integrations/excel/page.tsx`
- `app/action/credits/page.tsx`
- `app/reports/generated/page.tsx`
- `app/reports/frameworks/gri/page.tsx`
- `app/reports/frameworks/issb/page.tsx`
- `app/reports/frameworks/csrd/page.tsx`
- `app/settings/roles/page.tsx`
- `app/settings/api-keys/page.tsx`

**Redirect (next.config.mjs)**
- `/` → `/dashboard`
- `/esg/*` → `/data/esg/*`
- `/analytics/scope1|2|3` → `/data/emissions/scope1|2|3`
- `/scope3/*` → `/data/supply-chain/*`
- `/kpi` → `/kpi/dashboard`
- `/insights/*`, `/carbon-flow` → `/analytics/*`
- `/simulator/*` → `/action/*`
- `/reports`, `/reports/framework` 등 → `/reports/esg`, `/reports/frameworks/k-esg` 등
- `/settings`, `/settings/integration` → `/settings/organization`, `/settings/integrations`

## 9. 최종 리팩토링 요약

- **1depth**: 대시보드, 데이터 관리, KPI 관리, 분석, 감축 허브, 보고서, 설정 (7개)
- **UI**: 한글 메뉴명, 영문 route, Next.js App Router 유지
- **재사용**: ESG/배출량/공급망/KPI/분석/감축/보고서/설정 기존 페이지는 re-export 또는 redirect로 연결
- **설정**: 설정 사이드바는 `settings-config.ts` 기준(조직/사용자/권한/데이터 연동/API 키/시스템)
- **AI 인사이트**: 제거, 분석 하위에 배출량 분석·이상치 탐지·감축 시나리오·탄소 흐름 분석으로 통합
- **Breadcrumb**: 경로별 한글 라벨, AppLayout 상단
- **Active**: pathname 기준 상단·서브네비 일관 적용
