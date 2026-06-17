# Gap Analysis: EPIC-26-S10 — Country-Specific Disciplinary Control Notes

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-26-chapter-26-disciplinary-action-compliance.md](./EPIC-26-chapter-26-disciplinary-action-compliance.md)
> Parent epic: EPIC-26: Chapter 26 – Disciplinary Action Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 3

**Description**
Maintains a configurable per-country control-note library (notice periods, deduction caps, prohibited penalties, summary-dismissal grounds, time bars for acting on misconduct, documentation requirements) surfaced contextually within the disciplinary workflow for UAE, KSA, Bahrain, Qatar, Oman and Kuwait.

**Covers:** 26.19
**Acceptance criteria count:** 5 · **Task count:** 5

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

- confirm/add tenant-scoped schema or config; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a case's country, when handling proceeds, then relevant control notes are shown at the appropriate step.
- [ ] Given a time bar (e.g. acting within statutory days of discovery), when exceeded, then the system warns/blocks.
- [ ] Given a prohibited penalty for a country, when selected, then it is blocked with the reference.
- [ ] Given control-note updates, when published, then versioning applies and notes refresh in-workflow.
- [ ] Given any control-note application, when triggered, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `country_control_note` (versioned) entity + contextual-surfacing service; time-bar guard.
- [ ] Frontend: contextual control-note panel.
- [ ] Rules/Config: per-country notes, time bars and prohibited penalties.
- [ ] Alerts/Workflow: time-bar warning.
- [ ] Tests: unit (time-bar/prohibited-penalty), integration (contextual surfacing).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
