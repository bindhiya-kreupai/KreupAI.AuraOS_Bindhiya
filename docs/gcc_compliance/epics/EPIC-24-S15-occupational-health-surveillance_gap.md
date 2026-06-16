# Gap Analysis: EPIC-24-S15 — Occupational health surveillance

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** to manage occupational health surveillance, **so that** workers exposed to hazards receive required medical screening and fitness monitoring with confidential records.

**Description**
Manage health-surveillance programs for exposure-based roles (e.g. noise, dust/silica, chemicals, heat), scheduling baseline/periodic medicals, recording fitness outcomes confidentially, and flagging required follow-up.

**Covers:** 24.21
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Minimal Evidence

**Existing implementation evidence**

- apps/web/src/services/authService.ts
- apps/web/src/services/searchService.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given an exposure-based role, when assigned, then required surveillance type and frequency are derived from the risk assessment.
- [ ] Given a surveillance due date, when approaching, then a screening alert fires; overdue screenings flag the worker.
- [ ] Given a screening result, when recorded, then fitness status/restrictions are stored confidentially with RBAC and masking.
- [ ] Given an adverse result, then a follow-up/medical-restriction action is created.
- [ ] Given any surveillance record, then it is audit-logged with sensitive data protected.

## Implementation Tasks From Backlog

- [ ] Backend: `health_surveillance_program`, `surveillance_record` schema with confidentiality
- [ ] Backend: scheduling + due/overdue service
- [ ] Frontend: surveillance program + confidential result entry
- [ ] Rules/Config: exposure→surveillance type/frequency per country
- [ ] Alerts/Workflow: screening-due alerts; adverse-result follow-up
- [ ] Tests: unit (scheduling/masking)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
