# Gap Analysis: EPIC-27-S11 — Visa, Work Permit & Immigration Closure

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 8
**User story:** PRO / Immigration Officer, **I want** visa/work-permit cancellation orchestrated as part of separation, **so that** the employee's status is closed on time to avoid overstay fines and labour bans.

**Description**
Triggers and tracks immigration closure (EPIC-29): work-permit/visa cancellation, dependent-visa impact, grace-period tracking, repatriation/air-ticket where due, and signed cancellation acknowledgement, ensuring closure timing aligns with final settlement and last working day.

**Covers:** 27.20
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts
- apps/web/src/app/dashboard/(modules)/visa-permits/page.tsx
- apps/web/src/lib/services/visa-permit.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given a separation, when finalised, then a visa/work-permit cancellation task is created and tracked to authority confirmation (EPIC-29).
- [ ] Given dependent visas, when present, then their impact and required actions are surfaced.
- [ ] Given grace-period/overstay risk, when applicable, then alerts fire (e.g. at grace-period start and before expiry) to avoid fines/bans.
- [ ] Given repatriation/air-ticket entitlement, when due, then it is included in benefits/settlement closure.
- [ ] Given any immigration-closure event, when processed, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: immigration-closure trigger + status tracker integrating EPIC-29.
- [ ] Backend: dependent-impact + repatriation-entitlement evaluation.
- [ ] Frontend: immigration-closure tracker within separation case.
- [ ] Rules/Config: per-country cancellation steps, grace periods and repatriation rules.
- [ ] Alerts/Workflow: grace-period/overstay alerts; PRO task routing.
- [ ] Tests: integration (trigger→tracking), unit (dependent/repatriation logic).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
