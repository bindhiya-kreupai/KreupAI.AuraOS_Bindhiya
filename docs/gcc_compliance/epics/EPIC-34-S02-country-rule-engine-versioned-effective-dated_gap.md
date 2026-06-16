# Gap Analysis: EPIC-34-S02 — Country rule engine (versioned, effective-dated)

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 13
**User story:** Compliance Officer, **I want** a versioned country rule engine, **so that** the correct GCC statutory rule set is applied per entity, country and date without code changes.

**Description**
Build the core rule engine that stores per-country rule packs (thresholds, formulas, windows, mandatory fields, authority references) as versioned, effective-dated records and resolves the applicable rule for any transaction by country + legal entity + effective date. Supports rule overrides, future-dated rule changes, and a simulation/preview mode.

**Covers:** 34.4
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts
- apps/web/src/app/api/sso-config/route.ts
- apps/web/src/app/api/v1/admin/ai-config/route.ts
- apps/web/src/components/compliance/gosi/GosiConfigPanel.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a transaction with country and date, when evaluated, then the engine returns the rule version effective on that date for UAE/KSA/BH/QA/OM/KW.
- [ ] Given a future statutory change, when configured with a future effective date, then it activates automatically on that date and prior transactions still resolve to the old version.
- [ ] Given a rule change, when published, then it is versioned, attributable and audit-logged, and previous versions remain queryable.
- [ ] Given a draft rule, when simulated, then the engine previews impact without affecting live resolution.
- [ ] Given an entity override, when set, then it takes precedence over the country default per the resolution order.

## Implementation Tasks From Backlog

- [ ] Backend: `country_rule_pack`, `rule`, `rule_version` schemas (country, domain, key, value/formula, effective_from/to)
- [ ] Backend: rule-resolution service with effective-dating and override precedence
- [ ] Backend: rule simulation/preview endpoint
- [ ] Frontend: rule-pack editor with version history and effective-date scheduling
- [ ] Rules/Config: seed UAE/KSA/BH/QA/OM/KW rule pack skeletons
- [ ] Tests: unit + integration tests for effective-dated resolution and override precedence

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
