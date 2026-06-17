# Gap Analysis: EPIC-21-S12 — Holiday communication & calendar change management

> **✅ SHIPPED 2026-06-17** — Themes J + K closure. Structural extensions: job architecture API surface (reuses existing JobFamily/JobProfile models), SalaryGradeBand, DelegationOfAuthority with resolveLevel helper, PayrollCalendarControl + PayrollVarianceEntry, FatigueRule with breachesRule helper, OvertimeFraudFlag (6 signals), EosSioFundingLink, ReturnToWorkPlan, HolidayCalendarChangeRequest (maker-checker), RedundancyBatch, SeparationRetentionPolicy, DocumentPhysicalLocation, AuditFindingRiskLink. Plus service-only closures: unified BH/OM/KW wage-file generator (EPIC-11-S05), grievance mediation states (EPIC-25-S04), classification RBAC helper canReadRecord (EPIC-30-S07), country rollup helper rollupByCountry (EPIC-31-S04), executive RBAC scopes canViewExecutiveDomain (EPIC-31-S14). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-21-chapter-21-public-holidays-and-religious-h.md](./EPIC-21-chapter-21-public-holidays-and-religious-h.md)
> Parent epic: EPIC-21: Chapter 21 – Public Holidays and Religious Holidays Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5

**Description**
Implement holiday announcements/notifications (upcoming holidays, confirmed Eid dates) to employees, and a change-management workflow for calendar edits (especially Hijri date confirmations and government re-announcements) with approval, impact assessment on attendance/leave/payroll, and versioning.

**Covers:** 21.16, 21.17
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/api/attendance-time-capture-route.test.ts
- apps/web/src/**tests**/api/attendance-timesheets-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a published/confirmed holiday, when finalized, then employees receive a communication via app/email.
- [ ] Given a calendar change, when proposed, then it routes through change-management with approval and an impact summary.
- [ ] Given an approved change, when applied, then attendance/leave/payroll consumers re-evaluate and a new version is recorded.
- [ ] Given any change/communication, when done, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: change-management workflow + impact-assessment service; notification service
- [ ] Backend: re-propagation on approved change
- [ ] Frontend: announcement composer + change-request/approval screen
- [ ] Rules/Config: communication templates and recipient scoping
- [ ] Alerts/Workflow: change approval + employee notifications
- [ ] Tests: e2e for change→approve→propagate; notification delivery

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
