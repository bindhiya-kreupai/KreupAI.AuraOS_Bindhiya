# Gap Analysis: EPIC-30-S05 — Digital Document Management Controls

> Source epic: [EPIC-30-chapter-30-document-retention-and-hr-audit.md](./EPIC-30-chapter-30-document-retention-and-hr-audit.md)
> Parent epic: EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance
> Module: Compliance / Audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8
**User story:** System Administrator, **I want** governed digital document storage with versioning, integrity, metadata and immutability controls, **so that** electronic HR records are securely stored, tamper-evident and retrievable for audit.

**Description**
Provides the digital store controls: upload with mandatory metadata (employee, category, country, document date), versioning, integrity hashing/tamper-evidence, immutability for finalised records, indexing/search, and retention-stamp linkage. Ensures every stored record carries its classification, sensitivity, retain-until date and access policy, and is retrievable on demand for inspections and audits.

**Covers:** 30.21
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/admin/compliance/audit/data-retention/page.tsx
- apps/mobile/src/screens/documents/DocumentsScreen.tsx
- apps/mobile/src/services/documents.service.ts
- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/core-hr/document-intelligence/page.tsx
- apps/web/src/app/(modules)/core-hr/document-management/page.tsx
- apps/web/src/app/(modules)/master-data/document-types/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a document upload, when stored, then mandatory metadata (employee, category, country, date) is captured and the document classified and retention-stamped.
- [ ] Given a finalised record, when stored, then it is immutable and versioned; superseded versions are retained.
- [ ] Given integrity controls, when a record is retrieved, then a tamper-evidence hash validates it is unchanged.
- [ ] Given search, when queried by employee/category/date/retention status, then matching records are returned subject to access control.
- [ ] Given any store action, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `doc_record` store entity (metadata, version, hash, immutableFlag, retainUntil, accessPolicyRef) + integrity hashing
- [ ] Backend: versioning + immutability enforcement + indexed search
- [ ] Frontend: document store UI (upload, version history, search)
- [ ] Rules/Config: mandatory-metadata rules per category
- [ ] Tests: unit tests for integrity validation, immutability, search

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
