# Gap Analysis: EPIC-10-S01 — Payroll governance & controls framework

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a payroll governance framework with segregation of duties, control points and policy parameters, **so that** every payroll runs under defined, auditable controls.

**Description**
Establish payroll governance: roles (Payroll Officer preparer, approver, releaser), segregation-of-duties rules, mandatory control checkpoints (input freeze, reconciliation, approval, lock), and per-entity payroll policy parameters that the run engine enforces.

**Covers:** 10.1
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll/payslip-generation/page.tsx
- apps/web/src/app/(modules)/payroll/payslips/page.tsx
- apps/web/src/app/api/payroll/payslip-generation/route.ts
- apps/web/src/app/api/payroll/payslips/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given payroll roles, when assigned, then the same user cannot hold conflicting roles (preparer ≠ approver ≠ releaser) for the same run.
- [ ] Given a payroll policy, when configured per legal entity, then control checkpoints are mandatory and cannot be skipped.
- [ ] Given any governance/parameter change, when saved, then it is maker-checker approved and audit-logged.
- [ ] Given a run, when started, then it inherits the active, effective-dated governance parameters.

## Implementation Tasks From Backlog

- [ ] Backend: `payroll_policy` and `payroll_role_assignment` schemas with SoD constraints
- [ ] Backend: control-checkpoint enforcement service
- [ ] Frontend: payroll governance & roles configuration screen
- [ ] Rules/Config: per-entity control parameters
- [ ] Tests: unit tests for SoD conflict rejection

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
