# Gap Analysis: EPIC-05-S09 — Pre-employment documentation collection

> Source epic: [EPIC-05-chapter-5-offer-management-pre-employment-.md](./EPIC-05-chapter-5-offer-management-pre-employment-.md)
> Parent epic: EPIC-05: Chapter 5 – Offer Management & Pre-Employment Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**User story:** HR Admin, **I want** pre-employment documents collected and validated against a country checklist, **so that** all mandatory documents are present, valid and attested before joining.

**Description**
Manages the pre-employment document checklist per country/nationality (passport, photo, attested certificates, prior-employment papers, visa/entry docs, qualification attestation). Captures uploads, validates expiry/attestation, flags missing items and gates contract/joining until the mandatory set is complete.

**Covers:** 5.10
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

- confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a country/nationality, when the case opens, then the correct document checklist is generated.
- [ ] Given an uploaded document, when validated, then expiry and attestation status are checked.
- [ ] Given a missing/expired mandatory document, when contract/joining is attempted, then it is blocked.
- [ ] Given a document, when stored, then it is filed against the candidate in the document store with access control.
- [ ] Given any document action, when performed, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `pre_employment_document` entity (type, mandatory, expiry, attested, status, docId) + migration.
- [ ] Backend: checklist-generation + completeness-gate service.
- [ ] Frontend: document collection screen with checklist and upload.
- [ ] Rules/Config: per-country/nationality document matrices.
- [ ] Alerts/Workflow: missing-document reminders; joining gate.
- [ ] Tests: unit (completeness logic) + integration (expiry/attestation checks).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
