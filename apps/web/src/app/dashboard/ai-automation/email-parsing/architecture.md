# Email Parsing — Architecture

**Feature URL**: `/dashboard/ai-automation/email-parsing`  
**Module**: AI & Automation → Process Automation  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Related**: [requirements.md](./requirements.md) · [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md)

---

## 1. Context

Email Parsing is a **non-chat extraction feature** with an optional LLM path. Per the AI Automation guide, process-automation features:

1. Authenticate + resolve tenant
2. Ingest message (paste, upload, or sync)
3. **Classify** intent/category
4. **Extract** structured JSON (LLM primary, rules/regex fallback)
5. **Dry-run** suggested domain actions
6. **Commit** only on explicit human approval + audit

Core extraction is **LLM JSON output** (v1), with deterministic fallback when providers unavailable. This is **not** a predictive feature — no `Prediction` rows.

---

## 2. System context (C4 Level 0)

```text
┌──────────────┐     HTTPS      ┌─────────────────────────────────────┐
│ HR Ops User  │ ─────────────► │ AuraOS Web (Next.js :3006)          │
│              │ ◄───────────── │  /dashboard/ai-automation/          │
└──────────────┘     JSON       │  email-parsing                      │
                                └──────────────┬──────────────────────┘
                                               │ /api/ai/email-parser/*
                                               ▼
                                ┌─────────────────────────────────────┐
                                │ Email Parser API + Extraction Engine│
                                │ (LLM JSON + rules fallback)         │
                                └──────────────┬──────────────────────┘
                       ┌───────────────────────┼───────────────────────┐
                       ▼                       ▼                       ▼
              ┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
              │ Neon Postgres  │    │ Domain modules   │    │ LLM providers   │
              │ AIRunRecord,   │    │ Leave, Employee, │    │ via llm-client  │
              │ (optional queue│    │ Expense, Ticket  │    │ Groq→OpenAI→    │
              │  table)        │    │ (on commit)      │    │ Gemini          │
              └────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 3. Container / layering (Level 1)

| Layer         | Location                                                            | Responsibility                                |
| ------------- | ------------------------------------------------------------------- | --------------------------------------------- |
| Presentation  | `apps/web/src/app/dashboard/ai-automation/email-parsing/page.tsx`   | Queue, raw/extracted panes, dry-run/commit UX |
| Client        | `apps/web/src/lib/services/ai-automation-client.ts` → `emailParser` | Typed fetch to `/api/ai/email-parser*`        |
| API           | `apps/web/src/app/api/ai/email-parser/**`                           | Auth, validation, orchestration               |
| Legacy API    | `apps/web/src/app/api/ai-automation/email-parsing/route.ts`         | Regex stub + `AIRunRecord` (converge)         |
| Target AI lib | `apps/web/src/lib/ai/email-parsing-*` (to introduce)                | 4-layer pattern                               |
| Persistence   | Prisma `AIRunRecord`; optional intake table                         | Run audit + queue state                       |
| Shared auth   | `canReadAiAutomation` / `canWriteAiAutomation`                      | Tenant + RBAC                                 |

### Target 4-layer layout (recommended)

| File                                | Role                                                                         |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| `lib/ai/email-parsing-types.ts`     | DTOs: category enum, extract schemas, suggested action, queue item           |
| `lib/ai/email-parsing-rules.ts`     | Category prompts, JSON schema per type, confidence thresholds, routing rules |
| `lib/ai/email-parsing-retrieval.ts` | Employee lookup by email, leave balance hints, tenant parsing config         |
| `lib/ai/email-parsing-ai.ts`        | Orchestration: classify → extract → validate JSON → dry-run actions          |
| `lib/ai/email-parsing-fallback.ts`  | Regex/heuristic classify+extract (current legacy route logic, expanded)      |

---

## 4. Parse request lifecycle

```text
Client (page)
   │  POST /api/ai/email-parser  action=dry-run
   ▼
Auth (session → tenantId, permissions)
   │
   ├─ retrieval: resolve employee, load tenant rules
   ├─ classify: LLM or fallback → LEAVE | EXPENSE | TICKET | ...
   ├─ extract: type-specific JSON schema via LLM
   ├─ validate: Zod/contract check; flag low-confidence fields
   ├─ map: suggestedActions[] (no domain writes)
   ├─ persist: AIRunRecord (runType: email_parse)
   └─ respond: extraction + actions + runId

Commit path (action=commit, ai-automation:write):
   ├─ reload run / re-validate
   ├─ create LeaveRequest | ExpenseClaim | Ticket (domain APIs)
   ├─ persist: AIRunRecord (runType: email_parse_commit)
   └─ audit event
```

**Batch path**: enqueue N messages → background worker → poll `/runs/[runId]`.

---

## 5. Data model

### 5.1 Existing Prisma (authoritative)

**`AIRunRecord`** (`aura_ai_run_record`)

- `tenantId`, `runType`: `email_parse` \| `email_parse_batch` \| `email_parse_commit`
- `inputContext`: `{ messageId?, from?, subjectHash, bodyLength }` — avoid storing full PII if policy restricts
- `output`: classification + extraction JSON + suggestedActions
- `modelVersion`, `durationMs`, `createdBy`

Legacy stub already writes `runType: 'email_parse'` with regex output in `/api/ai-automation/email-parsing`.

### 5.2 Logical extraction payload (API `output` / JSON)

```ts
type EmailCategory =
  | 'LEAVE_REQUEST'
  | 'EXPENSE_REPORT'
  | 'SUPPORT_TICKET'
  | 'PAYROLL_INQUIRY'
  | 'GENERAL'
  | 'UNKNOWN';

type ExtractedField<T = string | number | null> = {
  value: T;
  confidence: number; // 0-1
};

type EmailParseResult = {
  runId: string;
  category: EmailCategory;
  categoryConfidence: number;
  intent: string;
  employee?: {
    employeeId?: string;
    email?: string;
    name?: string;
    resolved: boolean;
  };
  extracted: Record<string, ExtractedField | Record<string, ExtractedField>>;
  suggestedActions: {
    action: 'CREATE_LEAVE_REQUEST' | 'CREATE_EXPENSE' | 'CREATE_TICKET' | 'SEND_CONFIRMATION';
    params: Record<string, unknown>;
    confidence: number;
  }[];
  status: 'DRY_RUN' | 'COMMITTED' | 'REJECTED' | 'FAILED';
  provider: 'groq' | 'openai' | 'gemini' | 'fallback';
  parsedAt: string;
};
```

Unify with `EmailParsing` in `dashboard/ai-automation/types.ts` during implementation.

### 5.3 Category-specific extract schemas (v1)

| Category         | Required fields                                        |
| ---------------- | ------------------------------------------------------ |
| `LEAVE_REQUEST`  | leaveType, startDate, endDate, duration, reason        |
| `EXPENSE_REPORT` | vendorName, amount, currency, expenseDate, description |
| `SUPPORT_TICKET` | subject, category, priority, description               |

---

## 6. Extraction architecture (v1)

### 6.1 LLM path (primary)

1. Build system prompt from `email-parsing-rules.ts` (category list + JSON schema).
2. User message = normalized email (subject + body + from).
3. Two-step or single-shot: **classify** then **extract** (single-shot acceptable v1).
4. Parse JSON via shared `parseJsonFromAi` pattern (see `resume-screening-ai.ts`).
5. Validate required keys; clamp confidence values.

### 6.2 Fallback path (deterministic)

Port and extend legacy regex logic:

- Intent keywords: leave/vacation → `LEAVE_REQUEST`; `$` amounts + invoice → `EXPENSE_REPORT`; help/issue → `SUPPORT_TICKET`
- Entity regex: emails, ISO dates, currency amounts
- Never return hardcoded John Doe leave dates when input is an invoice

### 6.3 Confidence policy

| Field confidence | UI behavior                                              |
| ---------------- | -------------------------------------------------------- |
| ≥ 0.90           | Green badge; eligible for bulk commit                    |
| 0.70–0.89        | Amber; requires review                                   |
| &lt; 0.70        | Red; block commit unless manual override with audit note |

---

## 7. API design

### 7.1 Target contracts

**GET `/api/ai/email-parser`**

```json
{
  "success": true,
  "data": {
    "queue": [
      {
        "id": "run-uuid",
        "subject": "Leave request Jan 15-20",
        "from": "jane@company.com",
        "category": "LEAVE_REQUEST",
        "status": "PARSED",
        "parsedAt": "2026-07-16T10:00:00.000Z"
      }
    ],
    "stats": {
      "processed": 145,
      "leaveRequests": 23,
      "expenseReports": 34,
      "supportTickets": 12,
      "avgConfidence": 0.91,
      "avgProcessingTimeMs": 820
    }
  }
}
```

**POST `/api/ai/email-parser`**

| `action`              | Behavior                                                      |
| --------------------- | ------------------------------------------------------------- |
| `classify`            | Category only                                                 |
| `extract` / `dry-run` | Classify + extract + suggested actions; persist `AIRunRecord` |
| `commit`              | Execute suggested action for `runId`; audit                   |
| `batch`               | Queue multiple messages; async                                |

### 7.2 Auth & tenancy

```text
authenticateWithPermissions(request)
  → require tenantId from session (ignore client tenantId)
  → canReadAiAutomation / canWriteAiAutomation
```

Current `/api/ai/email-parser` has **no auth** — must change.

### 7.3 Client wiring

```text
page.tsx
  → emailParser.parseEmails()        // list queue + stats
  → emailParser.processEmail(id, 'dry-run')
  → emailParser.commitEmail(id)      // new method
```

Remove or implement orphan `/email-parser/process` path.

---

## 8. UI composition

```text
EmailParsingPage
├── Header (Upload Batch / Refresh)
├── Queue sidebar (optional phase 1.5)
├── Raw Content (textarea ← selected email)
├── Extracted Data (field map + confidence)
├── Suggested Actions (dry-run preview)
└── Commit / Reject bar (write permission)
```

Styling: existing Aura dashboard tokens; monospace JSON panel retained.

---

## 9. Security & compliance controls

| Control          | Implementation                                       |
| ---------------- | ---------------------------------------------------- |
| RBAC             | `ai-automation:read` / `:write`                      |
| Tenant isolation | All queries include `tenantId`                       |
| PII minimization | Hash/truncate bodies in logs; configurable retention |
| Human approval   | Commit requires explicit user action                 |
| Audit            | Domain writes + `AIRunRecord` linked by `runId`      |
| Secrets          | Provider keys server-only                            |

---

## 10. Performance strategy

1. **Sync path**: Single email dry-run; target &lt; 5s with LLM.
2. **Async path**: Batch upload → worker → poll `AIRunRecord` batch run.
3. **Cache**: Optional Redis for stats aggregate `email-parser:stats:{tenantId}`.
4. **Concurrency**: Cap parallel LLM calls per tenant.

---

## 11. Failure modes

| Failure                | Behavior                                                                |
| ---------------------- | ----------------------------------------------------------------------- |
| Unauthenticated        | 401 bilingual                                                           |
| Forbidden              | 403                                                                     |
| LLM unavailable        | Fallback extraction; `provider: 'fallback'` in response                 |
| Employee not found     | `employee.resolved: false`; block commit                                |
| Commit domain error    | Rollback none (compensating manual fix); return partial success + error |
| Schema validation fail | 422 with field errors; no persist                                       |

---

## 12. Migration / convergence plan

| Step | Work                                                               |
| ---- | ------------------------------------------------------------------ |
| 1    | Introduce `lib/ai/email-parsing-*` types + rules + fallback        |
| 2    | Harden `/api/ai/email-parser` with auth + session tenant           |
| 3    | Wire LLM extract in `email-parsing-ai.ts`                          |
| 4    | Replace page mocks (`MOCK_EMAIL`, `EXTRACTED_DATA`) with API queue |
| 5    | Implement dry-run → commit flow + audit                            |
| 6    | Merge `/api/ai-automation/email-parsing` into primary API          |
| 7    | Fix client: remove dead `/email-parser/process` or implement       |
| 8    | Optional IMAP/webhook intake                                       |

---

## 13. Testing strategy

| Layer       | Cases                                                                 |
| ----------- | --------------------------------------------------------------------- |
| Unit        | Category keyword fallback, JSON schema validation, confidence gating  |
| Integration | Authz, tenant isolation, `AIRunRecord` round-trip, commit → Leave API |
| UI          | Invoice paste → must **not** show leave extraction; empty queue state |
| Regression  | LLM down → fallback still classifies leave vs expense                 |

---

## 14. Key files (today)

| Path                                           | Role                                              |
| ---------------------------------------------- | ------------------------------------------------- |
| `.../email-parsing/page.tsx`                   | Dashboard UI (invoice mock vs leave API mismatch) |
| `lib/services/ai-automation-client.ts`         | `emailParser` client                              |
| `app/api/ai/email-parser/route.ts`             | Static mock API (always `LEAVE_REQUEST`)          |
| `app/api/ai-automation/email-parsing/route.ts` | Regex stub + `AIRunRecord` (orphan)               |
| `dashboard/ai-automation/types.ts`             | `EmailParsing` interface                          |
| `lib/ai/llm-client.ts`                         | Shared LLM client (reuse)                         |
| `packages/@aura/database/prisma/schema.prisma` | `AIRunRecord`                                     |

---

## 15. Decision log

| Decision           | Choice                                 | Rationale                                       |
| ------------------ | -------------------------------------- | ----------------------------------------------- |
| Primary extraction | LLM JSON + regex fallback              | GUIDE Phase 4 — structured extraction pipeline  |
| Persistence        | `AIRunRecord` (+ optional queue table) | Already stubbed; audit-friendly                 |
| Commit model       | Explicit human commit                  | Process automation risk; no silent writes       |
| API base           | `/api/ai/email-parser`                 | Aligns with `/api/ai/*` family                  |
| Not predictive     | No `Prediction` rows                   | Classification/extraction ≠ flight-risk scoring |
