# Gap Analysis: EPIC-22-S18 — Monthly benefits compliance pack, certificate & exception register

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** to generate a monthly benefits compliance pack with a sign-off certificate and exception register, **so that** management can certify benefits compliance and auditors have dated evidence.

**Description**
Auto-compile a monthly pack (coverage status, renewals, exceptions, cost) with the Sample Benefits Monthly Compliance Certificate and the Sample Benefits Exception Register, plus a key-takeaways summary, generated from live data with management certification.

**Covers:** 22.27, 22.28, 22.29, 22.31
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/exception-handling/page.tsx
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- packages/@aura/database/src/seeds/22-benefits.seed.ts
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx
- apps/mobile/src/services/benefits.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; add tests; verify workflow approvals and audit events; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given month-end, when the pack is generated, then it includes coverage, renewals, exceptions, cost and KPI snapshot per entity.
- [ ] Given the compliance certificate, when signed, then it captures the certifying officer, period, scope and is locked/audit-logged.
- [ ] Given the exception register, then each exception records type, employee/benefit, reason, owner, status and resolution date, exportable.
- [ ] Given an unresolved high-severity exception, then certification is blocked or flagged until addressed.
- [ ] Given the pack, then it is versioned, exportable (PDF/Excel) and retained per retention policy.

## Implementation Tasks From Backlog

- [ ] Backend: `benefit_compliance_pack`, `benefit_compliance_certificate`, `benefit_exception` schema
- [ ] Backend: pack generation + certification lock service
- [ ] Frontend: compliance pack viewer, certificate sign-off, exception register
- [ ] Rules/Config: certification gating rules; exception severities
- [ ] Alerts/Workflow: month-end generation + sign-off workflow
- [ ] Tests: e2e (generate → certify → export)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
