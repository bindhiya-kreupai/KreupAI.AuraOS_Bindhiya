# Gap Analysis: EPIC-12-S17 — OT request form, audit checklist, exception register & takeaways

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-12-chapter-12-overtime-compliance.md](./EPIC-12-chapter-12-overtime-compliance.md)
> Parent epic: EPIC-12: Chapter 12 – Overtime Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 3

**Description**
Build a configurable digital Overtime Request Form (mirroring the handbook sample), a configurable OT audit checklist (pre-approval present, hours match attendance, rates correct, within caps/budget, no self-approval) and an OT exception register (post-facto, fraud flags, budget/fatigue breaches), with export and the key-takeaways reference.

**Covers:** 12.19, 12.22, 12.23, 12.24
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-exceptions-route.test.ts
- apps/web/src/**tests**/services/attendance-exceptions-dashboard.service.test.ts
- apps/web/src/app/api/attendance/exceptions/route.ts
- apps/web/src/app/dashboard/attendance/attendance-exceptions/page.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify workflow approvals and audit events; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the OT request form, when submitted, then required fields (employee, date, type, estimated hours, reason) are validated and it feeds the approval workflow.
- [ ] Given the audit checklist, when run for a period, then it flags red-flags (missing pre-approval, hours-vs-attendance mismatch, wrong rate, cap/budget breach, self-approval).
- [ ] Given OT exceptions, when raised, then they are recorded in the exception register with type, owner, status and resolution.
- [ ] Given export, when requested, then form/checklist/register export to PDF/Excel and are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: OT request form schema + audit-rule engine + `ot_exception_register`
- [ ] Frontend: configurable OT request form, audit checklist runner and exception register
- [ ] Rules/Config: configurable red-flag rules
- [ ] Alerts/Workflow: unresolved-exception alerts
- [ ] Tests: integration tests for red-flag detection and register lifecycle

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
