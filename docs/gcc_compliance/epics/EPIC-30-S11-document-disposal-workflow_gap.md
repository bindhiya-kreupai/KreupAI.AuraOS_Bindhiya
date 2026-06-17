# Gap Analysis: EPIC-30-S11 — Document Disposal Workflow

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-30-chapter-30-document-retention-and-hr-audit.md](./EPIC-30-chapter-30-document-retention-and-hr-audit.md)
> Parent epic: EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance
> Module: Compliance / Audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a controlled, approved document-disposal workflow with a disposal certificate, **so that** records are destroyed/anonymised only when eligible, authorised and evidenced.

**Description**
Handles end-of-retention disposal: retention-due records (not under hold) enter a disposal queue; a maker-checker approval (preparer ≠ approver) authorises disposal per the schedule's disposal action (destroy/anonymise); the system records what was disposed, when, by/approved-by whom, and produces a disposal certificate/log for evidence. Held records are excluded; disposal is irreversible and fully audited.

**Covers:** 30.27
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/admin/compliance/audit/data-retention/page.tsx
- apps/web/src/app/(modules)/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/api/attendance/approval-workflow/route.ts
- apps/web/src/app/dashboard/admin/workflows/approvals/page.tsx
- apps/web/src/app/dashboard/attendance/approval-workflow/page.tsx
- apps/web/src/app/dashboard/finance/budget/approval-workflow/page.tsx
- apps/web/src/app/dashboard/policy-mgmt/approval-workflow/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify workflow approvals and audit events; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given retention-due records, when queued, then those under litigation hold are excluded automatically.
- [ ] Given a disposal batch, when approved, then maker-checker requires an approver different from the preparer before disposal executes.
- [ ] Given the disposal action, when executed, then records are destroyed or anonymised per the schedule and a disposal certificate/log is generated.
- [ ] Given an attempt to dispose a held or not-yet-due record, then it is blocked with a clear reason.
- [ ] Given any disposal, then it is irreversibly recorded and audited (what, when, who, approval).

## Implementation Tasks From Backlog

- [ ] Backend: `doc_disposal_batch` + `doc_disposal_log` entities; hold exclusion + maker-checker
- [ ] Backend: destroy/anonymise executor + disposal-certificate generator
- [ ] Frontend: disposal queue + approval + certificate view
- [ ] Rules/Config: disposal action per schedule; approval roles
- [ ] Alerts/Workflow: maker-checker approval + block on held/not-due
- [ ] Tests: integration test for hold exclusion, preparer≠approver, certificate

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
