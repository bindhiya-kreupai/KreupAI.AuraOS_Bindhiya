# Gap Analysis: EPIC-09-S06 — Job architecture (job families, jobs, profiles)

> **✅ SHIPPED 2026-06-17** — Themes J + K closure. Structural extensions: job architecture API surface (reuses existing JobFamily/JobProfile models), SalaryGradeBand, DelegationOfAuthority with resolveLevel helper, PayrollCalendarControl + PayrollVarianceEntry, FatigueRule with breachesRule helper, OvertimeFraudFlag (6 signals), EosSioFundingLink, ReturnToWorkPlan, HolidayCalendarChangeRequest (maker-checker), RedundancyBatch, SeparationRetentionPolicy, DocumentPhysicalLocation, AuditFindingRiskLink. Plus service-only closures: unified BH/OM/KW wage-file generator (EPIC-11-S05), grievance mediation states (EPIC-25-S04), classification RBAC helper canReadRecord (EPIC-30-S07), country rollup helper rollupByCountry (EPIC-31-S04), executive RBAC scopes canViewExecutiveDomain (EPIC-31-S14). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-09-chapter-9-organization-position-management.md](./EPIC-09-chapter-9-organization-position-management.md)
> Parent epic: EPIC-09: Chapter 9 – Organization & Position Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5

**Description**
Build the job catalogue: job families → sub-families → jobs → job profiles, each carrying a standard title, occupation/profession code (for nationalization and immigration), default grade and job description reference, reusable across legal entities.

**Covers:** 9.9
**Acceptance criteria count:** 4 · **Task count:** 5

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

- [ ] Given the architecture, when a job is created, then it must belong to a family/sub-family and carry an occupation/profession code.
- [ ] Given a position, when created, then it must reference a published job profile, not a free-text title.
- [ ] Given a country, when a job is used, then its occupation code maps to that country's classification (e.g., MOHRE/Qiwa profession lists).
- [ ] Given job-profile edits, when saved, then versioning and audit capture apply and existing positions show the version they were built from.

## Implementation Tasks From Backlog

- [ ] Backend: `job_family`, `job`, `job_profile` schemas with `occupation_code`
- [ ] Backend: occupation-code mapping per country via rule engine
- [ ] Frontend: job architecture catalogue + profile editor
- [ ] Rules/Config: country occupation/profession code lists
- [ ] Tests: unit tests for profile versioning and mandatory occupation code

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
