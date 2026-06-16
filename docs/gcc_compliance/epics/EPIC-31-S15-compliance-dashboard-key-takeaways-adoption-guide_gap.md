# Gap Analysis: EPIC-31-S15 — Compliance dashboard key takeaways & adoption guide

> Source epic: [EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md](./EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md)
> Parent epic: EPIC-31: Chapter 31 – HR Compliance Dashboard and Controls
> Module: Analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Could · **Estimate:** 1

**Description**
A lightweight, configurable in-app guidance panel summarising the chapter's key takeaways (what each dashboard means, how RAG/scoring works, the corrective-action and certification loop), surfaced contextually on each dashboard.

**Covers:** 31.31
**Acceptance criteria count:** 3 · **Task count:** 3

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx
- apps/web/src/app/dashboard/analytics/custom-reports/page.tsx
- apps/web/src/app/dashboard/analytics/drill-down-reports/page.tsx
- apps/web/src/app/dashboard/analytics/report-builder/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given a dashboard, when the help panel is opened, then it shows that dashboard's purpose, RAG meaning, and recommended actions.
- [ ] Given the key-takeaways content, when updated by an admin, then changes are versioned and reflected without code change.
- [ ] Given a first-time user, when they land on the executive dashboard, then a short guided overview is offered.

## Implementation Tasks From Backlog

- [ ] Backend: configurable `DashboardGuidance` content store (versioned).
- [ ] Frontend: contextual help/takeaways panel and first-time overview.
- [ ] Tests: unit test for guidance versioning; e2e for help-panel display.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
