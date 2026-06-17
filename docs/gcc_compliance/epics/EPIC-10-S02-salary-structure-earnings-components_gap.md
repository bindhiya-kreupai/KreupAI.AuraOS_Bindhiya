# Gap Analysis: EPIC-10-S02 — Salary structure & earnings components

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** configurable earnings components and salary structures, **so that** basic, allowances and other earnings are defined consistently and country-correctly.

**Description**
Model a configurable component library (basic, HRA, transport, allowances, fixed/variable earnings) with calculation methods (fixed, percentage-of-basic, formula), taxability/statutory flags, proration behaviour, and grade-band linkage, assembled into per-employee salary structures.

**Covers:** 10.2
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/components/payroll/SalaryStructureBuilder.tsx
- apps/web/src/app/api/v1/payroll/salary-structures/[id]/route.ts
- apps/web/src/app/api/v1/payroll/salary-structures/route.ts
- apps/web/src/app/api/v1/payroll/salary-structures/simulate/route.ts
- apps/web/src/components/payroll/PayslipGenerator.tsx
- apps/web/src/components/payroll/SalaryRevision.tsx
- apps/web/src/lib/services/payroll/**tests**/salary-components.test.ts
- services/payroll-service/src/services/salary-structure-service.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given a component, when defined, then its type (fixed/%/formula), base, proratable flag and country statutory tags are captured.
- [ ] Given an employee, when a salary structure is assigned, then the sum of components is validated against the grade salary band (EPIC-09) with out-of-band flagging.
- [ ] Given a country, when a structure is built, then country-specific composition rules apply (e.g., basic must be ≥ defined % of gross for gratuity/WPS basis where required).
- [ ] Given any structure change, when saved, then it is effective-dated, versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `pay_component` and `employee_salary_structure` schemas (`component_id`, `calc_method`, `base`, `proratable`, `statutory_tag`, `currency`)
- [ ] Backend: component calculation method resolver + band validation
- [ ] Frontend: component library + salary structure builder
- [ ] Rules/Config: per-country composition rules (basic %, gratuity basis)
- [ ] Tests: unit tests for fixed/%/formula evaluation and band validation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
