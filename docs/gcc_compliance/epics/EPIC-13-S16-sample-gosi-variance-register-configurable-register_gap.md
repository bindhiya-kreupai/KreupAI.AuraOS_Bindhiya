# Gap Analysis: EPIC-13-S16 — Sample GOSI Variance Register (Configurable Register)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-13-chapter-13-gosi-compliance.md](./EPIC-13-chapter-13-gosi-compliance.md)
> Parent epic: EPIC-13: Chapter 13 – GOSI Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 3
**User story:** Payroll Officer, **I want** a configurable GOSI Variance Register capturing every reconciliation discrepancy with status tracking, **so that** variances are explained, actioned, and closed with an audit trail.

**Description**
A digital register listing each GOSI variance (employee, type, declared vs payroll value, amount, period, root cause, action, owner, status) fed automatically from reconciliation and editable for resolution notes. Supports filtering, ageing, and export, and feeds the monthly compliance pack and audit checklist.

**Covers:** 13.21
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx
- apps/mobile/src/services/benefits.service.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given reconciliation variances, when generated, then each is recorded in the register with type, amounts, period, owner, and Open status.
- [ ] Given a variance, when resolved, then root cause, corrective action, and resolution date are captured and status moves to Closed.
- [ ] Given ageing, when a variance stays Open beyond the threshold, then it is escalated and flagged.
- [ ] Given filters (type, status, period, entity, owner), when applied, then the register updates and exports to Excel/PDF.
- [ ] Given any register edit, then it is written to the audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: `gosi_variance_register` view/entity linking to `gosi_variance` with resolution fields
- [ ] Backend: ageing + escalation logic
- [ ] Frontend: variance register grid with filters, status workflow, export
- [ ] Alerts/Workflow: ageing escalation to HR/Compliance Manager
- [ ] Tests: unit tests for ageing/escalation and status transitions

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
