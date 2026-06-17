# Gap Analysis: EPIC-34-S21 — Approval workflow configuration

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**User story:** System Administrator, **I want** a configurable approval-workflow engine, **so that** every compliance process routes through the correct, auditable approvals.

**Description**
Configure approval workflows per process and entity: multi-step routing, maker-checker (preparer ≠ approver), delegation-of-authority limits, parallel/sequential steps, conditional routing by amount/country, escalation and SLA — consumed by all domain modules.

**Covers:** 34.23
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/(modules)/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/(modules)/workflow-engine/escalation-rules/page.tsx
- apps/web/src/app/api/attendance/approval-workflow/route.ts
- apps/web/src/app/dashboard/admin/workflows/approvals/page.tsx
- apps/web/src/app/dashboard/admin/workflows/routing-rules/page.tsx
- apps/web/src/app/dashboard/attendance/approval-workflow/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- add/wire service logic; add tests; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given a process, when a workflow is configured, then steps, approvers, conditions and SLAs are defined per entity.
- [ ] Given maker-checker, when enforced, then the preparer cannot approve their own transaction.
- [ ] Given DoA limits, when configured, then routing escalates beyond an approver's authority threshold.
- [ ] Given any workflow change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `workflow_definition`, `workflow_step`, `doa_limit` schemas + routing engine
- [ ] Backend: maker-checker and conditional-routing logic
- [ ] Frontend: workflow builder UI
- [ ] Rules/Config: per-process/entity routing and DoA limits
- [ ] Alerts/Workflow: SLA escalation configuration
- [ ] Tests: integration tests for maker-checker and DoA escalation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
