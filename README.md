# CarbonOS – Frontend

Premium enterprise SaaS dashboard for ESG carbon management. Frontend-only implementation with mock data and a clear path to FastAPI backend integration.

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix-based components)
- **Recharts** for charts
- **Zustand** for client state
- **TanStack React Query** for server state (ready for API swap)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**400/500 에러가 나올 때 (화면 비거나 Internal Server Error)**

1. **우선 프로덕션으로 실행해 보기 (500 해결에 가장 확실)**  
   개발 서버에서 500이 나오면, 아래로 실행한 뒤 **http://localhost:3000** 에 접속하세요.
   ```bash
   npm run build
   npm run start
   ```
   이렇게 하면 500 없이 앱이 동작합니다.

2. **개발 서버를 쓸 때**  
   실행 중인 `npm run dev`를 **모두** `Ctrl+C`로 종료한 뒤, **한 번만** 아래 실행.
   ```bash
   npm run dev:fresh
   ```
   그다음 **기존 localhost 탭은 닫고**, **시크릿 창(Ctrl+Shift+N)** 에서 **http://localhost:3000** 접속.

3. **`EADDRINUSE`(포트 사용 중)**  
   - 다른 터미널에서 `Ctrl+C`로 서버 종료 후, 한 터미널에서만 `npm run dev:fresh` 실행.  
   - 또는 (Windows) `netstat -ano | findstr :3000` → `taskkill /PID <숫자> /F` 로 프로세스 종료.

4. **계속 400/500이면**  
   - `npm run dev:turbo` 로 실행 후 새 시크릿 창에서 접속.  
   - `.next`를 안티바이러스·OneDrive 제외 목록에 넣거나, 프로젝트를 동기화 폴더 밖으로 옮겨 보기.

## Folder structure

```
src/
├── app/                    # App Router pages and layout
│   ├── analytics/          # Emission Analytics
│   ├── carbon-flow/        # Carbon Flow
│   ├── compliance/         # Compliance Status
│   ├── insights/           # AI Carbon Insight
│   ├── reports/             # ESG Reports
│   ├── scope3/              # 공급망 포털 (Supply Chain Portal)
│   │   ├── page.tsx         # 포털 대시보드
│   │   ├── vendors/         # 협력사 관리
│   │   ├── invite/          # 협력사 초대
│   │   ├── submissions/     # ESG/탄소 데이터 제출 현황
│   │   ├── categories/      # Scope 3 카테고리 관리
│   │   ├── assessment/      # 협력사 ESG 평가
│   │   ├── verification/    # 데이터 검증
│   │   └── settings/        # 포털 설정
│   ├── simulator/          # Reduction Strategy Simulator
│   ├── layout.tsx
│   ├── page.tsx             # Main Dashboard
│   ├── globals.css
│   └── providers.tsx        # React Query provider
├── components/
│   ├── dashboard/           # Dashboard-specific (e.g. KpiCard)
│   ├── layout/              # Sidebar, PageHeader, TopHeader
│   ├── portal/              # 공급망 포털 전용 (VendorTable, InviteModal, EsgScoreCard 등)
│   └── ui/                  # shadcn-style primitives
├── lib/
│   ├── mock/                # Mock data (no UI imports)
│   │   ├── emissions.ts
│   │   ├── carbon-flow.ts
│   │   ├── supply-chain.ts
│   │   ├── insights.ts
│   │   ├── simulator.ts
│   │   ├── reports.ts
│   │   ├── compliance.ts
│   │   ├── supply-chain-portal.ts   # 공급망 포털 mock (협력사, 초대, 제출, Scope3, ESG, 검증, 설정)
│   │   └── index.ts
│   └── utils.ts
├── services/
│   └── api/                 # API layer – replace with real HTTP later
│       ├── emissions.ts
│       ├── carbon-flow.ts
│       ├── supply-chain.ts
│       ├── insights.ts
│       ├── simulator.ts
│       ├── reports.ts
│       ├── compliance.ts
│       ├── supply-chain-portal.ts   # 공급망 포털 API (FastAPI 연동 시 교체)
│       └── index.ts
├── stores/                  # Zustand stores
│   └── ui-store.ts
└── types/
    └── index.ts             # Shared TypeScript types
```

## 공급망 포털 (Supply Chain Portal)

상단 메뉴 **공급망 포털** 드롭다운 또는 `/scope3` 경로로 접근합니다. Frontend 전용이며 mock 데이터로 동작합니다.

| 경로 | 페이지 |
|------|--------|
| `/scope3` | 포털 대시보드 (요약 카드, Scope3 완성도 차트) |
| `/scope3/vendors` | 협력사 관리 (테이블, 검색/필터, 초대·재발송 모달) |
| `/scope3/invite` | 협력사 초대 (발송 목록, 상태, 재발송) |
| `/scope3/submissions` | ESG/탄소 데이터 제출 현황 (협력사별 상태·완성도·배출량) |
| `/scope3/categories` | Scope 3 카테고리 관리 (배출량·완성도 시각화) |
| `/scope3/assessment` | 협력사 ESG 평가 (ESG 점수 카드, 리스크 뱃지) |
| `/scope3/verification` | 데이터 검증 (워크플로우, 증빙 파일 목록) |
| `/scope3/settings` | 포털 설정 (초대 만료일, 알림, Tier, 증빙 옵션) |

- **타입**: `src/types/index.ts` 하단의 Portal 관련 타입 사용.
- **Mock**: `src/lib/mock/supply-chain-portal.ts` · **API**: `src/services/api/supply-chain-portal.ts`. 백엔드 연동 시 API 레이어만 교체하면 됩니다.

## Backend integration

- **Types** in `src/types/index.ts` are designed to mirror future FastAPI DTOs.
- **API layer** in `src/services/api/` currently returns mock data. Replace each function with `fetch('/api/...')` or your API client; components do not need to change.
- **React Query** is already used for all data; switch `queryFn` to your API and add error/retry as needed.

## Design

- Dark enterprise UI (Apple / Stripe / Linear inspired).
- CSS variables in `globals.css` for theming; `carbon-*` tokens for semantic colors.
- Desktop-first; layout is responsive.

## Scripts

- `npm run dev` – development server (port 3000)
- `npm run dev:clean` – delete `.next` and start dev (500 발생 시 권장)
- `npm run dev:turbo` – dev server with Turbopack (Windows 파일 잠금 완화에 도움)
- `npm run build` – production build
- `npm run start` – run production build
- `npm run lint` – ESLint
