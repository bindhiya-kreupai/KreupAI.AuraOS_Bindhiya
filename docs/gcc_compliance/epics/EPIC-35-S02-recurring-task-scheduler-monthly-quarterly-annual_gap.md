# Gap Analysis: EPIC-35-S02 — Recurring task scheduler (monthly/quarterly/annual)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-35-compliance-calendar-scheduling-automation.md](./EPIC-35-compliance-calendar-scheduling-automation.md)
> Parent epic: EPIC-35: Compliance Calendar & Scheduling Automation
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** a recurring statutory-task scheduler, **so that** monthly, quarterly and annual obligations auto-generate as owned, dated tasks.

**Description**
Build the core scheduler that defines recurrence rules (monthly/quarterly/annual, with country-specific due-date logic and holiday shifting) and auto-generates tasks per entity with owner, due date, category, dependencies and status, forming the monthly/quarterly/annual HR compliance calendars and the compliance task register.

**Covers:** A1.5, A1.6, A1.7, A1.26
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- packages/@aura/scheduler/tsconfig.json
- packages/@aura/scheduler/tsup.config.ts
- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/e2e/leave/leave-calendar.e2e.test.ts
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/calendar/gregorian/page.tsx
- apps/web/src/app/(modules)/leave/calendar/hijri/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC.

## Acceptance Criteria To Verify

- [ ] Given a recurrence rule, when active, then tasks auto-generate for each upcoming period per entity with owner, due date and category.
- [ ] Given a due date that falls on a public holiday/weekend, when computed, then it shifts per the country rule.
- [ ] Given monthly/quarterly/annual scopes, when generated, then they populate the respective calendar views and the task register.
- [ ] Given task generation, when run, then it is idempotent (no duplicates) and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `compliance_task`, `recurrence_rule` schemas + scheduler engine
- [ ] Backend: holiday/weekend due-date shifting using country calendar
- [ ] Frontend: monthly/quarterly/annual calendar views + task register
- [ ] Rules/Config: recurrence templates per category/country
- [ ] Tests: integration tests for idempotent generation and date shifting

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
