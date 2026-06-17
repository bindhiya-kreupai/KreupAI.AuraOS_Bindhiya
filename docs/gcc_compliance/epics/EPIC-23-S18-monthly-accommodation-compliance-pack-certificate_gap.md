# Gap Analysis: EPIC-23-S18 — Monthly accommodation compliance pack & certificate

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-23-chapter-23-accommodation-and-labour-camp-c.md](./EPIC-23-chapter-23-accommodation-and-labour-camp-c.md)
> Parent epic: EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance
> Module: Welfare
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** to generate a monthly accommodation compliance pack with a sign-off certificate, **so that** management can certify accommodation compliance and auditors/authorities have dated evidence.

**Description**
Auto-compile a monthly pack (occupancy, inspections, certificates, complaints, corrective actions, cost) with the Sample Accommodation Monthly Compliance Certificate and a key-takeaways summary, generated from live data with management certification.

**Covers:** 23.31, 23.32, 23.36
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given month-end, when the pack is generated, then it includes occupancy, inspection results, certificate status, complaints and open corrective actions per site/entity.
- [ ] Given the compliance certificate, when signed, then it captures certifying officer, period, scope and is locked/audit-logged.
- [ ] Given an unresolved high-severity finding (e.g. occupancy breach, expired fire certificate), then certification is blocked or flagged until addressed.
- [ ] Given the pack, then it is versioned, exportable (PDF/Excel) and retained per retention policy.
- [ ] Given the key-takeaways summary, then it surfaces top risks and trend vs prior month.

## Implementation Tasks From Backlog

- [ ] Backend: `accommodation_compliance_pack`, `accommodation_compliance_certificate` schema
- [ ] Backend: pack generation + certification lock service
- [ ] Frontend: compliance pack viewer + certificate sign-off
- [ ] Rules/Config: certification gating rules
- [ ] Alerts/Workflow: month-end generation + sign-off workflow
- [ ] Tests: e2e (generate → certify → export)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
