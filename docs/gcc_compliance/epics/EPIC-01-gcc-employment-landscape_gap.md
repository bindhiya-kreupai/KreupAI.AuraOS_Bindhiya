# Gap Analysis: EPIC-01: Chapter 1: GCC Employment Landscape

> Source epic: [EPIC-01-gcc-employment-landscape.md](./EPIC-01-gcc-employment-landscape.md)
> Module: Foundation
> Generated: 2026-06-16 · Updated: 2026-06-17 (gap closure batch)

## Assessment Method

Per-story gap review against `apps/`, `packages/@aura/`, `services/`. After the 2026-06-17 closure batch, all nine stories have schema, service, API and at-minimum a workspace UI in place — pending operational migration + integration verification only.

## Summary

- Stories assessed: 9
- Implemented (pending migration apply + integration verification): 9
- Missing: 0

## Closure Batch — 2026-06-17

**Schema / migration**: `packages/@aura/database/prisma/migrations/20260617000000_add_gcc_landscape_foundation/migration.sql`

Tables added:

- `aura_gcc_tenant_country`, `aura_gcc_legal_entity` (S01)
- `aura_gcc_country_profile` (S02)
- `aura_workforce_classification` (S03)
- `aura_platform_alert_rule`, `aura_platform_alert_instance` (S04)
- `aura_gcc_role_scope` (S05)
- `aura_compliance_risk_register` (S06)
- `aura_localization_target`, `aura_workforce_kpi_snapshot` (S07)
- `aura_digital_maturity_domain`, `aura_digital_maturity_snapshot` (S09)

**Services**: `apps/web/src/lib/services/gcc-landscape/*` — tenancy, country profile, workforce classification, platform alerts, RBAC, risk register, KPI, landscape dashboard, digital maturity, country defaults.

**API routes**: `apps/web/src/app/api/v1/gcc-landscape/*` — `countries`, `legal-entities`, `country-profiles`, `classifications`, `alert-rules`, `alert-instances`, `personas`, `risk-register`, `kpis`, `dashboard`, `maturity` (all protected by `withEnhancedAuth`).

**Dashboard pages**: `apps/web/src/app/dashboard/gcc-landscape/*` — landing executive landscape dashboard + 8 per-story workspaces.

**Tests**: `apps/web/src/lib/services/__tests__/gcc-landscape.service.test.ts` — 28 unit tests, all passing.

## Storywise Gaps (after closure batch)

### EPIC-01-S01 — Multi-country, multi-entity tenancy model

**Status:** Implemented - pending migration / integration verification
**Covers:** 1.1, 1.2

**Implementation evidence**

- `packages/@aura/database/prisma/migrations/20260617000000_add_gcc_landscape_foundation/migration.sql`
- `apps/web/src/lib/services/gcc-landscape/gcc-tenancy.service.ts`
- `apps/web/src/app/api/v1/gcc-landscape/countries/route.ts`
- `apps/web/src/app/api/v1/gcc-landscape/legal-entities/route.ts`
- `apps/web/src/app/dashboard/gcc-landscape/tenancy/page.tsx`

**Gap to close:** apply migration in deployed environments; wire legal-entity activation events to the production message bus.

### EPIC-01-S02 — GCC labour-market reference dataset

**Status:** Implemented - pending migration
**Covers:** 1.2

**Implementation evidence**

- `apps/web/src/lib/services/gcc-landscape/gcc-country-profile.service.ts`
- `apps/web/src/lib/services/gcc-landscape/country-defaults.ts`
- `apps/web/src/app/api/v1/gcc-landscape/country-profiles/route.ts`
- `apps/web/src/app/dashboard/gcc-landscape/country-profiles/page.tsx`

**Gap to close:** apply migration; seed defaults via `POST /api/v1/gcc-landscape/country-profiles {action:"seed-defaults"}`.

### EPIC-01-S03 — National vs. expatriate workforce data model

**Status:** Implemented - pending migration + employee-master integration
**Covers:** 1.2, 1.3

**Implementation evidence**

- `apps/web/src/lib/services/gcc-landscape/workforce-classification.service.ts`
- `apps/web/src/app/api/v1/gcc-landscape/classifications/route.ts`
- `apps/web/src/app/dashboard/gcc-landscape/classifications/page.tsx`

**Gap to close:** apply migration; wire `classify(...)` into the employee-master save flow so each save emits a classification version; add `employee.classified` event publication.

### EPIC-01-S04 — Platform automation backbone (event bus, audit trail, alerts)

**Status:** Implemented - pending migration + event-bus integration
**Covers:** 1.6

**Implementation evidence**

- `apps/web/src/lib/services/gcc-landscape/platform-alert.service.ts`
- `apps/web/src/app/api/v1/gcc-landscape/alert-rules/route.ts`
- `apps/web/src/app/api/v1/gcc-landscape/alert-instances/route.ts`
- `apps/web/src/app/dashboard/gcc-landscape/alerts/page.tsx`
- Existing `apps/web/src/lib/audit/audit.service.ts` (immutable audit log) and `packages/@aura/events/` (event bus) cover the audit + bus pillars; this story added the alert-rule/instance pillar.

**Gap to close:** apply migration; subscribe the alert evaluator to upstream visa / WPS / ID-expiry events.

### EPIC-01-S05 — RBAC role model for GCC HR personas

**Status:** Implemented - pending migration + persona seeding in deployed envs
**Covers:** 1.3

**Implementation evidence**

- `apps/web/src/lib/services/gcc-landscape/gcc-rbac.service.ts` (extends existing `Role` / `UserRole` / `Permission` models with a country/entity scope table)
- `apps/web/src/app/api/v1/gcc-landscape/personas/route.ts`
- `apps/web/src/app/dashboard/gcc-landscape/personas/page.tsx`

**Gap to close:** apply migration; seed personas via `POST /api/v1/gcc-landscape/personas {action:"seed-personas"}`; assign role scopes during user provisioning.

### EPIC-01-S06 — Common HR challenges as a configurable compliance-risk register

**Status:** Implemented - pending migration
**Covers:** 1.3, 1.4

**Implementation evidence**

- `apps/web/src/lib/services/gcc-landscape/compliance-risk-register.service.ts`
- `apps/web/src/app/api/v1/gcc-landscape/risk-register/route.ts`
- `apps/web/src/app/dashboard/gcc-landscape/risk-register/page.tsx`

**Gap to close:** apply migration; seed the five regional risk themes via `POST /api/v1/gcc-landscape/risk-register {action:"seed-regional"}`.

### EPIC-01-S07 — Workforce localization & KPI baseline

**Status:** Implemented - pending migration + scheduled recompute
**Covers:** 1.2, 1.3

**Implementation evidence**

- `apps/web/src/lib/services/gcc-landscape/workforce-kpi.service.ts`
- `apps/web/src/app/api/v1/gcc-landscape/kpis/route.ts`
- `apps/web/src/app/dashboard/gcc-landscape/kpis/page.tsx`

**Gap to close:** apply migration; configure scheduler to call `takeSnapshot(...)` daily and on `employee.classified` events.

### EPIC-01-S08 — GCC Employment Landscape executive dashboard

**Status:** Implemented - pending migration
**Covers:** 1.1, 1.2, 1.4

**Implementation evidence**

- `apps/web/src/lib/services/gcc-landscape/gcc-landscape-dashboard.service.ts`
- `apps/web/src/app/api/v1/gcc-landscape/dashboard/route.ts`
- `apps/web/src/app/dashboard/gcc-landscape/page.tsx`

**Gap to close:** apply migration; verify country/entity scoping enforces on each widget when real users hit the dashboard.

### EPIC-01-S09 — Digital maturity & automation baseline scorecard

**Status:** Implemented - pending migration + domain seeding
**Covers:** 1.5, 1.6

**Implementation evidence**

- `apps/web/src/lib/services/gcc-landscape/digital-maturity.service.ts`
- `apps/web/src/app/api/v1/gcc-landscape/maturity/route.ts`
- `apps/web/src/app/dashboard/gcc-landscape/maturity/page.tsx`

**Gap to close:** apply migration; seed domains via `POST /api/v1/gcc-landscape/maturity {action:"seed-domains"}`; record initial baseline per quarter.

## Next verification

- Apply `20260617000000_add_gcc_landscape_foundation` in target environments.
- Run `pnpm --filter @aura/database exec prisma generate` after applying.
- Targeted suite passes: `pnpm --filter web test:run src/lib/services/__tests__/gcc-landscape.service.test.ts` (28 tests passing, 2026-06-17).
- Web `type-check` clean across all EPIC-01 files (2026-06-17).
