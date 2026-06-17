# Gap Analysis: EPIC-29-S05 — Grace Period Management & Register

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**User story:** PRO / Immigration Officer, **I want** post-cancellation grace periods tracked with countdown alerts and a grace-period register, **so that** overstay penalties are avoided and the employee's lawful stay window is managed.

**Description**
On cancellation, AuraOS computes the statutory grace period per country (e.g. configurable days after residence cancellation before overstay/fines begin), starts a countdown with alerts, tracks the employee's status within the window (departed / transferred / extended / overstayed), and maintains a configurable Grace Period Register. Overstay risk is escalated; the register feeds the dashboard and monthly pack.

**Covers:** 29.9, 29.26
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

- confirm/add tenant-scoped schema or config; add tests; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a cancellation, when residence is cancelled, then the country grace period is computed and a countdown started from the cancellation date.
- [ ] Given the countdown, when within configurable thresholds (e.g. 15/7/1 days remaining), then alerts fire to PRO and the employee/HR.
- [ ] Given the window, when the employee departs/transfers/extends, then status is updated; if it lapses, then "overstay risk" is flagged and escalated.
- [ ] Given the Grace Period Register, then it lists each case with cancellation date, grace days, days remaining, status and owner, and exports.
- [ ] Given any grace-period change, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `immig_grace_period` entity (caseId, cancellationDate, graceDays, dueDate, status) + countdown service
- [ ] Backend: overstay-risk detector + escalation
- [ ] Frontend: grace-period register grid with filters/export
- [ ] Rules/Config: per-country grace-period days + alert thresholds
- [ ] Alerts/Workflow: 15/7/1-day countdown alerts + overstay escalation
- [ ] Tests: unit tests for countdown, status transitions, overstay flag

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
