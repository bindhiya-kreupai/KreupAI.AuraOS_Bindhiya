# Gap Analysis: EPIC-20-S16 — Notice-period & long-term leave / return-to-work

> **✅ SHIPPED 2026-06-17** — Themes J + K closure. Structural extensions: job architecture API surface (reuses existing JobFamily/JobProfile models), SalaryGradeBand, DelegationOfAuthority with resolveLevel helper, PayrollCalendarControl + PayrollVarianceEntry, FatigueRule with breachesRule helper, OvertimeFraudFlag (6 signals), EosSioFundingLink, ReturnToWorkPlan, HolidayCalendarChangeRequest (maker-checker), RedundancyBatch, SeparationRetentionPolicy, DocumentPhysicalLocation, AuditFindingRiskLink. Plus service-only closures: unified BH/OM/KW wage-file generator (EPIC-11-S05), grievance mediation states (EPIC-25-S04), classification RBAC helper canReadRecord (EPIC-30-S07), country rollup helper rollupByCountry (EPIC-31-S04), executive RBAC scopes canViewExecutiveDomain (EPIC-31-S14). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Should · **Estimate:** 5

**Description**
Restrict/configure leave during notice period (e.g., block or require approval, force encashment of balance rather than leave), and manage long-term leave (maternity, extended sick/unpaid) with return-to-work scheduling, reminders and reinstatement of benefits/attendance.

**Covers:** 20.21, 20.22
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
- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given an employee on notice period, when leave is requested, then policy rules apply (block / restrict / encash balance) per country.
- [ ] Given long-term leave, when started, then a return-to-work date is tracked with pre-return reminders.
- [ ] Given a return-to-work, when reached, then attendance/benefits resume and any extension routes for approval.
- [ ] Given these actions, when applied, then they are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: notice-period leave rule + `return_to_work` schema
- [ ] Backend: return-to-work scheduler + reinstatement service
- [ ] Frontend: notice-period leave screen + return-to-work tracker
- [ ] Rules/Config: per-country notice-period leave rule
- [ ] Alerts/Workflow: pre-return reminders + extension approval
- [ ] Tests: integration tests for notice restriction and return-to-work

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
