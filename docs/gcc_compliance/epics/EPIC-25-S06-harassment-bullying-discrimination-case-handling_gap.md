# Gap Analysis: EPIC-25-S06 — Harassment, Bullying & Discrimination Case Handling

> Source epic: [EPIC-25-chapter-25-employee-relations-and-grievanc.md](./EPIC-25-chapter-25-employee-relations-and-grievanc.md)
> Parent epic: EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 8

**Description**
Adds dedicated intake/triage and handling logic for harassment & bullying and for discrimination (protected characteristics: gender, nationality, religion, disability, etc.), enforcing elevated confidentiality, mandatory formal investigation, support measures for complainants, and interim safeguarding (e.g. separation of parties pending investigation).

**Covers:** 25.13, 25.14
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

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given a harassment/bullying case, when created, then it is forced to formal investigation with restricted access and support-measure prompts.
- [ ] Given a discrimination case, when created, then protected-characteristic fields are captured and tagged sensitive under data-privacy rules.
- [ ] Given interim safeguarding is required, when applied, then measures (reassignment, no-contact) are logged and linked to the case.
- [ ] Given a respondent is a senior leader, when triaged, then the case routes to an independent investigator outside the reporting line.
- [ ] Given sensitive-category data, when accessed, then access is restricted to authorised roles and every access is audited.

## Implementation Tasks From Backlog

- [ ] Backend: extend case model with `sensitive_category`, `protected_characteristics`, `interim_measures`; independent-routing service.
- [ ] Backend: access-restriction layer for sensitive cases.
- [ ] Frontend: harassment/discrimination intake + safeguarding panel.
- [ ] Rules/Config: protected-characteristic lists and forced-formal/independent-investigator rules per country.
- [ ] Alerts/Workflow: support-measure reminders + independent-investigator assignment.
- [ ] Tests: integration (forced formal + restricted access), unit (independent routing).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
