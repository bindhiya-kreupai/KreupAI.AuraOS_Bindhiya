# Gap Analysis: EPIC-18-S05 — Bahraini employee eligibility-for-counting rules

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** strict eligibility rules governing which Bahrainis count toward the ratio, **so that** only genuinely employed, SIO-registered, paid Bahrainis are counted.

**Description**
A counting-eligibility gate evaluating each Bahraini against configurable criteria — active status, SIO registration, real wage above any minimum counting threshold, genuine role, minimum working hours — and including only those that pass in the numerator, with reasons for any exclusion.

**Covers:** 18.7
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/contract/consumer/employee-api.consumer.test.ts
- apps/web/src/**tests**/contract/provider/employee-api.provider.test.ts
- apps/web/src/**tests**/e2e/employees/employee-management.spec.ts
- apps/web/src/**tests**/e2e/pages/EmployeesPage.ts
- apps/web/src/**tests**/factories/employee.factory.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a Bahraini, when evaluated, then they count only if active, SIO-registered, paid above the minimum counting threshold and in a genuine role.
- [ ] Given a Bahraini failing any criterion, when evaluated, then they are excluded from the numerator with the failed criterion recorded.
- [ ] Given a wage below the minimum counting threshold, when detected, then the Bahraini is flagged non-counting and routed to detection.
- [ ] Given the numerator, then the included/excluded breakdown is exportable for audit.
- [ ] Given config, then eligibility criteria and thresholds are editable per country.

## Implementation Tasks From Backlog

- [ ] Backend: counting-eligibility service producing included/excluded numerator with reasons.
- [ ] Backend: `bahraini_counting_eligibility` entity (`employeeId`, `criteriaResults`, `counted`, `exclusionReason`).
- [ ] Frontend: eligibility breakdown view (included vs. excluded).
- [ ] Rules/Config: configurable eligibility criteria and minimum-wage counting threshold.
- [ ] Tests: unit tests for each exclusion path.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
