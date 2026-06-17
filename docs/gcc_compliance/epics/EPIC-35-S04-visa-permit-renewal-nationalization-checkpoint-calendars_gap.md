# Gap Analysis: EPIC-35-S04 — Visa/permit renewal & nationalization checkpoint calendars

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-35-compliance-calendar-scheduling-automation.md](./EPIC-35-compliance-calendar-scheduling-automation.md)
> Parent epic: EPIC-35: Compliance Calendar & Scheduling Automation
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**User story:** PRO / Immigration Officer, **I want** visa/permit renewal and nationalization checkpoint calendars, **so that** renewals and localization targets are tracked to deadline.

**Description**
Generate per-employee work-permit/visa renewal tasks driven by document expiry (alerting 60/30/7 days before) and per-entity nationalization checkpoint tasks (Emiratisation/Nitaqat/Bahrainization/Omanisation mid-year/year-end and platform-reporting dates), with owners and escalation.

**Covers:** A1.10, A1.11
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts
- apps/web/src/app/dashboard/(modules)/visa-permits/page.tsx
- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/lib/services/visa-permit.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given an expiring visa/permit, when within the alert window, then a renewal task and tiered alerts (60/30/7 days) are raised to the PRO.
- [ ] Given an entity, when nationalization checkpoints are configured, then checkpoint tasks generate on the scheme's dates.
- [ ] Given a missed/at-risk checkpoint, when detected, then it escalates to management.
- [ ] Given task actions, when taken, then they are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: expiry-driven renewal-task generator + nationalization checkpoint scheduler
- [ ] Backend: tiered-alert engine for expiries
- [ ] Frontend: visa/permit renewal and nationalization checkpoint calendars
- [ ] Rules/Config: per-country renewal windows and checkpoint dates
- [ ] Alerts/Workflow: 60/30/7-day alerts + management escalation
- [ ] Tests: integration tests for expiry-driven task generation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
