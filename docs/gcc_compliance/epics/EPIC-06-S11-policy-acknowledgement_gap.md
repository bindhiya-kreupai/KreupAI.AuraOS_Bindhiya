# Gap Analysis: EPIC-06-S11 — Policy acknowledgement

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Parent epic: EPIC-06: Chapter 6 – Employee Onboarding Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 3
**User story:** Compliance Officer, **I want** new hires to acknowledge mandatory policies during onboarding, **so that** code of conduct, data-privacy and country-specific policy consent are evidenced.

**Description**
Present the mandatory policy pack (code of conduct, data privacy/PDPL consent, IT acceptable use, anti-harassment, country addendums) for e-acknowledgement. Acknowledgement is versioned, timestamped and stored to the employee file; missing acknowledgements block completion.

**Covers:** 6.13
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

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

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given onboarding, when the policy step opens, then the active policy versions for the employee's country/entity are presented.
- [ ] Given the employee e-acknowledges, then the exact policy version, timestamp and IP/device are recorded.
- [ ] Given an unacknowledged mandatory policy, then onboarding completion is blocked.
- [ ] Given a later policy version, then re-acknowledgement can be requested (handled in records module).
- [ ] Given audit, then acknowledgement evidence is retrievable per employee and policy.

## Implementation Tasks From Backlog

- [ ] Backend: `policy_acknowledgement` (employee_id, policy_id, version, acknowledged_at, evidence).
- [ ] Backend: acknowledgement capture + completeness gate.
- [ ] Frontend: ESS policy-acknowledgement screen.
- [ ] Rules/Config: mandatory policy pack per country/entity.
- [ ] Tests: gating + version-capture tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
