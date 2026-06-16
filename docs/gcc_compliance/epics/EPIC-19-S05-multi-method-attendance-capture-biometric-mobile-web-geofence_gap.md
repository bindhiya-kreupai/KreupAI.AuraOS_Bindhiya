# Gap Analysis: EPIC-19-S05 — Multi-method attendance capture (biometric, mobile, web, geofence)

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 13

**Description**
Build a unified punch ingestion pipeline that normalizes events from biometric/access-control devices, the mobile app (with GPS + selfie/liveness option), the web portal and geofence auto-punch, storing device ID, source, location and timestamp. Includes device registration, offline buffering and idempotent de-duplication.

**Covers:** 19.8
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/components/time-attendance/BiometricIntegration.tsx
- apps/web/src/**tests**/api/attendance-time-capture-route.test.ts
- apps/web/src/**tests**/services/attendance-time-capture-dashboard.service.test.ts
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/app/api/attendance/time-capture/route.ts
- apps/web/src/app/dashboard/attendance/time-capture/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/app/(modules)/attendance/biometric-integration/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given any capture method, when a punch posts, then it is normalized to a common event with source, device_id, geo-coordinates and server timestamp.
- [ ] Given a geofence, when an employee enters/exits the configured site radius, then an auto IN/OUT punch is created and tagged.
- [ ] Given a mobile punch outside the allowed geofence, when submitted, then it is flagged for review, not auto-approved.
- [ ] Given a duplicate device push within N seconds, when received, then it is de-duplicated idempotently.
- [ ] Given an offline mobile device, when reconnected, then buffered punches sync with original timestamps.
- [ ] Given any punch, when stored, then capture metadata is retained for audit.

## Implementation Tasks From Backlog

- [ ] Backend: `punch_event` schema (employee_id, source, device_id, lat, lng, ts, raw_payload) + `device_registry`
- [ ] Backend: ingestion API + normalization/de-dup service; event-bus publish `attendance.punch.recorded`
- [ ] Backend: geofence evaluation service (site polygons/radius)
- [ ] Frontend: mobile punch (GPS + optional selfie) and web punch components; device registration admin screen
- [ ] Rules/Config: per-site geofence radius, allowed capture methods per location
- [ ] Tests: integration tests for each source, de-dup, offline sync, geofence in/out

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
