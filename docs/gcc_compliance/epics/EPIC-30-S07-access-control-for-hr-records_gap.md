# Gap Analysis: EPIC-30-S07 — Access Control for HR Records

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-30-chapter-30-document-retention-and-hr-audit.md](./EPIC-30-chapter-30-document-retention-and-hr-audit.md)
> Parent epic: EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance
> Module: Compliance / Audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**User story:** System Administrator, **I want** sensitivity-based, role-based access control over HR records with full access logging, **so that** only authorised roles can view/download each record class and every access is traceable.

**Description**
Implements record-level access control keyed off sensitivity and role: general records visible to HR Admin/Manager; confidential to restricted roles; medical/sensitive and disciplinary/grievance to named roles only (e.g. Compliance/ER); employee self-service limited to own non-restricted records. Every view/download/print is logged. Access is enforced on the digital store and search results.

**Covers:** 30.23
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/admin/documents/access-control/page.tsx
- apps/web/src/app/dashboard/security/document-access-logs/page.tsx
- apps/mobile/src/screens/documents/DocumentsScreen.tsx
- apps/mobile/src/services/documents.service.ts
- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/core-hr/document-intelligence/page.tsx
- apps/web/src/app/(modules)/core-hr/document-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a record's sensitivity, when access is attempted, then only roles permitted for that sensitivity can view/download it.
- [ ] Given medical/sensitive/disciplinary records, then access is restricted to named roles and denied to others (including general HR).
- [ ] Given employee self-service, then an employee sees only their own non-restricted records.
- [ ] Given any view/download/print, then it is logged with user, record, timestamp and action.
- [ ] Given an access-policy change, then it is versioned and audited.

## Implementation Tasks From Backlog

- [ ] Backend: record-level access enforcement keyed on sensitivity + role; access-log entity
- [ ] Backend: self-service scoping to own records
- [ ] Frontend: access-policy configuration + access-log viewer
- [ ] Rules/Config: sensitivity→role access matrix
- [ ] Tests: unit tests for permitted/denied access and self-service scoping

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
