# Gap Analysis: EPIC-33-S09 — Employee relations forms group (grievance, disciplinary hearing record, warning letter)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-33-chapter-33-hr-forms-and-templates.md](./EPIC-33-chapter-33-hr-forms-and-templates.md)
> Parent epic: EPIC-33: Chapter 33 – HR Forms and Templates
> Module: Forms
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 5

**Description**
Delivers the employee-relations form group feeding EPIC-25/26: Grievance Form (confidential intake), Disciplinary Hearing Record (structured minutes, employee response), and Warning Letter template (verbal/written/final, e-signable). These carry heightened confidentiality and link to the ER/disciplinary case.

**Covers:** 33.26, 33.27, 33.28, 33.29
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

- [ ] Given the Grievance form, then it can be submitted confidentially, restricts access to the ER team, and creates/links an ER case.
- [ ] Given the Disciplinary Hearing Record, then it captures allegations, evidence, employee response and outcome with a structured minute and signatures.
- [ ] Given the Warning Letter template, then it generates verbal/written/final variants with merge fields, is e-signed, and stored to the employee file with retention.
- [ ] Given RBAC, then ER forms are restricted to authorised roles and excluded from general HR view; access is audited.
- [ ] Given linkage, then approved outcomes update the disciplinary/grievance case record.

## Implementation Tasks From Backlog

- [ ] Backend: form definitions + write-back to ER/disciplinary case; confidentiality access control.
- [ ] Backend: warning-letter merge/variant service.
- [ ] Frontend: grievance, hearing record, warning letter forms with restricted views.
- [ ] Rules/Config: penalty/warning variants per country; access roles.
- [ ] Alerts/Workflow: ER case routing; confidentiality enforcement.
- [ ] Tests: integration (confidential access, case linkage, letter generation).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
