# Gap Analysis: EPIC-28-S14 — EOSB Audit Checklist & Risk Matrix

> **✅ SHIPPED 2026-06-17** — Theme C closure. Generic `ComplianceAuditChecklistItem` + `ComplianceRiskRegisterEntry` register with `domainCode` discriminator (ER · DISCIPLINARY · SEPARATION · EOSB · VISA_EXIT) + per-domain seeds + L × I → band auto-derivation. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md).

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Should · **Estimate:** 5

**Description**
Provides a configurable EOSB audit checklist (rule-version correctness, salary-basis correctness, service-period accuracy, resignation/termination treatment applied, unpaid-leave adjustment, social-insurance netting, maker-checker on settlement, provision reconciliation, dispute handling) and a risk matrix seeded with common EOSB risks (wrong day-rate, mis-applied resignation reduction, stale rule version, under-provisioning, missing funded-balance netting, late settlement). System red-flags auto-create findings; risks tracked with likelihood/impact/owner/mitigation and a heatmap.

**Covers:** 28.21, 28.23
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; externalize country-specific rules into versioned config; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the checklist, when run for a period/sample, then each item is scored Pass/Fail/NA with evidence links to calculations.
- [ ] Given system red-flags (override without note, stale rule version, settlement without approval, provision mismatch), then they auto-create findings.
- [ ] Given the risk matrix, then each risk has likelihood, impact, score, owner, mitigation, with a heatmap.
- [ ] Given a failed item, then a corrective action can be raised and tracked to closure.
- [ ] Given RBAC, only Internal Auditor / Compliance Officer may edit templates and risks.

## Implementation Tasks From Backlog

- [ ] Backend: `eosb_audit_checklist_template` + `eosb_audit_result` + `eosb_risk` entities
- [ ] Backend: red-flag-to-finding generator
- [ ] Frontend: checklist runner + risk heatmap
- [ ] Alerts/Workflow: corrective-action raise and reminders
- [ ] Tests: unit tests for scoring and auto-findings

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
