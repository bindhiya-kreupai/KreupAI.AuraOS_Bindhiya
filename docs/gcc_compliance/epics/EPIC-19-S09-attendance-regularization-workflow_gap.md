# Gap Analysis: EPIC-19-S09 — Attendance regularization workflow

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5

**Description**
Provide a regularization workflow for missing punches, late/early events and absences with reason codes, evidence attachment, monthly caps and maker-checker (employee ≠ approver), updating attendance on approval.

**Covers:** 19.12
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/app/api/attendance/approval-workflow/route.ts
- apps/web/src/app/dashboard/attendance/approval-workflow/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-regularization-route.test.ts
- apps/web/src/**tests**/e2e/attendance/regularization.e2e.test.ts
- apps/web/src/**tests**/services/attendance-regularization-dashboard.service.test.ts
- apps/web/src/app/api/attendance/regularization-request/route.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given an exception, when an employee files a regularization with reason code, then it routes to the line manager for approval.
- [ ] Given the monthly regularization cap is reached, when another is filed, then it is blocked or escalated to HR per policy.
- [ ] Given approval, when granted, then the attendance record is updated and the exception cleared, audit-logged.
- [ ] Given employee = approver, when attempted, then the system blocks self-approval (maker-checker).

## Implementation Tasks From Backlog

- [ ] Backend: `regularization_request` schema (reason_code, evidence, status) + monthly-cap counter
- [ ] Backend: workflow-engine integration + apply-on-approval service
- [ ] Frontend: regularization request + manager approval screens
- [ ] Rules/Config: reason codes, monthly cap per country/grade
- [ ] Alerts/Workflow: approval routing + maker-checker enforcement
- [ ] Tests: e2e for request→approve→record-update; cap and self-approval blocks

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
