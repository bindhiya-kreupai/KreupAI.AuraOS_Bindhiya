# Gap Analysis: EPIC-30-S16 — Monthly HR Document Compliance Pack & Certificate

> Source epic: [EPIC-30-chapter-30-document-retention-and-hr-audit.md](./EPIC-30-chapter-30-document-retention-and-hr-audit.md)
> Parent epic: EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance
> Module: Compliance / Audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** a one-click Monthly HR Document Compliance Pack with certificate, **so that** I have a complete sign-off-ready evidence bundle of document/retention/audit status each month.

**Description**
Compiles the period's artefacts into one downloadable pack: file-completeness summary, retention register extract, expiry backlog, litigation holds active, disposals completed (with certificates), access-violation summary, audit findings/CAP status, KPI snapshot, and a configurable Monthly Document Compliance Certificate auto-populated with e-attestation. Requires sign-off, is versioned and archived for retention.

**Covers:** 30.34, 30.37
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/admin/compliance/audit/data-retention/page.tsx
- packages/@aura/database/prisma/document-schema-addition.prisma
- packages/@aura/database/prisma/migrations/20260322000000_audit_persistence_schema/migration.sql
- packages/@aura/database/prisma/migrations/20260601000000_add_mfa_audit_actions/migration.sql
- packages/@aura/database/src/extensions/audit-log.ts
- packages/@aura/database/src/middleware/audit.ts
- packages/@aura/database/src/seeds/31-asset-document-misc.seed.ts
- packages/@aura/database/src/seeds/document-templates.seed.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- add/wire service logic; add protected API route with validation/RBAC; add tests; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a closed period, when the pack is generated, then it includes completeness, retention extract, expiry backlog, holds, disposals, access violations, findings/CAP and KPI snapshot.
- [ ] Given the certificate, when generated, then it auto-populates entity, completeness %, retention/disposal stats and audit status, with e-attestation (name, role, timestamp).
- [ ] Given outstanding critical items (overdue disposal, open high-severity findings), when generation is attempted, then they are flagged before sign-off.
- [ ] Given a finalised pack, then it is archived immutably with version/retention metadata and exports to PDF/Excel.
- [ ] Given any pack/certificate action, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: compliance-pack assembler + certificate template engine with period data-binding
- [ ] Backend: immutable archive + retention metadata + e-attestation capture
- [ ] Frontend: pack preview + certificate generate/attest + sign-off
- [ ] Alerts/Workflow: sign-off request to Compliance Officer
- [ ] Tests: integration test for pack/certificate contents and flagging

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
