# Gap Analysis: EPIC-16-S10 — GPSSA & Emiratisation alignment / reconciliation

> Source epic: [EPIC-16-chapter-16-emiratisation-compliance.md](./EPIC-16-chapter-16-emiratisation-compliance.md)
> Parent epic: EPIC-16: Chapter 16 – Emiratisation Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** counted UAE nationals reconciled against GPSSA registrations and contribution salaries, **so that** the numerator matches what the pension authority sees.

**Description**
A reconciliation engine matching each counted national to a GPSSA record, comparing contribution-account salary vs. payroll salary, and flagging unregistered, salary-mismatched or de-registered nationals. Feeds both the genuineness score (S06) and the gap register.

**Covers:** 16.12
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx
- apps/web/src/app/api/compliance/nitaqat/route.ts
- apps/web/src/app/dashboard/payroll-compliance/nitaqat/page.tsx
- apps/web/src/lib/services/compliance/**tests**/nitaqat.service.test.ts
- apps/web/src/lib/services/compliance/nitaqat.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given counted nationals, when reconciled, then each is matched to a GPSSA registration or flagged "not registered."
- [ ] Given a GPSSA contribution salary differing from payroll salary beyond tolerance, when detected, then a variance flag with amounts is raised.
- [ ] Given a GPSSA de-registration, when detected, then the national is removed from the numerator and a checkpoint alert is raised.
- [ ] Given reconciliation results, then they are exportable and linked to the evidence pack and fake-Emiratisation engine.
- [ ] Given tolerance config, then the salary-match tolerance is configurable per country.

## Implementation Tasks From Backlog

- [ ] Backend: GPSSA reconciliation service joining numerator to GPSSA registration/contribution data.
- [ ] Backend: `emiratisation_gpssa_recon` entity (`employeeId`, `gpssaStatus`, `gpssaSalary`, `payrollSalary`, `variance`, `flag`).
- [ ] Frontend: reconciliation grid with variance highlights.
- [ ] Rules/Config: configurable salary-match tolerance.
- [ ] Tests: integration tests for unregistered/mismatch/de-registration cases.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
