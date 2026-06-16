# Gap Analysis: EPIC-16-S17 — Emiratisation risk matrix

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** a configurable Emiratisation risk matrix scoring likelihood × impact, **so that** I can prioritise mitigation of the biggest compliance risks.

**Description**
A configurable risk register/matrix capturing Emiratisation risks (shortfall at checkpoint, fake-Emiratisation exposure, national attrition, evidence gaps) with likelihood, impact, owner, mitigation and residual risk, rendered as a heatmap.

**Covers:** 16.19
**Acceptance criteria count:** 4 · **Task count:** 4

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

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a risk, when scored, then likelihood × impact yields a rating placed on the heatmap.
- [ ] Given mitigations, then residual risk recomputes and is tracked.
- [ ] Given linked data (e.g., open fake-Emiratisation flags), then relevant risks update automatically.
- [ ] Given config, then likelihood/impact scales and thresholds are editable.

## Implementation Tasks From Backlog

- [ ] Backend: `emiratisation_risk` entity (`title`, `likelihood`, `impact`, `owner`, `mitigation`, `residual`).
- [ ] Frontend: risk matrix heatmap with drill-down.
- [ ] Rules/Config: configurable scales/thresholds.
- [ ] Tests: unit tests for rating/residual calculation.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
