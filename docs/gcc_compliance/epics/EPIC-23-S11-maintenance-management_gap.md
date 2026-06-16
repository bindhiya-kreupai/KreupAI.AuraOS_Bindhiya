# Gap Analysis: EPIC-23-S11 — Maintenance management

> Source epic: [EPIC-23-chapter-23-accommodation-and-labour-camp-c.md](./EPIC-23-chapter-23-accommodation-and-labour-camp-c.md)
> Parent epic: EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance
> Module: Welfare
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Should · **Estimate:** 5
**User story:** HR Admin, **I want** to manage accommodation maintenance requests and preventive maintenance, **so that** defects are resolved within SLA and assets stay safe and habitable.

**Description**
Handle reactive maintenance requests (raised by workers/inspectors) and preventive maintenance schedules (AC servicing, plumbing, pest, generator) with priority, SLA, assignment and closure, feeding safety/hygiene compliance.

**Covers:** 23.20
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given a maintenance request, when raised, then it captures category, priority, location/bed, and SLA target by priority.
- [ ] Given an overdue request, when SLA is breached, then it escalates with an alert.
- [ ] Given a preventive-maintenance schedule, when due, then a work order auto-generates.
- [ ] Given a safety-critical defect (e.g. electrical, fire), then it is flagged high-priority and linked to the relevant safety standard.
- [ ] Given any request/closure, then it is audit-logged with completion evidence.

## Implementation Tasks From Backlog

- [ ] Backend: `maintenance_request`, `pm_schedule`, `work_order` schema with SLA
- [ ] Backend: SLA-breach escalation + PM auto-generation job
- [ ] Frontend: maintenance request + work-order board
- [ ] Rules/Config: priority→SLA matrix; PM intervals
- [ ] Alerts/Workflow: SLA escalation; safety-critical routing
- [ ] Tests: unit (SLA) + integration (PM generation)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
