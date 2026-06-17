# Gap Analysis: EPIC-29-S11 — Immigration Exit ↔ Social Insurance Closure

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** social-insurance de-registration triggered and reconciled as part of the immigration exit, **so that** GOSI/GPSSA/SIO records close in step with visa/permit closure and no contributions continue post-exit.

**Description**
Aligns immigration exit with social-insurance closure: triggers de-registration in the relevant scheme (GOSI/GPSSA/SIO) from the leaving date, reconciles that immigration cancellation and SI de-registration both occur (flagging mismatches such as cancelled-visa-but-still-in-GOSI), and surfaces the funded-gratuity/pension closure for EOSB. Ensures the two closures cannot drift apart.

**Covers:** 29.15
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

## Acceptance Criteria To Verify

- [ ] Given an exit, when initiated, then social-insurance de-registration is triggered from the leaving date in the relevant scheme.
- [ ] Given both processes, when reconciled, then mismatches (visa cancelled but SI active, or vice versa) are flagged and escalated.
- [ ] Given a transfer, then SI handling follows the configured transfer rule rather than full de-registration.
- [ ] Given closure, then the SI funded/pension status is exposed to EOSB.
- [ ] Given any SI-closure action, then it is audited and feeds the completeness score.

## Implementation Tasks From Backlog

- [ ] Backend: SI de-registration trigger + immigration↔SI reconciliation
- [ ] Backend: mismatch detection + escalation; expose SI status to EOSB
- [ ] Frontend: SI-closure panel within the exit case
- [ ] Rules/Config: scheme selection and transfer-vs-deregister rules
- [ ] Tests: unit tests for trigger, reconciliation and mismatch flag

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
