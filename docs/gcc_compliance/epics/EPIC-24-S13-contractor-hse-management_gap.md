# Gap Analysis: EPIC-24-S13 — Contractor HSE management

> **✅ SHIPPED 2026-06-17** — Themes E + F + I closure. Workforce extensions: ContractorAssignment (cross-domain), EmployeeLoanSchedule (amortized), UniformPpeIssuance register, AccommodationTransportRoute / Clinic / MaintenanceTicket (SLA-tracked). BenefitCatalogue extended with EDUCATION / RELOCATION / WELLNESS_EAP. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 5
**User story:** HSE Manager, **I want** to govern contractor HSE compliance, **so that** contractor workers meet the same safety standards and contractor performance is tracked.

**Description**
Extend HSE to contractors: pre-qualification (HSE plan, training, insurance), site induction, permit participation, incident attribution, and contractor HSE scorecards for procurement decisions.

**Covers:** 24.19
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Minimal Evidence

**Existing implementation evidence**

- apps/web/src/services/authService.ts
- apps/web/src/services/searchService.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given a contractor, when onboarded, then HSE pre-qualification (plan, training records, insurance) is verified before site access.
- [ ] Given a contractor worker, when on site, then required induction/training/PPE are verified and gaps block access.
- [ ] Given a contractor-attributed incident, then it is recorded against the contractor's HSE scorecard.
- [ ] Given poor contractor HSE performance, then it is flagged for procurement review.
- [ ] Given any contractor HSE record, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `contractor_hse_profile`, `contractor_hse_score`, `contractor_induction` schema
- [ ] Backend: pre-qualification + scorecard service
- [ ] Frontend: contractor HSE register + scorecard
- [ ] Rules/Config: pre-qualification + induction requirements per country
- [ ] Alerts/Workflow: access-block on gaps; procurement flag
- [ ] Tests: integration (induction gating + scorecard)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
