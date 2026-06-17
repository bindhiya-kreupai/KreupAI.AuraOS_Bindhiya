# Gap Analysis: EPIC-32-S11 — Policy review calendar & scheduled reviews

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-32-chapter-32-hr-policies.md](./EPIC-32-chapter-32-hr-policies.md)
> Parent epic: EPIC-32: Chapter 32 – HR Policies
> Module: Policies
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** a review calendar that schedules and alerts on policy reviews, **so that** no policy goes past its mandated review cycle.

**Description**
Adds a per-policy review cycle (e.g. annual) with a calendar view and 90/60/30/0-day review-due alerts to policy owners, plus a one-click "start review" that opens a draft revision.

**Covers:** 32.23
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/leave/leave-calendar.e2e.test.ts
- apps/web/src/app/(modules)/leave/calendar/gregorian/page.tsx
- apps/web/src/app/(modules)/leave/calendar/hijri/page.tsx
- apps/web/src/app/(modules)/leave/calendar/holidays/page.tsx
- apps/web/src/app/(modules)/leave/calendar/page.tsx
- apps/web/src/app/(modules)/leave/calendar/ramadan-hours/page.tsx
- apps/web/src/app/(modules)/leave/hijri-calendar/page.tsx
- apps/web/src/app/(modules)/leave/leave-calendar/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC.

## Acceptance Criteria To Verify

- [ ] Given a policy with an annual review cycle, then its next review date is computed from last approval and shown on the calendar.
- [ ] Given an approaching review, then owners are alerted at 90/60/30 days and on the due date.
- [ ] Given an overdue review, then the policy is flagged on the risk matrix and dashboard.
- [ ] Given "start review", then a new draft version is created from the current version for editing.

## Implementation Tasks From Backlog

- [ ] Backend: review-cycle fields + next-review-date computation service.
- [ ] Backend: scheduled review-due alert job.
- [ ] Frontend: policy review calendar view.
- [ ] Rules/Config: review cycle per policy type.
- [ ] Alerts/Workflow: 90/60/30/0-day owner alerts.
- [ ] Tests: unit (next-review calc), integration (alert thresholds, overdue flag).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
