# Gap Analysis: EPIC-05-S15 — Country-specific pre-employment control matrix

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-05-chapter-5-offer-management-pre-employment-.md](./EPIC-05-chapter-5-offer-management-pre-employment-.md)
> Parent epic: EPIC-05: Chapter 5 – Offer Management & Pre-Employment Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a configurable country-specific pre-employment control matrix, **so that** the required pre-employment steps adapt automatically to country, nationality and role.

**Description**
Implements a rule-driven control matrix mapping each GCC country (and nationality where relevant) to its mandatory pre-employment controls — documents, attestations, medical tests, work-permit steps, contract type and BGV requirements. The matrix configures the gates used by S05–S12 so a single source of truth governs what must be true before joining.

**Covers:** 5.16
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

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a country and nationality, when an offer case opens, then the matrix derives the applicable mandatory controls.
- [ ] Given a control matrix entry, when updated, then dependent gates (documents/medical/work-permit/contract) reflect the change.
- [ ] Given a control not applicable, when evaluated, then it is excluded from gating for that case.
- [ ] Given a matrix, when viewed, then required steps per country/nationality render side by side.
- [ ] Given any matrix change, when saved, then it is version-controlled and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `pre_employment_control_matrix` entity (countryCode, nationality, controlType, mandatory) + migration.
- [ ] Backend: matrix-resolution service feeding S05–S12 gates.
- [ ] Frontend: control-matrix configuration and comparison view.
- [ ] Rules/Config: per-country/nationality control definitions via rule engine.
- [ ] Alerts/Workflow: notify on matrix change affecting open cases.
- [ ] Tests: unit (resolution) + integration (gate reconfiguration).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
