# Gap Analysis: EPIC-29-S10 — Immigration Exit ↔ Benefits Closure

> **✅ SHIPPED 2026-06-17** — Themes G + H closure. HSE registers (SafetyOfficer · HeatStressRule · ToolboxTalk · EmergencyDrill · FirstAidStation · WelfareInspection) + visa-exit deep gaps (TRANSFER PRO chain seed · per-dependent register · benefits closure cascade · bilingual comm templates). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5

**Description**
Triggers benefits closure from the exit case: cancel medical insurance (principal + dependents) effective from the correct date, vacate accommodation, stop benefit allowances, recover assets, and align with the air-ticket/repatriation handling. Captures closure confirmations from benefit vendors/EPIC-22 and ensures any benefit-related recoveries flow to final settlement.

**Covers:** 29.14
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

## Acceptance Criteria To Verify

- [ ] Given an exit, when closure runs, then medical insurance (principal + dependents) is cancelled effective from the configured date and confirmation captured.
- [ ] Given accommodation/allowances/assets, then each is closed/recovered with status tracked.
- [ ] Given a transfer (not full exit), then benefit closures adjust per the configured rule (some may continue under new sponsor handover).
- [ ] Given benefit recoveries, then they are passed to final settlement.
- [ ] Given any benefits-closure action, then it is audited and feeds the exit completeness score.

## Implementation Tasks From Backlog

- [ ] Backend: benefits-closure trigger consuming EPIC-22 (insurance, accommodation, allowances, assets)
- [ ] Backend: recovery hand-off to final settlement
- [ ] Frontend: benefits-closure panel within the exit case
- [ ] Rules/Config: effective-date and transfer-vs-cancel closure rules
- [ ] Tests: unit tests for closure dates and recovery hand-off

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
