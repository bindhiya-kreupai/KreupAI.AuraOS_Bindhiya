# Gap Analysis: EPIC-29-S14 — Authority Portal Evidence Capture

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** authority-portal evidence captured and linked to each exit step, **so that** every cancellation, transfer, grace and absconding action is provable against MOHRE/ICP/GDRFA/Qiwa/LMRA/MOI records.

**Description**
Captures and validates authority evidence per exit step: cancellation papers, transfer confirmations, final-exit/exit-permit records, absconding report references, and portal screenshots/PDFs from MOHRE, ICP, GDRFA, Qiwa/MHRSD, LMRA, MOI/PAM, PACI. Evidence is tagged to the case/task, format/expiry-validated where applicable, stored immutably in the document store, and required to close the relevant task. Feeds the audit checklist and monthly pack.

**Covers:** 29.18
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts
- apps/web/src/app/dashboard/(modules)/visa-permits/page.tsx
- apps/web/src/lib/services/visa-permit.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given an exit step requiring evidence, when completed, then the authority reference and document are captured and tagged to the case/task.
- [ ] Given evidence, when uploaded, then type/format is validated and it is stored immutably with metadata (authority, date, reference).
- [ ] Given a task needing evidence, when evidence is missing, then the task cannot be closed.
- [ ] Given evidence, then it is retrievable for audit and included in the monthly pack.
- [ ] Given any evidence upload, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `immig_exit_evidence` entity (caseId, taskId, authority, refNumber, docRef, validatedAt) + immutable store link
- [ ] Backend: evidence-required gate on task closure + format validation
- [ ] Frontend: evidence upload/preview per task with authority tagging
- [ ] Rules/Config: per-authority evidence requirements
- [ ] Tests: unit tests for required-evidence gate and validation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
