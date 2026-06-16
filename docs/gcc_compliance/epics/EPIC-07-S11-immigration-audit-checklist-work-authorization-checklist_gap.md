# Gap Analysis: EPIC-07-S11 — Immigration audit checklist & work authorization checklist

> Source epic: [EPIC-07-chapter-7-immigration-work-authorization-c.md](./EPIC-07-chapter-7-immigration-work-authorization-c.md)
> Parent epic: EPIC-07: Chapter 7 – Immigration & Work Authorization Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5

**Description**
Provide (a) an immigration audit checklist (valid permit on file, residence valid, ID valid, occupation match, location compliant, dependents valid) auto-evaluated per employee/sample, and (b) a reusable Work Authorization Checklist (the section 7.18 sample) usable at onboarding, renewal and audit, as a configurable digital checklist with export.

**Covers:** 7.13, 7.18
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts
- apps/web/src/app/dashboard/(modules)/visa-permits/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a sample/employee, when the audit checklist runs, then each control is auto-evaluated from document data and gaps are flagged.
- [ ] Given the work authorization checklist, when applied to an employee, then mandatory items per country render and completion is tracked.
- [ ] Given a failed control (e.g. expired permit, occupation mismatch), then it routes to corrective action/risk register.
- [ ] Given export, then checklist results export for review with timestamp.
- [ ] Given audit, then checklist runs are logged.

## Implementation Tasks From Backlog

- [ ] Backend: `immigration_audit_check` + `work_authorization_checklist` definitions + evaluation service.
- [ ] Backend: auto-evaluation rules + corrective-action linkage.
- [ ] Frontend: checklist runner + per-employee checklist.
- [ ] Rules/Config: configurable controls + country checklist templates.
- [ ] Tests: auto-evaluation + gap-routing tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
