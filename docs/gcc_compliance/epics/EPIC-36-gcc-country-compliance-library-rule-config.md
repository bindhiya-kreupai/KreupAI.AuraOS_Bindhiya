# EPIC-36: GCC Country Compliance Library & Rule Config

> **Source:** GCC HR Compliance Handbook — Appendix A2 – Country-Wise Labour Law Summary
> **Module:** platform · **Labels:** `epic`, `gcc-compliance`, `platform`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver the authoritative GCC country compliance library in AuraOS: per-country labour-law and HR compliance rule sets (UAE, Saudi Arabia, Bahrain, Qatar, Oman, Kuwait) covering payroll, social insurance, nationalization and immigration, plus side-by-side comparison tables. These versioned country rule packs are the single source of truth that feeds the rule engine and every compliance module, with a country compliance dashboard and monthly country certificate on top.

## Business Value

Centralizes the legal knowledge that makes the whole platform country-correct — so a UAE entity applies UAE WPS windows and EOSB, a Saudi entity applies GOSI/Qiwa/Nitaqat, and so on, without bespoke code. The comparison tables let multi-country employers manage divergence at a glance, the risk matrix and audit checklist target country-specific exposure, and the certified, versioned library gives auditors proof of which country rules applied and when statutory changes took effect.

## Requirements Covered (handbook sections)

- A2.1 Introduction
- A2.2 GCC-Wide Compliance Themes
- A2.3 UAE Labour Law and HR Compliance Summary
- A2.4 Saudi Arabia Labour Law and HR Compliance Summary
- A2.5 Bahrain Labour Law and HR Compliance Summary
- A2.6 Qatar Labour Law and HR Compliance Summary
- A2.7 Oman Labour Law and HR Compliance Summary
- A2.8 Kuwait Labour Law and HR Compliance Summary
- A2.9 GCC Country Comparison Table
- A2.10 Payroll Compliance Comparison
- A2.11 Social Insurance Comparison
- A2.12 Nationalization Comparison
- A2.13 Immigration Comparison
- A2.14 Country-Wise Compliance Risk Matrix
- A2.15 Country-Wise Audit Checklist
- A2.16 HRMS Country Configuration Design
- A2.17 Country-Wise Compliance Dashboard
- A2.18 Monthly Country Compliance Certificate
- A2.19 Key Takeaways

## Out of Scope

- The generic rule-engine runtime/resolution mechanism itself (built in EPIC-34); this epic authors and curates the country content/rule packs it consumes.
- Domain execution logic (payroll runs, WPS submission, visa processing) — handled by domain epics that read these rule packs.
- Compliance calendar scheduling (EPIC-35) — consumes country deadlines from this library.
- The full KPI catalogue (EPIC-38) — this epic surfaces country-level compliance metrics only.

## Dependencies

- EPIC-02 (Regulatory Framework) · EPIC-34 (Country Rule Engine runtime) · feeds EPIC-34–EPIC-35, EPIC-37–EPIC-38 and all domain epics

## Epic Definition of Done

- [ ] Per-country rule packs (UAE/KSA/BH/QA/OM/KW) are authored, versioned and effective-dated in the rule engine.
- [ ] Payroll, social-insurance, nationalization and immigration comparison tables are generated from the live rule packs.
- [ ] GCC-wide themes and per-country summaries are published as structured, queryable references.
- [ ] Country-wise risk matrix and audit checklist are configurable and tenant-editable.
- [ ] The HRMS country configuration design binds each entity to its country rule pack.
- [ ] Country compliance dashboard and monthly country certificate are produced and audit-logged.
- [ ] Every rule-pack change is versioned, attributable and audit-trailed.

---

## User Stories

### EPIC-36-S01 — Country library structure, themes & rule-pack model

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a structured country compliance library with GCC-wide themes, **so that** per-country rules are authored against a consistent schema feeding the rule engine.
**Description**
Establish the library foundation: the rule-pack schema (domain, rule key, value/formula, effective date, authority reference, citation), the GCC-wide compliance themes (common obligations across all six countries), and the introduction/overview that frame the per-country summaries. Rule packs are versioned and bind to the EPIC-34 rule engine.

**Acceptance Criteria**

- [ ] Given the library, when structured, then each rule carries domain, key, value/formula, effective date, authority and citation.
- [ ] Given GCC-wide themes, when authored, then common obligations are captured as shared/base rules inheritable by country packs.
- [ ] Given a rule pack, when published, then it is versioned, effective-dated and registered with the rule engine.
- [ ] Given any rule-pack change, when saved, then it is audit-logged with author and source citation.

**Tasks**

- [ ] Backend: `country_rule_pack`, `compliance_theme`, `rule_citation` schemas
- [ ] Backend: rule-pack registration with the EPIC-34 rule engine
- [ ] Frontend: country library overview + theme browser
- [ ] Rules/Config: GCC-wide base theme rules
- [ ] Tests: unit tests for rule-pack registration and citation capture

**Covers:** A2.1, A2.2, A2.16
**Dependencies:** EPIC-02, EPIC-34

### EPIC-36-S02 — UAE & Saudi Arabia rule sets and summaries

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** authored UAE and Saudi Arabia rule packs and summaries, **so that** entities in those countries apply correct labour-law rules across all modules.
**Description**
Author the UAE rule pack (MOHRE/ICP, WPS window, fixed-term contracts, leave, EOSB 21/30-day bands, Emiratisation/GPSSA) and the Saudi rule pack (MHRSD/Qiwa/Mudad, GOSI, Nitaqat, working hours, EOSB award) with their structured country summaries, all effective-dated and citation-backed.

**Acceptance Criteria**

- [ ] Given UAE, when authored, then its labour-law summary and rules (contracts, leave, WPS window, EOSB bands, Emiratisation, GPSSA) are captured and bound to the rule engine.
- [ ] Given Saudi Arabia, when authored, then its summary and rules (Qiwa contracts, GOSI, Nitaqat, working hours, EOSB award) are captured.
- [ ] Given a statutory change, when scheduled with an effective date, then it activates correctly and prior versions remain queryable.
- [ ] Given any change, when saved, then it is audit-logged with citation.

**Tasks**

- [ ] Backend: UAE and KSA rule-pack content authored against the schema
- [ ] Backend: country-summary structured store
- [ ] Frontend: UAE/KSA summary + rule-pack editor views
- [ ] Rules/Config: UAE (WPS/EOSB/Emiratisation/GPSSA) and KSA (GOSI/Nitaqat/Qiwa) rules
- [ ] Tests: unit tests validating key UAE/KSA thresholds resolve correctly

**Covers:** A2.3, A2.4
**Dependencies:** EPIC-36-S01

### EPIC-36-S03 — Bahrain & Qatar rule sets and summaries

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** authored Bahrain and Qatar rule packs and summaries, **so that** entities in those countries apply correct labour-law rules across all modules.
**Description**
Author the Bahrain rule pack (LMRA, SIO, Bahrainization, wage protection, EOSB/indemnity) and the Qatar rule pack (MOL, Qatar WPS, working hours, EOSB gratuity) with structured summaries, effective-dated and citation-backed.

**Acceptance Criteria**

- [ ] Given Bahrain, when authored, then its summary and rules (LMRA, SIO, Bahrainization, wage protection, EOSB/indemnity) are captured and bound to the rule engine.
- [ ] Given Qatar, when authored, then its summary and rules (Qatar WPS, working hours, EOSB gratuity) are captured.
- [ ] Given a statutory change, when scheduled, then it activates on its effective date with prior versions retained.
- [ ] Given any change, when saved, then it is audit-logged with citation.

**Tasks**

- [ ] Backend: Bahrain and Qatar rule-pack content authored against the schema
- [ ] Frontend: Bahrain/Qatar summary + rule-pack editor views
- [ ] Rules/Config: Bahrain (SIO/LMRA/Bahrainization/EOSB) and Qatar (WPS/EOSB) rules
- [ ] Tests: unit tests validating key Bahrain/Qatar thresholds resolve correctly

**Covers:** A2.5, A2.6
**Dependencies:** EPIC-36-S01

### EPIC-36-S04 — Oman & Kuwait rule sets and summaries

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** authored Oman and Kuwait rule packs and summaries, **so that** entities in those countries apply correct labour-law rules across all modules.
**Description**
Author the Oman rule pack (PAM, Social Protection System, Omanisation, wage controls, EOSB/social-protection linkage) and the Kuwait rule pack (PACI, wage controls, Kuwaitisation, EOSB indemnity) with structured summaries, effective-dated and citation-backed.

**Acceptance Criteria**

- [ ] Given Oman, when authored, then its summary and rules (Social Protection System, Omanisation, wage controls, EOSB linkage) are captured and bound to the rule engine.
- [ ] Given Kuwait, when authored, then its summary and rules (wage controls, Kuwaitisation, EOSB indemnity) are captured.
- [ ] Given a statutory change, when scheduled, then it activates on its effective date with prior versions retained.
- [ ] Given any change, when saved, then it is audit-logged with citation.

**Tasks**

- [ ] Backend: Oman and Kuwait rule-pack content authored against the schema
- [ ] Frontend: Oman/Kuwait summary + rule-pack editor views
- [ ] Rules/Config: Oman (Omanisation/Social Protection/EOSB) and Kuwait (Kuwaitisation/EOSB) rules
- [ ] Tests: unit tests validating key Oman/Kuwait thresholds resolve correctly

**Covers:** A2.7, A2.8
**Dependencies:** EPIC-36-S01

### EPIC-36-S05 — GCC comparison tables (overview, payroll, social insurance, nationalization, immigration)

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** side-by-side GCC comparison tables generated from the rule packs, **so that** multi-country differences are visible and never drift from the live rules.
**Description**
Generate comparison tables from the live rule packs: the overall GCC country comparison table plus domain comparisons for payroll, social insurance, nationalization and immigration — so each table is a live projection of the rule packs, not a static document, and updates when a country rule changes.

**Acceptance Criteria**

- [ ] Given the rule packs, when compared, then the GCC comparison table and payroll/social-insurance/nationalization/immigration comparisons render the six countries side by side.
- [ ] Given a rule-pack change, when published, then the affected comparison cells update automatically.
- [ ] Given a comparison cell, when clicked, then it drills to the underlying rule and citation.
- [ ] Given a comparison, when exported, then it produces a table export and is audit-logged.

**Tasks**

- [ ] Backend: comparison-projection service reading live rule packs
- [ ] Frontend: comparison-table views (overview + payroll/SI/nationalization/immigration) with drill-down
- [ ] Rules/Config: comparison dimension definitions per domain
- [ ] Tests: integration tests for live projection and auto-update on rule change

**Covers:** A2.9, A2.10, A2.11, A2.12, A2.13
**Dependencies:** EPIC-36-S02, EPIC-36-S03, EPIC-36-S04

### EPIC-36-S06 — Country-wise risk matrix & audit checklist

**Labels:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 3
**As an** Internal Auditor, **I want** a country-wise compliance risk matrix and audit checklist, **so that** country-specific exposure is scored and tested.
**Description**
Provide a configurable country-wise compliance risk matrix (per-country risks such as WPS delay, GOSI underpayment, Nitaqat/Emiratisation shortfall, visa lapse) scored by likelihood × impact, and a country-wise audit checklist that tests each country's key obligations, with remediation tracking.

**Acceptance Criteria**

- [ ] Given a country, when the risk matrix is configured, then its risks carry likelihood, impact, score, owner and linked control.
- [ ] Given the audit checklist, when run per country, then it flags red-flag conditions against that country's obligations.
- [ ] Given a finding, when raised, then it is tracked to remediation with due date and status.
- [ ] Given risk/checklist items, when configured, then they are tenant-editable.

**Tasks**

- [ ] Backend: `country_risk_register` + country audit-rule engine
- [ ] Frontend: country risk heatmap + audit-checklist runner
- [ ] Rules/Config: per-country risk and red-flag definitions
- [ ] Alerts/Workflow: overdue-remediation alerts
- [ ] Tests: integration tests for red-flag detection per country

**Covers:** A2.14, A2.15
**Dependencies:** EPIC-36-S02, EPIC-36-S03, EPIC-36-S04

### EPIC-36-S07 — Country compliance dashboard, monthly certificate & key takeaways

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 3
**As an** Executive / Leadership user, **I want** a country-wise compliance dashboard and monthly country certificate, **so that** per-country compliance status is visible and attestable.
**Description**
Build the country-wise compliance dashboard (per-country compliance status across payroll/WPS/social-insurance/nationalization/immigration with RBAC and drill-down) and the monthly country compliance certificate attesting each country's obligations were met, with the chapter key-takeaways as reference.

**Acceptance Criteria**

- [ ] Given the dashboard, when loaded, then per-country compliance status across domains shows with drill-down.
- [ ] Given RBAC, when a user views, then only in-scope countries/entities are visible.
- [ ] Given the monthly certificate, when generated, then it attests each country's obligations and is blocked while critical country risks are open.
- [ ] Given the certificate, when exported, then it produces a PDF and is audit-logged.

**Tasks**

- [ ] Backend: country-compliance aggregation + certificate generator with gating
- [ ] Frontend: country compliance dashboard + certificate view with e-sign/export and key-takeaways reference
- [ ] Rules/Config: certificate attestation fields per country
- [ ] Tests: integration tests for aggregation, RBAC and certificate gating

**Covers:** A2.17, A2.18, A2.19
**Dependencies:** EPIC-36-S05, EPIC-36-S06
