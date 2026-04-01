# ESG_ON 챗봇 연동 가이드

ESG_ON 앱에 챗봇을 정상 작동시키기 위한 설정 가이드입니다.

## 아키텍처 개요

```
[esg-on.vercel.app]                    [chat-bot-demo-six.vercel.app]
 브라우저 챗봇 위젯  ── POST ──>  /api/chat (중앙 API 서버)
       |                                    |
  /api/chatbot/config                  services.json (서비스 설정)
  (DB에서 API URL 조회)                 OpenAI / Anthropic LLM
                                        Supabase RAG (벡터 검색)
```

- **esg-on**: 챗봇 UI 위젯만 임베드 (API 없음)
- **chat-bot-demo**: 중앙 Chat API 서버 (LLM 호출, 세션 관리, RAG)

---

## 1. chat-bot-demo (중앙 API 서버) 설정

Vercel 프로젝트 `chat-bot-demo`에 아래 환경변수를 설정합니다.

### 필수 환경변수

| 환경변수 | 예시 값 | 설명 |
|---------|--------|------|
| `OPENAI_API_KEY` | `sk-proj-...` | OpenAI API 키 (LLM 호출용) |
| `CHAT_AUTH_DISABLED` | `true` | 외부 서비스에서 인증 없이 접근 허용 |
| `CHAT_ALLOWED_ORIGINS` | `https://esg-on.vercel.app` | CORS 허용 도메인 (쉼표로 복수 지정 가능) |
| `DATABASE_URL` | `postgresql://...?pgbouncer=true` | PostgreSQL 연결 (세션/대화 저장) |
| `DIRECT_URL` | `postgresql://...` | Prisma 마이그레이션용 직접 연결 |
| `NEXTAUTH_SECRET` | 임의 32자 이상 문자열 | NextAuth 서명 키 |

### 선택 환경변수

| 환경변수 | 기본값 | 설명 |
|---------|-------|------|
| `ANTHROPIC_API_KEY` | - | Anthropic Claude 사용 시 |
| `SUPABASE_URL` | - | RAG 벡터 검색용 Supabase URL |
| `SUPABASE_SERVICE_KEY` | - | Supabase 서비스 키 |
| `LOG_LEVEL` | `info` | 로그 레벨 (`error`, `warn`, `info`) |
| `CHAT_RATE_LIMIT_PER_MINUTE` | `30` | 분당 요청 제한 |

### 서비스 등록

`apps/demo/config/services.json`에 esg-on 서비스가 등록되어 있어야 합니다.
`projectId`가 esg-on 앱에서 보내는 값과 일치해야 합니다.

---

## 2. esg-on (클라이언트 앱) 설정

### admin 페이지에서 설정

`https://esg-on.vercel.app/admin/chatbot` (플랫폼 관리 > 챗봇 관리)에서 아래 값을 입력하고 **적용하기**를 클릭합니다.

| 필드 | 값 |
|------|---|
| **projectId** | `esg-on` (services.json에 등록된 ID와 일치) |
| **chat API URL** | `https://chat-bot-demo-six.vercel.app/api/chat` |
| **confirm API URL** | `https://chat-bot-demo-six.vercel.app/api/chat/confirm` |
| **RAG namespace** | `esg-on-docs` |

나머지 UI 설정 (봇 이름, 테마, 환영 메시지 등)은 자유롭게 설정합니다.

### 캐시 주의사항

`src/app/api/chatbot/config/route.ts`에 반드시 아래 설정이 있어야 합니다:

```ts
export const dynamic = "force-dynamic";
```

이 설정이 없으면 Next.js App Router가 GET 응답을 정적 캐싱하여,
admin에서 설정을 변경해도 챗봇 위젯에 반영되지 않습니다.

---

## 3. 동작 흐름

1. 사용자가 esg-on 페이지 접속
2. 챗봇 위젯이 `/api/chatbot/config` 호출 → DB에서 설정 조회
3. `chatApiUrl`에 지정된 외부 URL로 채팅 메시지 POST
4. chat-bot-demo가 `projectId`로 서비스 설정 조회
5. RAG 검색 → systemPrompt 보강 → LLM 호출
6. SSE 스트리밍으로 응답 반환

---

## 4. 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| "오류가 발생했습니다" | chat API URL이 잘못되었거나 비어있음 | admin에서 올바른 URL 입력 후 적용 |
| 설정 변경이 반영 안 됨 | Next.js 정적 캐싱 | `force-dynamic` 추가 후 재배포 |
| CORS 에러 (브라우저 콘솔) | `CHAT_ALLOWED_ORIGINS`에 도메인 미등록 | chat-bot-demo 환경변수에 도메인 추가 |
| 404 on `/api/chat` | esg-on 자체에는 chat API가 없음 | 반드시 외부 URL(chat-bot-demo) 지정 |
| `UNKNOWN_PROJECT` 에러 | projectId 불일치 | services.json 등록 ID 확인 |
| `INVALID_INPUT` 에러 | sessionId가 UUID 형식이 아님 | 위젯 코드에서 `crypto.randomUUID()` 사용 확인 |

---

## 5. 새 서비스 추가 시

다른 서비스(예: MES_ON, Project_ON)에도 챗봇을 연동하려면:

1. **chat-bot-demo**: `config/services.json`에 새 서비스 등록 (projectId, systemPrompt, tools 등)
2. **chat-bot-demo**: `CHAT_ALLOWED_ORIGINS`에 새 도메인 추가 (쉼표 구분)
3. **새 서비스 앱**: admin 페이지에서 chat API URL을 `https://chat-bot-demo-six.vercel.app/api/chat`으로 설정
4. **새 서비스 앱**: config API 라우트에 `export const dynamic = "force-dynamic"` 확인
