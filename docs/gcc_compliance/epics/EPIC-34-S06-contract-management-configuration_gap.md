# Gap Analysis: EPIC-34-S06 — Contract management configuration

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5

**Description**
Configure contract types (limited/unlimited or fixed-term as permitted by country), probation limits, notice-period rules, working-hour caps, renewal rules and mandatory clauses, with country constraints (e.g., UAE fixed-term-only post-2022, KSA Qiwa contract requirements) sourced from the rule engine.

**Covers:** 34.8
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

- [ ] Given a country, when contract types are configured, then only legally valid types are offered (e.g., UAE fixed-term, KSA Qiwa-registered).
- [ ] Given probation/notice config, when set, then values cannot exceed the country statutory maximum.
- [ ] Given a contract template, when configured, then mandatory clauses for the country are enforced as present.
- [ ] Given any contract-config change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `contract_type`, `contract_clause`, `contract_rule` schemas bound to rule engine
- [ ] Backend: statutory-limit validation (probation/notice/working hours)
- [ ] Frontend: contract configuration screen with country constraints
- [ ] Rules/Config: per-country contract-type and clause rules
- [ ] Tests: unit tests for statutory-limit enforcement

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
