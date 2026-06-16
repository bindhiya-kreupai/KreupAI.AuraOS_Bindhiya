# Gap Analysis: EPIC-36-S01 — Country library structure, themes & rule-pack model

> Source epic: [EPIC-36-gcc-country-compliance-library-rule-config.md](./EPIC-36-gcc-country-compliance-library-rule-config.md)
> Parent epic: EPIC-36: GCC Country Compliance Library & Rule Config
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a structured country compliance library with GCC-wide themes, **so that** per-country rules are authored against a consistent schema feeding the rule engine.

**Description**
Establish the library foundation: the rule-pack schema (domain, rule key, value/formula, effective date, authority reference, citation), the GCC-wide compliance themes (common obligations across all six countries), and the introduction/overview that frame the per-country summaries. Rule packs are versioned and bind to the EPIC-34 rule engine.

**Covers:** A2.1, A2.2, A2.16
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts
- apps/web/src/app/api/sso-config/route.ts
- apps/web/src/app/api/v1/admin/ai-config/route.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- add/wire service logic; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given the library, when structured, then each rule carries domain, key, value/formula, effective date, authority and citation.
- [ ] Given GCC-wide themes, when authored, then common obligations are captured as shared/base rules inheritable by country packs.
- [ ] Given a rule pack, when published, then it is versioned, effective-dated and registered with the rule engine.
- [ ] Given any rule-pack change, when saved, then it is audit-logged with author and source citation.

## Implementation Tasks From Backlog

- [ ] Backend: `country_rule_pack`, `compliance_theme`, `rule_citation` schemas
- [ ] Backend: rule-pack registration with the EPIC-34 rule engine
- [ ] Frontend: country library overview + theme browser
- [ ] Rules/Config: GCC-wide base theme rules
- [ ] Tests: unit tests for rule-pack registration and citation capture

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
