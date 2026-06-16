# Gap Analysis: EPIC-19-S18 — Attendance audit checklist & risk matrix

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5

**Description**
Provide a digital audit checklist (policy ack, schedule coverage, regularization caps, missing-punch closure, LOP accuracy) and a configurable risk matrix/register scoring likelihood × impact for attendance risks (fraud, absconding, privacy, payroll error) with mitigation owners.

**Covers:** 19.21, 19.23
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/api/attendance-time-capture-route.test.ts
- apps/web/src/**tests**/api/attendance-timesheets-route.test.ts
- apps/web/src/**tests**/e2e/attendance/overtime.e2e.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the audit checklist, when run, then each control yields pass/fail with evidence links and is timestamped.
- [ ] Given the risk matrix, when configured, then risks score likelihood × impact with rating bands (low/med/high/critical).
- [ ] Given an open risk, when logged, then owner, mitigation and due date are tracked to closure.
- [ ] Given checklist/risk records, when saved, then they are exportable and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `audit_checklist_item`, `risk_register_entry` schemas
- [ ] Backend: checklist run + risk-scoring service
- [ ] Frontend: audit checklist + risk-matrix/register screens
- [ ] Rules/Config: default attendance control set and risk scoring bands
- [ ] Tests: unit tests for scoring and checklist evaluation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
