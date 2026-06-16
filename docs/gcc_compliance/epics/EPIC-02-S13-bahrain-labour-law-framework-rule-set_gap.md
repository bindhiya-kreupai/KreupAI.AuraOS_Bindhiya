# Gap Analysis: EPIC-02-S13 — Bahrain labour-law framework rule set

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** the Bahrain labour-law framework encoded as a baseline rule set, **so that** Bahrain entities compute leave, notice, and end-of-service indemnity correctly.

**Description**
Seeds Bahrain Labour Law parameters: working hours, annual leave (30 days), sick-leave bands, notice periods, and end-of-service indemnity (e.g., half-month wage per year for first three years, full month thereafter), with Bahrainization context referencing LMRA/SIO.

**Covers:** 2.12
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

- [ ] Given a Bahrain entity, when EOS indemnity is evaluated, then the seeded tiered formula is applied.
- [ ] Given annual leave, then 30 days entitlement (per qualifying service) is returned with pro-ration.
- [ ] Given sick leave, then the statutory paid/partial/unpaid bands are returned.
- [ ] Given notice, then statutory minimums are enforced.
- [ ] Given a future change, then a new effective-dated Bahrain version supersedes cleanly.
- [ ] Given any read, then the matched Bahrain version is traced.

## Implementation Tasks From Backlog

- [ ] Backend: seed Bahrain `RuleSet` (working_hours, annual_leave, sick_leave_bands, notice, eos_indemnity_formula).
- [ ] Backend: indemnity formula registered with the engine.
- [ ] Frontend: Bahrain rule-set view in the authoring workspace.
- [ ] Rules/Config: Bahrain parameter values with source references.
- [ ] Tests: unit tests for indemnity tiering and leave entitlement.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
