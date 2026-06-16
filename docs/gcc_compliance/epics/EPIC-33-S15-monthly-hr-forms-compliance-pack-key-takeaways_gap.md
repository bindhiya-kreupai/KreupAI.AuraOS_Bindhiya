# Gap Analysis: EPIC-33-S15 — Monthly HR forms compliance pack & key takeaways

> Source epic: [EPIC-33-chapter-33-hr-forms-and-templates.md](./EPIC-33-chapter-33-hr-forms-and-templates.md)
> Parent epic: EPIC-33: Chapter 33 – HR Forms and Templates
> Module: Forms
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** a one-click monthly HR forms compliance pack plus an in-product best-practice guide, **so that** I have signed monthly evidence of forms governance and teams adopt the engine correctly.

**Description**
Assembles the Monthly HR Forms Compliance Pack (forms library snapshot, version currency, submission/approval stats, audit-checklist results, red-flags, with a management certificate for sign-off and archival) and captures the chapter's key takeaways as an in-product best-practice/adoption guide.

**Covers:** 33.44, 33.45
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given month-end, when the pack is generated, then it compiles library snapshot, KPIs, audit-checklist results and red-flags into one document.
- [ ] Given the pack, then a management certificate is included for e-signature and the signed pack is archived with retention.
- [ ] Given regeneration, then the pack is reproducible for any prior period with point-in-time data.
- [ ] Given admins, then an in-product key-takeaways/best-practice guide for forms governance is available.

## Implementation Tasks From Backlog

- [ ] Backend: monthly pack assembler + PDF export; best-practice content store.
- [ ] Frontend: pack generation + certificate sign-off; in-product guide.
- [ ] Rules/Config: pack contents and certificate template per entity.
- [ ] Alerts/Workflow: month-end pack-due reminder.
- [ ] Tests: e2e (pack generation + sign-off + archive).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
