# Gap Analysis: EPIC-37-S12 — Checklist Template Library (full A3–A6 traceability)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-37-compliance-checklist-red-flag-engine.md](./EPIC-37-compliance-checklist-red-flag-engine.md)
> Parent epic: EPIC-37: Compliance Checklist & Red-Flag Engine
> Module: audit
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** a seeded Checklist Template Library materializing every handbook checklist, **so that** all A3–A6 checklists exist as configurable, traceable templates out of the box.

**Description**
Ship the Checklist Template Library: a curated, versioned set of seed templates for every Appendix A3–A6 checklist — master HR, employee-file, recruitment, onboarding, payroll (and all payroll sub-checklists), wage-protection, social-insurance, nationalization, immigration (and all immigration sub-checklists), leave, attendance/overtime, benefits, accommodation, HSE, grievance, disciplinary, separation, document-retention, and the full HR-audit checklist set — each mapped to its handbook section for traceability, loadable per tenant, and editable via the template engine. This story guarantees no handbook checklist is unrepresented.

**Covers:** A3.4, A3.5, A3.6, A3.7, A3.8, A3.9, A3.10, A3.11, A3.12, A3.13, A3.14, A3.15, A3.16, A3.17, A3.18, A3.19, A3.20, A4.3, A4.4, A4.5, A4.6, A4.7, A4.8, A4.9, A4.10, A4.11, A4.12, A4.13, A4.14, A4.15, A4.16, A4.17, A4.18, A4.19, A4.20, A5.3, A5.4, A5.5, A5.6, A5.7, A5.8, A5.9, A5.10, A5.11, A5.12, A5.13, A5.14, A5.15, A5.16, A5.17, A5.18, A6.3, A6.4, A6.5, A6.6, A6.7, A6.8, A6.9, A6.10, A6.11, A6.12, A6.13, A6.14, A6.15, A6.16, A6.17, A6.18, A6.19, A6.20, A6.21
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

- [ ] Given the library, when loaded, then a seed template exists for every A3–A6 handbook checklist mapped to its section number.
- [ ] Given a tenant, when onboarded, then the library can be installed and each template scoped/edited via the template engine.
- [ ] Given a seed template, when updated by the handbook, then a new version is published without breaking historical runs.
- [ ] Given the library, when audited, then a coverage report shows each handbook checklist section mapped to a live template.

## Implementation Tasks From Backlog

- [ ] Backend: seed-data loader for the full A3–A6 template library with section mapping
- [ ] Backend: coverage-report service (handbook section → template)
- [ ] Frontend: template library catalogue with section traceability view
- [ ] Rules/Config: per-template default items and red-flag bindings
- [ ] Tests: integration tests verifying every A3–A6 section maps to a seeded template

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
