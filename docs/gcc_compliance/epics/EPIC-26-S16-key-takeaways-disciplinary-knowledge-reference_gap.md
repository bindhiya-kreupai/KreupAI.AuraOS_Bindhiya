# Gap Analysis: EPIC-26-S16 — Key Takeaways & Disciplinary Knowledge Reference

> Source epic: [EPIC-26-chapter-26-disciplinary-action-compliance.md](./EPIC-26-chapter-26-disciplinary-action-compliance.md)
> Parent epic: EPIC-26: Chapter 26 – Disciplinary Action Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Could · **Estimate:** 1

**Description**
Surfaces concise key takeaways and contextual guidance (fair-process principles, deduction/penalty limits, country nuances, do/don't lists) within the disciplinary module as version-controlled help content linked to relevant screens.

**Covers:** 26.30
**Acceptance criteria count:** 5 · **Task count:** 4

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

- [ ] Given a module screen, when help is opened, then relevant takeaways/guidance show.
- [ ] Given content updates, when published, then versioning is maintained.
- [ ] Given a country context, when set, then country-specific notes surface.
- [ ] Given help content, when displayed, then it links to the related policy/section.
- [ ] Given content changes, when saved, then they are audited.

## Implementation Tasks From Backlog

- [ ] Backend: knowledge-content entity (versioned) + screen mapping.
- [ ] Frontend: contextual help panel.
- [ ] Rules/Config: country-specific note configuration.
- [ ] Tests: unit (versioning), integration (screen mapping).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
