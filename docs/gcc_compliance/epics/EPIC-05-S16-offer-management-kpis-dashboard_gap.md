# Gap Analysis: EPIC-05-S16 — Offer management KPIs & dashboard

> Source epic: [EPIC-05-chapter-5-offer-management-pre-employment-.md](./EPIC-05-chapter-5-offer-management-pre-employment-.md)
> Parent epic: EPIC-05: Chapter 5 – Offer Management & Pre-Employment Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**User story:** Executive / Leadership, **I want** offer-management KPIs and a dashboard, **so that** offer throughput, acceptance and pre-employment compliance are visible in real time.

**Description**
Delivers offer KPIs (offer cycle time, approval TAT, offer-to-acceptance rate, decline reasons, conditional-offer clearance rate, pre-employment-gate completion, time-to-join) and a dashboard surfacing pending approvals, expiring offers, blocked joiners and country control status. Filterable by country/entity/department with export.

**Covers:** 5.17
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

- [ ] Given the KPI view, when opened, then offer cycle time, approval TAT and acceptance rate render with trend.
- [ ] Given the dashboard, when opened, then pending approvals, expiring offers and blocked-joiner reasons are shown.
- [ ] Given filters, when applied, then all tiles recompute by country/entity/department/period.
- [ ] Given a threshold breach (e.g., approval TAT > target), when detected, then it is highlighted.
- [ ] Given RBAC, when viewed, then data is scoped to authorised entities; export available.

## Implementation Tasks From Backlog

- [ ] Backend: offer KPI aggregation views + dashboard service.
- [ ] Backend: export service (PDF/Excel).
- [ ] Frontend: offer KPI + status dashboard with filters.
- [ ] Rules/Config: KPI targets and thresholds per entity.
- [ ] Alerts/Workflow: threshold-breach alerts.
- [ ] Tests: unit (KPI calc) + integration (filter scoping/export).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
