# Gap Analysis: EPIC-13-S07 — Salary Changes & GOSI Wage Updates

> Source epic: [EPIC-13-chapter-13-gosi-compliance.md](./EPIC-13-chapter-13-gosi-compliance.md)
> Parent epic: EPIC-13: Chapter 13 – GOSI Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** GOSI contribution wages to update automatically when an employee's salary changes, with a GOSI wage-update record for submission, **so that** declared wages always match the current salary and we avoid under/over declaration penalties.

**Description**
When a salary change (increment, promotion, component change) is recorded, the GOSI contribution wage is recalculated, the delta is detected, and a GOSI wage-update entry is queued for the next monthly process or as an immediate amendment. Effective dating ensures the change applies from the correct GOSI period.

**Covers:** 13.10
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

- [ ] Given a recorded salary change, when saved, then the GOSI contribution wage is recalculated and compared to the last declared wage.
- [ ] Given a material wage delta, when detected, then a GOSI wage-update record is created with effective date and queued into the next monthly run.
- [ ] Given the change is backdated, when processed, then prior periods are flagged for amendment/adjustment rather than silently changed.
- [ ] Given an update is queued, then Payroll Officer is notified and the change is visible in the wage-change log.
- [ ] Given any wage update, then before/after wage and effective date are written to the audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: consumer on `employee.salaryChanged` → recompute GOSI wage and create `gosi_wage_update`
- [ ] Backend: delta detection + backdated-change amendment flagging
- [ ] Frontend: GOSI wage-change log + queued-updates view
- [ ] Alerts/Workflow: notify Payroll Officer of pending wage updates
- [ ] Tests: unit tests for delta detection and effective-date handling

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
