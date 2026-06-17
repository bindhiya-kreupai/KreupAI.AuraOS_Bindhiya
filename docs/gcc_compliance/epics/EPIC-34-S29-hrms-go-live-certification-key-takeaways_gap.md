# Gap Analysis: EPIC-34-S29 — HRMS go-live certification & key takeaways

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 3
**User story:** Compliance Officer, **I want** a go-live certification gated on configuration completeness, **so that** no entity launches without verified compliant setup.

**Description**
Build the HRMS go-live certification: an attested certificate confirming rule packs bound, mandatory config complete, migration reconciled, RBAC/audit/integrations validated and the configuration control sheet signed — blocked while critical implementation-checklist or risk items are open. Includes the chapter key-takeaways as a reference.

**Covers:** 34.33, 34.34
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts
- apps/web/src/app/api/sso-config/route.ts
- apps/web/src/app/api/v1/admin/ai-config/route.ts
- apps/web/src/components/compliance/gosi/GosiConfigPanel.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given an entity, when go-live certification is requested, then completeness, migration reconciliation, RBAC/audit/integration validation and the signed control sheet are checked.
- [ ] Given open critical checklist or risk items, when certification is attempted, then it is blocked until closed or formally accepted.
- [ ] Given certification, when issued, then it is e-signed by the authorized role, versioned and stored as go-live evidence.
- [ ] Given the certificate, when exported, then it produces a PDF and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: go-live certification service with gating on checklist/risk/migration status
- [ ] Backend: certificate generator + e-sign capture
- [ ] Frontend: go-live certification screen with gating summary + key-takeaways reference
- [ ] Rules/Config: certification attestation fields
- [ ] Tests: integration tests for certification gating on open critical items

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
