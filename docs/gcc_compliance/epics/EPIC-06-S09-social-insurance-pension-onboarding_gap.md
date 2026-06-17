# Gap Analysis: EPIC-06-S09 — Social insurance & pension onboarding

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Parent epic: EPIC-06: Chapter 6 – Employee Onboarding Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** eligible nationals (and applicable expats) registered with the correct social-insurance/pension authority during onboarding, **so that** GOSI/GPSSA/SIO/PASI registration deadlines are met and contributions begin correctly.

**Description**
Determine social-insurance applicability by nationality and country (UAE national → GPSSA; KSA → GOSI; Bahraini/expat in Bahrain → SIO; Oman → PASI; Qatar/Kuwait equivalents), capture contribution-wage basis and registration reference, and trigger registration within statutory windows. Block onboarding completion if a mandatory registration is missing.

**Covers:** 6.11
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Implemented - pending verification

**Existing implementation evidence**

- packages/@aura/database/prisma/schema.prisma
- packages/@aura/database/prisma/migrations/20260616090000_add_social_insurance_registration/migration.sql
- apps/web/src/lib/services/social-insurance-onboarding.service.ts
- apps/web/src/app/api/v1/onboarding/social-insurance/route.ts
- apps/web/src/app/api/v1/onboarding/social-insurance/[id]/register/route.ts
- apps/web/src/app/dashboard/onboarding/social-insurance/page.tsx
- apps/web/src/app/dashboard/onboarding/page.tsx
- apps/web/src/lib/services/**tests**/social-insurance-onboarding.service.test.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- Run database migration and Prisma client generation in the target environment.
- Run the targeted service test and web typecheck/build.
- Confirm seeded country rules are acceptable for UAE, KSA, Bahrain, Oman, Qatar, and Kuwait, or replace the in-service rule map with tenant-admin editable rule config in EPIC-06-S06.

## Acceptance Criteria To Verify

- [ ] Given nationality + country, when eligibility is evaluated, then the correct authority and contribution scheme are assigned (e.g. UAE national → GPSSA, KSA → GOSI).
- [ ] Given an eligible employee, when registration is initiated, then a statutory-deadline timer starts and is alerted before breach.
- [ ] Given contribution-wage rules, when computed, then the registered wage matches the country's defined contributory base.
- [ ] Given a missing mandatory registration reference, then onboarding completion is blocked.
- [ ] Given any registration action, then it is audit-logged with authority reference.

## Implementation Tasks From Backlog

- [ ] Backend: `social_insurance_registration` (employee_id, authority, scheme, contribution_wage, reference, status, deadline_at).
- [ ] Backend: eligibility + contribution-wage rule engine; deadline timers.
- [ ] Frontend: social-insurance onboarding screen.
- [ ] Rules/Config: per-country authority mapping & contributory base rules.
- [ ] Alerts/Workflow: registration-deadline alerts; completion-block on missing registration.
- [ ] Tests: eligibility + deadline + wage-basis tests per country.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
