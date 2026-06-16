# Gap Analysis: EPIC-02-S03 — UAE labour-law framework rule set

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** the UAE labour-law framework encoded as a baseline rule set, **so that** UAE entities compute working hours, leave, notice, probation, and EOSB correctly.

**Description**
Seeds UAE Federal Decree-Law parameters: contract types (limited-term), max working hours, weekly rest, annual leave (30 days after one year), sick-leave bands, notice periods, probation limits, and EOSB rule (21 days/yr for first 5 years then 30 days/yr, capped at 2 years' wage). These become the authoritative UAE rule version.

**Covers:** 2.2
**Acceptance criteria count:** 6 · **Task count:** 5

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

- [ ] Given a UAE entity, when leave/notice/EOSB rules are evaluated, then they return the seeded UAE parameters for the as-of date.
- [ ] Given EOSB evaluation, then it applies 21 days/yr for the first five years and 30 days/yr thereafter, capped at two years' total wage.
- [ ] Given annual-leave evaluation, then it returns 30 calendar days after one year of service with documented pro-ration for partial years.
- [ ] Given probation, then the rule enforces the statutory maximum and required notice within probation.
- [ ] Given a future legal change, then a new effective-dated UAE version can supersede without affecting historical calculations.
- [ ] Given any rule read, then the matched UAE version id is captured in the evaluation trace.

## Implementation Tasks From Backlog

- [ ] Backend: seed UAE `RuleSet` parameters (working_hours, rest_day, annual_leave, sick_leave_bands, notice, probation, eosb_formula).
- [ ] Backend: EOSB formula expression and leave pro-ration helper registered with the engine.
- [ ] Frontend: UAE rule-set view within the rule-authoring workspace.
- [ ] Rules/Config: UAE parameter values with source references.
- [ ] Tests: unit tests for EOSB tiering/cap and annual-leave entitlement.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
