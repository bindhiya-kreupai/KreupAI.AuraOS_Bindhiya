# Gap Analysis: EPIC-38: Compliance KPI & Scorecard Library

> **⚠️ STALE — superseded 2026-06-17.** This epic-level gap file predates the GCC compliance batched commits. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list across all 38 epics (~14% of stories are true gaps; the rest are shipped). This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-38-compliance-kpi-scorecard-library.md](./EPIC-38-compliance-kpi-scorecard-library.md)
> Module: analytics
> Generated: 2026-06-16 · Updated: 2026-06-17 (gap closure batch)

## Summary

- Stories assessed: 8
- Implemented (pending migration / operational verification): 8

## Closure Batch — 2026-06-17

**Schema**: `20260617150000_add_kpi_scorecard_library` — `aura_kpi_definition`, `aura_kpi_threshold`, `aura_kpi_value`, `aura_kpi_data_quality_check`, `aura_kpi_scorecard_weight`, `aura_kpi_certificate`.

**Services**: `apps/web/src/lib/services/kpi-scorecard/*` — catalog (versioned definitions with approve/retire), threshold (country-aware RAG banding), data-quality (completeness/timeliness/accuracy/source-reconciliation), compute (publication gate), scorecard (weighted roll-up), certificate (monthly attestation with DQ/red-KPI gating). `kpi-catalog-seed.ts` seeds 25 KPIs across 17 domains.

**API**: `/api/v1/kpi-scorecard/{definitions,thresholds,values,scorecard,certificate,data-quality}`.

**Dashboard**: `/dashboard/kpi-scorecard/` landing + `catalog`, `scorecard`, `thresholds`, `certificate` workspaces.

**Tests**: `apps/web/src/lib/services/__tests__/kpi-scorecard.service.test.ts` — 19 unit tests passing.

## Storywise Gaps

### EPIC-38-S01 — KPI governance & catalogue model

**Status:** Implemented - pending migration
**Covers:** A7.1, A7.2

`KpiDefinition` versioned; `approve()` retires the prior ACTIVE definition for the same code.

### EPIC-38-S02 — Governance, workforce & payroll KPI sets

**Status:** Implemented - pending wiring to live data sources
**Covers:** A7.3, A7.4, A7.5

Seeded KPIs (`POLICY_ACK_RATE`, `CONTROL_COMPLETION_RATE`, `HEADCOUNT_ACCURACY`, `ATTRITION_RATE`, `PAYROLL_ON_TIME`, `PAYROLL_ERROR_RATE`).

### EPIC-38-S03 — Statutory-compliance KPI sets

**Status:** Implemented - pending wiring to live data sources
**Covers:** A7.6, A7.7, A7.8, A7.9

Seeded `WPS_ON_TIME_PCT`, `SALARY_DELAY_INCIDENTS`, `SI_FILING_TIMELINESS`, `SI_CONTRIBUTION_MATCH`, `NATIONALIZATION_RATE`, `NITAQAT_BAND`, `VALID_DOC_PCT`, `EXPIRY_BREACHES` with statutory references that cross-link to EPIC-36 rule packs.

### EPIC-38-S04 — Operational compliance KPI sets

**Status:** Implemented - pending wiring to live data sources
**Covers:** A7.10–A7.14

Seeded `LEAVE_LIABILITY_RATIO`, `OT_OVER_CAP_PCT`, `MANDATORY_BENEFIT_COVER`, `CAMP_INSPECTION_PCT`, `LTIFR`.

### EPIC-38-S05 — Lifecycle & assurance KPI sets

**Status:** Implemented - pending wiring to live data sources
**Covers:** A7.15–A7.19

Seeded `GRIEVANCE_SLA`, `FINAL_SETTLEMENT_ON_TIME`, `DOC_FILE_COMPLETENESS`, `AUDIT_CLOSURE_RATE`, `AUTOMATION_COVERAGE`.

### EPIC-38-S06 — KPI threshold library & data-quality controls

**Status:** Implemented
**Covers:** A7.21, A7.23

`KpiThresholdService.band()` resolves RAG with optional country-specific overrides. `KpiDataQualityService.runStandardChecks()` implements completeness/timeliness/accuracy/source-reconciliation. `KpiComputeService.recordWithDq()` is the publication gate.

### EPIC-38-S07 — Executive compliance scorecard & KPI dashboards

**Status:** Implemented
**Covers:** A7.20, A7.22

`KpiScorecardService.compute()` rolls up GREEN/AMBER/RED counts into a per-domain weighted score (G=100, A=60, R=20) and overall score (≥85 GREEN, ≥70 AMBER, else RED).

### EPIC-38-S08 — KPI automation, monthly KPI certificate & key takeaways

**Status:** Implemented - pending scheduler wiring
**Covers:** A7.24, A7.25, A7.26

`KpiCertificateService.generate()` sets `gatingReason` when DQ failures > 0 or actioned-red < red. `sign()` refuses while gated.

## Next verification

- Apply migration `20260617150000_add_kpi_scorecard_library`.
- Targeted tests: `pnpm --filter web test:run src/lib/services/__tests__/kpi-scorecard.service.test.ts` (19 passing, 2026-06-17).
