# Gap Analysis: EPIC-22-S16 — Benefits audit checklist & risk matrix

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 5
**User story:** Internal Auditor, **I want** a configurable benefits audit checklist and risk matrix, **so that** I can verify compliance, flag red flags and maintain a benefits risk register.

**Description**
Provide a digital audit checklist (mandatory cover present, no expired policies, deduction caps respected, consent captured) and a configurable risk matrix/register with likelihood×impact scoring and red-flag rules driven from live benefit data.

**Covers:** 22.22, 22.24
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx
- apps/mobile/src/services/benefits.service.ts
- apps/web/src/**tests**/e2e/benefits/benefits-enrollment.e2e.test.ts
- apps/web/src/**tests**/security/dependency-audit.test.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the audit checklist, when run, then each item auto-evaluates against live data where possible (e.g. "all mandatory-cover employees insured") and flags fails.
- [ ] Given the risk matrix, when configured, then risks are scored likelihood×impact and rated low/medium/high with owners and mitigations.
- [ ] Given a red-flag rule (e.g. expired medical policy, loan deduction > legal cap), when triggered, then a risk-register entry is auto-created.
- [ ] Given a completed audit, then results are timestamped, signed off and exportable.
- [ ] Given any checklist/risk change, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `benefit_audit_checklist`, `benefit_risk_register` schema with scoring
- [ ] Backend: red-flag rule engine over benefit data
- [ ] Frontend: audit checklist runner + risk matrix/heatmap
- [ ] Rules/Config: checklist items, red-flag thresholds, scoring bands
- [ ] Tests: unit (auto-evaluation/scoring)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
