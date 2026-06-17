# Gap Analysis: EPIC-29-S17 — HRMS Immigration Exit Automation Design (Events, Rule Engine, Workflow)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**User story:** System Administrator, **I want** the immigration-exit module wired into the event bus, country rule engine and workflow engine, **so that** exits run straight-through, are fully configurable per country, and fail safe on missing rules.

**Description**
Makes the integration backbone explicit: separation/absence/payroll/benefit/SI events trigger exit actions; the rule engine holds all exit parameters (scenarios, country profiles, grace periods, dependent sequencing, repatriation rules, absconding thresholds, PRO templates, evidence requirements) configurable per country with effective-dating; the workflow engine drives PRO tasks, escalations and clearance gates; notifications and a standardised audit envelope are applied throughout.

**Covers:** 29.22
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Minimal Evidence

**Existing implementation evidence**

- apps/web/src/app/(modules)/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/(modules)/workflow-engine/escalation-rules/page.tsx
- apps/web/src/app/dashboard/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/dashboard/workflow-engine/escalation-rules/page.tsx
- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/(modules)/workflow-engine/ai-path-prediction/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/(modules)/workflow-engine/conditional-logic/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add tests; externalize country-specific rules into versioned config; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given the rule engine, when an exit parameter changes, then no deployment is needed and it is effective-dated.
- [ ] Given domain events (`employee.separationInitiated`, `employee.unauthorizedAbsence`, `payroll.run.completed`, `socialInsurance.deregistered`), then exit handlers react idempotently.
- [ ] Given the workflow engine, then PRO-task, escalation and clearance-gate paths are reusable and configurable.
- [ ] Given an unconfigured country/scenario, when an exit runs, then it fails safe with a clear error rather than skipping steps.
- [ ] Given all exit actions, then a standardised audit envelope is recorded.

## Implementation Tasks From Backlog

- [ ] Backend: exit event handlers with idempotency keys
- [ ] Backend: rule-engine namespace `immig.exit.*` with effective-dated parameter store
- [ ] Backend: workflow templates for PRO tasks and clearance gates
- [ ] Backend: fail-safe guard for missing config
- [ ] Rules/Config: parameterise scenarios, profiles, grace, sequencing, repatriation, thresholds, evidence per country
- [ ] Tests: integration tests for idempotency and fail-safe

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
