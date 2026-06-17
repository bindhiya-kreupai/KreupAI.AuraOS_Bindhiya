# Gap Analysis: EPIC-06-S08 — Medical insurance & benefits enrolment

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Parent epic: EPIC-06: Chapter 6 – Employee Onboarding Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 5

**Description**
Trigger enrolment into the correct medical insurance plan by emirate/region and grade, capture dependents, generate vendor enrolment files/records and track policy/card issuance. Enforce mandatory medical cover where required (e.g. Dubai/Abu Dhabi, KSA CCHI) before completion.

**Covers:** 6.10
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Implemented - pending migration/config verification

**Existing implementation evidence**

- packages/@aura/database/prisma/schema.prisma
- packages/@aura/database/prisma/migrations/20260616093000_add_benefit_onboarding_tracking/migration.sql
- apps/web/src/lib/services/benefits-onboarding.service.ts
- apps/web/src/lib/services/**tests**/benefits-onboarding.service.test.ts
- apps/web/src/app/api/v1/onboarding/benefits/route.ts
- apps/web/src/app/api/v1/onboarding/benefits/[id]/issue-card/route.ts
- apps/web/src/app/dashboard/onboarding/benefits/page.tsx
- apps/web/src/app/dashboard/onboarding/page.tsx
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- Run the new Prisma migration in the target environment.
- Confirm with product/compliance whether the built-in GCC mandatory-cover rule map should remain code-owned for MVP or move under the configurable country-rule engine from S06.

## Acceptance Criteria To Verify

- [ ] Given an activated employee, when benefits enrolment runs, then the correct plan is selected by location/grade and eligibility rules.
- [ ] Given mandatory-cover jurisdictions, when enrolment is incomplete, then onboarding completion is blocked and flagged.
- [ ] Given eligible dependents, when added, then their cover and documents are captured and included in the enrolment record.
- [ ] Given vendor enrolment, then an enrolment file/record is produced and insurance-card status is tracked to issuance.
- [ ] Given any enrolment action, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `benefit_enrolment` (employee_id, plan_id, dependents, vendor_ref, card_status).
- [ ] Backend: eligibility resolver + vendor enrolment export.
- [ ] Frontend: benefits enrolment screen incl. dependents.
- [ ] Rules/Config: mandatory medical-cover rules by emirate/region & grade.
- [ ] Alerts/Workflow: card-pending and mandatory-cover-missing alerts.
- [ ] Tests: eligibility + mandatory-gate tests.

## Next Verification

- Targeted service tests passed: `pnpm --filter web test:run src/lib/services/__tests__/benefits-onboarding.service.test.ts`.
- Prisma client generation passed: `pnpm --filter @aura/database db:generate`.
- Web type-check passed: `pnpm --filter web type-check`.
- Integration/E2E remains recommended after a seeded tenant has active `HEALTH_INSURANCE` plans with `eligibilityCriteria` for country/region/location/grade.
