# Gap Analysis: EPIC-24-S02 — HSE organization & responsibilities

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 3
**User story:** HSE Manager, **I want** to model the HSE organization and responsibilities, **so that** safety officers, first-aiders, fire wardens and responsible managers are assigned with required ratios and competencies.

**Description**
Define HSE roles (HSE officer, safety supervisor, first-aider, fire warden, permit issuer) and assign them to sites/employees with required ratios, certifications and validity, integrated with HR records.

**Covers:** 24.6
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/lib/services/organization/**tests**/department.service.test.ts
- apps/web/src/lib/services/organization/department.service.ts
- apps/web/src/lib/services/organization/**tests**/position.service.test.ts
- apps/web/src/lib/services/organization/position.service.ts
- apps/web/src/app/(modules)/core-hr/position-management/BudgetHealth.tsx
- apps/web/src/app/(modules)/core-hr/organization-structure/page.tsx
- apps/web/src/app/api/core-hr/organization/route.ts
- apps/web/src/app/dashboard/core-hr/organization-structure/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given a site, when staffed, then required HSE roles and minimum ratios (e.g. first-aiders per N workers) are checklisted and gaps flagged.
- [ ] Given an HSE role assignment, then the holder's certification and validity are tracked with expiry alerts.
- [ ] Given a role-holder separation, then the vacancy is flagged for reassignment.
- [ ] Given any assignment change, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `hse_role`, `hse_role_assignment` schema linked to employee records
- [ ] Backend: ratio-gap + certification-expiry service
- [ ] Frontend: HSE org & responsibilities screen
- [ ] Rules/Config: required roles + ratios per site type/country
- [ ] Alerts/Workflow: certification expiry + vacancy alerts
- [ ] Tests: unit (ratio/expiry)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
