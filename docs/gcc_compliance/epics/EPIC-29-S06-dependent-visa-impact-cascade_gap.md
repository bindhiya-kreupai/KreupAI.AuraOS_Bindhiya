# Gap Analysis: EPIC-29-S06 — Dependent Visa Impact Cascade

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**User story:** PRO / Immigration Officer, **I want** the impact on dependent visas handled when the principal's visa is cancelled or transferred, **so that** sponsored family members are cancelled/transferred in the correct sequence and not left in overstay.

**Description**
Links the principal employee's exit to their dependents' visas (from EPIC-07): on cancellation, dependents must typically be cancelled first/in sequence; on transfer, dependents may move under the new sponsor or require separate handling. AuraOS lists all linked dependents, enforces the correct cancellation/transfer sequence, computes dependent grace periods, and tracks each dependent's closure with its own evidence.

**Covers:** 29.10
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

- [ ] Given a principal exit, when the case is created, then all linked dependents and their visa records are listed.
- [ ] Given a cancellation, when processed, then the required dependent-first/sequenced cancellation is enforced and tracked per dependent.
- [ ] Given a transfer, when processed, then dependents are flagged for move-under-new-sponsor or separate handling per the configured rule.
- [ ] Given dependents, then each has its own grace period and closure status feeding the register and dashboard.
- [ ] Given any dependent action, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: dependent linkage on `immig_exit_case` + per-dependent closure tracking
- [ ] Backend: sequencing enforcement (dependents before/with principal per rule)
- [ ] Frontend: dependents panel with per-dependent status and grace period
- [ ] Rules/Config: per-country dependent cancellation/transfer sequencing
- [ ] Tests: unit tests for sequencing and per-dependent grace periods

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
