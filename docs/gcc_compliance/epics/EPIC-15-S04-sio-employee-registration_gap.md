# Gap Analysis: EPIC-15-S04 — SIO Employee Registration

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-15-chapter-15-bahrain-sio-compliance.md](./EPIC-15-chapter-15-bahrain-sio-compliance.md)
> Parent epic: EPIC-15: Chapter 15 – Bahrain SIO Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8

**Description**
On hire, AuraOS prepares an SIO registration using CPR/passport, nationality, occupation, join date and contribution salary, and enrols the worker into the correct scheme (Bahraini insurance branches vs expatriate gratuity funding). Generates the registration request/file and tracks the returned SIO registration number. Handles late-registration flagging.

**Covers:** 15.7
**Acceptance criteria count:** 5 · **Task count:** 7

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/benefits/analytics/total-statement/[employeeId]/route.ts
- apps/web/src/app/api/v1/benefits/compliance/1095b/[employeeId]/route.ts
- apps/web/src/app/api/v1/benefits/compliance/1095c/[employeeId]/route.ts
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a new hire, when onboarding completes, then an SIO registration record is auto-created with validated mandatory fields (CPR for Bahrainis / passport for expats, nationality, occupation, join date, contribution salary).
- [ ] Given a Bahraini national, when registered, then social-insurance branches are enrolled; given an expatriate, then the gratuity-funding scheme is enrolled (per configurable rule).
- [ ] Given registration not completed within the configured window from join date, then it is flagged "late registration" and surfaced on the dashboard.
- [ ] Given a returned SIO number, when entered, then it is stored and the record marked Active.
- [ ] Given any registration action, then it is audited; RBAC restricts submission to HR Admin / Payroll Officer.

## Implementation Tasks From Backlog

- [ ] Backend: `sio_member_registration` entity (employeeId, cprOrPassport, nationality, occupation, joinDate, schemeEnrolment[], sioNumber, status)
- [ ] Backend: registration file builder + late-registration detector
- [ ] Backend: consumer on `employee.hired` creating registration draft
- [ ] Frontend: SIO registration worklist + detail screen with validation
- [ ] Rules/Config: scheme-enrolment-by-nationality rule (Bahraini vs expat)
- [ ] Alerts/Workflow: late-registration alert at join+N days
- [ ] Tests: unit tests for scheme enrolment; e2e hire→registration draft

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
