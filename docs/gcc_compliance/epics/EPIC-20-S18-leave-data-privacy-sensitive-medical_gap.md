# Gap Analysis: EPIC-20-S18 — Leave data privacy (sensitive medical)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** privacy controls over sick/maternity medical data, **so that** sensitive leave information is protected per GCC data-protection laws.

**Description**
Implement consent, purpose limitation, RBAC-scoped access (e.g., line manager sees dates not diagnosis), encryption of medical certificates, and retention/erasure for sensitive leave data per UAE/KSA PDPL.

**Covers:** 20.24
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- packages/@aura/database/src/seeds/25-attendance-time.seed.ts
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/api/attendance-time-capture-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a medical certificate, when stored, then it is encrypted and access is RBAC-restricted (managers see status, not medical detail).
- [ ] Given sensitive leave data, when accessed, then access is logged.
- [ ] Given the retention schedule, when reached, then medical records are purged/anonymized.
- [ ] Given a valid erasure request, when processed, then relevant sensitive leave data is handled per policy.

## Implementation Tasks From Backlog

- [ ] Backend: field-level encryption + access-log for sensitive leave data
- [ ] Backend: retention/erasure jobs
- [ ] Frontend: privacy-scoped leave views + admin console
- [ ] Rules/Config: per-country retention and access scopes
- [ ] Tests: unit/integration for RBAC masking, retention purge

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
