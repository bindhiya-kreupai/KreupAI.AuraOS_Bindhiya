# Gap Analysis: EPIC-35-S06 — HSE/training, employee-relations & document-audit calendars

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-35-compliance-calendar-scheduling-automation.md](./EPIC-35-compliance-calendar-scheduling-automation.md)
> Parent epic: EPIC-35: Compliance Calendar & Scheduling Automation
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** HSE/training, employee-relations and document-audit calendars, **so that** recurring safety, ER and file-audit obligations are scheduled and owned.

**Description**
Configure the HSE/training calendar (safety training, drills, inspections, certification renewals), the employee-relations calendar (grievance SLA reviews, recurring ER reporting) and the document/file-audit calendar (employee-file completeness audits, document-expiry sweeps, retention reviews) as scheduler-driven tasks.

**Covers:** A1.14, A1.15, A1.16
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/components/recruitment/CalendarSlotPicker.tsx
- packages/@aura/database/src/seeds/holiday-calendars.seed.ts
- services/integration-service/src/services/calendarService.ts
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given HSE config, when scheduled, then training/drill/inspection tasks generate on cadence with owners.
- [ ] Given ER config, when scheduled, then recurring ER review/reporting tasks generate.
- [ ] Given document-audit config, when scheduled, then file-completeness and expiry-sweep tasks generate.
- [ ] Given task completion, when recorded, then it is audit-logged with evidence.

## Implementation Tasks From Backlog

- [ ] Backend: HSE/ER/document-audit calendar templates feeding the scheduler
- [ ] Frontend: HSE/training, ER and document-audit calendar views
- [ ] Rules/Config: cadence templates per category
- [ ] Alerts/Workflow: due-date alerts to owners
- [ ] Tests: integration tests for cadence generation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
