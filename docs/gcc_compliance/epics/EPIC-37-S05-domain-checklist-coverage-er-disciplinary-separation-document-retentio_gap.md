# Gap Analysis: EPIC-37-S05 — Domain checklist coverage: ER, disciplinary, separation & document retention

> Source epic: [EPIC-37-compliance-checklist-red-flag-engine.md](./EPIC-37-compliance-checklist-red-flag-engine.md)
> Parent epic: EPIC-37: Compliance Checklist & Red-Flag Engine
> Module: audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** the engine seeded for ER, disciplinary, separation and document-retention domains, **so that** those checklists run with their red flags.

**Description**
Materialize the grievance, disciplinary, separation and document-retention compliance checklists as templates with red flags (e.g., grievance SLA breach, disciplinary deduction over cap, incomplete exit clearance, document past retention/expired), completing the A3 domain set.

**Covers:** A3.17, A3.18, A3.19, A3.20
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/admin/compliance/audit/data-retention/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/mobile/src/screens/documents/DocumentsScreen.tsx
- apps/mobile/src/services/documents.service.ts
- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/core-hr/document-intelligence/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given grievance/disciplinary/separation/document-retention templates, when run, then their items evaluate with domain red flags.
- [ ] Given a breach (e.g., SLA breach, over-cap deduction, expired/over-retention document), when detected, then a red flag is raised.
- [ ] Given each template, when scoped, then it applies per entity/country correctly.
- [ ] Given runs, when completed, then results feed dashboards and certificates.

## Implementation Tasks From Backlog

- [ ] Backend: red-flag rule sets for grievance/disciplinary/separation/document-retention
- [ ] Frontend: domain checklist run views
- [ ] Rules/Config: domain red-flag thresholds
- [ ] Tests: integration tests for domain red-flag detection

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
