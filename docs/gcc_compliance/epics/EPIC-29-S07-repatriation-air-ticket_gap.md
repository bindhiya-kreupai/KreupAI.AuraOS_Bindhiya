# Gap Analysis: EPIC-29-S07 — Repatriation & Air Ticket

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5

**Description**
Manages the repatriation duty: determines air-ticket entitlement per country/contract/policy and separation type (e.g. employer-provided return ticket unless the employee resigns to join another local employer), captures destination, ticket class, booking/cost or cash-in-lieu, links to benefits closure, and records proof of repatriation. Feeds the final settlement and benefits-closure stories.

**Covers:** 29.11
**Acceptance criteria count:** 5 · **Task count:** 5

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

- [ ] Given an exit case, when evaluated, then air-ticket/repatriation entitlement is determined per country/contract/policy and separation type.
- [ ] Given entitlement, when actioned, then destination, class, booking reference or cash-in-lieu amount and cost are captured.
- [ ] Given no entitlement (e.g. transfer to local employer), then it is recorded with reason and no ticket cost is raised.
- [ ] Given repatriation, then proof (boarding/confirmation) can be attached and the obligation marked complete.
- [ ] Given the ticket cost or cash-in-lieu, then it is passed to final settlement/payroll and audited.

## Implementation Tasks From Backlog

- [ ] Backend: `immig_repatriation` entity (caseId, entitlement, destination, ticketRef, cost/cashInLieu, proofRef, status)
- [ ] Backend: entitlement rule evaluation + hand-off to final settlement/benefits
- [ ] Frontend: repatriation panel with entitlement, booking and proof
- [ ] Rules/Config: per-country/contract air-ticket entitlement rules
- [ ] Tests: unit tests for entitlement determination and settlement hand-off

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
