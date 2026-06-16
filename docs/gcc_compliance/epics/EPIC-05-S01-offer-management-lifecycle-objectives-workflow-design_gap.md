# Gap Analysis: EPIC-05-S01 — Offer management lifecycle, objectives & workflow design

> Source epic: [EPIC-05-chapter-5-offer-management-pre-employment-.md](./EPIC-05-chapter-5-offer-management-pre-employment-.md)
> Parent epic: EPIC-05: Chapter 5 – Offer Management & Pre-Employment Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**User story:** HR Manager, **I want** a configurable offer-management lifecycle and workflow, **so that** every offer follows one controlled, auditable path from selected candidate to accepted offer.

**Description**
Establishes the offer process backbone (objectives, lifecycle stages: initiate → approve → issue → accept → pre-employment → contract → handover) and the HRMS workflow design tying stages, gates and SLAs together. Consumes the `candidate.selected` package from EPIC-04 to open an offer case and orchestrates all later stories.

**Covers:** 5.1, 5.2, 5.3, 5.20
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

- confirm/add tenant-scoped schema or config; add/wire service logic; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given a `candidate.selected` event, when received, then an offer case opens pre-populated with the EPIC-04 package.
- [ ] Given offer lifecycle stages, when configured, then each has entry/exit gates, owner role and SLA.
- [ ] Given a stage-gate, when its controls are unmet, then advancing is blocked with reasons.
- [ ] Given an offer case, when progressed, then SLA timers run and breaches are flagged.
- [ ] Given any stage transition, when performed, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `offer_case` + `offer_stage` entities (candidateId, stage, owner, slaDays, status) + migration.
- [ ] Backend: offer workflow/state-machine consuming `candidate.selected`.
- [ ] Frontend: offer-case workspace with stage tracker.
- [ ] Rules/Config: configurable lifecycle stages, gates and SLAs per entity.
- [ ] Alerts/Workflow: SLA-breach and stage-transition notifications.
- [ ] Tests: unit (state machine) + e2e (selected→offer case opens).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
