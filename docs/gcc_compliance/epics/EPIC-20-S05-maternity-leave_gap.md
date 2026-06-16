# Gap Analysis: EPIC-20-S05 — Maternity leave

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5

**Description**
Implement maternity leave with country entitlement and pay (e.g., UAE 60 days: 45 full + 15 half pay; KSA up to 12 weeks), eligibility, expected-date scheduling, nursing-hour entitlements where applicable, and return-to-work linkage.

**Covers:** 20.7
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

- [ ] Given a country, when maternity leave resolves, then duration and pay tiers apply per law (e.g., UAE 45 full + 15 half).
- [ ] Given an expected delivery date, when scheduled, then the leave window and any pre/post split are computed.
- [ ] Given nursing-hour entitlement, when applicable, then it is granted post-return per country rule.
- [ ] Given maternity leave, when approved, then it links to return-to-work tracking and is privacy-protected, audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: maternity-leave service with pay-tier + scheduling logic
- [ ] Backend: nursing-hour entitlement post-return
- [ ] Frontend: maternity request + expected-date screen
- [ ] Rules/Config: per-country maternity duration, pay tiers, nursing hours
- [ ] Alerts/Workflow: return-to-work trigger handover
- [ ] Tests: unit tests for duration/pay tiers per country

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
