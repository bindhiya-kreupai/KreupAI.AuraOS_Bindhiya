# Gap Analysis: EPIC-27-S14 — Handover Management & Exit Interview

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Should · **Estimate:** 5
**User story:** Line Manager, **I want** structured handover and exit-interview steps, **so that** knowledge/responsibilities transfer cleanly and exit feedback is captured.

**Description**
Provides a handover workflow (responsibilities, pending work, documents, contacts, successor assignment, sign-off) and a configurable exit-interview process (questionnaire, reason-for-leaving coding, attrition-driver capture, optional/voluntary, confidentiality), feeding clearance completion and ER/analytics.

**Covers:** 27.24, 27.25
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/api/offboarding/exit-interviews/route.ts
- apps/web/src/app/dashboard/offboarding/exit-interview/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

## Acceptance Criteria To Verify

- [ ] Given a separation, when handover starts, then a handover template captures responsibilities/pending items and routes to a successor for acceptance.
- [ ] Given handover sign-off, when completed, then it satisfies the manager clearance item.
- [ ] Given an exit interview, when conducted, then structured reason-for-leaving and feedback are captured and coded.
- [ ] Given exit-interview confidentiality, when configured, then sensitive feedback is access-restricted and aggregated for analytics.
- [ ] Given any handover/exit-interview event, when stored, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `handover` (items, successor, signoff), `exit_interview` (reason_code, responses) entities.
- [ ] Backend: clearance linkage + analytics feed.
- [ ] Frontend: handover form + exit-interview questionnaire.
- [ ] Rules/Config: configurable handover/interview templates and reason-code library.
- [ ] Alerts/Workflow: handover routing + exit-interview scheduling.
- [ ] Tests: integration (handover→clearance), unit (reason coding).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
