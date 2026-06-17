# Gap Analysis: EPIC-27-S05 — Redundancy & Restructuring

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Should · **Estimate:** 5

**Description**
Handles redundancy: define a restructuring program, apply objective selection criteria, run consultation/notification steps, manage redundancy entitlements/enhanced packages, and batch-create separation cases that flow into clearance, settlement and statutory closures.

**Covers:** 27.9
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

- [ ] Given a redundancy program, when created, then affected roles/positions and selection criteria are recorded.
- [ ] Given selection, when applied, then the rationale per employee is captured to defend fairness.
- [ ] Given consultation/notification requirements, when configured, then steps are tracked to completion.
- [ ] Given redundancy entitlement, when computed, then any enhanced package flows into final settlement.
- [ ] Given any program/selection event, when stored, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `redundancy_program`, `redundancy_selection` entities + batch separation-case creation.
- [ ] Backend: entitlement/enhancement feed to settlement.
- [ ] Frontend: program setup, selection grid, consultation tracker.
- [ ] Rules/Config: per-country consultation/notification and entitlement rules.
- [ ] Alerts/Workflow: consultation-step reminders + approvals.
- [ ] Tests: integration (batch creation), unit (selection rationale capture).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
