# Gap Analysis: EPIC-04-S10 — Background verification management

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-04-chapter-4-recruitment-selection-compliance.md](./EPIC-04-chapter-4-recruitment-selection-compliance.md)
> Parent epic: EPIC-04: Chapter 4 – Recruitment & Selection Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** background verification tracked as a gating control, **so that** education, employment, criminal and reference checks are completed and cleared before offer.

**Description**
Tracks background-verification (BGV) cases per candidate with consent capture, check types (education, prior employment, criminal/police clearance, references, professional licences), vendor/result and overall clearance status. BGV completion is a stage-gate to offer; discrepancies route to review. Candidate consent is mandatory before any check.

**Covers:** 4.13
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/recruitment/background-verification/page.tsx
- apps/web/src/app/dashboard/recruitment/background-verification/page.test.tsx
- apps/web/src/app/dashboard/recruitment/background-verification/page.tsx
- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC.

## Acceptance Criteria To Verify

- [ ] Given a candidate, when BGV starts, then explicit consent is captured before any check is initiated.
- [ ] Given configured check types, when run, then each result (clear/discrepant/pending) is recorded with evidence.
- [ ] Given a discrepancy, when found, then the case routes to review and blocks offer progression.
- [ ] Given all checks clear, when complete, then BGV status = Cleared and the offer gate opens.
- [ ] Given any BGV access/change, when performed, then it is audit-logged (sensitive-data access tracked).

## Implementation Tasks From Backlog

- [ ] Backend: `bgv_case` + `bgv_check` entities (type, vendor, result, consentDocId, status) + migration.
- [ ] Backend: BGV gating service tied to offer stage-gate.
- [ ] Frontend: BGV tracker with consent capture and discrepancy review.
- [ ] Rules/Config: mandatory check types per country/role.
- [ ] Alerts/Workflow: discrepancy escalation; BGV-overdue alerts.
- [ ] Tests: unit (gate logic) + integration (consent enforcement, offer block).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
