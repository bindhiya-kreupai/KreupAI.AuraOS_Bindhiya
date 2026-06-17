# Gap Analysis: EPIC-35-S07 — Annual HR compliance audit plan, sampling & testing checklist

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-35-compliance-calendar-scheduling-automation.md](./EPIC-35-compliance-calendar-scheduling-automation.md)
> Parent epic: EPIC-35: Compliance Calendar & Scheduling Automation
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8

**Description**
Build the annual HR compliance audit plan (scope, schedule, areas, owners), the audit sampling plan (population, sample size/method per area, e.g., risk-based and random sampling), and the audit testing checklist driving each area's tests — producing the sample annual audit plan from the handbook.

**Covers:** A1.17, A1.18, A1.19, A1.25
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/testing/tsconfig.json
- packages/@aura/testing/tsup.config.ts
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a year, when the audit plan is configured, then scope, schedule, areas and owners are defined and generate audit tasks.
- [ ] Given an audit area, when sampling is configured, then sample size/method and selected records are produced from the population.
- [ ] Given a sample, when tested, then the area's testing checklist captures pass/fail with evidence.
- [ ] Given the plan, when exported, then it produces the annual audit-plan document and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `audit_plan`, `audit_sample`, `audit_test_result` schemas
- [ ] Backend: sampling engine (risk-based + random) over populations
- [ ] Frontend: audit-plan builder + sampling + testing-checklist runner
- [ ] Rules/Config: per-area sampling methods and testing checklists
- [ ] Tests: integration tests for sample selection and test capture

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
