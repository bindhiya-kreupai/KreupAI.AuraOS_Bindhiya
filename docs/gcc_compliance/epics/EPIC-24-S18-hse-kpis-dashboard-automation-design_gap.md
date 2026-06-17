# Gap Analysis: EPIC-24-S18 — HSE KPIs, dashboard & automation design

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 5
**User story:** Executive / Leadership, **I want** an HSE KPI dashboard with automation, **so that** I can monitor injury rates, training, permits, incidents and compliance in real time.

**Description**
Deliver HSE KPIs (LTIFR/TRIR, near-miss count, training compliance %, open corrective actions, permit compliance, midday-break violations) on a dashboard, plus the automation design (event-driven training/PPE checks, expiry alerts, permit gating, incident escalation).

**Covers:** 24.24, 24.26, 24.27
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Minimal Evidence

**Existing implementation evidence**

- apps/web/src/services/authService.ts
- apps/web/src/services/searchService.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given the dashboard, when opened, then it shows LTIFR/TRIR, near-misses, training compliance %, open corrective actions and expiring certificates by site/country.
- [ ] Given a KPI breach (e.g. training compliance below threshold, rising injury rate), then it is highlighted red and drillable.
- [ ] Given automation design, then event-driven triggers (training due, certificate expiry, incident, permit) auto-create tasks per the documented flow.
- [ ] Given RBAC, then dashboard scope respects site/country and sensitive medical data is role-restricted.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation views (LTIFR/TRIR etc.); automation event handlers
- [ ] Frontend: HSE dashboard with drill-downs
- [ ] Rules/Config: KPI thresholds + dashboard RBAC scope
- [ ] Alerts/Workflow: automation triggers wiring
- [ ] Tests: integration (KPI accuracy) + e2e (drill-down RBAC)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
