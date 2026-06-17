# Gap Analysis: EPIC-33-S07 — Leave & attendance forms group (leave request, attendance regularization, comp-off)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-33-chapter-33-hr-forms-and-templates.md](./EPIC-33-chapter-33-hr-forms-and-templates.md)
> Parent epic: EPIC-33: Chapter 33 – HR Forms and Templates
> Module: Forms
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 5

**Description**
Delivers the leave/attendance form group feeding EPIC-19/20: Leave Request (balance-aware, leave-type rules), Attendance Regularization (missing punch/late correction with evidence), and Comp-Off Request (earned vs availed). Forms validate against live balances and country leave rules.

**Covers:** 33.18, 33.19, 33.20, 33.21
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/attendance/regularization-request/route.ts
- apps/web/src/app/dashboard/attendance/regularization-request/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-regularization-route.test.ts
- apps/web/src/**tests**/e2e/attendance/regularization.e2e.test.ts
- apps/web/src/**tests**/services/attendance-regularization-dashboard.service.test.ts
- apps/web/src/app/api/attendance/regularization/route.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given the Leave Request form, then available balance and leave-type eligibility (e.g. statutory annual/sick) are validated and overlapping leave is flagged.
- [ ] Given the Attendance Regularization form, then it references the specific date/punch and requires reason/evidence, routing to the manager.
- [ ] Given the Comp-Off form, then comp-off can only be requested against earned/approved holiday or rest-day work.
- [ ] Given approval, then approved leave/regularization/comp-off updates the attendance/leave ledgers and is audited.
- [ ] Given country rules, then statutory leave minimums and Ramadan/holiday rules are respected.

## Implementation Tasks From Backlog

- [ ] Backend: form definitions + write-back to leave/attendance ledgers; balance validation service.
- [ ] Frontend: leave request, attendance regularization, comp-off forms.
- [ ] Rules/Config: leave-type rules and balances per country.
- [ ] Alerts/Workflow: manager approval routing; overlap warnings.
- [ ] Tests: integration (balance validation, ledger write-back).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
