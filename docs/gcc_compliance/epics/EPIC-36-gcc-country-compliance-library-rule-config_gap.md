# Gap Analysis: EPIC-36: GCC Country Compliance Library & Rule Config

> **⚠️ STALE — superseded 2026-06-17.** This epic-level gap file predates the GCC compliance batched commits. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list across all 38 epics (~14% of stories are true gaps; the rest are shipped). This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-36-gcc-country-compliance-library-rule-config.md](./EPIC-36-gcc-country-compliance-library-rule-config.md)
> Module: platform
> Generated: 2026-06-16 · Updated: 2026-06-17 (gap closure batch)

## Assessment Method

After the 2026-06-17 closure batch, every story has authored seed data, services, API routes, dashboards and tests. Pending operational migration + statutory verification only.

## Summary

- Stories assessed: 7
- Implemented (pending migration / operational verification): 7
- Partial: 0

## Closure Batch — 2026-06-17

**Schema / migration**: `packages/@aura/database/prisma/migrations/20260617120000_add_gcc_rule_library/migration.sql`

Tables added: `aura_compliance_theme`, `aura_country_rule_pack`, `aura_country_rule`, `aura_country_risk_matrix`, `aura_country_audit_checklist`, `aura_country_compliance_certificate`.

**Services**: `apps/web/src/lib/services/gcc-rule-library/*` — rule-pack lifecycle (draft → publish → retire), comparison projection, risk matrix scoring + seed, certificate generate/sign with critical-risk gating, plus `rule-pack-seeds.ts` with authored rule packs for all six GCC countries (real WPS windows, EOSB formulas, contribution %, nationalization programmes, working-hour caps, leave entitlements + citation pointers).

**API**: `/api/v1/gcc-rule-library/{rule-packs,themes,comparisons,risk-matrix,certificates,dashboard}`.

**Dashboard**: `/dashboard/gcc-rule-library/{,/rule-packs,/comparisons,/risk-matrix,/certificates}`.

**Tests**: `apps/web/src/lib/services/__tests__/gcc-rule-library.service.test.ts` — 16 unit tests, all passing (seed integrity, draft/publish lifecycle, retire-on-publish, comparison projection, risk scoring, certificate gating).

## Storywise Gaps (after closure batch)

### EPIC-36-S01 — Country library structure, themes & rule-pack model

**Status:** Implemented - pending migration
**Covers:** A2.1, A2.2, A2.16

**Implementation evidence**

- `packages/@aura/database/prisma/migrations/20260617120000_add_gcc_rule_library/migration.sql`
- `apps/web/src/lib/services/gcc-rule-library/rule-pack.service.ts` (themes + pack lifecycle)
- `apps/web/src/lib/services/gcc-rule-library/rule-pack-seeds.ts` (`GCC_WIDE_THEMES` covering WAGE_PROTECTION, SOCIAL_INSURANCE, NATIONALIZATION, EOSB, IMMIGRATION)
- `apps/web/src/app/api/v1/gcc-rule-library/{rule-packs,themes}/route.ts`
- `apps/web/src/app/dashboard/gcc-rule-library/{,/rule-packs}/page.tsx`

**Gap to close:** apply migration; seed via `POST /api/v1/gcc-rule-library/rule-packs {action:"seed-themes"}` and `{action:"seed-authored"}`.

### EPIC-36-S02 — UAE & Saudi Arabia rule sets and summaries

**Status:** Implemented - pending statutory verification
**Covers:** A2.3, A2.4

**Implementation evidence**

- `rule-pack-seeds.ts` UAE pack (15-day WPS, 21/30-day EOSB bands, 12.5%/5% GPSSA, Emiratisation thresholds + NAFIS fine, working-hour caps, Ramadan rules)
- `rule-pack-seeds.ts` KSA pack (7-day Mudad WPS, 11.75%/9.75% GOSI national + 2% expat, Nitaqat bands, 0.5/1-month EOSB award)

**Gap to close:** confirm latest statutory figures with legal counsel before publishing in production.

### EPIC-36-S03 — Bahrain & Qatar rule sets and summaries

**Status:** Implemented - pending statutory verification
**Covers:** A2.5, A2.6

**Implementation evidence**

- BH pack (7-day WPS, 0.5/1-month EOSB, 12%/7% SIO national, Bahrainization default 50%)
- QA pack (7-day Qatar WPS, 21-day-per-year EOSB, 14%/7% GRSIA national, sector-specific Qatarization targets)

### EPIC-36-S04 — Oman & Kuwait rule sets and summaries

**Status:** Implemented - pending statutory verification
**Covers:** A2.7, A2.8

**Implementation evidence**

- OM pack (7-day WPS, 30-day-per-year EOSB, 11.5%/8% PASI, Omanisation default 35%)
- KW pack (7-day WPS, 15/30-day EOSB, 11.5%/10.5% PIFSS, Kuwaitisation default 60%)

### EPIC-36-S05 — GCC comparison tables (overview, payroll, social insurance, nationalization, immigration)

**Status:** Implemented
**Covers:** A2.9, A2.10, A2.11, A2.12, A2.13

**Implementation evidence**

- `apps/web/src/lib/services/gcc-rule-library/comparison.service.ts` — live projection over ACTIVE rule packs (no caching) → publishing a new pack updates the comparison automatically.
- `apps/web/src/app/dashboard/gcc-rule-library/comparisons/page.tsx` — tabbed view across PAYROLL / SOCIAL_INSURANCE / NATIONALIZATION / IMMIGRATION / EOSB with cell-level authority + citation rendering.

### EPIC-36-S06 — Country-wise risk matrix & audit checklist

**Status:** Implemented - pending migration
**Covers:** A2.14, A2.15

**Implementation evidence**

- `apps/web/src/lib/services/gcc-rule-library/risk-matrix.service.ts` (likelihood × impact scoring, seeded with country-specific risk themes — WPS delays, Emiratisation/Nitaqat shortfalls, LMRA lapses, etc.)
- `apps/web/src/app/api/v1/gcc-rule-library/risk-matrix/route.ts`
- `apps/web/src/app/dashboard/gcc-rule-library/risk-matrix/page.tsx`

**Gap to close:** apply migration; seed via `POST /api/v1/gcc-rule-library/risk-matrix {action:"seed-regional"}`. Audit checklist table is in schema; per-country checklists can be authored as tenant data.

### EPIC-36-S07 — Country compliance dashboard, monthly certificate & key takeaways

**Status:** Implemented - pending migration
**Covers:** A2.17, A2.18, A2.19

**Implementation evidence**

- `apps/web/src/lib/services/gcc-rule-library/certificate.service.ts` (generate + sign with critical-risk gating)
- `apps/web/src/app/api/v1/gcc-rule-library/{certificates,dashboard}/route.ts`
- `apps/web/src/app/dashboard/gcc-rule-library/certificates/page.tsx`

**Gap to close:** apply migration; PDF export will be wired through existing document store in a follow-up; tightening RBAC scoping to honour `GccRoleScope` from EPIC-01-S05.

## Next verification

- Apply `20260617120000_add_gcc_rule_library` in target environments.
- Run `pnpm --filter @aura/database exec prisma generate`.
- Targeted suite passes: `pnpm --filter web test:run src/lib/services/__tests__/gcc-rule-library.service.test.ts` (16 tests, 2026-06-17).
- Web `type-check` clean for `apps/web/src/lib/services/gcc-rule-library/**` and routes (2026-06-17).
