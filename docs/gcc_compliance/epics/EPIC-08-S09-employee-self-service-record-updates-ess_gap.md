# Gap Analysis: EPIC-08-S09 — Employee self-service record updates (ESS)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-08-chapter-8-employee-records-management.md](./EPIC-08-chapter-8-employee-records-management.md)
> Parent epic: EPIC-08: Chapter 8 – Employee Records Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8

**Description**
Provide an ESS portal where employees view their record/file and submit updates (contact, address, emergency contact, bank/IBAN, dependents, documents). Low-risk fields may auto-apply; sensitive fields (IBAN, name, ID, nationality) route to HR approval. Document re-uploads (e.g. renewed passport) feed the file and mandatory-matrix.

**Covers:** 8.12
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/lib/services/ess/employee-self-service.service.ts
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx
- apps/web/src/app/(modules)/core-hr/position-management/BudgetHealth.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given an employee, when they open ESS, then only their own record/file is visible.
- [ ] Given a low-risk field update, when submitted within validation, then it applies (or auto-routes per config) and notifies the employee.
- [ ] Given a sensitive field update (IBAN/name/ID), when submitted, then it routes to HR approval before taking effect.
- [ ] Given a document re-upload, when validated, then it updates the file and refreshes mandatory-matrix/expiry status.
- [ ] Given any ESS change, then it is audit-logged with the requesting employee as actor.
- [ ] Given RBAC, then employees cannot view others' data.

## Implementation Tasks From Backlog

- [ ] Backend: ESS update-request entity + field-risk routing service.
- [ ] Backend: document re-upload handler feeding file/matrix.
- [ ] Frontend: ESS record view + update request forms.
- [ ] Rules/Config: field-risk classification (auto vs approval).
- [ ] Alerts/Workflow: HR approval routing + employee notifications.
- [ ] Tests: routing, validation, own-record-scope tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
