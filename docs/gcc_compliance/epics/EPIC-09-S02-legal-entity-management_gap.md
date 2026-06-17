# Gap Analysis: EPIC-09-S02 — Legal entity management

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-09-chapter-9-organization-position-management.md](./EPIC-09-chapter-9-organization-position-management.md)
> Parent epic: EPIC-09: Chapter 9 – Organization & Position Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5

**Description**
Model each legal entity with its country, trade licence / CR number, MOHRE/Qiwa/LMRA establishment IDs, WPS employer code and base currency, so downstream modules resolve the right statutory context per entity.

**Covers:** 9.4
**Acceptance criteria count:** 4 · **Task count:** 6

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

- [ ] Given a new legal entity, when created, then mandatory fields (country, legal name, registration number, establishment ID, base currency) are validated before save.
- [ ] Given a GCC country, when the entity is saved, then country-specific identifier formats (e.g., UAE establishment card, Saudi CR/Qiwa, Bahrain LMRA) are validated by the rule engine.
- [ ] Given an entity used by active employees, when a user attempts deletion, then it is blocked and only deactivation with effective date is allowed.
- [ ] Given any field change, when saved, then maker-checker approval and audit capture apply.

## Implementation Tasks From Backlog

- [ ] Backend: `legal_entity` schema (`entity_id`, `country_code`, `legal_name`, `cr_number`, `establishment_id`, `wps_employer_code`, `base_currency`, `status`)
- [ ] Backend: country-specific identifier validation via rule engine
- [ ] Frontend: legal entity registry screen with CRUD + deactivate
- [ ] Rules/Config: per-country mandatory identifier and format rules
- [ ] Alerts/Workflow: maker-checker on entity create/change
- [ ] Tests: integration tests for identifier validation per country

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
