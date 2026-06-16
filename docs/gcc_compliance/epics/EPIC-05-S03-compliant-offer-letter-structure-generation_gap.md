# Gap Analysis: EPIC-05-S03 — Compliant offer-letter structure & generation

> Source epic: [EPIC-05-chapter-5-offer-management-pre-employment-.md](./EPIC-05-chapter-5-offer-management-pre-employment-.md)
> Parent epic: EPIC-05: Chapter 5 – Offer Management & Pre-Employment Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**User story:** HR Admin, **I want** offer letters generated from compliant, country-specific templates, **so that** every issued offer contains mandatory terms and is version-controlled.

**Description**
Generates offer letters from configurable templates per country/entity with mandatory components (job title, grade, salary structure, benefits, probation, notice, conditions, validity/expiry). Merges approved offer data, version-locks the issued document, supports bilingual output where required, and only allows issuance after final approval (S02).

**Covers:** 5.5
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/recruitment/OfferLetterPreview.tsx
- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx
- apps/web/src/app/(modules)/recruitment/job-requisition/page.tsx
- apps/web/src/app/api/recruitment/interviews/feedback/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given an approved offer, when generated, then mandatory components are populated and missing ones block generation.
- [ ] Given a country, when generating, then the correct template (and Arabic/bilingual version where required) is used.
- [ ] Given an issued offer letter, when sent, then it is version-locked with an expiry/validity date.
- [ ] Given edits after issue, when required, then a new version supersedes the prior with audit trail.
- [ ] Given any generation/issue action, when performed, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `offer_letter` entity (templateId, version, expiryDate, language, status) + merge service.
- [ ] Backend: document generation (PDF) with version lock.
- [ ] Frontend: offer-letter preview/issue screen.
- [ ] Rules/Config: per-country offer templates and mandatory-component rules.
- [ ] Alerts/Workflow: issuance notification; expiry reminder.
- [ ] Tests: unit (mandatory-component validation) + integration (versioning).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
