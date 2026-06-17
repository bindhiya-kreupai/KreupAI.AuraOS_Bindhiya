# Gap Analysis: EPIC-13-S08 — Employee Exits & GOSI De-registration / Settlement Interaction

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-13-chapter-13-gosi-compliance.md](./EPIC-13-chapter-13-gosi-compliance.md)
> Parent epic: EPIC-13: Chapter 13 – GOSI Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5

**Description**
On termination/resignation, AuraOS computes the final GOSI contribution for the partial period, triggers GOSI de-registration with the correct end-of-service reason code, ensures the leaver drops off the next monthly file, and surfaces the GOSI/EOSB interaction (GOSI subscription period feeds the end-of-service calculation). Prevents the common error of continuing to contribute for exited employees.

**Covers:** 13.11
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

- [ ] Given an exit is initiated, when the leaving date is set, then the final-period GOSI contribution is prorated and de-registration is queued with the correct reason code.
- [ ] Given the leaver, when the next monthly run snapshots members, then the exited employee is excluded after their leaving date and flagged if erroneously still active.
- [ ] Given GOSI subscription history, when an end-of-service calculation is requested, then the GOSI contribution period is exposed as an input to the EOSB epic.
- [ ] Given de-registration is required by a deadline, then alerts fire if it is not completed on time.
- [ ] Given any exit/de-registration action, then it is captured in the audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: consumer on `employee.separationInitiated` → final GOSI proration + de-registration record
- [ ] Backend: exclusion rule in monthly snapshot + "exited but still contributing" red-flag
- [ ] Backend: expose GOSI subscription-period API for EOSB consumption
- [ ] Frontend: GOSI exit/de-registration panel in separation flow
- [ ] Alerts/Workflow: de-registration deadline alert
- [ ] Tests: unit tests for proration and snapshot exclusion

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
