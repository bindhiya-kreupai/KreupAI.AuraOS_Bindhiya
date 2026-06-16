# Gap Analysis: EPIC-11-S09 — Salary delay controls

> Source epic: [EPIC-11-chapter-11-wage-protection-system-complian.md](./EPIC-11-chapter-11-wage-protection-system-complian.md)
> Parent epic: EPIC-11: Chapter 11 – Wage Protection System Compliance
> Module: Payroll / WPS
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** automated salary-delay detection and escalation, **so that** wages are never paid beyond the statutory window without warning.

**Description**
Track each entity's statutory pay/report window per country, project pay/submission dates from the payroll calendar, and raise tiered alerts and escalations as the window approaches and on breach (e.g., flag salary delay when wages unpaid/unreported beyond the statutory limit, typically > 15 days for UAE WPS), with management visibility.

**Covers:** 11.13
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll-compliance/gosi/mudad-bridge/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/mudad/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/qatar-wps/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a payroll period, when the projected pay/report date nears the statutory window, then tiered alerts fire (e.g., 7/3/1 days before, and on breach).
- [ ] Given wages unpaid or unreported beyond the country's statutory limit, when detected, then a salary-delay flag is set and escalated to management.
- [ ] Given a country, when evaluated, then the correct statutory window per country drives the calculation.
- [ ] Given a salary-delay event, when raised, then it is logged for the penalty/business-impact tracker and audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: salary-delay projection + breach-detection service over payroll calendar
- [ ] Backend: tiered escalation engine
- [ ] Frontend: salary-delay monitor with status per entity
- [ ] Rules/Config: per-country statutory windows and alert tiers
- [ ] Alerts/Workflow: tiered alerts + management escalation
- [ ] Tests: unit tests for window projection and breach flagging per country

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
