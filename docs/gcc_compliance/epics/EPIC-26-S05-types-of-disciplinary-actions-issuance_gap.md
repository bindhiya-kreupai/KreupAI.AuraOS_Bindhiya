# Gap Analysis: EPIC-26-S05 — Types of Disciplinary Actions & Issuance

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-26-chapter-26-disciplinary-action-compliance.md](./EPIC-26-chapter-26-disciplinary-action-compliance.md)
> Parent epic: EPIC-26: Chapter 26 – Disciplinary Action Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5

**Description**
Supports issuing verbal warning, written warning, final written warning, fine/penalty deduction (subject to legal-limit checks), demotion, suspension and dismissal-recommendation, each generating a formal letter/record, communicating to the employee, capturing acknowledgement, and tracking validity/expiry that feeds the penalty matrix's prior-record logic.

**Covers:** 26.11
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/grievance/types.ts
- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/dashboard/core-hr/employee-database/types.ts
- apps/web/src/lib/services/employee/types.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given a finalised decision, when a penalty type is issued, then the corresponding letter/record is generated and delivered with acknowledgement capture.
- [ ] Given a fine/deduction penalty, when issued, then it routes through legal-limit validation (S06) before payroll instruction.
- [ ] Given a warning, when issued, then its validity period is set and it appears in the employee's active record.
- [ ] Given employee non-acknowledgement, when occurring, then delivery is still evidenced (e.g. witnessed/registered) and recorded.
- [ ] Given any issuance, when completed, then it is audited and filed to the employee record.

## Implementation Tasks From Backlog

- [ ] Backend: `disciplinary_action` (type, validity_period, letter_ref, ack_status) entity + letter generator.
- [ ] Backend: prior-record feed to penalty matrix; payroll-instruction emitter for fines.
- [ ] Frontend: action issuance + acknowledgement screens.
- [ ] Rules/Config: per-country permissible action types and validity periods.
- [ ] Alerts/Workflow: issuance notification + acknowledgement reminder.
- [ ] Tests: integration (issuance→record→matrix feed), unit (validity expiry).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
