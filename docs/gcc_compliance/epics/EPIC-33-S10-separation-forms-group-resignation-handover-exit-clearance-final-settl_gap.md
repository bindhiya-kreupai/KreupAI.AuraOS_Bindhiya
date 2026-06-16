# Gap Analysis: EPIC-33-S10 — Separation forms group (resignation, handover, exit clearance, final settlement, exit interview)

> Source epic: [EPIC-33-chapter-33-hr-forms-and-templates.md](./EPIC-33-chapter-33-hr-forms-and-templates.md)
> Parent epic: EPIC-33: Chapter 33 – HR Forms and Templates
> Module: Forms
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 8

**Description**
Delivers the separation form group feeding EPIC-27/28: Resignation Form (notice period), Handover Form, Exit Clearance Form (multi-department sign-off incl. IT, asset return, finance), Final Settlement Form (EOSB/leave encashment/recoveries), and Exit Interview Form. These chain into one offboarding workflow.

**Covers:** 33.30, 33.31, 33.32, 33.33, 33.34, 33.35
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/api/offboarding/exit-interviews/route.ts
- apps/web/src/app/api/offboarding/final-settlements/route.ts
- apps/web/src/app/api/v1/exits/[id]/clearances/[clearanceId]/complete/route.ts
- apps/web/src/app/api/v1/exits/[id]/clearances/route.ts
- apps/web/src/app/api/v1/hr/exits/[id]/clearance/route.ts
- apps/web/src/app/dashboard/offboarding/exit-interview/page.tsx
- apps/web/src/components/hr/ExitClearanceTracker.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

## Acceptance Criteria To Verify

- [ ] Given the Resignation form, then notice period and last working day are computed per contract/country and route for acceptance.
- [ ] Given the Exit Clearance form, then each department (IT, Finance, Admin, Line Manager) must sign off and asset returns reconcile to the asset register (S08) before clearance completes.
- [ ] Given the Final Settlement form, then it pulls EOSB, leave encashment, deductions and recoveries and requires maker-checker approval before payout.
- [ ] Given the Exit Interview form, then responses are captured (optionally anonymised for analytics) without blocking clearance.
- [ ] Given completion, then approved data writes back to separation/EOSB and triggers immigration/social-insurance closure tasks; all audited.

## Implementation Tasks From Backlog

- [ ] Backend: form definitions + write-back to separation/EOSB; multi-department clearance state machine.
- [ ] Backend: notice-period and settlement aggregation hooks.
- [ ] Frontend: resignation, handover, exit clearance, final settlement, exit interview forms.
- [ ] Rules/Config: notice periods and settlement components per country.
- [ ] Alerts/Workflow: clearance routing across departments; settlement maker-checker.
- [ ] Tests: integration (clearance completion gates, settlement maker-checker, write-back).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
