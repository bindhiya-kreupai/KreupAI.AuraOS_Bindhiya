# Gap Analysis: EPIC-30-S02 — Employee File Structure & Document Classification Model

> Source epic: [EPIC-30-chapter-30-document-retention-and-hr-audit.md](./EPIC-30-chapter-30-document-retention-and-hr-audit.md)
> Parent epic: EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance
> Module: Compliance / Audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5

**Description**
Defines the standard employee file structure (sections/folders) and a document classification taxonomy: each document type maps to a file section, a sensitivity level (general/confidential/medical/sensitive), and a retention class. This taxonomy is the backbone the retention schedule, access control, privacy rules and audit all key off, and aligns with the EPIC-08 mandatory document matrix.

**Covers:** 30.6
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/admin/compliance/audit/data-retention/page.tsx
- apps/web/src/app/api/v1/ai-governance/model-cards/[id]/bias-audits/route.ts
- apps/web/src/app/api/v1/employees/[id]/documents/route.ts
- apps/web/src/app/dashboard/(modules)/employee-profile/page.tsx
- apps/web/src/components/directory/EmployeeProfileCard.tsx
- apps/web/src/components/profile/EmployeeProfileEditor.tsx
- apps/mobile/src/screens/documents/DocumentsScreen.tsx
- apps/mobile/src/services/documents.service.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the file structure, when configured, then sections/sub-sections are defined per entity and documents file into them.
- [ ] Given the classification model, when set, then each document type has a section, sensitivity level and retention class.
- [ ] Given a new document type, when added in config, then it is classified without code change.
- [ ] Given the model, then it aligns with the EPIC-08 mandatory document matrix and flags unmapped document types.
- [ ] Given any classification change, then it is versioned and audited.

## Implementation Tasks From Backlog

- [ ] Backend: `doc_file_structure` + `doc_type_classification` entities (docType, section, sensitivity, retentionClass)
- [ ] Backend: unmapped-document-type detector
- [ ] Frontend: file-structure + classification configuration screens
- [ ] Rules/Config: seed standard sections and document-type taxonomy
- [ ] Tests: unit tests for classification resolution and unmapped detection

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
