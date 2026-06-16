# Gap Analysis: EPIC-26-S13 — Monthly Disciplinary Compliance Pack

> Source epic: [EPIC-26-chapter-26-disciplinary-action-compliance.md](./EPIC-26-chapter-26-disciplinary-action-compliance.md)
> Parent epic: EPIC-26: Chapter 26 – Disciplinary Action Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** an auto-generated monthly disciplinary compliance pack, **so that** management and auditors receive a certified disciplinary summary.

**Description**
Generates a periodic pack consolidating cases by type/severity, penalty distribution, due-process compliance (hearing/investigation rates), deduction-legality status, appeals/overturns, audit-checklist results and risk-matrix highlights, with management certification and export (PDF/Excel).

**Covers:** 26.25
**Acceptance criteria count:** 5 · **Task count:** 5

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

- [ ] Given period close, when generated, then all sections populate from live data.
- [ ] Given the pack, when reviewed, then a manager certifies it with e-signature and timestamp.
- [ ] Given export, when requested, then PDF/Excel outputs are stored in the document store.
- [ ] Given sensitive content, when packaged, then aggregate views protect individual identities per privacy rules.
- [ ] Given generation/certification, when completed, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: pack assembler + certification entity + export service + monthly scheduler.
- [ ] Frontend: pack preview and certification screen.
- [ ] Rules/Config: configurable sections per country/entity.
- [ ] Alerts/Workflow: certification reminder + distribution.
- [ ] Tests: integration (assembly+export), unit (certification audit).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
