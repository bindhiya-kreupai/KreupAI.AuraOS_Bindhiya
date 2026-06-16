# Gap Analysis: EPIC-34-S12 — Leave configuration

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5

**Description**
Configure leave types (annual, sick with tiered pay, maternity, paternity, Hajj, bereavement, unpaid), entitlement and accrual rules, carry-forward caps, encashment basis, and leave-salary treatment — bound to country rules (e.g., UAE 30 days annual, tiered sick pay).

**Covers:** 34.14
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/(modules)/leave/calendar/holidays/page.tsx
- apps/web/src/app/(modules)/leave/country-specific-rules/page.tsx
- apps/web/src/app/(modules)/leave/holiday-management/page.tsx
- apps/web/src/app/(modules)/leave/policies/country-rules/page.tsx
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/leave/holidays/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

## Gap To Close

- add/wire service logic; add tests.

## Acceptance Criteria To Verify

- [ ] Given a country, when leave is configured, then statutory types and entitlements (e.g., annual days, tiered sick pay) resolve from the rule engine.
- [ ] Given accrual/carry-forward, when set, then methods and caps are enforced and cannot violate statutory minima.
- [ ] Given encashment, when configured, then the salary basis and eligibility are defined per country.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `leave_type`, `accrual_rule`, `encashment_rule` schemas
- [ ] Backend: statutory-minimum validation
- [ ] Frontend: leave configuration screen
- [ ] Rules/Config: per-country leave entitlement/accrual rules
- [ ] Tests: unit tests for statutory-minimum enforcement

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
