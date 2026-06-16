# Gap Analysis: EPIC-02-S12 — Nitaqat (Saudization) parameter set & hooks

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** Nitaqat bands, sector/size rules, and counting logic configurable, **so that** KSA entities can be classified (Red/Low/Medium/High/Platinum) and the Saudization epic can compute status.

**Description**
Encodes Nitaqat applicability by activity/size, band thresholds, Saudi-workforce calculation (weighted headcount with GOSI/Qiwa linkage), and artificial-Saudization risk parameters, exposing evaluation hooks for the dedicated Nitaqat epic.

**Covers:** 2.11
**Acceptance criteria count:** 6 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/api/mfa-config/route.ts
- apps/web/src/app/api/sso-config/route.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a KSA entity, when its Saudization ratio is evaluated, then the engine returns the band and distance to the next band.
- [ ] Given counting, then only GOSI-registered, Qiwa-contracted Saudis are counted per the rule.
- [ ] Given activity and size, then the correct band thresholds are selected.
- [ ] Given a band change risk, then artificial-Saudization risk parameters are exposed for reporting.
- [ ] Given a threshold change, then it is effective-dated and versioned.
- [ ] Given any evaluation, then inputs and matched version are traced.

## Implementation Tasks From Backlog

- [ ] Backend: Nitaqat rule parameters (applicability, band thresholds, weighted counting, risk flags).
- [ ] Backend: `evaluateNitaqat(entity, asOf)` hook returning band and gap.
- [ ] Frontend: Nitaqat parameter view in the rule workspace.
- [ ] Rules/Config: seed band thresholds by sector/size with source references.
- [ ] Tests: unit tests for band selection, weighted counting, and GOSI/Qiwa eligibility.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
