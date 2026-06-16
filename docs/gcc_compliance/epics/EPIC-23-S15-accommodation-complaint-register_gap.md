# Gap Analysis: EPIC-23-S15 — Accommodation complaint register

> Source epic: [EPIC-23-chapter-23-accommodation-and-labour-camp-c.md](./EPIC-23-chapter-23-accommodation-and-labour-camp-c.md)
> Parent epic: EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance
> Module: Welfare
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Should · **Estimate:** 3
**User story:** Employee (Self-Service), **I want** to raise accommodation complaints and track resolution, **so that** issues (overcrowding, hygiene, maintenance, dignity) are addressed and evidenced.

**Description**
A complaint channel for accommodation issues with categorization, confidentiality option, routing to maintenance/inspection, SLA and resolution tracking, producing the complaint register.

**Covers:** 23.35
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

- [ ] Given a worker, when they raise a complaint, then category, accommodation/bed, description and confidentiality flag are captured.
- [ ] Given a complaint, when logged, then it routes to the right owner (maintenance/HSE/welfare) with an SLA.
- [ ] Given an overdue complaint, then it escalates.
- [ ] Given the Complaint Register, then it exports complaint, category, status, owner and resolution date.
- [ ] Given any complaint/resolution, then it is audit-logged and dignity-related complaints stay confidential.

## Implementation Tasks From Backlog

- [ ] Backend: `accommodation_complaint` schema with routing/SLA
- [ ] Backend: routing + escalation service
- [ ] Frontend: complaint submission (self-service) + Complaint Register export
- [ ] Rules/Config: category→owner routing + SLA
- [ ] Alerts/Workflow: complaint escalation
- [ ] Tests: e2e (raise → route → resolve)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
