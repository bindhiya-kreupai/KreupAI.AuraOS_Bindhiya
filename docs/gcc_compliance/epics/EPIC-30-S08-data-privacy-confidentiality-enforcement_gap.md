# Gap Analysis: EPIC-30-S08 — Data Privacy & Confidentiality Enforcement

> Source epic: [EPIC-30-chapter-30-document-retention-and-hr-audit.md](./EPIC-30-chapter-30-document-retention-and-hr-audit.md)
> Parent epic: EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance
> Module: Compliance / Audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** data-privacy and confidentiality rules enforced over HR records (purpose limitation, minimisation, lawful retention, subject requests), **so that** personal and sensitive data is handled per GCC data-protection law.

**Description**
Adds privacy enforcement over the document store: purpose tagging and minimisation for sensitive categories, lawful-retention enforcement (no keeping personal data beyond its retention period — driving anonymise/dispose at expiry), masking/redaction on export, and support for data-subject access/erasure requests within the legal constraints (records under retention/hold cannot be erased early). Aligns with the privacy obligations of the source modules.

**Covers:** 30.24
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/admin/compliance/audit/data-retention/page.tsx
- packages/@aura/database/prisma/migrations/20260322000000_audit_persistence_schema/migration.sql
- packages/@aura/database/prisma/migrations/20260601000000_add_mfa_audit_actions/migration.sql
- packages/@aura/database/src/extensions/audit-log.ts
- packages/@aura/database/src/middleware/audit.ts
- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- add/wire service logic; add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a sensitive record, when handled, then purpose tag and minimisation rules apply and over-collection is flagged.
- [ ] Given retention expiry, when reached for personal data, then the configured anonymise/dispose action is enforced (no indefinite retention).
- [ ] Given an export, when it includes sensitive fields, then masking/redaction is applied per role.
- [ ] Given a data-subject request, when raised, then access/erasure is processed within legal limits, with records under retention/litigation hold excluded from early erasure and the reason recorded.
- [ ] Given any privacy action, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: privacy tags + minimisation checks; subject-request workflow honouring retention/hold
- [ ] Backend: masking/redaction on export by role
- [ ] Frontend: privacy/subject-request console
- [ ] Rules/Config: per-category privacy rules and masking policy
- [ ] Tests: unit tests for erasure-vs-hold conflict and masking

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
