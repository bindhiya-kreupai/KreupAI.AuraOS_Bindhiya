# Gap Analysis: EPIC-13-S13 — HRMS GOSI Automation Design (Events, Rule Engine, Workflow)

> Source epic: [EPIC-13-chapter-13-gosi-compliance.md](./EPIC-13-chapter-13-gosi-compliance.md)
> Parent epic: EPIC-13: Chapter 13 – GOSI Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**User story:** System Administrator, **I want** the GOSI module wired into the event bus, country rule engine, and workflow/approval engine, **so that** GOSI runs straight-through with minimal manual intervention and is fully configurable per country/nationality.

**Description**
Defines the end-to-end automation: hire/salary-change/exit events trigger GOSI actions; the country rule engine holds all GOSI parameters (branches, wage rules, rates, caps, deadlines) configurable per country and nationality with effective-dating; the workflow engine drives maker-checker and approvals; and notifications/audit are standardised. This is the integration backbone the other stories depend on, made explicit and testable.

**Covers:** 13.17
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

- [ ] Given the rule engine, when a GOSI parameter changes (rate, cap, included component, deadline), then no deployment is needed and changes are effective-dated.
- [ ] Given domain events (`employee.hired`, `employee.salaryChanged`, `employee.separationInitiated`, `payroll.run.completed`), when published, then GOSI handlers react idempotently.
- [ ] Given the workflow engine, when GOSI approvals are configured, then maker-checker and escalation paths are reusable and configurable.
- [ ] Given a country/nationality not yet configured, when GOSI runs, then it fails safe with a clear "missing configuration" error rather than wrong numbers.
- [ ] Given all GOSI actions, then a standardised audit envelope (actor, entity, before/after, correlationId) is recorded.

## Implementation Tasks From Backlog

- [ ] Backend: GOSI event handlers + idempotency keys on the event bus
- [ ] Backend: rule-engine namespace `gosi.*` with effective-dated parameter store
- [ ] Backend: workflow templates for GOSI maker-checker/approvals
- [ ] Backend: fail-safe guard for missing country/nationality config
- [ ] Rules/Config: parameterise branches, wage rules, rates, caps, deadlines per country/nationality
- [ ] Tests: integration tests for event idempotency and fail-safe behaviour

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
