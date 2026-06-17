# Gap Analysis: EPIC-05-S05 — Conditional offer management

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-05-chapter-5-offer-management-pre-employment-.md](./EPIC-05-chapter-5-offer-management-pre-employment-.md)
> Parent epic: EPIC-05: Chapter 5 – Offer Management & Pre-Employment Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**User story:** HR Admin, **I want** offers issued conditional on defined pre-employment conditions, **so that** employment is contingent on medical, BGV, document and visa clearances being met.

**Description**
Supports conditional offers where the offer explicitly lists conditions precedent (medical fitness, BGV clearance, document submission, work-permit approval, qualification attestation). Tracks each condition's status, prevents the contract/joining gate from opening until all mandatory conditions are satisfied, and supports withdrawal if a condition fails.

**Covers:** 5.6
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

- [ ] Given a conditional offer, when issued, then each condition precedent is listed with owner and target date.
- [ ] Given a condition, when its evidence is recorded, then its status updates (pending/met/failed).
- [ ] Given an unmet mandatory condition, when contract/joining is attempted, then it is blocked.
- [ ] Given a failed condition, when confirmed, then offer withdrawal workflow can be triggered with reason.
- [ ] Given any condition change, when made, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `offer_condition` entity (offerId, type, mandatory, status, evidenceDocId, targetDate) + migration.
- [ ] Backend: conditions-gate service feeding contract/joining gate.
- [ ] Frontend: conditional-offer tracker with status per condition.
- [ ] Rules/Config: condition catalogue and mandatory flags per country/role.
- [ ] Alerts/Workflow: condition-overdue alerts; offer-withdrawal workflow.
- [ ] Tests: unit (gate logic) + integration (block on unmet condition).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
