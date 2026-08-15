# Interview Scheduling — Architecture

**Feature URL**: `/dashboard/ai-automation/interview-scheduling`  
**Module**: AI & Automation → Recruitment AI  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Related**: [requirements.md](./requirements.md) · [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md)

---

## 1. Context

Interview Scheduling is a **non-chat recruitment automation feature** with a **two-phase write model**:

1. **Propose** — compute ranked slots, persist proposal on `AIRunRecord`, return suggestions.
2. **Confirm** — human explicitly accepts a slot → create `Interview` (+ optional external calendar event).

Per the AI Automation guide, scoring is **rules/heuristic v1** (availability, skill match, load, time-of-day). LLM is **optional** (scheduling narrative only).

Core logic today exists in **`interview-scheduler.service.ts`** (in-memory) but must be refactored into **`lib/ai/interview-scheduling-*`** and wired to Prisma.

---

## 2. System context (C4 Level 0)

```text
┌──────────────┐     HTTPS      ┌─────────────────────────────────────┐
│ Recruiter    │ ─────────────► │ AuraOS Web (Next.js)                │
│              │ ◄───────────── │  /dashboard/ai-automation/          │
└──────────────┘     JSON       │  interview-scheduling               │
                                └──────────────┬──────────────────────┘
                                               │ /api/ai/interview/*
                                               ▼
                                ┌─────────────────────────────────────┐
                                │ Interview Scheduling Engine         │
                                │ (propose → confirm)                 │
                                └──────────────┬──────────────────────┘
                       ┌───────────────────────┼───────────────────────┐
                       ▼                       ▼                       ▼
              ┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
              │ Neon Postgres  │    │ Recruitment      │    │ Optional        │
              │ Interview,     │    │ CandidateApp,    │    │ Calendar API    │
              │ AIRunRecord    │    │ JobPosting       │    │ (on confirm)    │
              └────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 3. Container / layering (Level 1)

| Layer                   | Location                                                       | Responsibility                                  |
| ----------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| Presentation            | `.../interview-scheduling/page.tsx`                            | Application context, slot list, confirm UX      |
| Client                  | `lib/services/ai-automation-client.ts` → `interviewScheduling` | Typed fetch to `/api/ai/interview*`             |
| API                     | `app/api/ai/interview/**`                                      | Auth, propose/confirm orchestration             |
| Legacy API              | `app/api/ai-automation/interview-scheduling/route.ts`          | Basic `AIRunRecord` slots — merge into main API |
| Domain service (legacy) | `lib/services/ai/interview-scheduler.service.ts`               | Rich algorithms — refactor into lib/ai          |
| Target AI lib           | `lib/ai/interview-scheduling-*`                                | 4-layer pattern                                 |
| Persistence             | `Interview`, `CandidateApplication`, `AIRunRecord`             | Confirmed vs proposed state                     |
| Calendar (optional)     | `services/integration-service/.../calendarService.ts`          | External write **after confirm**                |
| Shared auth             | `withEnhancedAuth` + `ai-automation:*`                         | Tenant + RBAC                                   |

### Target 4-layer layout

| File                                       | Role                                                             |
| ------------------------------------------ | ---------------------------------------------------------------- |
| `lib/ai/interview-scheduling-types.ts`     | Slot, proposal, confirm DTOs; UI/API score scale                 |
| `lib/ai/interview-scheduling-rules.ts`     | Business hours, durations, priority weights, conflict severities |
| `lib/ai/interview-scheduling-retrieval.ts` | Applications, interviewers, existing interviews, busy blocks     |
| `lib/ai/interview-scheduling-ai.ts`        | Orchestration: propose → persist run → confirm → Interview row   |
| `lib/ai/interview-scheduling-fallback.ts`  | Deterministic slot generation when calendar/skills sparse        |

Refactor **`InterviewSchedulerService`** methods (`findAvailableSlots`, `scoreSlot`, `scheduleInterview`) into these modules rather than rewriting algorithms from scratch.

---

## 4. Propose → confirm lifecycle

```text
Client (page)
   │  POST /api/ai/interview  { action: propose, applicationId, interviewType, ... }
   ▼
Auth (session → tenantId, ai-automation:read)
   │
   ├─ retrieval: application, candidate, job skills, interviewers, busy Interviews
   ├─ rules: generate slots, score, detect conflicts
   ├─ persist: AIRunRecord (runType: interview_schedule, output: ranked slots)
   └─ respond: { runId, suggestedSlots[], schedules[] }

User clicks Book → confirm dialog
   │
   │  POST /api/ai/interview  { action: confirm, runId, slotId, applicationId }
   ▼
Auth (ai-automation:write)
   │
   ├─ validate slot still available (re-check conflicts)
   ├─ prisma.interview.create({ applicationId, scheduledDate, interviewerIds, ... })
   ├─ optional: calendarService.createEvent (async, failure ≠ rollback Interview)
   ├─ audit event
   └─ respond: { interviewId, meetingLink?, status: SCHEDULED }
```

**Critical invariant**: No `Interview` row and no external calendar write on `propose` alone.

---

## 5. Data model

### 5.1 Existing Prisma (authoritative)

**`Interview`** (`aura_interview`)

- `applicationId` → `CandidateApplication`
- `scheduledDate`, `duration`, `interviewerIds[]`, `interviewerNames[]`
- `type`, `status`, `meetingLink`, `location`

**`CandidateApplication`** / **`Candidate`**

- Candidate identity, job link, pipeline status

**`AIRunRecord`**

- `runType`: `interview_schedule` | `interview_schedule_batch`
- `inputContext`: `{ applicationId, interviewType, dateRange, panelSize }`
- `output`: `{ slots: SlotSuggestion[], bestSlotId? }`

### 5.2 Logical slot payload (API / UI contract)

```ts
type InterviewSlotSuggestion = {
  id: string; // stable within run
  start: string; // ISO UTC
  end: string;
  time: string; // localized display e.g. "10:00 AM"
  available: boolean;
  score: number; // 0-100 integer for UI
  reason: string;
  reasonAr?: string;
  conflicts?: { type: string; description: string; severity: string }[];
  interviewerIds: string[];
};
```

Unify UI `slot.score/100` with service `scoreSlot` 0–1 via `Math.round(score * 100)`.

### 5.3 Confirm payload

```ts
type InterviewConfirmRequest = {
  action: 'confirm';
  runId: string;
  slotId: string;
  applicationId: string;
  meetingLink?: string;
  notes?: string;
};
```

---

## 6. Scoring architecture (v1)

From `InterviewSchedulerService` — reuse weights:

| Factor                           | Approx weight | Notes                           |
| -------------------------------- | ------------- | ------------------------------- |
| Interviewer availability count   | 20%           | More matching interviewers free |
| Skill match (job vs interviewer) | 30%           | `calculateSkillMatch`           |
| Time of day                      | 15%           | Morning preference 9–12         |
| Day of week                      | 15%           | Tue–Thu preferred               |
| Priority (urgency)               | 5%            | From request                    |
| Sooner slot                      | 15%           | Within 14-day horizon           |

### Conflict types

| Type                   | UI behavior                                |
| ---------------------- | ------------------------------------------ |
| `interviewer_busy`     | `available: false`, show reason            |
| `load_limit`           | De-prioritize or block                     |
| `time_constraint`      | Outside business hours                     |
| `candidate_preference` | Lower score, still selectable if essential |

---

## 7. API design

### 7.1 GET `/api/ai/interview`

```json
{
  "success": true,
  "data": {
    "summary": {
      "upcomingInterviews": 12,
      "completionRate": 0.93,
      "avgSchedulingTimeHours": 2.3
    },
    "schedules": [],
    "suggestedSlots": []
  }
}
```

When `applicationId` query present, populate `suggestedSlots` from latest run or inline propose.

### 7.2 POST actions

| `action`       | Behavior                               |
| -------------- | -------------------------------------- |
| `propose`      | Rank slots; `AIRunRecord` only         |
| `confirm`      | Create `Interview`; optional calendar  |
| `reschedule`   | Update interview; re-propose if needed |
| `cancel`       | Status cancelled; free busy            |
| `optimize`     | Multi-application batch (async run)    |
| `availability` | Single interviewer free/busy           |

### 7.3 Auth & tenancy

```text
withEnhancedAuth / authenticateWithPermissions
  → tenantId from session
  → all CandidateApplication queries include tenant scoping via relations
```

Add bilingual errors to mock route (currently English-only).

### 7.4 Client wiring fixes

```text
interviewScheduling.getSchedules()
  → GET /api/ai/interview?applicationId=

interviewScheduling.scheduleInterview(data)
  → POST /api/ai/interview { action: confirm, ... }

interviewScheduling.getSuggestedSlots(candidateId)
  → POST propose with resolved applicationId
```

---

## 8. UI composition

```text
InterviewSchedulingPage
├── Application selector (replaces hardcoded Emily Chen)
├── Context panel (candidate, interviewers, format)
├── Recommended slots (map suggestedSlots)
│     └── Book → Confirm modal → POST confirm
└── Upcoming interviews table
```

Reuse recruitment components where possible: `CalendarSlotPicker`, `InterviewerAvailability`.

---

## 9. Security & compliance controls

| Control           | Implementation                               |
| ----------------- | -------------------------------------------- |
| RBAC              | `ai-automation:read` / `:write`              |
| Human-in-the-loop | Confirm gate before calendar/Interview write |
| Tenant isolation  | Applications/interviews tenant-scoped        |
| OAuth secrets     | Calendar tokens in integration service only  |
| Audit             | Confirm/reschedule/cancel logged             |
| Candidate consent | Notification step before invite              |

---

## 10. Performance strategy

1. **Propose**: Single DB round-trip for application + interviews; in-memory slot generation.
2. **Cache**: Optional Redis `interview:busy:{tenantId}:{interviewerId}:{date}` short TTL.
3. **Batch optimize**: Background job + poll `GET /runs/[runId]`.

---

## 11. Failure modes

| Failure                   | Behavior                                              |
| ------------------------- | ----------------------------------------------------- |
| Application not found     | 404 bilingual                                         |
| Slot stale on confirm     | 409 + fresh propose suggestion                        |
| Calendar API failure      | Interview still created; `meetingLink` null + warning |
| No interviewers matched   | 200 with empty slots + actionable message             |
| Partial panel unavailable | Mark slot unavailable with conflict detail            |

---

## 12. Migration / convergence plan

| Step | Work                                                                 |
| ---- | -------------------------------------------------------------------- |
| 1    | Introduce `lib/ai/interview-scheduling-*`; port scoring from service |
| 2    | Harden `/api/ai/interview` with auth + bilingual errors              |
| 3    | Implement propose/confirm split; wire `AIRunRecord`                  |
| 4    | Replace page hardcoding with application picker + real slots         |
| 5    | Wire Book button to confirm flow                                     |
| 6    | Merge `/api/ai-automation/interview-scheduling` logic                |
| 7    | Optional calendar integration on confirm behind flag                 |

---

## 13. Testing strategy

| Layer       | Cases                                                               |
| ----------- | ------------------------------------------------------------------- |
| Unit        | Score normalization 0–1 → 0–100, conflict detection, business hours |
| Integration | Propose run persist, confirm creates Interview, tenant isolation    |
| UI          | Emily Chen absent; Book triggers confirm                            |
| Regression  | Double-confirm idempotency                                          |

---

## 14. Key files (today)

| Path                                                  | Role                                |
| ----------------------------------------------------- | ----------------------------------- |
| `.../interview-scheduling/page.tsx`                   | UI (hardcoded candidate)            |
| `lib/services/ai-automation-client.ts`                | `interviewScheduling` client        |
| `app/api/ai/interview/route.ts`                       | Static mock API                     |
| `app/api/ai-automation/interview-scheduling/route.ts` | Auth + AIRunRecord propose          |
| `lib/services/ai/interview-scheduler.service.ts`      | In-memory scheduler (orphan)        |
| `components/recruitment/CalendarSlotPicker.tsx`       | Reusable slot UI                    |
| `packages/@aura/database/prisma/schema.prisma`        | `Interview`, `CandidateApplication` |

---

## 15. Decision log

| Decision        | Choice                      | Rationale                                        |
| --------------- | --------------------------- | ------------------------------------------------ |
| Write model     | Propose then confirm        | User requirement; prevents rogue calendar writes |
| Primary scoring | Rules/heuristic v1          | GUIDE; service already implemented               |
| Persistence     | `Interview` + `AIRunRecord` | Schema ready; separates proposal from truth      |
| LLM             | Optional narrative only     | Scheduling must stay auditable                   |
| API base        | `/api/ai/interview`         | Consistent with recruitment AI routes            |
