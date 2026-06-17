# Gap Analysis: EPIC-19-S16 — Attendance fraud controls

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** automated fraud detection, **so that** buddy-punching, ghost attendance and location spoofing are prevented and flagged.

**Description**
Detect buddy/proxy punches (biometric liveness, selfie face-match), geofence breaches, GPS-spoof/mock-location signals, impossible-travel patterns, duplicate device pushes and unusual punch patterns, raising a fraud register with risk scoring.

**Covers:** 19.19
**Acceptance criteria count:** 4 · **Task count:** 6

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

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a mobile punch with mock-location/spoof signal, when detected, then it is blocked or flagged high-risk.
- [ ] Given two punches for the same person at impossible distance/time, when detected, then an impossible-travel alert is raised.
- [ ] Given selfie/biometric mismatch, when scored below threshold, then the punch is rejected/flagged.
- [ ] Given any fraud flag, when raised, then it enters the fraud register with risk score and is audit-logged for investigation.

## Implementation Tasks From Backlog

- [ ] Backend: fraud-rule engine + `attendance_fraud_flag` schema (signal, risk_score)
- [ ] Backend: face-match/liveness integration, mock-location & impossible-travel detectors
- [ ] Frontend: fraud register/investigation screen
- [ ] Rules/Config: thresholds per signal; auto-block vs flag per country
- [ ] Alerts/Workflow: high-risk alert to Compliance Officer
- [ ] Tests: unit/integration tests for each fraud signal

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
