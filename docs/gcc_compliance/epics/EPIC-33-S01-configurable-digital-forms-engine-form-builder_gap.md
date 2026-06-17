# Gap Analysis: EPIC-33-S01 — Configurable digital forms engine (form builder)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-33-chapter-33-hr-forms-and-templates.md](./EPIC-33-chapter-33-hr-forms-and-templates.md)
> Parent epic: EPIC-33: Chapter 33 – HR Forms and Templates
> Module: Forms
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 13
**User story:** System Administrator, **I want** a configurable form builder with field types, validation, conditional logic and versioning, **so that** HR can create and change any HR form without code.

**Description**
Delivers the heart of the epic: a drag-and-drop form definition engine with field types (text, number, date, dropdown, lookup-to-employee, file upload, signature), per-field validation, conditional show/hide, sections, multi-language labels, and immutable form versioning. All later form-group stories instantiate definitions in this engine. This addresses the chapter's introduction and objectives by replacing ad-hoc forms with one governed platform.

**Covers:** 33.1, 33.2
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given the builder, when an admin adds fields, then they can set type, label (multi-language), required flag, validation rule and default, and reorder via drag-and-drop.
- [ ] Given conditional logic, then a field can be shown/hidden or made required based on another field's value.
- [ ] Given a published form, when it is edited, then a new version is created and in-flight submissions stay on their original version.
- [ ] Given validation, then a submission failing a required/format/range rule is rejected with field-level errors and never persists partial data.
- [ ] Given RBAC, then only Form Authors can build/publish; field-level permissions can restrict who sees/edits sensitive fields.

## Implementation Tasks From Backlog

- [ ] Backend: `form_definition` (formCode, category, ownerId, status, currentVersionId), `form_version` (versionNo, schemaJson, status), `form_submission` (formVersionId, data, status) entities + migration.
- [ ] Backend: schema validation + conditional-logic evaluation service.
- [ ] Frontend: drag-and-drop form builder (admin portal) and dynamic form renderer.
- [ ] Rules/Config: reusable validation rule library and field-type registry.
- [ ] Alerts/Workflow: hook points for routing (consumed by S03).
- [ ] Tests: unit (validation, conditional logic), integration (versioning isolation), e2e (build → render → submit).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
