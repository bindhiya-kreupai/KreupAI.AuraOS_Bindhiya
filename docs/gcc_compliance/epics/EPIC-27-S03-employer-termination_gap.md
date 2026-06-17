# Gap Analysis: EPIC-27-S03 — Employer Termination

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5

**Description**
Handles employer termination (with-notice and summary/gross-misconduct), requiring lawful-ground citation, linkage to disciplinary case where applicable (EPIC-26), required approvals, notice or pay-in-lieu, and arbitrary-dismissal risk flagging, then drives clearance, settlement and statutory closures.

**Covers:** 27.7
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

- [ ] Given an employer termination, when initiated, then a lawful ground and required approval level are captured.
- [ ] Given a disciplinary-led dismissal, when linked, then EPIC-26 findings/grounds are imported and referenced.
- [ ] Given with-notice termination, when chosen, then notice or pay-in-lieu is computed per country.
- [ ] Given arbitrary-dismissal risk indicators, when present, then the case is flagged for compliance review before finalisation.
- [ ] Given any termination event, when stored, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `employer_termination` (ground, notice_type, pay_in_lieu, disciplinary_link) entity + ground-validation service.
- [ ] Backend: arbitrary-dismissal risk flagging.
- [ ] Frontend: termination decision screen with grounds/approval.
- [ ] Rules/Config: per-country lawful grounds, notice and pay-in-lieu rules.
- [ ] Alerts/Workflow: approval routing + compliance-review flag.
- [ ] Tests: integration (disciplinary import + notice), unit (risk flagging).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
