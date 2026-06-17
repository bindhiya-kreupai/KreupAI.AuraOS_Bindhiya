# Gap Analysis: EPIC-06-S05 — Employee master data creation & activation

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Parent epic: EPIC-06: Chapter 6 – Employee Onboarding Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 13

**Description**
Compose the canonical employee master record (personal, identification, job/position, contract, compensation, bank/IBAN, nationality, social-insurance eligibility). A preparer drafts; a checker activates. On activation the employee number is issued and `employee.activated` is emitted to payroll, immigration, benefits and social insurance.

**Covers:** 6.7
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Implemented - pending migration/integration verification

**Existing implementation evidence**

- packages/@aura/database/prisma/schema.prisma
- packages/@aura/database/prisma/migrations/20260616110000_add_employee_master_activation/migration.sql
- apps/web/src/lib/services/employee-master-activation.service.ts
- apps/web/src/lib/services/**tests**/employee-master-activation.service.test.ts
- apps/web/src/app/api/v1/onboarding/employee-master/route.ts
- apps/web/src/app/api/v1/onboarding/employee-master/[id]/route.ts
- apps/web/src/app/api/v1/onboarding/employee-master/[id]/transition/route.ts
- apps/web/src/app/dashboard/onboarding/employee-master/page.tsx
- apps/web/src/app/dashboard/onboarding/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/ErrorBoundary.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/LoadingSpinner.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/components/Toast.tsx
- apps/web/src/app/dashboard/core-hr/employee-database/data.ts
- apps/web/src/app/dashboard/core-hr/employee-database/hooks/useEmployees.test.ts
- apps/web/src/app/dashboard/core-hr/employee-database/hooks/useEmployees.ts
- apps/web/src/app/dashboard/core-hr/employee-database/hooks/useToast.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- Run the new Prisma migration in the target environment.
- Wire the `employee.activated` outbox rows to the production message bus/worker when that publishing mechanism is selected.
- Run integration/E2E with seeded companies, employee statuses, employment types, job/grade/location masters, and S06 activation tasks.

## Acceptance Criteria To Verify

- [ ] Given validated onboarding data, when the master record is drafted, then mandatory fields per country (e.g. Emirates ID/Iqama/CPR/QID number, nationality, IBAN, GOSI/GPSSA eligibility flag) are enforced.
- [ ] Given maker-checker, when the preparer submits, then a different user must approve before activation (preparer ≠ approver).
- [ ] Given activation, when approved, then an employee number is generated per entity sequence and the record becomes active.
- [ ] Given activation, then `employee.activated` event is published with the master payload for downstream modules.
- [ ] Given duplicate detection, when passport/national-ID matches an existing active employee, then activation is blocked.
- [ ] Given any create/edit/activate, then field-level changes are written to the audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: `employee` master schema + `employee_identification`, `employee_job`, `employee_compensation` with realistic fields; migration.
- [ ] Backend: maker-checker activation service + employee-number generator + duplicate check.
- [ ] Backend: `employee.activated` Kafka publisher.
- [ ] Frontend: master-data create/draft and checker-approval screens.
- [ ] Rules/Config: per-country mandatory-field matrix.
- [ ] Tests: maker-checker, duplicate, event-publish integration tests.

## Next Verification

- Targeted service tests passed: `pnpm --filter web test:run src/lib/services/__tests__/employee-master-activation.service.test.ts`.
- Prisma client generation passed: `pnpm --filter @aura/database db:generate`.
- Web type-check passed: `pnpm --filter web type-check`.
- Integration/E2E remains recommended after seeded master data and activation workflow users are available.
