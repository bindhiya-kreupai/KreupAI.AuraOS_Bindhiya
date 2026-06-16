# Gap Analysis: EPIC-12-S16 — HRMS overtime automation design

> Source epic: [EPIC-12-chapter-12-overtime-compliance.md](./EPIC-12-chapter-12-overtime-compliance.md)
> Parent epic: EPIC-12: Chapter 12 – Overtime Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 5
**User story:** System Administrator, **I want** OT automation across the cycle, **so that** detection, calculation, reconciliation and payroll feed run with exception-only intervention.

**Description**
Implement the OT automation design: scheduled attendance ingest, auto OT detection/classification/calculation, auto request-matching and fraud screening, exception-only manual review, and automated payroll feed at cut-off, all event-driven and configurable per entity.

**Covers:** 12.21
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/e2e/attendance/overtime.e2e.test.ts
- apps/web/src/**tests**/services/attendance-overtime-dashboard.service.test.ts
- apps/web/src/app/(modules)/attendance/overtime-calculation/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/ot-rules/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given attendance posting, when it completes, then OT auto-detects, classifies, calculates and matches to approvals.
- [ ] Given clean OT, when no exceptions/flags exist, then it flows to the payroll feed automatically; otherwise it halts on exceptions.
- [ ] Given the payroll cut-off, when reached, then finalized OT is auto-pushed to payroll inputs.
- [ ] Given automation config, when changed, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: OT orchestrator (ingest→detect→calc→match→screen→feed) on event bus
- [ ] Backend: exception-only halt logic
- [ ] Frontend: OT automation configuration console
- [ ] Alerts/Workflow: stage notifications and exception halts
- [ ] Tests: e2e test of automated OT cycle with and without exceptions

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
