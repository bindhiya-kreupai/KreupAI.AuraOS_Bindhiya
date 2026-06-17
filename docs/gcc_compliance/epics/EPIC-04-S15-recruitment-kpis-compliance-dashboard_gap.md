# Gap Analysis: EPIC-04-S15 — Recruitment KPIs & compliance dashboard

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-04-chapter-4-recruitment-selection-compliance.md](./EPIC-04-chapter-4-recruitment-selection-compliance.md)
> Parent epic: EPIC-04: Chapter 4 – Recruitment & Selection Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**User story:** Executive / Leadership, **I want** recruitment KPIs and a compliance dashboard, **so that** hiring efficiency and compliance posture are visible in real time.

**Description**
Delivers recruitment KPIs (time-to-fill, time-to-hire, cost-per-hire, offer-acceptance rate, source effectiveness, national-hire ratio, pipeline conversion) and a compliance dashboard surfacing control status (JD-bias flags, BGV/eligibility clearance rates, nationalization progress, privacy/retention compliance, agency-licence validity). Filterable by country/entity/department with export.

**Covers:** 4.18, 4.19
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx
- apps/web/src/app/(modules)/recruitment/job-requisition/page.tsx
- apps/web/src/app/api/recruitment/interviews/feedback/route.ts
- apps/web/src/app/api/recruitment/interviews/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given the KPI view, when opened, then time-to-fill, cost-per-hire, acceptance rate and national-hire ratio render with trend.
- [ ] Given the compliance dashboard, when opened, then BGV/eligibility clearance, bias flags, nationalization gap and privacy status are shown.
- [ ] Given filters, when applied, then all tiles recompute by country/entity/department/period.
- [ ] Given a threshold breach (e.g., time-to-fill > target), when detected, then it is highlighted.
- [ ] Given RBAC, when viewed, then data is scoped to authorised entities; export available.

## Implementation Tasks From Backlog

- [ ] Backend: recruitment KPI aggregation views + compliance-status service.
- [ ] Backend: export service (PDF/Excel).
- [ ] Frontend: KPI + compliance dashboards with filters.
- [ ] Rules/Config: KPI targets and compliance thresholds per entity.
- [ ] Alerts/Workflow: threshold-breach alerts.
- [ ] Tests: unit (KPI calc) + integration (filter scoping/export).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
