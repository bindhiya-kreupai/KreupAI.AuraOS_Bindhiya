# Gap Analysis: EPIC-14-S02 — Employer Responsibilities & Compliance Calendar

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-14-chapter-14-gpssa-compliance.md](./EPIC-14-chapter-14-gpssa-compliance.md)
> Parent epic: EPIC-14: Chapter 14 – GPSSA Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 3
**User story:** Compliance Officer, **I want** GPSSA employer duties encoded as a recurring obligation calendar, **so that** registration, monthly contribution, updates, transfers and exits are tracked to deadline.

**Description**
Models employer GPSSA obligations (register establishment, register eligible nationals on time, declare correct account salary, pay contributions by the statutory monthly deadline, update salary changes, handle transfers and exits) as trackable obligations with owners, SLAs, and alert schedules driving the worklist and dashboard.

**Covers:** 14.5
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx
- apps/mobile/src/services/benefits.service.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given the GPSSA obligation set, when configured, then each duty has owner role, frequency, and statutory due-day.
- [ ] Given a monthly cycle, when the deadline approaches, then alerts fire at 7/3/1 days to the Payroll Officer and Compliance Officer.
- [ ] Given an overdue obligation, then it is flagged red and escalated to HR Manager.
- [ ] Given any obligation change, then it is written to the audit trail.
- [ ] Given RBAC, only Compliance Officer / System Administrator may edit the calendar.

## Implementation Tasks From Backlog

- [ ] Backend: `gpssa_obligation` entity (code, ownerRole, frequency, dueDayOfMonth, slaDays, alertOffsets[])
- [ ] Backend: scheduler emitting obligation events
- [ ] Frontend: GPSSA obligation calendar + worklist
- [ ] Alerts/Workflow: 7/3/1-day alerts + overdue escalation
- [ ] Tests: integration test for alerts/escalation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
