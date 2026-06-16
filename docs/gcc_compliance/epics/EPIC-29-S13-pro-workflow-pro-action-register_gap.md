# Gap Analysis: EPIC-29-S13 — PRO Workflow & PRO Action Register

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**User story:** PRO / Immigration Officer, **I want** a PRO task workflow with ownership, SLAs and a PRO Action Register, **so that** every government-relations step in an exit is assigned, tracked to deadline and evidenced.

**Description**
Provides the PRO workflow engine for exits: the scenario/country task template generates discrete PRO tasks (e.g. submit cancellation, collect cancellation paper, file transfer, book ticket, file absconding report), each with owner, SLA, dependency order and required evidence. A configurable PRO Action Register lists all tasks across cases with status, ageing, owner and authority reference, driving the worklist, dashboard and monthly pack.

**Covers:** 29.17, 29.27
**Acceptance criteria count:** 5 · **Task count:** 5

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

- confirm/add tenant-scoped schema or config; add tests; verify workflow approvals and audit events; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given an exit case, when instantiated, then PRO tasks are generated from the country template with owner, SLA, dependency order and evidence requirement.
- [ ] Given a task, when worked, then status, completion date, authority reference and evidence are captured; dependent tasks unlock in order.
- [ ] Given an overdue PRO task, then it is flagged and escalated to the PRO supervisor / HR Manager.
- [ ] Given the PRO Action Register, then it lists tasks across all cases with filters (status, country, owner, ageing) and exports.
- [ ] Given any PRO task action, then it is audited; RBAC restricts task completion to PRO roles.

## Implementation Tasks From Backlog

- [ ] Backend: `immig_pro_task` + `immig_pro_action_register` entities (caseId, taskCode, owner, sla, dependsOn[], status, authorityRef, evidenceRef)
- [ ] Backend: dependency-ordered task engine + SLA/escalation
- [ ] Frontend: PRO worklist + PRO Action Register grid with filters/export
- [ ] Alerts/Workflow: SLA-breach escalation
- [ ] Tests: integration tests for dependency ordering and SLA escalation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
