# GCC Compliance — Remaining Gaps as of 2026-06-17

> Supersedes the per-story `EPIC-XX-SYY-*_gap.md` files dated 2026-06-16.
> Those files predate the bulk of the GCC compliance batched commits and
> are wholesale stale; **~86% of the stories they flagged "Partial" are
> shipped**. This document lists only the ~14% that remain true gaps,
> grouped by theme so they can be planned, batched, and worked together.
>
> **Update 2026-06-17 (Theme A closure):** all 25 EPIC-34 HRMS Configuration
> workspaces (S01, S03–S20, S24–S29) shipped via the generic
> `HrmsConfigObject` registry + 22 per-domain workspaces + implementation
> checklist + connectors + migrations + monthly/go-live certificate.
> **66 gaps remain** (was 91).
>
> **Update 2026-06-17 (Theme B closure):** all 13 nationalisation overlay
> stories (EPIC-16 S06/S07/S08/S12/S13 + EPIC-17 S09/S11/S12/S13 +
> EPIC-18 S07/S08/S14/S15) shipped via the shared
> `nationalisation-overlay` registry (requisition tags, job tags,
> retention ledger with early-attrition flag, L&D plan tracker,
> artificial-risk detection with 9 signals banded LOW/MEDIUM/HIGH/CRITICAL,
> Saudi profession-localisation codes). **53 gaps remain** (was 66).
>
> **Update 2026-06-17 (Themes E + F + I closure):** 12 workforce-extension
> stories shipped via `workforce-extensions` module: ContractorAssignment
> (E — 4 stories across attendance/holidays/accommodation/HSE),
> EmployeeLoanSchedule with equal-installment amortization + UniformPpeIssuance
> register + extended BenefitCatalogue seeds (F — 5 stories), and
> AccommodationTransportRoute / Clinic / MaintenanceTicket with severity-based
> SLA (I — 3 stories). **30 gaps remain** (was 42).
>
> **Update 2026-06-17 (Themes C + D closure):** 5 audit-checklist + risk
> register stories (EPIC-25-S12 · EPIC-26-S11 · EPIC-27-S17 · EPIC-28-S14 ·
> EPIC-29-S15) shipped via the shared `compliance-audit-register` with
> generic `ComplianceAuditChecklistItem` + `ComplianceRiskRegisterEntry`
> using a `domainCode` discriminator, per-domain seeds, and L × I → band
> auto-derivation. 6 form-template stories (EPIC-25-S15 · EPIC-26-S14 ·
> EPIC-27-S20 · EPIC-28-S18 · EPIC-29-S19 · EPIC-30-S17) shipped by
> extending the `hr-forms-compliance` DEFAULT_TEMPLATES catalogue with
> the 4 new templates (MISCONDUCT_REPORT, EOSB_CALC_SHEET,
> VISA_EXIT_CHECKLIST, EMPLOYEE_FILE_AUDIT_SHEET) plus existing
> GRIEVANCE / RESIGNATION / EXIT_CLEARANCE coverage. **42 gaps remain**
> (was 53). Themes E–K unchanged.

## Source of truth

- Read-only cross-audit of `docs/gcc_compliance/epics/*_gap.md` versus
  the actual `apps/web/src/lib/services/<slug>/`,
  `apps/web/src/app/api/v1/<slug>/`,
  `apps/web/src/app/dashboard/<slug>/`, and
  `packages/@aura/database/prisma/schema.prisma` — run 2026-06-17.
- Shipping evidence: `git log --oneline | grep "feat(gcc-compliance)"`
  (38 commits).

## Headline numbers

| Bucket                                            | Stories                                                                     |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| Total stories in spec                             | ~650                                                                        |
| Audited 2026-06-17                                | 642                                                                         |
| **SHIPPED** (full stack present — gap file stale) | **551** (86%)                                                               |
| **TRUE-GAP** (real work remaining)                | **91** (14%)                                                                |
| Audit-clean epics (zero gaps)                     | **EPIC-01 → EPIC-08, EPIC-32, EPIC-33, EPIC-35, EPIC-36, EPIC-37, EPIC-38** |

EPIC-34 (HRMS Configuration) carries the largest single concentration of
remaining work — **25 of the 91 gaps**.

---

## Remaining gaps grouped by theme

### Theme A — EPIC-34 HRMS Configuration workspaces (25 stories) — ✅ CLOSED 2026-06-17

Closed in commit batching the generic `HrmsConfigObject` registry
(scope: GLOBAL → COUNTRY → LEGAL_ENTITY → DOMAIN; lifecycle DRAFT →
PENDING_APPROVAL → ACTIVE → RETIRED with maker-checker); 22 per-domain
workspaces (LEGAL_ENTITY, EMPLOYEE_DATA_DICTIONARY, POSITION_RULES,
CONTRACT_TEMPLATE, PAYROLL_COMPONENT, PAYROLL_CALENDAR, PRORATION_RULE,
GL_MAPPING, WPS_MAPPING, SOCIAL_INSURANCE, NATIONALISATION, IMMIGRATION,
LEAVE, ATTENDANCE, BENEFITS, ACCOMMODATION, HSE, ER_MATRIX, SEPARATION,
EOSB_FORMULA, DOCUMENT_RETENTION, RBAC_SCOPE); implementation checklist
(S27); connector / secret-rotation registry (S25); data-migration plans
(S26); monthly + go-live certificate with gating on
`MAKER_CHECKER_PENDING | CONNECTOR_HEALTH | MIGRATION_FAILED |
IMPLEMENTATION_OPEN` (S28, S29).

Files:

- migration `20260704000000_add_hrms_config_workspaces`
- `apps/web/src/lib/services/hrms-config/{registry,workspaces,implementation,connector,migration,certificate}.service.ts`
- API `/api/v1/hrms-config/{config-objects,workspaces,implementation,connectors,migrations,certificates}`
- Dashboards `/dashboard/hrms-config/{config-objects,implementation,connectors,migrations,certificate}`
- 17 Vitest covering scope priority, maker-checker, gating, rotation

Original (pre-closure) detail kept below for traceability.

| Story  | Missing                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------- |
| 34-S01 | `config_object_registry` + scope-resolution service (global → country → entity → domain)                |
| 34-S03 | Legal-entity-scoped config workspace + binding under `hrms-config`                                      |
| 34-S04 | Employee master data dictionary registry + field-governance service                                     |
| 34-S05 | Position / org-rule config workspace over `OrgPositionControl`                                          |
| 34-S06 | Contract template / clause library + lifecycle config model                                             |
| 34-S07 | `pay_component` / `payroll_calendar` / `proration_rule` / `gl_mapping` config + statutory-base resolver |
| 34-S08 | WPS / Mudad SIF file-layout mapping config                                                              |
| 34-S09 | Unified social-insurance config workspace surfacing GOSI/GPSSA/SIO                                      |
| 34-S10 | Unified nationalisation config workspace (Nitaqat/Emiratisation/Bahrainisation/Omanisation)             |
| 34-S11 | Immigration config (visa categories, permit rules, sponsor matrix)                                      |
| 34-S12 | Leave config workspace exposing `LeavePolicy` + entitlement rules with effective-dating                 |
| 34-S13 | Attendance/OT config workspace exposing `AttendancePolicy` + `OtPolicy`                                 |
| 34-S14 | Benefits-plan eligibility/coverage config                                                               |
| 34-S15 | Accommodation config (housing categories, allowances)                                                   |
| 34-S16 | HSE config (incident categories, PPE matrix, training cadence)                                          |
| 34-S17 | ER/disciplinary matrix config (offence → action mapping, escalation)                                    |
| 34-S18 | Separation/final-settlement config (reason codes, clearance steps)                                      |
| 34-S19 | Per-country EOSB formula registry + formula-resolver (current `EosbCalculation` persists outputs only)  |
| 34-S20 | Document retention/category config workspace under `hrms-config`                                        |
| 34-S24 | RBAC scope-config workspace tying `GccRoleScope` to data-row filters                                    |
| 34-S25 | Data-integration endpoint/connector config registry + secret rotation                                   |
| 34-S26 | Data-migration plan/run/validation model + tooling service                                              |
| 34-S27 | Implementation checklist / configuration control sheet + sign-off API                                   |
| 34-S28 | HRMS-config KPI compute + risk-matrix service (dashboard scaffold present)                              |
| 34-S29 | `HrmsConfigCertificate` model + go-live sign-off flow                                                   |

### Theme B — Nationalisation pipeline / retention / L&D overlays (13 stories) — ✅ CLOSED 2026-06-17

Shipped via `nationalisation-overlay` shared registry. New tables:
`NationalisationRequisitionTag`, `NationalisationJobTag`,
`NationalisationRetentionEvent` (with `isEarlyAttrition` flag derived
from `daysFromHire < threshold`), `NationalisationDevelopmentPlan`,
`NationalisationArtificialRiskFlag` (9 signal codes, banded by count),
`SaudiProfessionLocalization`. Consumed by emiratisation-, nitaqat-,
bahrainization-compliance services. Migration
`20260705000000_add_nationalisation_overlay`.

Files:

- 7 services in `apps/web/src/lib/services/nationalisation-overlay/`
- 7 API routes under `/api/v1/nationalisation-overlay/`
- 7 dashboard pages under `/dashboard/nationalisation-overlay/`
- Menu: `NATIONALISATION_OVERLAY` under `GCC_COMPLIANCE`
- 25 Vitest covering helpers, validation, retention KPIs, risk bands,
  scope resolution

Original (pre-closure) detail kept below for traceability.

| Story  | Missing                                                                     |
| ------ | --------------------------------------------------------------------------- |
| 16-S06 | Fake/artificial Emiratisation detection (GPSSA × payroll × WPS cross-check) |
| 16-S07 | UAE-national recruitment pipeline overlay (req/source/pipeline tags)        |
| 16-S08 | Eligible-role tagging on Job/JobProfile for Emiratisation                   |
| 16-S12 | UAE-national retention metrics / early-attrition tracking                   |
| 16-S13 | UAE-national training/development plan tracking                             |
| 17-S09 | Saudi profession-localisation code table / job-classification linkage       |
| 17-S11 | Saudi-flag overlay on TA pipeline                                           |
| 17-S12 | Saudi retention tracker tied to Nitaqat                                     |
| 17-S13 | Fake/artificial Saudization detection (Bahrainization has it; copy pattern) |
| 18-S07 | Bahraini-flag overlay on TA pipeline                                        |
| 18-S08 | Job-design tagging for Bahrainization on positions                          |
| 18-S14 | Bahraini retention KPI tracker                                              |
| 18-S15 | Bahraini learning/development plan tagging                                  |

### Theme C — Audit checklist + risk matrix register (5 stories) — ✅ CLOSED 2026-06-17

Shipped via shared `compliance-audit-register` (generic
`ComplianceAuditChecklistItem` + `ComplianceRiskRegisterEntry` with
`domainCode` discriminator: ER · DISCIPLINARY · SEPARATION · EOSB ·
VISA_EXIT). Per-domain seeds, L × I → band auto-derivation (LOW < 4,
MEDIUM 4–8, HIGH 9–15, CRITICAL ≥ 16). Migration
`20260706000000_add_compliance_audit_register`. 18 Vitest covering
band derivation, range validation, seed integrity, review flow.

| Story  | Missing                                             |
| ------ | --------------------------------------------------- |
| 25-S12 | ER audit checklist + risk matrix register           |
| 26-S11 | Disciplinary audit checklist + risk matrix register |
| 27-S17 | Separation audit checklist + risk matrix register   |
| 28-S14 | EOSB audit checklist + risk matrix register         |
| 29-S15 | Visa-exit audit checklist + risk matrix register    |

### Theme D — Configurable sample form templates (6 stories) — ✅ CLOSED 2026-06-17

Shipped by extending `hr-forms-compliance` DEFAULT_TEMPLATES with
MISCONDUCT_REPORT (EPIC-26-S14), EOSB_CALC_SHEET (EPIC-28-S18),
VISA_EXIT_CHECKLIST (EPIC-29-S19), EMPLOYEE_FILE_AUDIT_SHEET
(EPIC-30-S17). The remaining gap-list entries (EPIC-25-S15
Grievance, EPIC-27-S20 Separation request / Exit clearance) were
already covered by the existing GRIEVANCE / RESIGNATION /
EXIT_CLEARANCE templates — the audit narrowly read them as missing.
Each template has a `writebackTarget` that ties submissions to the
domain owner.

| Story  | Missing                                           |
| ------ | ------------------------------------------------- |
| 25-S15 | Grievance intake form template                    |
| 26-S14 | Misconduct report form template                   |
| 27-S20 | Separation request / exit clearance form template |
| 28-S18 | EOSB calc sheet / export template                 |
| 29-S19 | Visa-exit checklist form template                 |
| 30-S17 | Employee-file audit sheet form template           |

### Theme E — Contractor flow tagging (4 stories)

Services mention contractor scope in headers but lack the actual
contractor-tagged data flow.

| Story  | Missing                              |
| ------ | ------------------------------------ |
| 19-S15 | Contractor-tagged attendance flow    |
| 21-S11 | Contractor-tagged holiday flow       |
| 23-S13 | Contractor-tagged accommodation flow |
| 24-S13 | Contractor HSE flow                  |

### Theme F — Benefits sub-categories (5 stories)

The `BenefitCatalogue` default seeds medical, life, ticket, housing,
transport. The following are explicitly missing.

| Story  | Missing                                                                          |
| ------ | -------------------------------------------------------------------------------- |
| 22-S08 | Education assistance plan                                                        |
| 22-S09 | Employee loan / salary advance tracker with amortisation                         |
| 22-S10 | Relocation / mobilisation tracker                                                |
| 22-S11 | Uniforms / PPE / tools issuance register (HSE has PPE; benefits side is missing) |
| 22-S12 | Wellness / EAP enrolment model                                                   |

### Theme G — HSE sub-domains beyond risk / permit / incident / training (6 stories)

`hse-compliance` ships risk assessment (L×S → band), permit-to-work,
incident register (with GOSI notify), training register, and LTIFR
certificate. The following sub-domains aren't modelled.

| Story  | Missing                                                                     |
| ------ | --------------------------------------------------------------------------- |
| 24-S02 | HSE-role / safety-officer registry                                          |
| 24-S04 | Heat-stress / midday-break rule (Ramadan exists; ambient-heat rule missing) |
| 24-S07 | Toolbox-talk log model                                                      |
| 24-S11 | Emergency-drill / evacuation tracker                                        |
| 24-S12 | First-aider / clinic register                                               |
| 24-S14 | HSE welfare inspection flow distinct from accommodation                     |

### Theme H — EPIC-29 Visa-Exit deep gaps (4 stories)

| Story  | Missing                                                                               |
| ------ | ------------------------------------------------------------------------------------- |
| 29-S04 | `TRANSFER` scenario has no transfer-specific PRO action set (uses DEFAULT)            |
| 29-S06 | Dependent visa cascade is single action; no per-dependent register                    |
| 29-S10 | Benefits-closure cascade (insurance / accommodation / EOS) not modelled as a register |
| 29-S12 | Employee communication templates / notification register                              |

### Theme I — EPIC-23 Accommodation ops gaps (3 stories)

| Story  | Missing                                                        |
| ------ | -------------------------------------------------------------- |
| 23-S08 | Worker-welfare transport-route tracker linking site → worksite |
| 23-S09 | On-site medical / clinic tracker                               |
| 23-S11 | Maintenance / work-order ticketing model                       |

### Theme J — Org & Payroll structural gaps (5 stories)

| Story  | Missing                                                                                    |
| ------ | ------------------------------------------------------------------------------------------ |
| 09-S06 | Job architecture / job families / job profiles models surfaced via `org-compliance`        |
| 09-S07 | Configurable grade / `SalaryBand` tables under `org-compliance`                            |
| 09-S10 | Delegation-of-Authority (DoA) matrix model + API                                           |
| 10-S04 | Payroll calendar / cut-off control object in `payroll-compliance`                          |
| 10-S13 | Payroll variance / reconciliation register (WPS/GOSI variance exist; payroll-side doesn't) |

### Theme K — Misc remaining (4 stories)

| Story  | Missing                                                                                             |
| ------ | --------------------------------------------------------------------------------------------------- |
| 11-S05 | Bahrain/Oman/Kuwait unified wage-file generator under `wps-compliance` (per-country services exist) |
| 12-S12 | Fatigue / H&S risk-control rules (max consecutive shifts, rest hours)                               |
| 12-S13 | OT fraud / abuse detection rules (duplicate punches, repeat over-cap)                               |
| 15-S09 | Expat EOS gratuity funding link to SIO scheme as a discrete funding account                         |
| 20-S16 | Return-to-work workflow / long-leave notice-period gating                                           |
| 21-S12 | Holiday-calendar change-management / communication workflow                                         |
| 25-S04 | Informal-resolution / mediation distinct grievance state (currently only OPEN → RESOLVED)           |
| 27-S05 | Redundancy / restructuring batch workflow + selection criteria                                      |
| 27-S16 | Separation-side data-privacy retention controls inside `separation-compliance` (relies on EPIC-30)  |
| 30-S06 | Physical file-location controls (warehouse / box / shelf)                                           |
| 30-S07 | Classification-based RBAC for record access enforced in service                                     |
| 30-S13 | Formal risk-matrix linkage from audit findings                                                      |
| 31-S04 | Country-wise rollup dimension in `executive-compliance` (currently per-domain only)                 |
| 31-S14 | Dashboard access control (RBAC per executive role) in `executive-compliance`                        |

---

## How to use this document

1. **Treat this as the single source of truth** for remaining GCC
   compliance work. The 688 `_gap.md` files are kept for historical
   audit traceability but should be regarded as a 2026-06-16 snapshot
   only.
2. **Sequence by theme.** Theme A (EPIC-34 config workspaces) is the
   biggest single block and worth scheduling as one or two batched
   commits per the established pattern.
3. **Themes C and D (audit-checklist + form-template patterns)** are
   each a single repeating shape — close in one pass per theme.
4. **Themes B, E, F, G, H, I, J, K** are domain-specific and best done
   alongside the next round of work in those domains.

## Pattern reminders (carried over from prior closures)

- Layer behind existing code where present (e.g. EOSB calc layered);
  otherwise build canonical: config → register → workflow → certificate.
- Every epic ends in a monthly compliance certificate that refuses to
  sign while gating reasons remain.
- Menu lives under `GCC_COMPLIANCE` parent in
  `packages/@aura/config/src/super-admin-menu.ts`.
- Migration file under `packages/@aura/database/prisma/migrations/`
  with defensive `DO $$ IF EXISTS pg_type … END $$` blocks for any
  enum work (deployed DB uses `prisma db push`, not `migrate`).
- Vitest in `apps/web/src/lib/services/__tests__/<slug>.service.test.ts`
  covering pure functions + state machine + gated-certificate sign
  refusal.
