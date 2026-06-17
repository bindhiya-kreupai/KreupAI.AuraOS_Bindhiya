# Gap Analysis: EPIC-34-S03 — Legal entity configuration

> **✅ SHIPPED 2026-06-17** — EPIC-34 batch closure. Generic HrmsConfigObject registry (scope: GLOBAL → COUNTRY → LEGAL_ENTITY → DOMAIN) + 22 per-domain workspaces + implementation checklist + connectors + migrations + monthly/go-live certificate. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for what remains in other themes.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5

**Description**
Configure each legal entity with country, establishment/labour registrations and authority identifiers (MOHRE/MOL establishment, Qiwa/Mudad, GOSI/GPSSA/SIO/LMRA, WPS employer IDs, trade licence), calendar, currency and the rule-pack binding that drives all downstream compliance behaviour for that entity.

**Covers:** 34.5
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

- add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a new legal entity, when created, then its country, registrations and authority IDs are captured and the matching country rule pack is bound.
- [ ] Given authority IDs, when entered, then country-specific format validation is enforced (e.g., GOSI establishment, Qiwa unified number, MOHRE establishment card).
- [ ] Given an entity, when activated, then mandatory registrations for its country must be present or activation is blocked.
- [ ] Given any entity-config change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `legal_entity` schema (country, trade_licence, authority_ids[], currency, calendar, rule_pack_id)
- [ ] Backend: authority-ID validation service per country
- [ ] Frontend: legal-entity configuration screen with registration completeness indicator
- [ ] Rules/Config: mandatory-registration matrix per country
- [ ] Tests: integration tests for activation gating on missing registrations

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
