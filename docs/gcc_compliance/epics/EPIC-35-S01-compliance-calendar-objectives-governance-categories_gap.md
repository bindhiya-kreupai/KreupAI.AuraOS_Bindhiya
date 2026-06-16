# Gap Analysis: EPIC-35-S01 — Compliance calendar objectives, governance & categories

> Source epic: [EPIC-35-compliance-calendar-scheduling-automation.md](./EPIC-35-compliance-calendar-scheduling-automation.md)
> Parent epic: EPIC-35: Compliance Calendar & Scheduling Automation
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 3
**User story:** Compliance Officer, **I want** a governed compliance-calendar model with defined categories, **so that** every statutory obligation has structure, ownership and a control framework.

**Description**
Establish the calendar foundation: objectives, governance roles (calendar owner, task owners, approvers), and the category taxonomy (payroll, social insurance, immigration, nationalization, holiday, benefits, HSE, ER, document audit). This frames every scheduling and automation story.

**Covers:** A1.1, A1.2, A1.3, A1.4
**Acceptance criteria count:** 4 · **Task count:** 5

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

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC.

## Acceptance Criteria To Verify

- [ ] Given the platform, when configured, then calendar categories and governance roles/control points are defined.
- [ ] Given a category, when created, then it has an owner role and default cadence.
- [ ] Given governance, when set, then task creation → assignment → completion → certification control points are mandatory.
- [ ] Given any calendar-config change, when saved, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `calendar_category`, `calendar_governance` schemas
- [ ] Backend: governance control-point service
- [ ] Frontend: calendar governance & category configuration screen
- [ ] Rules/Config: default category taxonomy and cadences
- [ ] Tests: unit tests for control-point enforcement

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
