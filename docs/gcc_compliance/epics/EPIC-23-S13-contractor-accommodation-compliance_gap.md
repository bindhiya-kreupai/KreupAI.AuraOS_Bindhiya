# Gap Analysis: EPIC-23-S13 — Contractor accommodation compliance

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-23-chapter-23-accommodation-and-labour-camp-c.md](./EPIC-23-chapter-23-accommodation-and-labour-camp-c.md)
> Parent epic: EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance
> Module: Welfare
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** to govern contractor/third-party accommodation, **so that** subcontracted worker housing meets the same standards and contractor non-compliance is tracked.

**Description**
Extend accommodation compliance to contractor-provided or third-party-leased accommodation: register contractor accommodations, require the same standards/inspections, and track contractor compliance status for procurement decisions.

**Covers:** 23.22
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given a contractor accommodation, when registered, then it is linked to the contractor and subject to the same standard checklists and inspections.
- [ ] Given a contractor accommodation inspection, when failing, then a non-compliance is recorded against the contractor with a remediation deadline.
- [ ] Given repeated/serious non-compliance, then the contractor is flagged for procurement review.
- [ ] Given any contractor accommodation record, then it is audit-logged and visible on the dashboard.

## Implementation Tasks From Backlog

- [ ] Backend: `contractor_accommodation`, `contractor_noncompliance` schema
- [ ] Backend: contractor compliance-status service
- [ ] Frontend: contractor accommodation register + compliance status
- [ ] Rules/Config: standard applicability + escalation thresholds
- [ ] Alerts/Workflow: non-compliance remediation + procurement flag
- [ ] Tests: integration (contractor inspection + flagging)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
