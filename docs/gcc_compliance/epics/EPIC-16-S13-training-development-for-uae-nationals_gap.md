# Gap Analysis: EPIC-16-S13 — Training & development for UAE nationals

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3

**Description**
Captures development plans, training completion and competency progression for counted nationals, linking to onboarding and retention, and producing a training-evidence section for the pack.

**Covers:** 16.15
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts
- apps/web/src/lib/services/compliance/nitaqat.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a counted national, when a development plan is created, then training items, target dates and status are tracked.
- [ ] Given completed training, then completion records and certificates are stored as evidence.
- [ ] Given overdue mandatory training, when detected, then a reminder is raised.
- [ ] Given the evidence pack, then a training-and-development summary per national is included.

## Implementation Tasks From Backlog

- [ ] Backend: `national_development_plan` entity (`employeeId`, `items[]`, `status`, `evidenceRefs[]`).
- [ ] Frontend: development-plan view with completion tracking.
- [ ] Alerts/Workflow: overdue-training reminders.
- [ ] Tests: unit tests for overdue detection.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
