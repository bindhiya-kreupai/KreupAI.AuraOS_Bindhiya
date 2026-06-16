# Gap Analysis: EPIC-05-S12 — Employment contract preparation

> Source epic: [EPIC-05-chapter-5-offer-management-pre-employment-.md](./EPIC-05-chapter-5-offer-management-pre-employment-.md)
> Parent epic: EPIC-05: Chapter 5 – Offer Management & Pre-Employment Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**User story:** HR Manager, **I want** employment contracts prepared per country contract type with mandatory clauses, **so that** contracts comply with GCC labour law and authority templates before signing.

**Description**
Generates the employment contract per country contract type (e.g., MOHRE/Qiwa standard contract, fixed/unlimited term per current law), populating salary structure, benefits, probation, notice, working hours and mandatory statutory clauses. Supports bilingual (Arabic) output where mandated and alignment with the authority-registered contract, version-locked and gated on cleared pre-employment conditions.

**Covers:** 5.13
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

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a country and contract type, when prepared, then the correct template and mandatory clauses are applied.
- [ ] Given salary/benefits/probation/notice, when merged, then they match the approved offer and salary structure.
- [ ] Given a country requiring bilingual contracts, when generated, then an Arabic/bilingual version is produced.
- [ ] Given unmet mandatory pre-employment conditions, when contract finalisation is attempted, then it is blocked.
- [ ] Given any contract preparation/version, when performed, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `employment_contract` entity (countryCode, contractType, term, language, version, status) + migration.
- [ ] Backend: contract generation + clause/condition validation service.
- [ ] Frontend: contract preparation/preview screen.
- [ ] Rules/Config: per-country contract types, mandatory clauses, bilingual rules.
- [ ] Alerts/Workflow: block on unmet conditions; readiness-for-signature notification.
- [ ] Tests: unit (clause/condition validation) + integration (offer-data merge).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
