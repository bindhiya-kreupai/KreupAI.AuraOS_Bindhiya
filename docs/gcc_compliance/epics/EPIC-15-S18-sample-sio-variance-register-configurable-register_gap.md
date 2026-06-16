# Gap Analysis: EPIC-15-S18 — Sample SIO Variance Register (Configurable Register)

> Source epic: [EPIC-15-chapter-15-bahrain-sio-compliance.md](./EPIC-15-chapter-15-bahrain-sio-compliance.md)
> Parent epic: EPIC-15: Chapter 15 – Bahrain SIO Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 3
**User story:** Payroll Officer, **I want** a configurable SIO Variance Register capturing every reconciliation discrepancy with status tracking, **so that** variances are explained, actioned and closed with an audit trail.

**Description**
A digital register listing each SIO variance (employee, type, declared vs payroll value, amount, period, root cause, action, owner, status) fed automatically from reconciliation and LMRA-alignment, editable for resolution. Supports filtering, ageing and export, feeding the monthly pack and audit checklist.

**Covers:** 15.22
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

- [ ] Given reconciliation/alignment variances, when generated, then each is recorded with type, amounts, period, owner and Open status.
- [ ] Given a variance, when resolved, then root cause, corrective action and resolution date are captured and status moves to Closed.
- [ ] Given ageing beyond threshold, then it is escalated and flagged.
- [ ] Given filters (type, status, period, entity, owner), then the register updates and exports to Excel/PDF.
- [ ] Given any edit, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `sio_variance_register` view/entity with resolution fields (incl. LMRA-mismatch type)
- [ ] Backend: ageing + escalation logic
- [ ] Frontend: register grid with filters, status workflow, export
- [ ] Alerts/Workflow: ageing escalation to HR/Compliance Manager
- [ ] Tests: unit tests for ageing/escalation and status transitions

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
