# Gap Analysis: EPIC-27-S18 — Separation KPIs, Dashboard & Automation Design

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Should · **Estimate:** 8

**Description**
Builds separation analytics (KPIs: attrition rate by type, average time-to-settlement, % settled within statutory window, visa-cancellation timeliness, clearance cycle time, overstay/penalty incidents, EOSB dispute rate, voluntary vs involuntary mix) and an interactive dashboard with country/entity drill-down, underpinned by an event-driven automation blueprint (case orchestration, gates, alerts, escalation).

**Covers:** 27.29, 27.31, 27.32
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given separation data, when the dashboard loads, then KPIs render with country/entity/period filters and drill-down.
- [ ] Given late-settlement/overstay/dispute metrics, when present, then they are highlighted with trends.
- [ ] Given the automation design, when configured, then case orchestration, gates and escalations run on events from the event bus.
- [ ] Given RBAC, when a viewer lacks rights, then individual case detail is masked while aggregate KPIs remain.
- [ ] Given KPI computation, when run, then figures reconcile with the separation register.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation + materialised views; automation rules on event bus.
- [ ] Backend: dashboard APIs with RBAC masking.
- [ ] Frontend: separation dashboard (KPI cards, trends, drill-down).
- [ ] Rules/Config: KPI thresholds and automation triggers.
- [ ] Alerts/Workflow: dashboard alerts for breaches/spikes.
- [ ] Tests: integration (KPI reconciliation), e2e (filters + masking).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
