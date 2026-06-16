# Gap Analysis: EPIC-07-S13 — Immigration risk matrix & red-flag register

> Source epic: [EPIC-07-chapter-7-immigration-work-authorization-c.md](./EPIC-07-chapter-7-immigration-work-authorization-c.md)
> Parent epic: EPIC-07: Chapter 7 – Immigration & Work Authorization Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** an immigration risk matrix with red-flag detection and a risk register, **so that** authorization risks are scored, tracked and remediated before they cause penalties.

**Description**
Maintain a configurable risk register seeded with immigration risks (expired/expiring permits, occupation mismatch, illegal work location, overstay/grace breach, absconding, dependent lapse, missing documents). Auto-create entries from red-flag detectors, score likelihood × impact into a heat-map, and track corrective actions to closure.

**Covers:** 7.15
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

- confirm/add tenant-scoped schema or config; add tests; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a detected red flag (e.g. expired permit, overstay), when triggered, then a risk-register entry is created with severity.
- [ ] Given a risk entry, when scored, then likelihood × impact yields a rating and heat-map position.
- [ ] Given a corrective action, when assigned, then owner, due date and status are tracked to closure.
- [ ] Given the risk matrix, when filtered by country/entity, then it updates with current ratings.
- [ ] Given export, then the risk register exports for review.

## Implementation Tasks From Backlog

- [ ] Backend: `immigration_risk_register` (risk, likelihood, impact, rating, action, status) + red-flag detectors.
- [ ] Backend: scoring + heat-map computation.
- [ ] Frontend: risk matrix/heat-map + register view.
- [ ] Rules/Config: configurable scoring + seeded risks.
- [ ] Tests: detector + scoring tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
