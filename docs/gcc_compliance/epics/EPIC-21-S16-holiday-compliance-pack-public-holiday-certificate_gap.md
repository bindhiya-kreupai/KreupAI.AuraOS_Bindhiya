# Gap Analysis: EPIC-21-S16 — Holiday compliance pack & public-holiday certificate

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-21-chapter-21-public-holidays-and-religious-h.md](./EPIC-21-chapter-21-public-holidays-and-religious-h.md)
> Parent epic: EPIC-21: Chapter 21 – Public Holidays and Religious Holidays Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** a monthly/event-based holiday compliance pack and signed certificate, **so that** management certification and inspection evidence are generated automatically.

**Description**
Assemble a monthly/event-based pack (holiday calendar status, holiday-work approvals, premium/pay summary, registers, open audit actions) and a configurable Public Holiday Compliance Certificate with maker-checker sign-off and export, triggerable per Eid event or monthly.

**Covers:** 21.23, 21.24
**Acceptance criteria count:** 4 · **Task count:** 6

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

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given month-end or a holiday event, when the pack runs, then it compiles calendar status, approvals, pay summary and registers per entity/country.
- [ ] Given the certificate, when generated, then it reflects pack figures and requires sign-off (preparer ≠ approver).
- [ ] Given sign-off, when completed, then the certificate is locked, versioned and exportable (PDF).
- [ ] Given generation, when done, then it is audit-logged and archived to the document store.

## Implementation Tasks From Backlog

- [ ] Backend: pack assembler + `holiday_certificate` schema; event-based trigger
- [ ] Backend: PDF export + document-store archival
- [ ] Frontend: pack viewer + certificate sign-off screen
- [ ] Rules/Config: certificate template per country/entity
- [ ] Alerts/Workflow: month-end/event generation + sign-off reminder
- [ ] Tests: e2e for pack assembly, sign-off lock, export

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
