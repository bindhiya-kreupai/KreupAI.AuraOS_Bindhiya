# Gap Analysis: EPIC-34-S11 — Immigration configuration

> **✅ SHIPPED 2026-06-17** — EPIC-34 batch closure. Generic HrmsConfigObject registry (scope: GLOBAL → COUNTRY → LEGAL_ENTITY → DOMAIN) + 22 per-domain workspaces + implementation checklist + connectors + migrations + monthly/go-live certificate. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for what remains in other themes.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**User story:** PRO / Immigration Officer, **I want** to configure visa/permit document types, validity rules and expiry-alert thresholds per country, **so that** immigration compliance and renewals are driven by configuration.

**Description**
Configure immigration document types (visa, work permit, Iqama, CPR, QID, residence, labour card), validity rules, occupation/quota linkage, grace periods, and renewal/expiry alert thresholds (e.g., 60/30/7 days before expiry) consumed by the immigration modules.

**Covers:** 34.13
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- add/wire service logic; add tests.

## Acceptance Criteria To Verify

- [ ] Given a country, when configured, then its immigration document types, validity rules and grace periods are defined.
- [ ] Given expiry alerts, when configured, then thresholds (e.g., 60/30/7 days before visa/permit expiry) are set per document type.
- [ ] Given a document type, when configured, then mandatory linkage to occupation/quota is enforced where the country requires it.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `immigration_doc_type`, `validity_rule`, `expiry_alert_config` schemas
- [ ] Backend: alert-threshold resolution per document type
- [ ] Frontend: immigration configuration screen
- [ ] Rules/Config: per-country document types and grace periods
- [ ] Alerts/Workflow: expiry-alert threshold configuration
- [ ] Tests: unit tests for alert-threshold derivation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
