# Gap Analysis: EPIC-16-S04 — Mid-year and year-end compliance checkpoints

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** automated mid-year and year-end checkpoint tracking with escalating alerts, **so that** we never miss a MOHRE compliance date and can act before penalties trigger.

**Description**
Configurable checkpoint calendar (mid-year and year-end statutory dates) that, at each checkpoint, snapshots the target/achievement position, evaluates pass/shortfall, and raises tiered alerts at 90/60/30/7 days before the date. A locked, immutable snapshot is stored as evidence at each checkpoint.

**Covers:** 16.6
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts
- apps/web/src/lib/services/compliance/nitaqat.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given the configured checkpoint dates, when 90/60/30/7 days remain, then tiered alerts go to Compliance/HR Manager/Executive per escalation rules.
- [ ] Given a checkpoint date is reached, when processed, then an immutable snapshot of denominator, target, current count and gap is stored.
- [ ] Given a shortfall at a checkpoint, when detected, then the gap and projected fine exposure are flagged and a corrective action is auto-created.
- [ ] Given a passed checkpoint, then the snapshot is marked compliant and linked to the evidence pack.
- [ ] Given checkpoint dates change by regulation, then they are updated in config without code change.

## Implementation Tasks From Backlog

- [ ] Backend: `emiratisation_checkpoint` entity (`entityId`, `period`, `checkpointType`, `dueDate`, `snapshotId`, `status`).
- [ ] Backend: checkpoint scheduler + immutable snapshot writer (event-bus driven).
- [ ] Frontend: checkpoint timeline with status and countdown.
- [ ] Rules/Config: configurable checkpoint calendar and 90/60/30/7-day alert tiers.
- [ ] Alerts/Workflow: escalating notifications + auto corrective-action creation on shortfall.
- [ ] Tests: scheduler tests for alert tiers and snapshot immutability.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
