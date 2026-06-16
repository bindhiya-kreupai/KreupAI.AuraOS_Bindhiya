# Gap Analysis: EPIC-32-S04 — Workforce policy set (Leave, Attendance, Remote Work, Payroll)

> Source epic: [EPIC-32-chapter-32-hr-policies.md](./EPIC-32-chapter-32-hr-policies.md)
> Parent epic: EPIC-32: Chapter 32 – HR Policies
> Module: Policies
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 5

**Description**
Configures Leave, Attendance, Remote Work and Payroll policies as engine documents, each cross-linking the corresponding AuraOS functional configuration (leave types, attendance rules, payroll calendar) so the written policy and the system behaviour reference one source.

**Covers:** 32.8, 32.9, 32.10, 32.15
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/api/attendance-work-from-home-route.test.ts
- apps/web/src/**tests**/e2e/attendance/shift-management.e2e.test.ts
- apps/web/src/**tests**/services/attendance-roster-dashboard.service.test.ts
- apps/web/src/**tests**/services/attendance-shift-swap-dashboard.service.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given the Leave policy, then it references the leave-type matrix (EPIC-20) and country statutory minimums.
- [ ] Given the Attendance policy, then it references work schedules, late/missing-punch and Ramadan rules (EPIC-19).
- [ ] Given the Remote Work policy, then eligibility, hours, equipment and data-security clauses are configurable.
- [ ] Given the Payroll policy, then pay calendar, deductions, and WPS/salary-delay statements (EPIC-10/11) are referenced.
- [ ] Given any of these, then publishing triggers an acknowledgement campaign for the in-scope population.

## Implementation Tasks From Backlog

- [ ] Backend: policy-to-module reference links (leave, attendance, payroll config IDs).
- [ ] Backend: template content for the four policies.
- [ ] Frontend: cross-reference panel showing linked module config.
- [ ] Rules/Config: country statutory-minimum references per policy.
- [ ] Alerts/Workflow: publish → acknowledgement campaign trigger.
- [ ] Tests: integration (cross-reference resolution, campaign trigger).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
