# Gap Analysis: EPIC-14-S15 — HRMS GPSSA Automation Design (Events, Rule Engine, Workflow)

> Source epic: [EPIC-14-chapter-14-gpssa-compliance.md](./EPIC-14-chapter-14-gpssa-compliance.md)
> Parent epic: EPIC-14: Chapter 14 – GPSSA Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**User story:** System Administrator, **I want** the GPSSA module wired into the event bus, country rule engine and workflow engine, **so that** GPSSA runs straight-through and is fully configurable per country/nationality.

**Description**
Defines end-to-end automation: hire/salary-change/transfer/exit events trigger GPSSA actions; the rule engine holds all GPSSA parameters (applicability, account-salary rules, employer/employee/government rates, caps, deadlines) configurable per country and nationality with effective-dating; the workflow engine drives maker-checker and approvals; notifications/audit are standardised. This is the integration backbone made explicit and testable.

**Covers:** 14.18
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Minimal Evidence

**Existing implementation evidence**

- apps/web/src/app/(modules)/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/(modules)/workflow-engine/escalation-rules/page.tsx
- apps/web/src/app/(modules)/workflow-engine/version-control/page.tsx
- apps/web/src/app/dashboard/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/dashboard/workflow-engine/escalation-rules/page.tsx
- apps/web/src/app/dashboard/workflow-engine/version-control/page.tsx
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add tests; externalize country-specific rules into versioned config; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given the rule engine, when a GPSSA parameter changes, then no deployment is needed and it is effective-dated.
- [ ] Given domain events (`employee.hired`, `employee.salaryChanged`, `employee.transferred`, `employee.separationInitiated`, `payroll.run.completed`), then GPSSA handlers react idempotently.
- [ ] Given the workflow engine, then GPSSA maker-checker/escalation paths are reusable and configurable.
- [ ] Given an unconfigured country/nationality, when GPSSA runs, then it fails safe with a clear error rather than wrong numbers.
- [ ] Given all GPSSA actions, then a standardised audit envelope is recorded.

## Implementation Tasks From Backlog

- [ ] Backend: GPSSA event handlers with idempotency keys
- [ ] Backend: rule-engine namespace `gpssa.*` with effective-dated parameter store
- [ ] Backend: workflow templates for GPSSA approvals
- [ ] Backend: fail-safe guard for missing config
- [ ] Rules/Config: parameterise applicability, account-salary, rates, caps, deadlines per country/nationality
- [ ] Tests: integration tests for idempotency and fail-safe

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
