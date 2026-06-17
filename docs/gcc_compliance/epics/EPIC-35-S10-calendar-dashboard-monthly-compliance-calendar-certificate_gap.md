# Gap Analysis: EPIC-35-S10 — Calendar dashboard & monthly compliance-calendar certificate

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-35-compliance-calendar-scheduling-automation.md](./EPIC-35-compliance-calendar-scheduling-automation.md)
> Parent epic: EPIC-35: Compliance Calendar & Scheduling Automation
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 3

**Description**
Build the compliance calendar dashboard (on-time %, overdue tasks, upcoming deadlines, by category/entity/country with drill-down and RBAC) and the monthly compliance-calendar certificate attesting all due tasks were completed or formally deferred, with the chapter key-takeaways as reference.

**Covers:** A1.23, A1.24, A1.27
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/e2e/leave/leave-calendar.e2e.test.ts
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/calendar/gregorian/page.tsx
- apps/web/src/app/(modules)/leave/calendar/hijri/page.tsx
- apps/web/src/app/(modules)/leave/calendar/holidays/page.tsx
- apps/web/src/app/(modules)/leave/calendar/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; verify query-backed dashboard/reporting; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the dashboard, when loaded, then on-time %, overdue and upcoming tasks show per category/entity/country with drill-down.
- [ ] Given RBAC, when a user views, then only in-scope entities are visible.
- [ ] Given the monthly certificate, when generated, then it attests completion/deferral of all due tasks and is blocked while critical tasks are overdue.
- [ ] Given the certificate, when exported, then it produces a PDF and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: calendar-KPI aggregation + certificate generator with gating
- [ ] Frontend: calendar dashboard + certificate view with e-sign/export and key-takeaways reference
- [ ] Rules/Config: certificate attestation fields
- [ ] Tests: integration tests for KPI computation, RBAC and certificate gating

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
