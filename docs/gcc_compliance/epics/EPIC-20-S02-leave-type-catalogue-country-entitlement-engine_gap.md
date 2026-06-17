# Gap Analysis: EPIC-20-S02 — Leave type catalogue & country entitlement engine

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 13

**Description**
Build a leave-type catalogue (annual, sick, maternity, paternity/parental, bereavement, Hajj, study/exam, marriage, unpaid, comp-off and custom) with per-country/entity/grade entitlement, paid/unpaid/partial-pay tiers, eligibility (service, gender, religion, nationality where lawful), documentation requirements and limits — the configuration that powers all type-specific stories.

**Covers:** 20.4
**Acceptance criteria count:** 4 · **Task count:** 5

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

- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md
- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given the catalogue, when configured, then each leave type carries country-specific entitlement, pay tier, eligibility and documentation rules.
- [ ] Given a country, when an employee's leave types resolve, then only eligible, correctly-quantified types are offered.
- [ ] Given a paid-then-reduced type (e.g., sick leave full→half→unpaid bands), when configured, then pay tiers apply by day-band.
- [ ] Given any entitlement change, when saved, then it is versioned, effective-dated and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `leave_type`, `leave_entitlement_rule` schemas (country, pay_tier_bands, eligibility, doc_required)
- [ ] Backend: entitlement resolution service (employee+country → entitlements)
- [ ] Frontend: leave-type catalogue + entitlement configuration screen
- [ ] Rules/Config: seed GCC defaults (entitlement days, pay bands per type/country)
- [ ] Tests: unit tests for entitlement resolution and pay-tier bands

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
