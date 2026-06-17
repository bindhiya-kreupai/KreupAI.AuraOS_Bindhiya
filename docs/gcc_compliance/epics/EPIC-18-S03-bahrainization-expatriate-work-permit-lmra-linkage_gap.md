# Gap Analysis: EPIC-18-S03 — Bahrainization & expatriate work-permit (LMRA) linkage

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-18-chapter-18-bahrainization-compliance.md](./EPIC-18-chapter-18-bahrainization-compliance.md)
> Parent epic: EPIC-18: Chapter 18 – Bahrainization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**User story:** PRO / Immigration Officer, **I want** the Bahrainization ratio linked to LMRA expatriate work-permit quota eligibility, **so that** I know whether we can issue or renew expat permits before applying.

**Description**
Connects the Bahrainization ratio to LMRA work-permit quotas: evaluates whether the current/projected ratio supports requested expatriate permit issuance/renewals, flags permit actions that would be blocked or constrained by a shortfall, and shows the Bahrainis needed to unlock a permit quota.

**Covers:** 18.5
**Acceptance criteria count:** 5 · **Task count:** 6

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

- [ ] Given the current ratio and target, when a permit issuance/renewal is requested, then eligibility (permitted/blocked/constrained) is shown with the reason.
- [ ] Given a shortfall, when evaluated, then the additional Bahrainis required to unlock the requested quota are computed.
- [ ] Given a pending permit batch, when the ratio would drop below target after hiring expats, then a warning is raised before submission.
- [ ] Given config, then the permit-quota rules linking ratio to allowance are configurable.
- [ ] Given audit, then each eligibility evaluation is logged with inputs.

## Implementation Tasks From Backlog

- [ ] Backend: `bahrainization_permit_eligibility` entity (`entityId`, `requestedPermits`, `ratioAtCheck`, `eligibility`, `bahrainisNeeded`).
- [ ] Backend: ratio-to-quota eligibility service linked to immigration permit requests.
- [ ] Frontend: permit-eligibility indicator within the permit request flow.
- [ ] Rules/Config: configurable ratio-to-permit-quota rules.
- [ ] Alerts/Workflow: pre-submission warning on quota-impacting permit batches.
- [ ] Tests: integration tests for permitted/blocked/constrained outcomes.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
