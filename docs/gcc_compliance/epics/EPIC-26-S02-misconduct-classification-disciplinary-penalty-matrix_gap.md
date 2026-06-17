# Gap Analysis: EPIC-26-S02 — Misconduct Classification & Disciplinary Penalty Matrix

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-26-chapter-26-disciplinary-action-compliance.md](./EPIC-26-chapter-26-disciplinary-action-compliance.md)
> Parent epic: EPIC-26: Chapter 26 – Disciplinary Action Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 8

**Description**
Implements a misconduct taxonomy (minor/major/gross categories with specific offences—absenteeism, insubordination, safety breach, theft, fraud, harassment-linked, etc.) and a penalty matrix mapping offence × prior-record × severity to a recommended penalty (verbal/written warning, final warning, fine, suspension, demotion, dismissal), constrained by country legal limits.

**Covers:** 26.6, 26.7
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx
- apps/web/src/app/dashboard/grievance/components/ErrorBoundary.tsx
- apps/web/src/app/dashboard/grievance/components/LoadingSpinner.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given a case, when an offence is classified, then category and severity are recorded and drive matrix lookup.
- [ ] Given an offence plus the employee's active prior warnings, when the matrix runs, then a proportionate recommended penalty is proposed.
- [ ] Given a proposed penalty, when it exceeds country legal limits, then it is blocked/flagged with the statutory reference.
- [ ] Given an HR override of the recommendation, when applied, then reason and approver are captured and audited.
- [ ] Given expired prior warnings, when matrix runs, then they are excluded per validity period (configurable).

## Implementation Tasks From Backlog

- [ ] Backend: `misconduct_category`, `misconduct_offence`, `penalty_matrix_rule`, `disciplinary_case` entities/migrations.
- [ ] Backend: matrix evaluation service using prior-record + severity in the rule engine.
- [ ] Frontend: classification + recommended-penalty screen with override.
- [ ] Rules/Config: configurable matrix and per-country legal-limit constraints and warning-validity periods.
- [ ] Alerts/Workflow: approval routing for overrides/escalated penalties.
- [ ] Tests: unit (matrix evaluation + legal cap), integration (prior-record aggregation).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
