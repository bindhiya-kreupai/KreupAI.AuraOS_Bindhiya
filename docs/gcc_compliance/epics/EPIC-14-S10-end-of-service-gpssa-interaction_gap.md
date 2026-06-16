# Gap Analysis: EPIC-14-S10 — End of Service & GPSSA Interaction

> Source epic: [EPIC-14-chapter-14-gpssa-compliance.md](./EPIC-14-chapter-14-gpssa-compliance.md)
> Parent epic: EPIC-14: Chapter 14 – GPSSA Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5

**Description**
On separation of a national, AuraOS computes the final-period GPSSA contribution, triggers de-registration with the correct end-of-service reason, excludes the leaver from the next file, and exposes the GPSSA contribution/service period as an input to the EOSB/pension settlement. Prevents continued contribution for exited nationals.

**Covers:** 14.12
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/dashboard/payroll-compliance/eosb/end-of-service-benefits-calculator/page.tsx
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/mobile/src/services/benefits.service.ts
- apps/web/src/**tests**/services/compliance/gosi.service.test.ts
- apps/web/src/app/api/benefits/dependents/route.ts
- apps/web/src/app/api/v1/benefits/analytics/trends/route.ts
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an exit, when the leaving date is set, then the final-period GPSSA contribution is prorated and de-registration queued with the correct reason code.
- [ ] Given the leaver, when the next monthly snapshot runs, then they are excluded after their leaving date and flagged if still active.
- [ ] Given GPSSA service history, when an end-of-service/pension calculation is requested, then the GPSSA service period is exposed to the EOSB epic.
- [ ] Given a de-registration deadline, then alerts fire if not completed on time.
- [ ] Given any exit action, then it is written to the audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: consumer on `employee.separationInitiated` → final GPSSA proration + de-registration
- [ ] Backend: snapshot exclusion + "exited but still contributing" red-flag
- [ ] Backend: expose GPSSA service-period API for EOSB
- [ ] Frontend: GPSSA exit/de-registration panel in separation flow
- [ ] Alerts/Workflow: de-registration deadline alert
- [ ] Tests: unit tests for proration and exclusion

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
