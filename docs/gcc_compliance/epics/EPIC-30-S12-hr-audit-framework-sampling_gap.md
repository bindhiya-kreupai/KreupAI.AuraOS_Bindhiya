# Gap Analysis: EPIC-30-S12 — HR Audit Framework & Sampling

> Source epic: [EPIC-30-chapter-30-document-retention-and-hr-audit.md](./EPIC-30-chapter-30-document-retention-and-hr-audit.md)
> Parent epic: EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance
> Module: Compliance / Audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8

**Description**
Delivers the HR audit framework: configurable audit scopes (by module/domain — recruitment, payroll, WPS, social insurance, immigration, leave/attendance, benefits, HSE, ER/disciplinary, separation, documents), a sampling engine (random/risk-based/stratified sample selection over populations), an audit execution model linking samples to tests, and a findings register with severity, root cause, owner and corrective-action tracking to closure. This is the engine the audit checklist (S13) runs within.

**Covers:** 30.28
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/api/audit-logs/route.ts
- apps/web/src/app/api/security/audit-logs/route.ts
- apps/web/src/app/api/v1/admin/audit-log/export/route.ts
- apps/web/src/app/api/v1/ai-governance/model-cards/[id]/bias-audits/route.ts
- apps/web/src/app/api/v1/compliance/audit/route.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given an audit scope, when configured, then its population, tests and sampling method are defined.
- [ ] Given a sampling method (random/risk-based/stratified), when run, then a defensible sample is selected and recorded with the method and seed.
- [ ] Given a sample, when tested, then each item is scored Pass/Fail/NA with evidence linked.
- [ ] Given a failed test, when raised as a finding, then severity, root cause, owner and corrective action are captured and tracked to closure.
- [ ] Given an audit, then a report can be generated; RBAC restricts audit setup to Internal Auditor / Compliance Officer; all actions audited.

## Implementation Tasks From Backlog

- [ ] Backend: `hr_audit_scope` + `hr_audit_run` + `hr_audit_sample` + `hr_audit_finding` entities
- [ ] Backend: sampling engine (random/risk-based/stratified) + finding/CAP tracker
- [ ] Frontend: audit setup + sampling + execution + findings screens
- [ ] Rules/Config: per-module audit scopes, populations and tests
- [ ] Tests: unit tests for sampling determinism and finding lifecycle

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
