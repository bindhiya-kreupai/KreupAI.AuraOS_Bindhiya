# Gap Analysis: EPIC-07-S14 — Immigration workflow design & PRO orchestration

> Source epic: [EPIC-07-chapter-7-immigration-work-authorization-c.md](./EPIC-07-chapter-7-immigration-work-authorization-c.md)
> Parent epic: EPIC-07: Chapter 7 – Immigration & Work Authorization Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 8
**User story:** System Administrator, **I want** to configure immigration workflows and PRO task orchestration, **so that** issuance, renewal, transfer and cancellation processes are standardised, assignable and auditable.

**Description**
Provide a no-code workflow designer for immigration processes (new permit, renewal, transfer, dependent, cancellation) with PRO task assignment, authority-step checklists, document-upload gates, fees and approvals. PRO workload is queued and balanced, with SLAs and escalation.

**Covers:** 7.16
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/api/attendance/approval-workflow/route.ts
- apps/web/src/app/dashboard/admin/workflows/approvals/page.tsx
- apps/web/src/app/dashboard/attendance/approval-workflow/page.tsx
- apps/web/src/app/dashboard/finance/budget/approval-workflow/page.tsx
- apps/web/src/app/dashboard/policy-mgmt/approval-workflow/page.tsx
- apps/web/src/app/dashboard/workflow-engine/approval-chains/page.tsx
- services/workflow-service/src/services/approvalService.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given the designer, when an admin configures a process, then matching cases follow the configured steps and gates.
- [ ] Given PRO orchestration, when tasks are created, then they are assigned/queued by entity/country with SLAs.
- [ ] Given a document-upload or approval gate, when unmet, then the step cannot complete.
- [ ] Given a config change, then in-flight cases keep their bound workflow version.
- [ ] Given audit, then workflow execution and PRO actions are logged.

## Implementation Tasks From Backlog

- [ ] Backend: `immigration_workflow_def` (versioned) + PRO task queue model.
- [ ] Backend: workflow execution + SLA/escalation service.
- [ ] Frontend: workflow designer + PRO task console.
- [ ] Rules/Config: default GCC immigration workflows.
- [ ] Alerts/Workflow: SLA + escalation notifications.
- [ ] Tests: workflow execution + queue/SLA tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
