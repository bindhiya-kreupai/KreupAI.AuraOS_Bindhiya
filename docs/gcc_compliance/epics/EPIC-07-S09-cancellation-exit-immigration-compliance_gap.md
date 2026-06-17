# Gap Analysis: EPIC-07-S09 — Cancellation & exit immigration compliance

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-07-chapter-7-immigration-work-authorization-c.md](./EPIC-07-chapter-7-immigration-work-authorization-c.md)
> Parent epic: EPIC-07: Chapter 7 – Immigration & Work Authorization Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**User story:** PRO / Immigration Officer, **I want** to process visa/work-permit cancellation and immigration exit with grace-period control, **so that** departures are compliant, sponsorship obligations end correctly and overstays/absconding are avoided.

**Description**
On separation, run the immigration cancellation workflow: work-permit cancellation, residence-visa cancellation, dependent-visa cancellation, ID surrender, exit/grace-period tracking and (where relevant) absconding reporting. Link to final settlement (cancellation often gates final pay/EOSB) and capture authority cancellation evidence.

**Covers:** 7.11
**Acceptance criteria count:** 6 · **Task count:** 6

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

- [ ] Given a separation trigger, when cancellation starts, then employee and dependent permits/visas are queued for cancellation in the correct order.
- [ ] Given visa cancellation, when completed, then a grace period timer starts and is alerted before lapse (overstay risk).
- [ ] Given a country cancellation-before-final-settlement rule, when configured, then final settlement is gated until cancellation evidence exists.
- [ ] Given absconding/abandonment, when reported, then the authority report and status are recorded.
- [ ] Given dependents, when the sponsor's visa is cancelled, then dependent cancellations are enforced.
- [ ] Given audit, then all cancellation steps and authority evidence are logged.

## Implementation Tasks From Backlog

- [ ] Backend: `immigration_cancellation` (employee_id, scope, status, grace_until, evidence) + workflow.
- [ ] Backend: ordered-cancellation + grace-period + settlement-gate service.
- [ ] Frontend: cancellation/exit processing screen.
- [ ] Rules/Config: per-country cancellation order, grace periods & settlement-gate rules.
- [ ] Alerts/Workflow: grace-period/overstay alerts; settlement-gate hook to EPIC-29.
- [ ] Tests: ordering, grace-timer, gating tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
