# Gap Analysis: EPIC-13-S03 — GOSI Employee Registration & De-registration

> Source epic: [EPIC-13-chapter-13-gosi-compliance.md](./EPIC-13-chapter-13-gosi-compliance.md)
> Parent epic: EPIC-13: Chapter 13 – GOSI Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8

**Description**
On hire, AuraOS prepares a GOSI registration record using the employee's Iqama/National ID, nationality, occupation, join date and contribution wage, and applies the correct branch enrolment. Generates a registration request/file for the GOSI portal and tracks the returned GOSI subscription number. Also handles late registration flagging.

**Covers:** 13.6
**Acceptance criteria count:** 6 · **Task count:** 7

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

- [ ] Given a new in-scope hire, when onboarding completes, then a GOSI registration record is auto-created with nationality-correct branch enrolment and validated mandatory fields (National ID/Iqama, occupation, join date, contribution wage).
- [ ] Given a Saudi national, when registered, then both Annuities and Occupational Hazards branches are enrolled; given an expatriate, then only Occupational Hazards is enrolled (per configurable rule).
- [ ] Given registration is not completed within the configured window from join date, then the record is flagged "late registration" and raised on the dashboard.
- [ ] Given a returned GOSI subscription number, when entered, then it is stored against the employee and the record marked Active.
- [ ] Given any registration/de-registration action, then it is written to the audit trail with actor and timestamp.
- [ ] Given RBAC, only HR Admin / Payroll Officer may submit registrations.

## Implementation Tasks From Backlog

- [ ] Backend: `gosi_member_registration` entity (employeeId, nationalId, nationality, occupation, joinDate, branchEnrolment[], gosiSubscriptionNo, status, registeredAt)
- [ ] Backend: registration request file/export builder + late-registration detector
- [ ] Backend: event consumer on `employee.hired` to auto-create registration draft
- [ ] Frontend: GOSI registration worklist + detail screen with validation
- [ ] Rules/Config: branch-enrolment-by-nationality rule (Saudi vs expat)
- [ ] Alerts/Workflow: late-registration alert at configurable join+N days
- [ ] Tests: unit tests for branch enrolment, e2e for hire→registration draft

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
