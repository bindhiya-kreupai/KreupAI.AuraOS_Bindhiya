# Gap Analysis: EPIC-21-S10 — Holiday & payroll integration

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-21-chapter-21-public-holidays-and-religious-h.md](./EPIC-21-chapter-21-public-holidays-and-religious-h.md)
> Parent epic: EPIC-21: Chapter 21 – Public Holidays and Religious Holidays Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** holiday pay/premium inputs delivered to payroll, **so that** holiday work and day-in-lieu are paid correctly with no manual entry.

**Description**
Aggregate holiday-work premium, holiday-OT and any day-in-lieu monetization into the payroll input feed with maker-checker lock, ensuring holiday treatment is finalized before payroll lock for the period.

**Covers:** 21.14
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/time-attendance/BiometricIntegration.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/app/(modules)/attendance/biometric-integration/page.tsx
- apps/web/src/app/dashboard/attendance/biometric-integration/page.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given period close, when holiday work is finalized, then premiums/OT/lieu amounts are aggregated per employee.
- [ ] Given unfinalized holiday-work approvals for the period, when payroll attempts lock, then it is blocked with a reason.
- [ ] Given maker-checker, when approved (preparer ≠ approver), then the holiday input set is locked and published.
- [ ] Given a post-lock change, when made, then it routes to off-cycle/adjustment and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `holiday_payroll_input` aggregation + lock; event `holiday.payroll.locked`
- [ ] Backend: pre-lock completeness check
- [ ] Frontend: holiday-input review + maker-checker screen
- [ ] Rules/Config: premium/lieu monetization basis per country
- [ ] Alerts/Workflow: lock-block alerts
- [ ] Tests: integration tests for aggregation, lock-block, maker-checker

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
