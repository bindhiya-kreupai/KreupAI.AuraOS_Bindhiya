# Gap Analysis: EPIC-32-S15 — Sample policy register, acknowledgement form & exception request form

> Source epic: [EPIC-32-chapter-32-hr-policies.md](./EPIC-32-chapter-32-hr-policies.md)
> Parent epic: EPIC-32: Chapter 32 – HR Policies
> Module: Policies
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Should · **Estimate:** 3

**Description**
Builds three sample artefacts as configurable digital forms/registers driven by live engine data: the HR Policy Register (all policies, owner, version, effective date, review date, ack coverage), the Policy Acknowledgement Form, and the Policy Exception Request Form — each exportable to PDF/Excel.

**Covers:** 32.29, 32.30, 32.31
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given the policy register, then it lists every policy with code, owner, current version, effective/review dates and acknowledgement coverage, and exports to PDF/Excel.
- [ ] Given the acknowledgement form, then it renders the policy, version and signer block and produces a signed record bound to the version.
- [ ] Given the exception request form, then it captures policy, clause, scope, justification and validity and submits into the exception workflow (S10).
- [ ] Given any export, then it is watermarked with generation timestamp and generated-by for audit.

## Implementation Tasks From Backlog

- [ ] Backend: register query + form definitions reusing the configurable forms engine (EPIC-33).
- [ ] Backend: PDF/Excel export service.
- [ ] Frontend: register view + acknowledgement form + exception form.
- [ ] Rules/Config: column/field configuration per entity.
- [ ] Tests: integration (register accuracy, export, form → workflow submission).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
