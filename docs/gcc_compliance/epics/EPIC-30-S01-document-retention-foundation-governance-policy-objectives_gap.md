# Gap Analysis: EPIC-30-S01 — Document Retention Foundation, Governance, Policy & Objectives

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-30-chapter-30-document-retention-and-hr-audit.md](./EPIC-30-chapter-30-document-retention-and-hr-audit.md)
> Parent epic: EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance
> Module: Compliance / Audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 3
**User story:** Compliance Officer, **I want** the HR document-retention domain, GCC record-keeping context, governance framework and policy modelled as configurable reference data, **so that** AuraOS applies one consistent retention-and-audit framework across all entities.

**Description**
Establishes the module foundation: objectives, the GCC record-keeping context (per-country statutory retention drivers), the document governance framework (owner roles, retention authority, segregation of duties for disposal), and a configurable HR Document Policy (classification, retention, access, disposal, hold). Provides inline guidance and anchors all downstream record-classification and audit stories.

**Covers:** 30.1, 30.2, 30.3, 30.4, 30.5
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

- [ ] Given the module, when opened, then objectives, GCC record-keeping context and governance roles are configurable and shown inline.
- [ ] Given the document policy, when configured, then classification, retention, access, disposal and hold rules are captured and versioned.
- [ ] Given governance roles, when set, then document-owner, retention-authority and disposal-approver duties and SoD are enforceable downstream.
- [ ] Given guidance content (30.1–30.5), then it is editable per entity without code, versioned and EN/AR.
- [ ] Given any governance/policy change, then it is versioned with effective date and audited.

## Implementation Tasks From Backlog

- [ ] Backend: `doc_governance` + `doc_policy` entities (classificationRules, retentionRules, accessRules, disposalRules, holdRules)
- [ ] Backend: guidance content store keyed by section with locale/version
- [ ] Frontend: governance + policy configuration screens
- [ ] Rules/Config: seed document policy and governance roles; per-country record-keeping context
- [ ] Tests: unit tests for policy versioning and SoD evaluation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
