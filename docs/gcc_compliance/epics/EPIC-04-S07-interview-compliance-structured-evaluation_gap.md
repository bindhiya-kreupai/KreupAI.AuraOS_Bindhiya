# Gap Analysis: EPIC-04-S07 — Interview compliance & structured evaluation

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-04-chapter-4-recruitment-selection-compliance.md](./EPIC-04-chapter-4-recruitment-selection-compliance.md)
> Parent epic: EPIC-04: Chapter 4 – Recruitment & Selection Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**User story:** Line Manager, **I want** structured, panel-based interviews with standardized scorecards, **so that** selection is consistent, evidence-based and defensible.

**Description**
Provides interview scheduling, panels, structured question sets tied to competencies and standardized scorecards. Restricts free-text to job-related observations, blocks prohibited questions guidance, and consolidates panel scores into a recommendation. Produces the digital Interview Evaluation record.

**Covers:** 4.10
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx
- apps/web/src/app/(modules)/recruitment/job-requisition/page.tsx
- apps/web/src/app/api/recruitment/interviews/feedback/route.ts
- apps/web/src/app/api/recruitment/interviews/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given an interview, when scheduled, then panel members, stage and competency set are defined.
- [ ] Given a panellist, when scoring, then they complete a structured scorecard per competency with evidence notes.
- [ ] Given panel completion, when reached, then scores aggregate into a consolidated recommendation.
- [ ] Given prohibited interview topics, when surfaced as guidance, then interviewers are warned and topics excluded from scoring.
- [ ] Given any interview record, when saved, then it is audit-logged and access-restricted.

## Implementation Tasks From Backlog

- [ ] Backend: `interview` + `interview_scorecard` entities (panel, competencies, scores) + migration.
- [ ] Backend: score aggregation + recommendation service.
- [ ] Frontend: interview scheduler + structured scorecard form.
- [ ] Rules/Config: competency frameworks and prohibited-topic guidance.
- [ ] Alerts/Workflow: panel reminders; recommendation routing.
- [ ] Tests: unit (aggregation) + integration (scorecard completeness gate).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
