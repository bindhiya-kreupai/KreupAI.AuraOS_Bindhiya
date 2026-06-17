# Gap Analysis: EPIC-12-S13 — Overtime fraud & abuse controls

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-12-chapter-12-overtime-compliance.md](./EPIC-12-chapter-12-overtime-compliance.md)
> Parent epic: EPIC-12: Chapter 12 – Overtime Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5

**Description**
Detect OT fraud patterns: OT without supporting punches (ghost hours), self-approved OT, repeated post-facto OT, duplicate OT for the same hours, statistical outliers (employees/managers with abnormal OT), and approval after the fact, raising cases to the exception register.

**Covers:** 12.17
**Acceptance criteria count:** 5 · **Task count:** 6

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

- [ ] Given OT pay with no/insufficient attendance support, when detected, then it is flagged as potential ghost OT and withheld from payroll.
- [ ] Given an approver approving their own OT, when detected, then it is blocked/flagged (maker ≠ approver).
- [ ] Given duplicate OT for the same hours/date, when detected, then it is flagged and deduplicated.
- [ ] Given outlier OT (e.g., top-percentile hours or repeated post-facto), when detected, then it is raised as a fraud-risk case.
- [ ] Given any flag, when raised, then it is logged to the exception register and audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: OT fraud red-flag engine (ghost/self-approval/duplicate/outlier)
- [ ] Backend: withhold-from-payroll on critical flags
- [ ] Frontend: fraud-flag review queue
- [ ] Rules/Config: configurable fraud thresholds/rules
- [ ] Alerts/Workflow: fraud-case alerts to auditor/compliance
- [ ] Tests: integration tests for ghost-OT and self-approval detection

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
