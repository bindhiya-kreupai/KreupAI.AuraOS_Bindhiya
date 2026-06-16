# Gap Analysis: EPIC-05-S10 — Pre-employment background verification finalisation

> Source epic: [EPIC-05-chapter-5-offer-management-pre-employment-.md](./EPIC-05-chapter-5-offer-management-pre-employment-.md)
> Parent epic: EPIC-05: Chapter 5 – Offer Management & Pre-Employment Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 3
**User story:** Compliance Officer, **I want** background-verification status confirmed as a joining condition, **so that** any pre-employment BGV is cleared before contract and joining.

**Description**
Finalises the BGV initiated in EPIC-04 within the offer context: confirms all required checks are Cleared (or that approved exceptions are documented), links BGV outcome to the conditional-offer condition (S05), and blocks contract/joining if BGV is unresolved. Avoids duplicating EPIC-04 BGV mechanics — this story is the offer-side gate and reconciliation.

**Covers:** 5.11
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

- [ ] Given an offer case, when reviewed, then the linked EPIC-04 BGV status is displayed (cleared/pending/discrepant).
- [ ] Given a pending/discrepant BGV, when contract/joining is attempted, then it is blocked.
- [ ] Given a BGV discrepancy, when accepted via exception, then approval and justification are recorded.
- [ ] Given BGV Cleared, when confirmed, then the related offer condition (S05) is auto-marked met.
- [ ] Given any BGV confirmation/exception, when made, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: BGV-reconciliation service linking EPIC-04 `bgv_case` to `offer_condition`.
- [ ] Backend: joining-gate enforcement on BGV status.
- [ ] Frontend: BGV status panel on offer case with exception capture.
- [ ] Rules/Config: BGV-exception approval authority per entity.
- [ ] Alerts/Workflow: escalation on unresolved BGV at joining.
- [ ] Tests: integration (gate block) + unit (condition auto-mark).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
