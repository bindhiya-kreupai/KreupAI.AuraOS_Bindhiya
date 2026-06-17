# Gap Analysis: EPIC-04-S01 — Recruitment governance framework & lifecycle stage-gates

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-04-chapter-4-recruitment-selection-compliance.md](./EPIC-04-chapter-4-recruitment-selection-compliance.md)
> Parent epic: EPIC-04: Chapter 4 – Recruitment & Selection Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**User story:** HR Manager, **I want** a configurable recruitment governance framework with defined lifecycle stages and stage-gates, **so that** every hire follows one controlled, auditable process.

**Description**
Establishes the recruitment process backbone: ownership/roles, the lifecycle from approved vacancy → sourcing → screening → interview → assessment → verification → offer, and configurable stage-gate rules (a candidate cannot advance until the prior stage's mandatory controls are satisfied). Captures the introduction, governance framework and lifecycle sections as the engine all other stories plug into.

**Covers:** 4.1, 4.2, 4.3
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

- [ ] Given a vacancy, when a recruitment case opens, then it inherits position, JD and nationalization expectation from the EPIC-03 requisition.
- [ ] Given lifecycle stages, when configured, then each has entry/exit controls and an owner role enforced by RBAC.
- [ ] Given a stage-gate, when mandatory controls are unmet, then advancing the candidate is blocked with reasons.
- [ ] Given a recruitment case, when progressed, then SLA timers per stage start and breaches are flagged.
- [ ] Given any stage transition, when performed, then actor, decision and timestamp are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `recruitment_case` + `recruitment_stage` entities (vacancyId, stage, owner, slaDays, status) + migration.
- [ ] Backend: stage-gate engine consuming `vacancy.approved` events.
- [ ] Frontend: recruitment pipeline (kanban) with stage controls.
- [ ] Rules/Config: configurable stages, gates and SLAs per entity/country.
- [ ] Alerts/Workflow: SLA-breach alerts; stage-transition notifications.
- [ ] Tests: unit (gate logic) + e2e (vacancy→case→stage progression).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
