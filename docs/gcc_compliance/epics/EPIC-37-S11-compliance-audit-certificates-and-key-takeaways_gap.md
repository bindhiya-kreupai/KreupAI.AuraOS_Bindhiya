# Gap Analysis: EPIC-37-S11 — Compliance & audit certificates and key takeaways

> Source epic: [EPIC-37-compliance-checklist-red-flag-engine.md](./EPIC-37-compliance-checklist-red-flag-engine.md)
> Parent epic: EPIC-37: Compliance Checklist & Red-Flag Engine
> Module: audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 3
**User story:** Compliance Officer, **I want** monthly compliance and audit certificates gated on red-flags and findings, **so that** sign-off attests a genuinely clean compliance state.

**Description**
Generate the monthly HR compliance checklist certificate, monthly payroll compliance certificate, monthly immigration compliance certificate and management audit certificate — each attesting checklist completion and red-flag/finding closure, blocked while critical red flags or open findings remain, e-signed and exportable, with the chapters' key-takeaways as reference.

**Covers:** A3.21, A3.23, A4.22, A4.26, A5.20, A5.24, A6.25, A6.29
**Acceptance criteria count:** 4 · **Task count:** 5

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

- [ ] Given a period, when a certificate is generated, then it attests checklist completion and red-flag/finding closure for its domain.
- [ ] Given open critical red flags or findings, when certification is attempted, then it is blocked until closed or formally accepted.
- [ ] Given a certificate, when issued, then it is e-signed by the authorized role, versioned and stored as evidence.
- [ ] Given the certificate, when exported, then it produces a PDF and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: certificate generators (HR/payroll/immigration/audit) with red-flag/finding gating
- [ ] Backend: e-sign capture and evidence storage
- [ ] Frontend: certificate views with gating summary, e-sign/export and key-takeaways reference
- [ ] Rules/Config: certificate attestation fields per domain
- [ ] Tests: integration tests for certificate gating on open red flags/findings

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
