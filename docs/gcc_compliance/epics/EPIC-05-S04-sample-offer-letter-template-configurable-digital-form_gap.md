# Gap Analysis: EPIC-05-S04 — Sample offer-letter template (configurable digital form)

> Source epic: [EPIC-05-chapter-5-offer-management-pre-employment-.md](./EPIC-05-chapter-5-offer-management-pre-employment-.md)
> Parent epic: EPIC-05: Chapter 5 – Offer Management & Pre-Employment Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 3
**User story:** HR Admin, **I want** a configurable sample offer-letter template library, **so that** standardised, compliant offer templates can be maintained and reused per country/entity.

**Description**
Delivers the chapter's sample offer-letter template as a configurable digital template with placeholders, clause blocks, country variants and an export. Maintained by HR with version control and approval; consumed by the generation engine in S03. Includes the standard GCC clause set (title, comp, benefits, probation, notice, governing law, conditions).

**Covers:** 5.21
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/recruitment/offer-management/templates/page.test.tsx
- apps/web/src/app/dashboard/recruitment/offer-management/templates/page.tsx
- apps/web/src/components/recruitment/OfferLetterPreview.tsx
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

- [ ] Given the template library, when a template is created, then placeholders, clause blocks and country variant are defined.
- [ ] Given a template, when published, then it is version-controlled and available to S03 generation.
- [ ] Given a country variant, when required, then bilingual/Arabic clause blocks are supported.
- [ ] Given a template, when exported, then a sample/preview document is produced.
- [ ] Given any template change, when saved, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `offer_template` entity (clauses, placeholders, country, version, status) + migration.
- [ ] Backend: template publish/version service + export.
- [ ] Frontend: template builder with clause blocks and preview.
- [ ] Rules/Config: standard GCC clause catalogue and country variants.
- [ ] Alerts/Workflow: template approval routing.
- [ ] Tests: unit (placeholder validation) + integration (export/preview).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
