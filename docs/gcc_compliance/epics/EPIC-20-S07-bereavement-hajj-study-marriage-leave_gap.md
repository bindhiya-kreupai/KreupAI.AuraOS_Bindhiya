# Gap Analysis: EPIC-20-S07 — Bereavement, Hajj, study & marriage leave

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 8

**Description**
Implement the special-leave family using the catalogue: bereavement/compassionate (e.g., UAE 5 days spouse, 3 days specified relatives), Hajj/pilgrimage (e.g., once in service, up to 10–15 unpaid days where applicable, religion/eligibility-gated), study/examination leave, and marriage leave, each with eligibility, once-in-service or frequency caps, documents and approval.

**Covers:** 20.9, 20.10, 20.11, 20.12
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

- [ ] Given bereavement leave, when requested, then day count varies by relationship per country (e.g., 5 days spouse / 3 days parent).
- [ ] Given Hajj leave, when requested, then once-in-service and eligibility (e.g., not previously taken) are enforced and paid/unpaid status applies per country.
- [ ] Given study/exam or marriage leave, when configured, then frequency caps, service eligibility and documents are enforced.
- [ ] Given any special leave, when approved, then usage caps update and the request is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: special-leave service with relationship/frequency/once-in-service caps
- [ ] Backend: eligibility + document-requirement enforcement
- [ ] Frontend: special-leave request screens (relationship picker, document upload)
- [ ] Rules/Config: per-country bereavement-by-relationship, Hajj, study, marriage rules
- [ ] Alerts/Workflow: approval routing
- [ ] Tests: unit tests for relationship/frequency/once-in-service caps

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
