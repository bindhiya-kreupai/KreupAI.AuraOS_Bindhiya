# Gap Analysis: EPIC-07-S12 — Immigration compliance KPIs & dashboard

> Source epic: [EPIC-07-chapter-7-immigration-work-authorization-c.md](./EPIC-07-chapter-7-immigration-work-authorization-c.md)
> Parent epic: EPIC-07: Chapter 7 – Immigration & Work Authorization Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5

**Description**
Compute KPIs (% workforce with valid authorization, documents expiring in 60/30/7 days, on-time renewal rate, overdue renewals, occupation-mismatch count, cancellation-on-time rate, grace-period overstays) and present a filterable dashboard with trends, drill-down and expiry heat windows.

**Covers:** 7.14
**Acceptance criteria count:** 5 · **Task count:** 4

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

- confirm/add tenant-scoped schema or config; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given document data, when KPIs compute, then validity, expiry-window and renewal metrics reflect current data with filters.
- [ ] Given the dashboard, when filtered by country/entity/PRO, then values, trends and at-risk lists update.
- [ ] Given a KPI threshold breach, then the metric is visually flagged.
- [ ] Given drill-down, then underlying documents/employees list (RBAC-respecting).
- [ ] Given refresh, then KPIs update on schedule/events.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation queries + metrics API.
- [ ] Frontend: immigration dashboard with filters, trends, drill-down, expiry windows.
- [ ] Rules/Config: KPI thresholds per entity.
- [ ] Tests: KPI calculation tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
