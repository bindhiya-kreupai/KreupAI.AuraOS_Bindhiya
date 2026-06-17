# Gap Analysis: EPIC-28-S16 — HRMS EOSB Automation Design (Events, Rule Engine, Workflow)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8
**User story:** System Administrator, **I want** the EOSB module wired into the event bus, country rule engine and workflow engine, **so that** EOSB runs straight-through, is fully configurable per country, and fails safe on missing rules.

**Description**
Makes the integration backbone explicit: separation/salary-change/leave/social-insurance events trigger EOSB recalculation and provisioning; the rule engine holds all EOSB parameters (country profiles, salary basis, service rules, separation treatments, caps, provision mappings) configurable per country with effective-dating; the workflow engine drives maker-checker and dispute escalation; notifications and a standardised audit envelope are applied throughout.

**Covers:** 28.24
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Minimal Evidence

**Existing implementation evidence**

- apps/web/src/app/(modules)/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/(modules)/workflow-engine/escalation-rules/page.tsx
- apps/web/src/app/dashboard/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/dashboard/workflow-engine/escalation-rules/page.tsx
- apps/web/src/app/(modules)/workflow-engine/ai-path-prediction/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/(modules)/workflow-engine/conditional-logic/page.tsx
- apps/web/src/app/(modules)/workflow-engine/email-notifications/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add tests; externalize country-specific rules into versioned config; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given the rule engine, when an EOSB parameter changes, then no deployment is needed and it is effective-dated.
- [ ] Given domain events (`employee.separationInitiated`, `employee.salaryChanged`, `leave.unpaidRecorded`, `socialInsurance.fundedBalanceUpdated`, `payroll.monthEnd`), then EOSB handlers react idempotently.
- [ ] Given the workflow engine, then EOSB maker-checker and dispute-escalation paths are reusable and configurable.
- [ ] Given an unconfigured country/rule, when EOSB runs, then it fails safe with a clear error rather than producing a wrong figure.
- [ ] Given all EOSB actions, then a standardised audit envelope (who/when/inputs/outputs) is recorded.

## Implementation Tasks From Backlog

- [ ] Backend: EOSB event handlers with idempotency keys
- [ ] Backend: rule-engine namespace `eosb.*` with effective-dated parameter store
- [ ] Backend: workflow templates for EOSB approval and disputes
- [ ] Backend: fail-safe guard for missing/expired rule profile
- [ ] Rules/Config: parameterise profiles, salary basis, service rules, treatments, caps, provision mapping per country
- [ ] Tests: integration tests for idempotency and fail-safe

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
