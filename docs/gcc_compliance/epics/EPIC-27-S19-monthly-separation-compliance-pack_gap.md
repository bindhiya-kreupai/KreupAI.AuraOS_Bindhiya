# Gap Analysis: EPIC-27-S19 — Monthly Separation Compliance Pack

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** an auto-generated monthly separation compliance pack, **so that** management and auditors receive a certified separation summary.

**Description**
Generates a periodic pack consolidating separations by type, settlement timeliness, EOSB summary, visa-cancellation and social-insurance/benefits closure status, clearance completion, overstay/penalty incidents, audit-checklist results and risk-matrix highlights, with management certification and export (PDF/Excel).

**Covers:** 27.33
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given period close, when generated, then all sections populate from live data.
- [ ] Given the pack, when reviewed, then a manager certifies it with e-signature and timestamp.
- [ ] Given export, when requested, then PDF/Excel outputs are stored in the document store.
- [ ] Given sensitive content, when packaged, then aggregate views protect individual identities per privacy rules.
- [ ] Given generation/certification, when completed, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: pack assembler + certification entity + export service + monthly scheduler.
- [ ] Frontend: pack preview and certification screen.
- [ ] Rules/Config: configurable sections per country/entity.
- [ ] Alerts/Workflow: certification reminder + distribution.
- [ ] Tests: integration (assembly+export), unit (certification audit).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
