# Gap Analysis: EPIC-25-S14 — Monthly ER Compliance Pack

> Source epic: [EPIC-25-chapter-25-employee-relations-and-grievanc.md](./EPIC-25-chapter-25-employee-relations-and-grievanc.md)
> Parent epic: EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** an auto-generated monthly Employee Relations compliance pack, **so that** management and auditors receive a consistent, certified ER summary.

**Description**
Generates a periodic compliance pack consolidating case volumes by type/tier, SLA performance, open/aged cases, harassment/discrimination/retaliation summaries, authority-complaint status, audit-checklist results and risk-matrix highlights, with management certification sign-off and export (PDF/Excel).

**Covers:** 25.29
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- packages/@aura/database/src/seeds/23-employees-extended.seed.ts
- packages/@aura/database/src/seeds/24-employee-lifecycle.seed.ts
- packages/@aura/events/src/events/employee-events.ts
- packages/@aura/testing/src/factories/employee-factory.ts
- services/employee-service/package.json
- apps/web/src/app/api/my-services/grievances/route.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given a period close, when the pack is generated, then all required sections populate from live data.
- [ ] Given the pack, when reviewed, then a manager can certify it with e-signature and timestamp.
- [ ] Given export, when requested, then PDF and Excel outputs are produced and stored in the document store.
- [ ] Given sensitive content, when packaged, then aggregate-only views are used and individual identities are protected per privacy rules.
- [ ] Given generation/certification, when completed, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: compliance-pack assembler + certification entity; export service.
- [ ] Backend: scheduler for monthly generation.
- [ ] Frontend: pack preview and certification screen.
- [ ] Rules/Config: configurable pack sections per country/entity.
- [ ] Alerts/Workflow: certification reminder + distribution.
- [ ] Tests: integration (assembly + export), unit (certification audit).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
