# Gap Analysis: EPIC-02-S06 — GPSSA pension compliance & contribution integration

> Source epic: [EPIC-02-chapter-2-regulatory-framework.md](./EPIC-02-chapter-2-regulatory-framework.md)
> Parent epic: EPIC-02: Chapter 2 – Regulatory Framework
> Module: Platform / Country Rule Engine
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** GPSSA registration and contribution rules with file/integration support, **so that** UAE/GCC-national pension contributions are calculated, submitted, and reconciled correctly.

**Description**
Encodes GPSSA applicability (UAE nationals and GCC nationals under the unified extension), contribution-account-salary definition, employer/employee split, and monthly process; provides a contribution file/adapter with reconciliation against payroll.

**Covers:** 2.5
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- packages/@aura/database/src/seeds/integration-configs.seed.ts
- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts
- apps/web/src/app/api/sso-config/route.ts
- apps/web/src/app/api/v1/admin/ai-config/route.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a UAE-national employee, when contributions are computed, then the GPSSA contribution-account salary and employer/employee percentages from the rule engine are applied.
- [ ] Given a GCC national employed in the UAE, then GPSSA cross-GCC handling is applied per the unified extension rule.
- [ ] Given monthly close, when the GPSSA file is generated, then it reconciles to payroll contribution totals and flags variances.
- [ ] Given a salary change mid-period, then the contribution base is recomputed and the variance recorded.
- [ ] Given any GPSSA submission, then payload, totals, and outcome are audit-logged.
- [ ] Given RBAC, then only Payroll Officer/HR Admin may run GPSSA processing.

## Implementation Tasks From Backlog

- [ ] Backend: `GpssaRegistration`, `GpssaContribution` schema + monthly contribution engine; migration.
- [ ] Backend: GPSSA file/adapter and payroll reconciliation service.
- [ ] Frontend: GPSSA monthly run + variance review screen.
- [ ] Rules/Config: GPSSA contribution-salary definition, rates, and GCC-unified-extension flag.
- [ ] Alerts/Workflow: contribution-due reminder and variance alert.
- [ ] Tests: unit tests for split calculation, mid-period change, and reconciliation.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
