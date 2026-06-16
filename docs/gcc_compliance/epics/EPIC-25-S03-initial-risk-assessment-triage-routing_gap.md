# Gap Analysis: EPIC-25-S03 — Initial Risk Assessment & Triage Routing

> Source epic: [EPIC-25-chapter-25-employee-relations-and-grievanc.md](./EPIC-25-chapter-25-employee-relations-and-grievanc.md)
> Parent epic: EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5

**Description**
On case creation, AuraOS computes an initial risk score from grievance type, presence of harassment/discrimination/retaliation markers, vulnerability of complainant, and potential authority/legal exposure, assigning a tier (Low/Medium/High/Critical) that sets SLA, confidentiality level, assigned investigator seniority and whether informal resolution is permitted.

**Covers:** 25.9
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

- [ ] Given a case is created, when triage runs, then a risk tier and rationale are recorded automatically.
- [ ] Given a harassment, discrimination or retaliation category, when triaged, then the case is forced to at least High tier and informal-only resolution is disabled.
- [ ] Given a High/Critical tier, when assigned, then only senior ER/investigator roles can view/handle it (elevated confidentiality).
- [ ] Given an HR Manager overrides the tier, when saved, then the override, reason and approver are audited.
- [ ] Given the tier is set, when SLA clocks start, then due dates for acknowledgement, investigation and resolution are computed per country config.

## Implementation Tasks From Backlog

- [ ] Backend: `grievance_risk_assessment` (tier, score, factors, rationale, override_reason) entity + scoring service in rule engine.
- [ ] Backend: SLA computation tied to tier + country timelines.
- [ ] Frontend: triage panel showing score factors and tier with override control.
- [ ] Rules/Config: configurable risk factors/weights and forced-tier rules per category/country.
- [ ] Alerts/Workflow: escalate Critical cases to ER committee immediately.
- [ ] Tests: unit (scoring), integration (forced tier + confidentiality enforcement).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
