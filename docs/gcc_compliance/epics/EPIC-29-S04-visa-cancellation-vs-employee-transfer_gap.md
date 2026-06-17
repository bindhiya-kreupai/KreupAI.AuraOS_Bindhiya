# Gap Analysis: EPIC-29-S04 — Visa Cancellation vs Employee Transfer

> **✅ SHIPPED 2026-06-17** — Themes G + H closure. HSE registers (SafetyOfficer · HeatStressRule · ToolboxTalk · EmergencyDrill · FirstAidStation · WelfareInspection) + visa-exit deep gaps (TRANSFER PRO chain seed · per-dependent register · benefits closure cascade · bilingual comm templates). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**User story:** PRO / Immigration Officer, **I want** the exit case to distinguish and correctly handle visa/permit cancellation versus transfer/release to a new sponsor, **so that** the right authority steps, consents and evidence are applied for each path.

**Description**
Branches the exit path: full cancellation (work-permit cancellation + residence cancellation, exit/grace handling) versus transfer/release (sponsorship transfer to a new employer, e.g. UAE work-permit transfer, KSA Qiwa transfer, Bahrain LMRA transfer) where the residence may continue under the new sponsor. Captures required consents/NOCs, ban implications, and produces the correct task set and evidence requirements for each path with country-specific rules.

**Covers:** 29.7
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts
- apps/web/src/app/dashboard/(modules)/visa-permits/page.tsx
- apps/web/src/lib/services/visa-permit.service.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given an exit case, when the path is set to cancellation or transfer, then the appropriate country-specific task set and document requirements are applied.
- [ ] Given a transfer, when processed, then transfer consent/NOC, new-sponsor details and any transfer eligibility/ban rules are captured and validated.
- [ ] Given a cancellation, when processed, then work-permit and residence cancellation steps and any labour-ban implications are tracked.
- [ ] Given the chosen path, then dependent-visa and grace-period handling (S05/S06) adjust accordingly.
- [ ] Given any path action, then it is audited with the authority and reference captured.

## Implementation Tasks From Backlog

- [ ] Backend: cancellation vs transfer branch on `immig_exit_case` with path-specific task sets
- [ ] Backend: transfer consent/NOC + ban-rule validation per country
- [ ] Frontend: path selector + cancellation/transfer detail panels
- [ ] Rules/Config: per-country cancellation vs transfer rules, ban implications
- [ ] Tests: unit tests for both paths across countries

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
