# Gap Analysis: EPIC-02-S07 — Emiratisation parameter set & hooks

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** Emiratisation targets and counting rules configurable in the rule engine, **so that** UAE entities can be measured and the nationalization epic can compute compliance.

**Description**
Captures Emiratisation applicability (size/category thresholds), target percentages, counting/eligibility rules, and penalty-exposure parameters as configurable rules, exposing evaluation hooks (Emirati count vs. target) for the dedicated Emiratisation epic.

**Covers:** 2.6
**Acceptance criteria count:** 6 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts
- apps/web/src/app/api/sso-config/route.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a UAE entity, when applicability is evaluated, then size/category thresholds determine whether targets apply.
- [ ] Given an applicable entity, when its Emirati ratio is evaluated, then the engine returns actual vs. target and a shortfall.
- [ ] Given an employee, when counted, then only eligible (genuinely employed, GPSSA-registered) Emiratis contribute per the rule.
- [ ] Given a shortfall, then the configured penalty-exposure parameters are returned for downstream reporting.
- [ ] Given a target change, then it is effective-dated and version-controlled.
- [ ] Given any evaluation, then inputs and matched version are traced.

## Implementation Tasks From Backlog

- [ ] Backend: Emiratisation rule parameters (applicability, target %, counting/eligibility, penalty exposure).
- [ ] Backend: `evaluateEmiratisation(entity, asOf)` hook returning actual/target/shortfall.
- [ ] Frontend: Emiratisation parameter view in the rule workspace.
- [ ] Rules/Config: seed UAE Emiratisation thresholds with source references.
- [ ] Tests: unit tests for applicability, eligibility filtering, and shortfall computation.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
