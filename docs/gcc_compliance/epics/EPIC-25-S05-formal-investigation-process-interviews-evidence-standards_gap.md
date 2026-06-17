# Gap Analysis: EPIC-25-S05 — Formal Investigation Process, Interviews & Evidence Standards

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-25-chapter-25-employee-relations-and-grievanc.md](./EPIC-25-chapter-25-employee-relations-and-grievanc.md)
> Parent epic: EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 13

**Description**
Implements the formal investigation workflow: appoint investigator (conflict-of-interest check), define scope/allegations, plan and record interviews (complainant, respondent, witnesses) with statements, log evidence with chain-of-custody and source/reliability tagging, apply the balance-of-probabilities standard, and reach documented findings per allegation.

**Covers:** 25.11, 25.12
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx
- apps/web/src/app/dashboard/grievance/components/ErrorBoundary.tsx
- apps/web/src/app/dashboard/grievance/components/LoadingSpinner.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a formal case, when an investigator is appointed, then a conflict-of-interest declaration is required and recorded.
- [ ] Given an investigation plan, when interviews are scheduled, then each interviewee record stores invitation, attendance, statement and right-to-be-accompanied note where applicable.
- [ ] Given evidence is added, when logged, then it captures source, date obtained, reliability tag, custodian and an immutable hash for integrity.
- [ ] Given findings are recorded, when finalised, then each allegation has a finding (substantiated/partly/unsubstantiated) with reasoning and the standard of proof applied.
- [ ] Given investigation completion, when closed, then a draft investigation report is generated for review/approval.
- [ ] Given any investigation step, when performed, then it is captured in the audit trail with actor and timestamp.

## Implementation Tasks From Backlog

- [ ] Backend: `investigation`, `investigation_interview`, `investigation_evidence` (source, reliability, custody, hash), `investigation_finding` entities/migrations.
- [ ] Backend: conflict-of-interest guard + evidence integrity hashing service.
- [ ] Frontend: investigation case workspace (scope, interviews, evidence, findings).
- [ ] Rules/Config: standard-of-proof and accompaniment rules per country.
- [ ] Alerts/Workflow: interview scheduling notifications + investigation SLA reminders.
- [ ] Tests: integration (evidence integrity + COI guard), e2e (full investigation to findings).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
