# Gap Analysis: EPIC-30-S10 — Litigation Hold

> Source epic: [EPIC-30-chapter-30-document-retention-and-hr-audit.md](./EPIC-30-chapter-30-document-retention-and-hr-audit.md)
> Parent epic: EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance
> Module: Compliance / Audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** to place and manage litigation holds on records/employees, **so that** documents relevant to a claim or investigation cannot be disposed of or erased until the hold is released.

**Description**
Provides litigation/legal hold: a Compliance/Legal user places a hold scoped to an employee, case, category or date range; held records are locked against disposal, expiry-disposal and early erasure regardless of retention status; the hold is tracked with reason, scope, owner and authority/case reference; and release requires authorisation. Held records are clearly flagged everywhere they appear, and the hold overrides retention expiry and data-subject erasure.

**Covers:** 30.26
**Acceptance criteria count:** 5 · **Task count:** 6

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

- [ ] Given a litigation hold, when placed, then scoped records are locked against disposal, expiry-disposal and erasure with a clear flag.
- [ ] Given a held record, when retention expiry or a subject-erasure request occurs, then disposal/erasure is blocked and the hold reason shown.
- [ ] Given the hold, then reason, scope, owner and case reference are captured and audited.
- [ ] Given a release, when authorised, then the hold lifts and normal retention/disposal resumes from the correct date.
- [ ] Given RBAC, only Compliance/Legal roles may place/release holds; every hold action is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `doc_litigation_hold` entity (scope, reason, owner, caseRef, status) + disposal/erasure lock
- [ ] Backend: hold-override over retention expiry and subject erasure
- [ ] Frontend: litigation-hold console with scope builder
- [ ] Rules/Config: hold scopes (employee/case/category/date)
- [ ] Alerts/Workflow: hold place/release authorisation
- [ ] Tests: unit tests for lock, override and release

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
