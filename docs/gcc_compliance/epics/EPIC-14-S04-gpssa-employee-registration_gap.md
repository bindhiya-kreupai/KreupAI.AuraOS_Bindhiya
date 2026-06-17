# Gap Analysis: EPIC-14-S04 — GPSSA Employee Registration

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-14-chapter-14-gpssa-compliance.md](./EPIC-14-chapter-14-gpssa-compliance.md)
> Parent epic: EPIC-14: Chapter 14 – GPSSA Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8

**Description**
On hire of an eligible national, AuraOS prepares a GPSSA registration using Emirates ID, nationality, occupation, join date and account salary, generates the registration request/file, and stores the returned GPSSA registration/insurance number. Handles late registration flagging and excludes expatriates automatically.

**Covers:** 14.7
**Acceptance criteria count:** 5 · **Task count:** 6

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

- [ ] Given a new eligible national hire, when onboarding completes, then a GPSSA registration record is auto-created with validated mandatory fields (Emirates ID, nationality, occupation, join date, account salary).
- [ ] Given an expatriate hire, when onboarding completes, then no GPSSA registration is created.
- [ ] Given registration not completed within the configured window from join date, then it is flagged "late registration" and surfaced on the dashboard.
- [ ] Given a returned GPSSA number, when entered, then it is stored and the record marked Active.
- [ ] Given any registration action, then it is written to the audit trail; RBAC restricts submission to HR Admin / Payroll Officer.

## Implementation Tasks From Backlog

- [ ] Backend: `gpssa_member_registration` entity (employeeId, emiratesId, nationality, occupation, joinDate, gpssaNumber, status)
- [ ] Backend: registration file builder + late-registration detector + expat exclusion
- [ ] Backend: consumer on `employee.hired` creating registration draft for eligible nationals
- [ ] Frontend: GPSSA registration worklist + detail screen with validation
- [ ] Alerts/Workflow: late-registration alert at join+N days
- [ ] Tests: unit tests for eligibility filter; e2e hire→registration draft

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
