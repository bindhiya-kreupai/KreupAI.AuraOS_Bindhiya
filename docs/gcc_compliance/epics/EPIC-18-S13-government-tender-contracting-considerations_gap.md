# Gap Analysis: EPIC-18-S13 — Government tender & contracting considerations

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3

**Description**
A tender-eligibility module holding tender Bahrainization requirements (minimum ratio/certificate) and evaluating the entity's current position against each, flagging shortfalls and the additional Bahrainis needed to qualify.

**Covers:** 18.15
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

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given a tender with a minimum Bahrainization requirement, when checked, then meets/does-not-meet status is shown with the gap.
- [ ] Given a shortfall, when evaluated, then the additional Bahrainis needed to qualify are computed.
- [ ] Given a won/active contract with an ongoing requirement, when the ratio drops below it, then a contract-compliance alert is raised.
- [ ] Given config, then tender requirements are configurable per tender/contract.
- [ ] Given audit, then each eligibility evaluation is logged.

## Implementation Tasks From Backlog

- [ ] Backend: `tender_bahrainization_requirement` entity (`tenderId`, `minRatio`, `certificateRequired`) + eligibility evaluation.
- [ ] Frontend: tender-eligibility view with meets/gap status.
- [ ] Rules/Config: configurable per-tender requirements.
- [ ] Alerts/Workflow: ratio-drop alert on active contracts.
- [ ] Tests: integration tests for meets/shortfall and active-contract drop.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
