# Gap Analysis: EPIC-27-S07 — Abandonment / Absconding / Unauthorized Absence

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5
**User story:** PRO / Immigration Officer, **I want** to manage abandonment/absconding cases with the correct legal and immigration steps, **so that** unauthorized absence is handled lawfully and overstay/penalty risk is controlled.

**Description**
Handles unauthorized absence escalating to abandonment/absconding: track consecutive absence days, trigger warning/return-to-work notices at statutory thresholds, manage absconding declaration to the authority, and link to immigration absconding/cancellation procedures (EPIC-29) and final-settlement implications.

**Covers:** 27.12
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given consecutive unauthorized absence, when thresholds are reached (configurable, e.g. 7 consecutive days), then escalation notices and an absconding-eligibility flag are raised.
- [ ] Given an absconding declaration, when initiated, then the authority-reporting step and required evidence are tracked.
- [ ] Given an absconding case, when declared, then immigration absconding/cancellation actions are triggered to EPIC-29.
- [ ] Given final-settlement implications, when applicable, then forfeiture/withholding rules per country are applied with justification.
- [ ] Given any abandonment event, when processed, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `absence_escalation`, `absconding_case` entities + threshold-trigger service consuming attendance events.
- [ ] Backend: immigration-trigger emitter + settlement-implication flags.
- [ ] Frontend: absconding case workspace + notice generation.
- [ ] Rules/Config: per-country absence thresholds, reporting and settlement rules.
- [ ] Alerts/Workflow: escalation notices + authority-reporting reminders.
- [ ] Tests: integration (threshold→escalation→immigration trigger), unit (settlement flags).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
