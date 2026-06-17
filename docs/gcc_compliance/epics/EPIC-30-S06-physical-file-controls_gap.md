# Gap Analysis: EPIC-30-S06 — Physical File Controls

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-30-chapter-30-document-retention-and-hr-audit.md](./EPIC-30-chapter-30-document-retention-and-hr-audit.md)
> Parent epic: EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance
> Module: Compliance / Audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5

**Description**
Manages physical files where paper originals exist: a physical-file register with file ID, location (cabinet/box/archive), custody, check-in/out log, and linkage to the corresponding digital record. Supports archive/off-site tracking, missing-file flagging, and aligns physical retention/disposal with the digital schedule so paper and electronic copies are governed together.

**Covers:** 30.22
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

- [ ] Given a physical file, when registered, then file ID, location, custodian and linked digital record are captured.
- [ ] Given check-out/check-in, when logged, then custody and return-due are tracked and overdue returns flagged.
- [ ] Given the retention schedule, when a physical file is due for disposal, then it is flagged in step with its digital record.
- [ ] Given a missing/unreturned file, then it is flagged and escalated.
- [ ] Given any physical-file action, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `doc_physical_file` entity (fileId, location, custodian, digitalRecordRef) + check-in/out log
- [ ] Backend: overdue-return + missing-file detection; disposal alignment with schedule
- [ ] Frontend: physical-file register + check-in/out screen
- [ ] Rules/Config: location taxonomy + custody rules
- [ ] Tests: unit tests for check-in/out and overdue/missing flags

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
