# Gap Analysis: EPIC-04-S04 — Recruitment agency compliance & vendor control

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-04-chapter-4-recruitment-selection-compliance.md](./EPIC-04-chapter-4-recruitment-selection-compliance.md)
> Parent epic: EPIC-04: Chapter 4 – Recruitment & Selection Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** recruitment agencies onboarded and controlled, **so that** only licensed agencies are used and no banned fees are charged to candidates.

**Description**
Maintains an agency register with licence/permit details, validity, country approval, fee terms and a no-candidate-fee attestation (candidate-paid recruitment fees are prohibited in GCC). Restricts requisition assignment to compliant, in-date agencies and tracks agency-sourced candidate performance.

**Covers:** 4.7
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

- [ ] Given an agency, when onboarded, then licence number, validity, jurisdiction and fee model are captured with documents.
- [ ] Given an agency with an expired/invalid licence, when assignment is attempted, then it is blocked.
- [ ] Given an agency engagement, when created, then a no-candidate-fee attestation is required and stored.
- [ ] Given a licence nearing expiry, when within 60/30/7 days, then an alert is raised.
- [ ] Given any agency change, when saved, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `recruitment_agency` + `agency_engagement` entities (licenceNo, validTo, jurisdiction, feeModel, attestation) + migration.
- [ ] Backend: agency-eligibility validation service.
- [ ] Frontend: agency register and engagement screen.
- [ ] Rules/Config: country agency-licensing and fee-prohibition rules.
- [ ] Alerts/Workflow: 60/30/7-day licence-expiry alerts.
- [ ] Tests: unit (eligibility) + integration (blocked expired agency).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
