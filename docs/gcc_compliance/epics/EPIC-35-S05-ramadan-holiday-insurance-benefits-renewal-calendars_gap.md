# Gap Analysis: EPIC-35-S05 — Ramadan/holiday & insurance/benefits renewal calendars

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-35-compliance-calendar-scheduling-automation.md](./EPIC-35-compliance-calendar-scheduling-automation.md)
> Parent epic: EPIC-35: Compliance Calendar & Scheduling Automation
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 3

**Description**
Configure the Ramadan/public-holiday calendar (per-country holiday lists, Ramadan reduced-hours window, event-based tasks like schedule changes and communications) and the insurance/benefits renewal calendar (medical/life policy renewals, vendor SLAs) with lead-time alerts.

**Covers:** A1.12, A1.13
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- packages/@aura/database/src/seeds/holiday-calendars.seed.ts
- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/components/recruitment/CalendarSlotPicker.tsx
- services/integration-service/src/services/calendarService.ts
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; add tests.

## Acceptance Criteria To Verify

- [ ] Given a country, when the holiday calendar is loaded, then public holidays and the Ramadan window generate event-based tasks and communications.
- [ ] Given an insurance/benefit policy, when its renewal nears, then a renewal task and lead-time alert are raised.
- [ ] Given a holiday-calendar change, when published, then dependent schedules/tasks update and are flagged.
- [ ] Given task actions, when taken, then they are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: holiday/Ramadan and policy-renewal calendar generators
- [ ] Backend: renewal lead-time alerting
- [ ] Frontend: holiday/Ramadan and benefits-renewal calendar views
- [ ] Rules/Config: per-country holidays and renewal lead times
- [ ] Alerts/Workflow: renewal and holiday-change alerts
- [ ] Tests: integration tests for holiday-driven task generation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
