# Gap Analysis: EPIC-29-S08 — Absconding / Abandonment Immigration Cases

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**User story:** PRO / Immigration Officer, **I want** absconding/abandonment exits handled with the correct authority reporting and timelines, **so that** the employer reports per law, limits liability, and the case is fully evidenced.

**Description**
Handles the absconding/abandonment path: triggered from EPIC-27 unauthorized-absence, it enforces the statutory waiting/notice period before an absconding report can be filed, generates the authority report task set per country (e.g. UAE MOHRE absconding/work-abandonment report, KSA Qiwa/MOI, Bahrain LMRA, Qatar/Kuwait equivalents), captures the report reference and any withdrawal if the employee returns, and links to payroll stop and benefits/SI closure. Strong controls prevent premature or unsupported reports.

**Covers:** 29.12
**Acceptance criteria count:** 5 · **Task count:** 7

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts
- apps/web/src/app/dashboard/(modules)/visa-permits/page.tsx
- apps/web/src/lib/services/visa-permit.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given an unauthorized absence from EPIC-27, when it reaches the configured threshold, then an absconding case can be raised — and is blocked before the statutory waiting period elapses.
- [ ] Given the report, when filed, then the country-specific authority report task set is generated and the report reference captured as evidence.
- [ ] Given the employee returns within the window, then the absconding report can be withdrawn with reason and the case reclassified.
- [ ] Given an absconding case, then payroll is flagged to stop and benefits/SI closure are triggered.
- [ ] Given any absconding action, then it is audited; RBAC restricts filing to PRO / HR Manager.

## Implementation Tasks From Backlog

- [ ] Backend: `immig_absconding_case` entity (caseId, absenceFrom, thresholdMet, reportRef, withdrawal, status)
- [ ] Backend: statutory-waiting-period guard + country report task generator
- [ ] Backend: payroll-stop + benefits/SI-closure triggers
- [ ] Frontend: absconding case panel with report and withdrawal
- [ ] Rules/Config: per-country absconding thresholds, waiting periods, report requirements
- [ ] Alerts/Workflow: escalation + block on premature filing
- [ ] Tests: unit tests for threshold/waiting-period guard and withdrawal

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
