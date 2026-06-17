# Gap Analysis: EPIC-06-S01 — Onboarding case lifecycle & governance model

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Parent epic: EPIC-06: Chapter 6 – Employee Onboarding Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8

**Description**
Introduce an `OnboardingCase` aggregate spanning stages Pre-Joining → Joining Day → Master-Data Activation → Enrolment → Probation → Completed. Governance defines stage owners (HR Admin, PRO, Payroll, IT, Line Manager), entry/exit criteria, SLAs and escalation. The case is created automatically when an offer reaches `ACCEPTED`.

**Covers:** 6.3, 6.4
**Acceptance criteria count:** 6 · **Task count:** 7

## Current Status

**Status:** Implemented - pending migration/event-bus integration verification

**Existing implementation evidence**

- packages/@aura/database/prisma/schema.prisma
- packages/@aura/database/prisma/migrations/20260616113000_add_onboarding_case_governance/migration.sql
- apps/web/src/lib/services/onboarding-case.service.ts
- apps/web/src/lib/services/**tests**/onboarding-case.service.test.ts
- apps/web/src/app/api/v1/onboarding/cases/route.ts
- apps/web/src/app/api/v1/onboarding/cases/[id]/transition/route.ts
- apps/web/src/app/dashboard/onboarding/cases/page.tsx
- apps/web/src/app/dashboard/onboarding/page.tsx
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx
- apps/web/src/app/(modules)/core-hr/position-management/BudgetHealth.tsx
- apps/web/src/app/(modules)/core-hr/position-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- Run the new Prisma migration in the target environment.
- Wire recruitment offer acceptance to `onboardingCaseService.consumeOfferAccepted(...)` through the production event bus/worker when the bus contract is finalized.
- Run integration/E2E with seeded governance templates, accepted offers, onboarding instances, and role-bearing users.

## Acceptance Criteria To Verify

- [ ] Given an offer status changes to ACCEPTED, when the event is consumed, then an OnboardingCase is created with country, legal entity, employment type and target join date pre-populated.
- [ ] Given a case in any stage, when a stage's mandatory exit criteria are unmet, then the case cannot advance and the blocking items are listed.
- [ ] Given a stage SLA breach, when the SLA timer elapses, then the case is escalated to the configured role and flagged on the dashboard.
- [ ] Given governance config per country/entity, when a case is created, then the correct owners and checklist template are bound.
- [ ] Given any stage transition, then actor, timestamp, from/to stage and reason are written to the audit trail.
- [ ] Given RBAC, then only the stage owner role (or HR Manager) can advance or reassign a stage.

## Implementation Tasks From Backlog

- [ ] Backend: `onboarding_case` (id, employee_offer_id, country_code, legal_entity_id, employment_type, target_join_date, current_stage, status, sla_due_at) + `onboarding_stage_history`.
- [ ] Backend: state-machine service with entry/exit guards and Kafka `onboarding.case.*` events.
- [ ] Backend: offer-accepted event consumer to auto-create cases.
- [ ] Frontend: Onboarding case workspace with stage tracker and blocking-items panel (HR/admin portal).
- [ ] Rules/Config: per-country/entity governance template (owners, SLAs, escalation paths).
- [ ] Alerts/Workflow: SLA timers + escalation notifications.
- [ ] Tests: state-machine guard unit tests, e2e offer→case creation.

## Next Verification

- Targeted service tests passed: `pnpm --filter web test:run src/lib/services/__tests__/onboarding-case.service.test.ts`.
- Prisma client generation passed: `pnpm --filter @aura/database db:generate`.
- Web type-check passed: `pnpm --filter web type-check`.
- Integration/E2E remains recommended after seeded governance and recruitment event data are available.
