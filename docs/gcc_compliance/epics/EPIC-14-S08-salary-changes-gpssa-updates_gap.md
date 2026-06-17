# Gap Analysis: EPIC-14-S08 — Salary Changes & GPSSA Updates

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-14-chapter-14-gpssa-compliance.md](./EPIC-14-chapter-14-gpssa-compliance.md)
> Parent epic: EPIC-14: Chapter 14 – GPSSA Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** GPSSA account salaries to update automatically on salary change with a GPSSA update record, **so that** declared salaries always match current pay and we avoid under/over-declaration.

**Description**
When a salary change is recorded, the GPSSA account salary is recalculated, the delta detected, and a GPSSA update entry queued for the next monthly process (or amendment). Effective dating ensures the change applies from the correct period; backdated changes flag prior periods for adjustment.

**Covers:** 14.10
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/web/src/components/payroll/SalaryRevision.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a salary change, when saved, then the GPSSA account salary is recalculated and compared to the last declared salary.
- [ ] Given a material delta, when detected, then a GPSSA update record is created with effective date and queued.
- [ ] Given a backdated change, when processed, then prior periods are flagged for amendment rather than silently changed.
- [ ] Given a queued update, then Payroll Officer is notified and it appears in the salary-change log.
- [ ] Given any update, then before/after salary and effective date are audited.

## Implementation Tasks From Backlog

- [ ] Backend: consumer on `employee.salaryChanged` → recompute account salary + create `gpssa_salary_update`
- [ ] Backend: delta detection + backdated amendment flagging
- [ ] Frontend: GPSSA salary-change log + queued updates view
- [ ] Alerts/Workflow: notify Payroll Officer of pending updates
- [ ] Tests: unit tests for delta detection and effective-date handling

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
