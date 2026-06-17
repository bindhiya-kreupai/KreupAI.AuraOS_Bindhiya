# Gap Analysis: EPIC-36-S07 — Country compliance dashboard, monthly certificate & key takeaways

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-36-gcc-country-compliance-library-rule-config.md](./EPIC-36-gcc-country-compliance-library-rule-config.md)
> Parent epic: EPIC-36: GCC Country Compliance Library & Rule Config
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 3

**Description**
Build the country-wise compliance dashboard (per-country compliance status across payroll/WPS/social-insurance/nationalization/immigration with RBAC and drill-down) and the monthly country compliance certificate attesting each country's obligations were met, with the chapter key-takeaways as reference.

**Covers:** A2.17, A2.18, A2.19
**Acceptance criteria count:** 4 · **Task count:** 4

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

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config; verify query-backed dashboard/reporting; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the dashboard, when loaded, then per-country compliance status across domains shows with drill-down.
- [ ] Given RBAC, when a user views, then only in-scope countries/entities are visible.
- [ ] Given the monthly certificate, when generated, then it attests each country's obligations and is blocked while critical country risks are open.
- [ ] Given the certificate, when exported, then it produces a PDF and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: country-compliance aggregation + certificate generator with gating
- [ ] Frontend: country compliance dashboard + certificate view with e-sign/export and key-takeaways reference
- [ ] Rules/Config: certificate attestation fields per country
- [ ] Tests: integration tests for aggregation, RBAC and certificate gating

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
