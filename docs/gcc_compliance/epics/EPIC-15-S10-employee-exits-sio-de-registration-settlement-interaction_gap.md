# Gap Analysis: EPIC-15-S10 — Employee Exits & SIO De-registration / Settlement Interaction

> Source epic: [EPIC-15-chapter-15-bahrain-sio-compliance.md](./EPIC-15-chapter-15-bahrain-sio-compliance.md)
> Parent epic: EPIC-15: Chapter 15 – Bahrain SIO Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5

**Description**
On separation, AuraOS computes the final-period SIO contribution and gratuity funding, triggers de-registration with the correct reason, excludes the leaver from the next file, and exposes the SIO service period and funded-gratuity balance to the EOSB/final-settlement module. Prevents continued contribution for exited employees.

**Covers:** 15.12
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

- [ ] Given an exit, when the leaving date is set, then the final-period SIO contribution and gratuity funding are prorated and de-registration queued with the correct reason code.
- [ ] Given the leaver, when the next monthly snapshot runs, then they are excluded after their leaving date and flagged if still active.
- [ ] Given SIO history, when an end-of-service/settlement calculation is requested, then the SIO service period and funded-gratuity balance are exposed to the EOSB epic.
- [ ] Given a de-registration deadline, then alerts fire if not completed on time.
- [ ] Given any exit action, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: consumer on `employee.separationInitiated` → final SIO + gratuity proration + de-registration
- [ ] Backend: snapshot exclusion + "exited but still contributing" red-flag
- [ ] Backend: expose SIO service-period + funded-gratuity API for EOSB
- [ ] Frontend: SIO exit/de-registration panel in separation flow
- [ ] Alerts/Workflow: de-registration deadline alert
- [ ] Tests: unit tests for proration and exclusion

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
