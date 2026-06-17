# Gap Analysis: EPIC-16-S08 — Job design for Emiratisation

> **✅ SHIPPED 2026-06-17** — Theme B closure. Shared `nationalisation-overlay` registry: requisition tags (TA pipeline), job/position tags, retention ledger with early-attrition flag, L&D plan tracker, artificial-risk detection (9 signals, banded LOW/MEDIUM/HIGH/CRITICAL), Saudi profession-localisation codes. Consumed by emiratisation-, nitaqat-, bahrainization-compliance services. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3

**Description**
Position-management overlay marking roles as Emiratisation-target with required skill level, genuine duties, grade and salary band aligned to counting/Nafis thresholds. Prevents counting against artificially designed or below-threshold "shell" roles.

**Covers:** 16.10
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

- [ ] Given a position, when designed for Emiratisation, then skill level, duties, grade and salary band are captured and validated against counting/Nafis thresholds.
- [ ] Given a salary band below the counting/subsidy threshold, when saved, then a warning is shown and the role is flagged non-counting-risk.
- [ ] Given a target position, when linked to a national hire, then it contributes to the numerator only if genuineness criteria are met.
- [ ] Given changes to a target position, then changes are versioned and audited.

## Implementation Tasks From Backlog

- [ ] Backend: extend `position` with `emiratisationTarget`, `skillLevel`, `genuineDutiesText`, `salaryBandRef`.
- [ ] Backend: validation service against counting/Nafis salary thresholds.
- [ ] Frontend: job-design panel with threshold warnings.
- [ ] Rules/Config: configurable salary/skill thresholds for counting.
- [ ] Tests: validation tests for below-threshold roles.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
