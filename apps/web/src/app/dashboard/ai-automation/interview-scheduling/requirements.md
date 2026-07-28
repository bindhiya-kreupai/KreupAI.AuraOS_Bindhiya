# Interview Scheduling — Requirements

**Feature URL**: `/dashboard/ai-automation/interview-scheduling`  
**Module**: AI & Automation → Recruitment AI  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Status**: Spec for completion (UI exists; candidate/interviewers hardcoded; APIs static mock)  
**Related**: [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md) · [architecture.md](./architecture.md)

---

## 1. Purpose

Help recruiters and hiring coordinators **propose optimal interview slots** by combining candidate context, interviewer availability, panel requirements, and scheduling heuristics — with **human confirmation before any calendar write** — so interviews land on real `Interview` records tied to `CandidateApplication`, not demo names like “Emily Chen.”

---

## 2. Current State (as of this document)

| Area        | Reality                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| UI          | “Smart Scheduler” with hardcoded **Emily Chen**, generic interviewer avatars, slot list from API                                            |
| Data        | Candidate panel static; Book buttons not wired to `handleSchedule`                                                                          |
| Client      | `interviewScheduling.getSchedules()` → `/api/ai/interview`; `scheduleInterview` → `/api/ai/interview/schedule` (**route may not exist**)    |
| Mock API    | `/api/ai/interview` — static `suggestedSlots`, fictional `Jane Doe` / `Mike Johnson` interviews; no auth                                    |
| Orphan API  | `/api/ai-automation/interview-scheduling` — auth + `AIRunRecord` (`runType: interview_schedule`) with generated ISO slots; not used by page |
| Service     | `interview-scheduler.service.ts` — rich in-memory scheduler (skill match, conflicts, panel); **not wired** to API or Prisma                 |
| Persistence | Schema: `Interview`, `CandidateApplication`, `Candidate`; proposals should use `AIRunRecord` until confirmed                                |
| Auth        | Target: `ai-automation:read` / `ai-automation:write`; mock route has none                                                                   |

---

## 3. Personas & Goals

| Persona                      | Goals                                                                    |
| ---------------------------- | ------------------------------------------------------------------------ |
| Recruiter                    | Pick application, get ranked slots, book with one click after review     |
| Hiring Manager / Interviewer | See only their panel invites; confirm availability                       |
| Candidate                    | Receive proposed times (via portal/email) — no auto-book without consent |
| TA Ops                       | Reduce scheduling back-and-forth; audit who confirmed calendar writes    |
| System Admin                 | Configure business hours, timezones, video provider defaults             |

---

## 4. Functional Requirements

### 4.1 Mandatory

| ID  | Requirement                             | Acceptance criteria                                                                                                              |
| --- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| M1  | **Tenant-scoped applications**          | Scheduler loads real `CandidateApplication` + `Candidate` + job context for tenant                                               |
| M2  | **Ranked slot suggestions**             | Each slot: start/end, score 0–100, availability flag, human-readable `reason`                                                    |
| M3  | **Interviewer panel resolution**        | Resolve interviewers from recruitment data (assigned panel, job skills) — not placeholder “I1, I2”                               |
| M4  | **Human confirm before calendar write** | POST `propose` returns suggestions only; POST `confirm` creates `Interview` + optional calendar event after explicit user action |
| M5  | **Persist proposals**                   | Slot generation writes `AIRunRecord` (`runType: interview_schedule`) with input + ranked output                                  |
| M6  | **Persist confirmed interviews**        | Confirmed slot creates/updates `Interview` linked to `applicationId`                                                             |
| M7  | **Permission gates**                    | `ai-automation:read` for list/propose; `ai-automation:write` for confirm/reschedule/cancel                                       |
| M8  | **Bilingual API errors**                | Error payloads include `error` + `errorAr`                                                                                       |
| M9  | **No fabricated candidates**            | API never returns hardcoded Emily Chen / Jane Doe in production path                                                             |
| M10 | **Conflict detection**                  | Unavailable slots marked with reason (interviewer busy, load limit, outside business hours)                                      |

### 4.2 Essential

| ID  | Requirement                        | Acceptance criteria                                                                      |
| --- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| E1  | **Application picker**             | UI selects `CandidateApplication` (search by candidate name, job title)                  |
| E2  | **Interview type & duration**      | Phone screen, technical, panel, etc.; default duration per type                          |
| E3  | **Timezone display**               | Show candidate + interviewer zones; store UTC in DB                                      |
| E4  | **Reschedule / cancel**            | Update `Interview.status`; release busy times                                            |
| E5  | **Calendar integration (phase 2)** | On confirm, optional Google/Microsoft write via integration service — **behind confirm** |
| E6  | **Notifications**                  | Email/push to candidate + interviewers on confirm (queue acceptable)                     |
| E7  | **Batch optimize**                 | `action: optimize` for multiple applications same day (recruiter tool)                   |
| E8  | **Metrics strip**                  | Upcoming count, completion rate from real `Interview` rows                               |
| E9  | **Audit**                          | Confirm/reschedule/cancel emit audit events                                              |

### 4.3 Good-to-Have

| ID  | Requirement                                    | Acceptance criteria                                     |
| --- | ---------------------------------------------- | ------------------------------------------------------- |
| G1  | **Video link auto-generation**                 | Meet/Teams link on confirm when feature flag enabled    |
| G2  | **Candidate self-schedule link**               | Magic link picks from proposed slots                    |
| G3  | **Focus-time / load balancing**                | Weight against interviewer daily cap                    |
| G4  | **Room booking**                               | Physical location resource conflict check               |
| G5  | **LLM scheduling note**                        | Optional natural-language summary of why slot ranked #1 |
| G6  | **Integration with interview-feedback module** | Deep link post-interview                                |

---

## 5. Non-Functional Requirements

| ID  | Category      | Requirement                                                                        |
| --- | ------------- | ---------------------------------------------------------------------------------- |
| N1  | Performance   | Slot proposal &lt; 3s for panel ≤ 5 interviewers, 14-day window                    |
| N2  | Scalability   | Batch optimize async via job + `AIRunRecord` progress                              |
| N3  | Security      | Calendar OAuth tokens server-side only                                             |
| N4  | Privacy       | Minimize candidate PII in logs; interviewer calendars not exposed to other tenants |
| N5  | Reliability   | If calendar API down, still persist `Interview` with manual link field             |
| N6  | Observability | Log runId, applicationId, slotCount; no emails in info logs                        |
| N7  | Compliance    | Candidate consent before calendar invite sent                                      |

---

## 6. Data Inputs (feature sources)

| Input          | Sources (examples)                                                                            |
| -------------- | --------------------------------------------------------------------------------------------- |
| Application    | `CandidateApplication`, `Candidate`, `JobPosting` / `JobRequisition`                          |
| Interviewers   | `Employee` (recruitment role), interviewer availability config                                |
| Busy times     | Existing `Interview` rows, optional calendar sync, `AttendanceRecord` (legacy orphan comment) |
| Business rules | Tenant business hours, GCC weekend rules, default video provider                              |
| Skills         | Job required skills → interviewer skill match (from service)                                  |

Initial **v1** may use `Interview` + generated business-hour slots until calendar sync is live.

---

## 7. API Surface (target)

| Method | Path                              | Purpose                                                                          |
| ------ | --------------------------------- | -------------------------------------------------------------------------------- |
| GET    | `/api/ai/interview`               | Summary metrics + upcoming interviews (tenant-scoped)                            |
| GET    | `/api/ai/interview/applications`  | Selectable applications for scheduler                                            |
| POST   | `/api/ai/interview`               | `action: propose \| confirm \| reschedule \| cancel \| optimize \| availability` |
| GET    | `/api/ai/interview/runs/[runId]`  | Proposal run status / ranked slots                                               |
| GET    | `/api/ai/interview/[interviewId]` | Single interview detail                                                          |

**Deprecation note**: Align `/api/ai-automation/interview-scheduling` with `/api/ai/interview` (propose uses same engine). Client paths `/interview/schedule` and `/interview/suggest-slots/*` must be implemented or client updated.

---

## 8. UI Requirements (page)

Must continue to support (wired to real data):

1. Context panel: candidate, role, interviewers, format (video/ duration)
2. Recommended slots list: time, AI score, reason, Book action → **confirm dialog**
3. Upcoming / scheduled interviews list (replace static-only view)
4. Loading, empty (no applications), and error states

UX constraints:

- Book button calls `confirm` only after user acknowledges panel + time
- Never show Emily Chen unless that is the selected real candidate
- Disabled slots show conflict reason (not generic “Unavailable”)

---

## 9. Out of Scope

- Fully autonomous scheduling without recruiter/candidate confirmation
- Replacing dedicated **Recruitment → Interview Management** module UI (may share components)
- Video recording / AI interview scoring (separate feature flag: `candidate_video_interviews`)
- Payroll or internal employee shift scheduling

---

## 10. Success Metrics

| Metric                         | Target                                                        |
| ------------------------------ | ------------------------------------------------------------- |
| Hardcoded candidate on page    | 0 in production path                                          |
| Proposals persisted            | 100% of propose actions create `AIRunRecord`                  |
| Confirmed interviews in DB     | Every Book → `Interview` row with correct `applicationId`     |
| Calendar write without confirm | 0 occurrences                                                 |
| Median time-to-schedule        | Measurable from application stage → `Interview.scheduledDate` |

---

## 11. Traceability

| Product statement                          | Requirement IDs |
| ------------------------------------------ | --------------- |
| GUIDE Phase 3: Interview Scheduling        | M1–M6, E1, E5   |
| FEATURES-GUIDE: Smart interview scheduling | M2, M4, E3      |
| Recruitment module `Interview` schema      | M6, E4          |

---

## 12. Open Decisions

1. Availability source of truth: `Interview` table only vs external calendar sync v1.
2. Score scale: UI `0–100` vs service `0–1` — unify in `interview-scheduling-types.ts`.
3. Whether propose requires `applicationId` or also supports standalone `candidateId` + `jobId`.
4. Calendar integration: integration-service `calendarService` vs deferred manual link.
