# Gap Analysis: EPIC-13-S02 — Employer Responsibilities & Compliance Calendar

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-13-chapter-13-gosi-compliance.md](./EPIC-13-chapter-13-gosi-compliance.md)
> Parent epic: EPIC-13: Chapter 13 – GOSI Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 3
**User story:** Compliance Officer, **I want** GOSI employer responsibilities encoded as a recurring obligation calendar with owners and deadlines, **so that** nothing (registration, monthly contribution, salary updates, exits) is missed.

**Description**
Models the employer's statutory GOSI duties as trackable obligations: register new joiners promptly, declare correct wages, pay contributions by the statutory monthly deadline, update salary changes, and de-register leavers. Each obligation has an owner, SLA, and alert schedule that drives the worklist and dashboard.

**Covers:** 13.5
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

- [ ] Given the GOSI obligation set, when configured, then each duty (register, declare, pay, update, exit) has an owner role, frequency, and statutory due-day.
- [ ] Given a monthly cycle, when the due-day approaches, then alerts fire at 7/3/1 days before the GOSI payment deadline to the assigned Payroll Officer and Compliance Officer.
- [ ] Given an overdue obligation, when the deadline passes, then it is flagged red on the dashboard and escalated to HR Manager.
- [ ] Given any obligation status change, then it is captured in the audit trail.
- [ ] Given RBAC, only Compliance Officer / System Administrator may edit the obligation calendar.

## Implementation Tasks From Backlog

- [ ] Backend: `gosi_obligation` entity (code, ownerRole, frequency, dueDayOfMonth, slaDays, alertOffsets[])
- [ ] Backend: scheduler job emitting obligation events to the event bus
- [ ] Frontend: GOSI obligation calendar + worklist component
- [ ] Alerts/Workflow: 7/3/1-day notifications and overdue escalation to HR Manager
- [ ] Tests: integration test for alert firing and escalation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
