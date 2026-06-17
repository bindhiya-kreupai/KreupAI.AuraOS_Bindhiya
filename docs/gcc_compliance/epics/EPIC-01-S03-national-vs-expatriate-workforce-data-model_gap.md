# Gap Analysis: EPIC-01-S03 — National vs. expatriate workforce data model

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-01-gcc-employment-landscape.md](./EPIC-01-gcc-employment-landscape.md)
> Parent epic: EPIC-01: Chapter 1: GCC Employment Landscape
> Module: Foundation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8

**Description**
The single most reused dimension across GCC compliance is national vs. expat. This story adds nationality, country of employment, GCC-national flag, and a derived classification to the employee master so that EOSB, GOSI/GPSSA, Emiratisation/Nitaqat and immigration logic all read one consistent value.

**Covers:** 1.2, 1.3
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Minimal Evidence

**Existing implementation evidence**

- apps/web/src/app/dashboard/workforce-planning/data.ts
- apps/web/src/app/dashboard/workforce-planning/scenario-modeling/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add tests.

## Acceptance Criteria To Verify

- [ ] Given an employee, when their nationality and country of employment are set, then the system derives `workforce_class` ∈ {national, gcc_national_other, expat}.
- [ ] Given a UAE entity, when an Emirati is recorded, then the employee is flagged eligible for Emiratisation counting hooks (calculation owned by nationalization epic).
- [ ] Given an employee, when nationality is missing, then the record cannot be activated and a data-quality flag is raised.
- [ ] Given a classification change, then it is versioned with effective date and written to the audit trail.
- [ ] Given RBAC, when a Line Manager views an employee, then nationality/ID numbers are masked unless permitted.
- [ ] Given a GCC national working in another GCC state, then the cross-GCC social-insurance hook (e.g., GCC unified extension) is flagged for the social-insurance module.

## Implementation Tasks From Backlog

- [ ] Backend: extend `Employee` with nationality, country_of_employment, is_gcc_national, workforce_class (derived), classification_effective_from; migration.
- [ ] Backend: derivation service + `employee.classified` event for downstream modules.
- [ ] Frontend: employee personal-details section with masked sensitive fields.
- [ ] Rules/Config: GCC-national set and derivation matrix per country of employment.
- [ ] Alerts/Workflow: data-quality flag when mandatory classification fields are missing.
- [ ] Tests: unit tests for derivation across national/other-GCC/expat permutations.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
