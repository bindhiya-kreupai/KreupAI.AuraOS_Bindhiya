# Gap Analysis: EPIC-01-S01 — Multi-country, multi-entity tenancy model

> Source epic: [EPIC-01-gcc-employment-landscape.md](./EPIC-01-gcc-employment-landscape.md)
> Parent epic: EPIC-01: Chapter 1: GCC Employment Landscape
> Module: Foundation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**User story:** System Administrator, **I want** to configure a tenant with multiple GCC countries and legal entities, **so that** every downstream compliance module knows which country's rules and authorities apply to each entity.

**Description**
AuraOS must support organisations operating across UAE, Saudi Arabia, Bahrain, Qatar, Oman and Kuwait simultaneously. This story builds the tenant → country → legal-entity hierarchy that anchors all later configuration, with each entity bound to exactly one GCC country and its relevant authority context.

**Covers:** 1.1, 1.2
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a tenant, when an admin adds a country, then only the six GCC countries (UAE, KSA, Bahrain, Qatar, Oman, Kuwait) are selectable.
- [ ] Given a country is enabled, when an admin creates a legal entity, then the entity must be assigned to one enabled country and inherits that country's ISO code, currency, and timezone defaults.
- [ ] Given a legal entity, when it is saved, then a unique entity registration reference (e.g., MOHRE establishment / Qiwa entity / LMRA / CR number placeholder) field is captured per country.
- [ ] Given a country is not enabled for a tenant, when any user tries to assign an employee to it, then the system blocks the action with a validation error.
- [ ] Given any create/update/disable of a country or entity, then the change is written to the audit trail with actor, timestamp, and before/after values.
- [ ] Given RBAC, when a non-System-Administrator attempts entity configuration, then access is denied.

## Implementation Tasks From Backlog

- [ ] Backend: `Tenant`, `Country` (iso_code, currency, timezone, enabled), `LegalEntity` (entity_id, tenant_id, country_id, legal_name, registration_ref, status) Prisma schema + migration.
- [ ] Backend: tenancy service enforcing country-scoping on all entity reads/writes; emit `entity.created`/`entity.updated` events.
- [ ] Frontend: admin "Countries & Entities" configuration screen with country picker and entity CRUD.
- [ ] Rules/Config: restrict country list to the six GCC states; default currency/timezone per country.
- [ ] Alerts/Workflow: notify System Administrator group on entity activation/deactivation.
- [ ] Tests: unit tests for country-scope enforcement; e2e for entity creation across two countries.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
