# Gap Analysis: EPIC-26-S15 — Sample Hearing Record, Warning Letter Structure & Disciplinary Register

> Source epic: [EPIC-26-chapter-26-disciplinary-action-compliance.md](./EPIC-26-chapter-26-disciplinary-action-compliance.md)
> Parent epic: EPIC-26: Chapter 26 – Disciplinary Action Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 5

**Description**
Delivers three configurable digital artefacts: a disciplinary hearing record template (notice, attendees, allegations, employee representations, decision), a warning-letter structure (offence, prior history, expectation, consequence of recurrence, validity, appeal rights) generated per country wording, and a disciplinary register (all cases with type, penalty, status, validity, appeal)—each filterable and exportable.

**Covers:** 26.27, 26.28, 26.29
**Acceptance criteria count:** 5 · **Task count:** 6

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

- [ ] Given a hearing, when the record is generated, then it follows the template and pulls hearing data.
- [ ] Given a warning, when issued, then the letter follows the configured structure with mandatory clauses (incl. appeal rights) per country.
- [ ] Given the disciplinary register, when opened, then all cases list with filters (country, type, penalty, status) and export.
- [ ] Given a record/letter/register change, when saved, then it is audited and exportable (PDF/Excel).
- [ ] Given a missing mandatory clause, when generating a letter, then generation is blocked with the gap identified.

## Implementation Tasks From Backlog

- [ ] Backend: hearing-record + warning-letter generators (template-driven) + register query service.
- [ ] Backend: mandatory-clause validation per country.
- [ ] Frontend: hearing-record builder, letter preview, disciplinary register grid.
- [ ] Rules/Config: configurable templates/clauses and register columns per country.
- [ ] Alerts/Workflow: letter-issuance notification.
- [ ] Tests: integration (letter generation + register export), unit (clause validation).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
