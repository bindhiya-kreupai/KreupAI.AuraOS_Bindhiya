# Gap Analysis: EPIC-26-S09 — Confidentiality, Consistency/Fairness & Documentation Standards

> Source epic: [EPIC-26-chapter-26-disciplinary-action-compliance.md](./EPIC-26-chapter-26-disciplinary-action-compliance.md)
> Parent epic: EPIC-26: Chapter 26 – Disciplinary Action Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** confidentiality, consistency/fairness checks and documentation standards enforced, **so that** discipline is private, even-handed and fully documented.

**Description**
Enforces need-to-know access to disciplinary records, a consistency engine comparing the proposed penalty against precedents for similar offences (flagging disparate treatment risk), and documentation-completeness validation (investigation, hearing, decision, communication, acknowledgement) before closure.

**Covers:** 26.16, 26.17, 26.18
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

- [ ] Given a disciplinary record, when accessed, then only authorised roles view it and access is logged.
- [ ] Given a proposed penalty, when the consistency engine runs, then it surfaces comparable past cases and flags disparate treatment for the same offence/severity.
- [ ] Given case closure, when validated, then mandatory documents must be present or closure is blocked.
- [ ] Given a disparate-treatment flag, when raised, then justification or adjustment is required before issuance.
- [ ] Given any access/consistency/documentation action, when performed, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: confidentiality middleware + `consistency_check` service comparing precedents + completeness validator.
- [ ] Backend: precedent index by offence/severity/outcome.
- [ ] Frontend: consistency-comparison panel + closure completeness checklist.
- [ ] Rules/Config: comparable-case criteria and mandatory-document sets per country.
- [ ] Alerts/Workflow: disparate-treatment review prompt; closure-blocked notice.
- [ ] Tests: integration (consistency flagging + closure block), unit (access logging).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
