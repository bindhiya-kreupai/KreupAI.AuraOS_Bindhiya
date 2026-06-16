# Gap Analysis: EPIC-18-S08 — Job design for Bahrainization

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3

**Description**
Position-management overlay marking roles as Bahrainization-target with required skill, genuine duties, grade and wage band aligned to counting thresholds, preventing counting against shell or below-threshold roles.

**Covers:** 18.10
**Acceptance criteria count:** 4 · **Task count:** 5

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

- [ ] Given a position, when designed for Bahrainization, then skill, duties, grade and wage band are captured and validated against counting thresholds.
- [ ] Given a wage band below the counting threshold, when saved, then a warning is shown and the role is flagged non-counting-risk.
- [ ] Given a target position, when linked to a Bahraini hire, then it contributes to the numerator only if genuineness criteria are met.
- [ ] Given changes to a target position, then they are versioned and audited.

## Implementation Tasks From Backlog

- [ ] Backend: extend `position` with `bahrainizationTarget`, `skillLevel`, `genuineDutiesText`, `wageBandRef`.
- [ ] Backend: validation service against counting wage thresholds.
- [ ] Frontend: job-design panel with threshold warnings.
- [ ] Rules/Config: configurable wage/skill counting thresholds.
- [ ] Tests: validation tests for below-threshold roles.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
