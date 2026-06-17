# Gap Analysis: EPIC-02-S08 — Saudi labour-law framework rule set

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** the Saudi labour-law framework encoded as a baseline rule set, **so that** KSA entities compute working hours, leave, notice, and end-of-service award correctly.

**Description**
Seeds KSA Labour Law parameters: working hours (with Ramadan reduction for Muslim workers), weekly rest, annual leave (21 days rising to 30 after five years), sick-leave pay bands, notice periods, and the end-of-service award (half-month wage per year for first five years, full month thereafter, with resignation tiers).

**Covers:** 2.7
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

- [ ] Given a KSA entity, when EOS award is evaluated, then it applies ½-month/yr for the first five years and 1-month/yr thereafter.
- [ ] Given a resignation, then the resignation-based EOS reduction tiers are applied per service length.
- [ ] Given annual-leave evaluation, then 21 days (rising to 30 after five years) is returned.
- [ ] Given Ramadan, then reduced working hours for Muslim workers are reflected in the working-hours rule.
- [ ] Given a future change, then a new effective-dated KSA version supersedes cleanly.
- [ ] Given any read, then the matched KSA version is traced.

## Implementation Tasks From Backlog

- [ ] Backend: seed KSA `RuleSet` (working_hours, ramadan_hours, annual_leave, sick_leave_bands, notice, eos_award_formula, resignation_tiers).
- [ ] Backend: EOS-award formula with resignation tiering registered with the engine.
- [ ] Frontend: KSA rule-set view in the authoring workspace.
- [ ] Rules/Config: KSA parameter values with source references.
- [ ] Tests: unit tests for EOS tiering, resignation reduction, and leave entitlement.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
