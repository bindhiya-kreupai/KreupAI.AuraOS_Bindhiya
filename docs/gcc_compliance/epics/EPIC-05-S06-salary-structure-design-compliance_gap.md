# Gap Analysis: EPIC-05-S06 — Salary structure design & compliance

> Source epic: [EPIC-05-chapter-5-offer-management-pre-employment-.md](./EPIC-05-chapter-5-offer-management-pre-employment-.md)
> Parent epic: EPIC-05: Chapter 5 – Offer Management & Pre-Employment Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**User story:** HR Manager, **I want** to design compliant salary structures for the offer, **so that** basic/allowance splits, minimum-wage and WPS-relevant components meet country labour-law and grade-band rules.

**Description**
Builds the offer's salary structure from configurable components (basic, housing, transport, other allowances), validates against grade/salary band (EPIC-09), country minimum-wage/national-wage rules and the basic-to-gross ratios that drive EOSB and WPS. Ensures the structure is WPS-payable and feeds the offer letter and contract.

**Covers:** 5.7
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx
- apps/web/src/app/(modules)/recruitment/job-requisition/page.tsx
- apps/web/src/app/api/recruitment/interviews/feedback/route.ts
- apps/web/src/app/api/recruitment/interviews/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a grade, when a structure is built, then components validate against the band min/mid/max.
- [ ] Given a country, when a structure is built, then minimum-wage/national-wage and basic-ratio rules are enforced via the rule engine.
- [ ] Given EOSB/WPS relevance, when components are set, then the EOSB-eligible basic and WPS-payable gross are flagged correctly.
- [ ] Given an out-of-band component, when entered, then an approval flag is raised.
- [ ] Given any salary-structure change, when saved, then it is audit-logged and carried to offer letter/contract.

## Implementation Tasks From Backlog

- [ ] Backend: `salary_structure` + `salary_component` entities (componentType, amount, eosbEligible, wpsPayable) + migration.
- [ ] Backend: structure-validation service (band, minimum wage, basic ratio).
- [ ] Frontend: salary-structure designer with live validation.
- [ ] Rules/Config: per-country minimum-wage, basic-ratio and band rules.
- [ ] Alerts/Workflow: out-of-band approval flag.
- [ ] Tests: unit (validation rules) + integration (feed to offer letter).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
