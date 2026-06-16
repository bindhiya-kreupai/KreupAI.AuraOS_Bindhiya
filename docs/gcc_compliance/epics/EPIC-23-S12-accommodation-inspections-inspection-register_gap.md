# Gap Analysis: EPIC-23-S12 — Accommodation inspections & inspection register

> Source epic: [EPIC-23-chapter-23-accommodation-and-labour-camp-c.md](./EPIC-23-chapter-23-accommodation-and-labour-camp-c.md)
> Parent epic: EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance
> Module: Welfare
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** to schedule and conduct accommodation inspections with a digital checklist, **so that** periodic inspections are evidenced, findings tracked and corrective actions closed.

**Description**
A mobile-friendly inspection workflow covering hygiene, fire, electrical, food, welfare and occupancy, with scoring, photo evidence, findings → corrective actions, and a complete inspection register for authority/internal audit.

**Covers:** 23.21, 23.34
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given an inspection schedule, when an inspection is due (e.g. monthly), then it is created and an overdue inspection is flagged.
- [ ] Given an inspection, when conducted, then each checklist item is rated with photo evidence and an overall score computed.
- [ ] Given a failed item, then a corrective action with owner, due date and severity is auto-created.
- [ ] Given the Inspection Register, then it exports site, date, inspector, score, findings and corrective-action status.
- [ ] Given any inspection/corrective action, then it is audit-logged and reflects on the dashboard.

## Implementation Tasks From Backlog

- [ ] Backend: `inspection_schedule`, `inspection`, `inspection_item`, `corrective_action` schema
- [ ] Backend: scoring + overdue-inspection job; corrective-action lifecycle
- [ ] Frontend: mobile inspection form + Inspection Register export
- [ ] Rules/Config: checklist templates + frequency per accommodation type/country
- [ ] Alerts/Workflow: overdue-inspection alerts; corrective-action escalation
- [ ] Tests: e2e (inspect → finding → corrective action) + unit (scoring)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
