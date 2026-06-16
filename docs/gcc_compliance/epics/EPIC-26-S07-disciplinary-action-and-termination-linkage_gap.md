# Gap Analysis: EPIC-26-S07 — Disciplinary Action and Termination Linkage

> Source epic: [EPIC-26-chapter-26-disciplinary-action-compliance.md](./EPIC-26-chapter-26-disciplinary-action-compliance.md)
> Parent epic: EPIC-26: Chapter 26 – Disciplinary Action Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a gated pathway from disciplinary action to termination, **so that** dismissals are lawfully grounded, traceable and connected to separation/EOSB processing.

**Description**
Links disciplinary outcomes to EPIC-27: where the matrix/decision results in dismissal (including gross-misconduct summary dismissal under specific statutory grounds), AuraOS verifies the required disciplinary history/grounds, requires elevated approval, and initiates a separation case carrying findings, hearing record and country dismissal-ground references, flagging EOSB/notice implications.

**Covers:** 26.14
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
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

- [ ] Given a dismissal recommendation, when raised, then required disciplinary history or qualifying statutory ground is verified before proceeding.
- [ ] Given a gross-misconduct summary dismissal, when selected, then the specific country statutory ground (e.g. UAE Art. 44 type grounds, KSA Art. 80 type grounds) must be cited and evidenced.
- [ ] Given approval, when granted at the required authority level, then a separation case is created with linked disciplinary evidence and dismissal type.
- [ ] Given a dismissal type, when set, then notice/EOSB impact flags are passed to separation/EOSB.
- [ ] Given any linkage event, when performed, then it is audited with full traceability.

## Implementation Tasks From Backlog

- [ ] Backend: `disciplinary_termination_link` entity + dismissal-grounds verification service.
- [ ] Backend: separation-init event emitter with evidence handoff.
- [ ] Frontend: dismissal decision screen with grounds citation.
- [ ] Rules/Config: per-country dismissal grounds and required-history rules.
- [ ] Alerts/Workflow: elevated-approval routing; separation owner notification.
- [ ] Tests: integration (grounds verification + separation init), unit (history checks).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
