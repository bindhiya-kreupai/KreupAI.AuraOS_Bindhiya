# Gap Analysis: EPIC-27-S16 — Separation Data Privacy

> **✅ SHIPPED 2026-06-17** — Themes J + K closure. Structural extensions: job architecture API surface (reuses existing JobFamily/JobProfile models), SalaryGradeBand, DelegationOfAuthority with resolveLevel helper, PayrollCalendarControl + PayrollVarianceEntry, FatigueRule with breachesRule helper, OvertimeFraudFlag (6 signals), EosSioFundingLink, ReturnToWorkPlan, HolidayCalendarChangeRequest (maker-checker), RedundancyBatch, SeparationRetentionPolicy, DocumentPhysicalLocation, AuditFindingRiskLink. Plus service-only closures: unified BH/OM/KW wage-file generator (EPIC-11-S05), grievance mediation states (EPIC-25-S04), classification RBAC helper canReadRecord (EPIC-30-S07), country rollup helper rollupByCountry (EPIC-31-S04), executive RBAC scopes canViewExecutiveDomain (EPIC-31-S14). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 3
**User story:** Compliance Officer, **I want** data-privacy controls over separation records, **so that** leaver data is retained, minimised and disposed lawfully.

**Description**
Implements data-privacy controls for separation: retention scheduling per record type/country, access restriction post-exit, minimisation, subject-access/correction handling, and lawful retention of records needed for EOSB disputes/labour claims, with controlled disposal/anonymisation at retention end.

**Covers:** 27.27
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

- [ ] Given separation records, when stored, then retention periods per record type/country are applied.
- [ ] Given a post-exit access, when attempted, then only authorised roles access records and access is logged.
- [ ] Given retention end, when reached, then disposal/anonymisation is scheduled and audited, respecting any litigation hold.
- [ ] Given a subject-access/correction request, when received, then a controlled workflow handles it.
- [ ] Given any privacy action, when performed, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: retention/disposal scheduler + access-restriction layer + litigation-hold guard.
- [ ] Backend: subject-access export with redaction.
- [ ] Frontend: privacy-request handler + retention view.
- [ ] Rules/Config: per-country retention periods and lawful-basis tags.
- [ ] Alerts/Workflow: retention-due alerts.
- [ ] Tests: integration (retention + hold), unit (access logging).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
