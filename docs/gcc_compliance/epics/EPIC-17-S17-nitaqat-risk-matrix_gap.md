# Gap Analysis: EPIC-17-S17 — Nitaqat risk matrix

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** a configurable Nitaqat risk matrix scoring likelihood × impact, **so that** I can prioritise mitigation of band/compliance risks.

**Description**
A configurable risk register/matrix capturing Nitaqat risks (band downgrade, artificial-Saudization exposure, Saudi attrition, evidence/profession-localization gaps, certificate expiry) with likelihood, impact, owner, mitigation and residual risk, rendered as a heatmap.

**Covers:** 17.19
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

- [ ] Given a risk, when scored, then likelihood × impact yields a rating on the heatmap.
- [ ] Given mitigations, then residual risk recomputes and is tracked.
- [ ] Given linked data (e.g., open artificial-Saudization flags, projected band drop), then relevant risks update automatically.
- [ ] Given config, then scales/thresholds are editable.

## Implementation Tasks From Backlog

- [ ] Backend: `nitaqat_risk` entity (`title`, `likelihood`, `impact`, `owner`, `mitigation`, `residual`).
- [ ] Frontend: risk matrix heatmap with drill-down.
- [ ] Rules/Config: configurable scales/thresholds.
- [ ] Tests: unit tests for rating/residual.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
