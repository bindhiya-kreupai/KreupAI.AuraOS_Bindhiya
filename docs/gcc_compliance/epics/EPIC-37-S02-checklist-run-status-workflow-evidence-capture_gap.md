# Gap Analysis: EPIC-37-S02 — Checklist run, status workflow & evidence capture

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-37-compliance-checklist-red-flag-engine.md](./EPIC-37-compliance-checklist-red-flag-engine.md)
> Parent epic: EPIC-37: Compliance Checklist & Red-Flag Engine
> Module: audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8

**Description**
Provide checklist execution: instantiate a run from a template for a period/entity/employee, capture per-item status (compliant / non-compliant / N/A / pending) with mandatory evidence attachments, reviewer and reason, route through a maker-checker workflow, and compute a weighted run score. This is the shared runtime that every domain checklist (employee file, recruitment, onboarding, etc.) uses.

**Covers:** A3.4, A3.5, A3.6, A6.4, A6.5, A6.6
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/api/attendance/approval-workflow/route.ts
- apps/web/src/app/dashboard/admin/workflows/approvals/page.tsx
- apps/web/src/app/dashboard/attendance/approval-workflow/page.tsx
- apps/web/src/app/dashboard/finance/budget/approval-workflow/page.tsx
- apps/web/src/app/dashboard/policy-mgmt/approval-workflow/page.tsx
- apps/web/src/app/dashboard/workflow-engine/approval-chains/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify workflow approvals and audit events; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a template, when a run is instantiated, then it targets a period/entity/scope and lists all in-scope items.
- [ ] Given an item, when assessed, then status, reviewer, reason and required evidence are captured and mandatory items cannot be left blank.
- [ ] Given a completed run, when scored, then a weighted compliance score is computed and non-compliant items are listed.
- [ ] Given the workflow, when submitted, then a separate checker reviews before sign-off (preparer ≠ approver).
- [ ] Given any run action, when performed, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `checklist_run`, `checklist_run_item`, `evidence_attachment` schemas + scoring service
- [ ] Backend: maker-checker run workflow
- [ ] Frontend: checklist run screen with item status, evidence upload and score
- [ ] Alerts/Workflow: run-due and pending-item reminders
- [ ] Tests: integration tests for mandatory-evidence and maker-checker gating

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
