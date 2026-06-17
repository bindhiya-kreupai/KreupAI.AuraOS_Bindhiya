# Gap Analysis: EPIC-13-S06 — Monthly GOSI Process & Contribution File Generation

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-13-chapter-13-gosi-compliance.md](./EPIC-13-chapter-13-gosi-compliance.md)
> Parent epic: EPIC-13: Chapter 13 – GOSI Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 13
**User story:** Payroll Officer, **I want** a guided monthly GOSI cycle that compiles all members, validates the data, and produces the submission-ready contribution file with maker-checker approval, **so that** the monthly declaration is accurate, on time, and auditable.

**Description**
Orchestrates the monthly GOSI run: snapshot active members, pull contribution wages and calculated contributions, run pre-submission validations (missing subscription numbers, wage anomalies, unregistered joiners), and generate the GOSI-format contribution/declaration file. A maker-checker workflow enforces preparer ≠ approver before the file is released for upload, and the deadline is tracked against the obligation calendar.

**Covers:** 13.9
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/gosi/contribution-simulation/page.tsx
- apps/web/src/app/api/v1/benefits/hsa-fsa/contribution/route.ts
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/components/compliance/gosi/GosiContributionCalculator.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an open GOSI period, when the cycle is started, then a member snapshot is created and validation runs (flagging missing subscription numbers, zero/negative wages, unregistered active employees, exited-but-still-listed members).
- [ ] Given validations pass, when the preparer submits, then the file enters maker-checker; the approver must differ from the preparer.
- [ ] Given approval, then the GOSI contribution file is generated in the prescribed format and the period is locked from edits.
- [ ] Given the statutory deadline, when within 7/3/1 days, then alerts fire; if the period is not approved by the deadline it is flagged overdue.
- [ ] Given the file is generated, then a download/manual-upload guided step records the upload confirmation and reference.
- [ ] Given any step, then actor, timestamp, and state transitions are written to the audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: `gosi_monthly_run` entity (period, status, snapshotAt, preparedBy, approvedBy, fileRef, uploadRef)
- [ ] Backend: validation rule set + contribution-file builder service
- [ ] Backend: maker-checker state machine integrated with workflow engine
- [ ] Frontend: monthly GOSI run dashboard (snapshot → validate → approve → generate → upload)
- [ ] Alerts/Workflow: deadline countdown + overdue escalation
- [ ] Tests: integration test for full cycle incl. preparer≠approver enforcement and period lock

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
