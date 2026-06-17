# Gap Analysis: EPIC-33-S05 — Employment forms group (offer letter, contract checklist, joining form)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-33-chapter-33-hr-forms-and-templates.md](./EPIC-33-chapter-33-hr-forms-and-templates.md)
> Parent epic: EPIC-33: Chapter 33 – HR Forms and Templates
> Module: Forms
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 8

**Description**
Delivers the employment form group: an Offer Letter template (merge-fields from offer data, e-signable), an Employment Contract Checklist (mandatory pre-employment/contract documents per country), and an Employee Joining Form that captures master data and creates the employee record (EPIC-06/08).

**Covers:** 33.9, 33.10, 33.11, 33.12
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

- [ ] Given the Offer Letter template, when generated, then offer data merges into the document, it is e-signable, and signed copies are archived.
- [ ] Given the Contract Checklist, then mandatory documents/clauses are listed by country (UAE/KSA/etc.) and the contract cannot be marked complete with missing mandatory items.
- [ ] Given the Joining Form, when approved, then validated master data creates/updates the employee record and triggers onboarding tasks.
- [ ] Given validation, then identifiers (Emirates ID/Iqama/CPR/QID, IBAN) are format-validated per country at capture.
- [ ] Given completion, then all actions are audited and documents stored to the employee file.

## Implementation Tasks From Backlog

- [ ] Backend: offer-letter merge service; checklist completeness engine; joining-form → employee write-back.
- [ ] Backend: country-specific ID/IBAN validators.
- [ ] Frontend: offer letter generator, contract checklist, joining form.
- [ ] Rules/Config: mandatory document matrix and ID formats per country.
- [ ] Alerts/Workflow: onboarding task trigger on joining-form approval.
- [ ] Tests: integration (merge, checklist completeness, write-back), unit (ID validators).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
