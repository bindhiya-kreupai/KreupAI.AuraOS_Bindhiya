# Gap Analysis: EPIC-14-S07 — Monthly GPSSA Process & Submission File

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-14-chapter-14-gpssa-compliance.md](./EPIC-14-chapter-14-gpssa-compliance.md)
> Parent epic: EPIC-14: Chapter 14 – GPSSA Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 13
**User story:** Payroll Officer, **I want** a guided monthly GPSSA cycle that compiles members, validates data, and produces the submission file with maker-checker approval, **so that** the monthly declaration is accurate, on time and auditable.

**Description**
Orchestrates the monthly GPSSA run: snapshot active eligible members, pull account salaries and calculated contributions, run pre-submission validations (missing GPSSA numbers, salary anomalies, unregistered eligible nationals, exited-still-listed), and generate the GPSSA-format submission file. Maker-checker enforces preparer ≠ approver, and the deadline is tracked.

**Covers:** 14.9
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/app/api/v1/compliance/ministry-submissions/[id]/transition/route.ts
- apps/web/src/app/api/v1/compliance/ministry-submissions/route.ts
- apps/web/src/app/api/v1/compliance/wps/submissions/route.ts
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/lib/services/**tests**/labour-ministry-submission.service.test.ts
- apps/web/src/lib/services/labour-ministry-submission.service.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an open GPSSA period, when started, then a member snapshot is created and validations flag missing numbers, zero/negative salaries, unregistered eligible nationals, and exited-still-listed members.
- [ ] Given validations pass, when the preparer submits, then maker-checker requires an approver different from the preparer.
- [ ] Given approval, then the submission file is generated in the prescribed format and the period locked.
- [ ] Given the statutory deadline, when within 7/3/1 days, then alerts fire; unapproved periods are flagged overdue.
- [ ] Given the file is generated, then a guided upload step records confirmation and reference.
- [ ] Given any step, then state transitions are written to the audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: `gpssa_monthly_run` entity (period, status, snapshotAt, preparedBy, approvedBy, fileRef, uploadRef)
- [ ] Backend: validation set + submission-file builder
- [ ] Backend: maker-checker state machine via workflow engine
- [ ] Frontend: monthly GPSSA run dashboard (snapshot→validate→approve→generate→upload)
- [ ] Alerts/Workflow: deadline countdown + overdue escalation
- [ ] Tests: integration test for full cycle incl. preparer≠approver and period lock

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
