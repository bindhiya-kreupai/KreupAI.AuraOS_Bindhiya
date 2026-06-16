# EPIC-22: Chapter 22 – Employee Benefits Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 22 – Employee Benefits Compliance
> **Module:** Benefits · **Labels:** `epic`, `gcc-compliance`, `benefits`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver a configurable Employee Benefits module in AuraOS that governs the full lifecycle of every GCC benefit — medical and life insurance, air tickets, housing, transport, mobile, meals, education, loans/advances, relocation, uniforms/PPE and wellness — from eligibility rules through payroll and EOSB integration, vendor management and data privacy. The module enforces benefit policy and eligibility per legal entity and country, tracks insurance and entitlement registers with expiry alerts, and produces certificates, KPIs, dashboards and audit evidence.

## Business Value

Prevents non-compliance with mandatory benefit obligations (e.g. UAE/Qatar mandatory medical cover, air-ticket entitlements, accommodation duty of care), avoids fines and labour complaints, and removes manual spreadsheet tracking. Gives Finance accurate benefit cost and EOSB-impacting data, gives employees self-service visibility, and gives auditors a complete, dated benefits evidence trail with vendor and privacy controls.

## Requirements Covered (handbook sections)

- 22.1 Introduction
- 22.2 Objectives of Employee Benefits Compliance
- 22.3 GCC Benefits Governance Framework
- 22.4 Benefits Policy
- 22.5 Medical Insurance
- 22.6 Life Insurance and Personal Accident Coverage
- 22.7 Air Ticket Benefits
- 22.8 Housing Benefits
- 22.9 Transport Benefits
- 22.10 Mobile and Communication Benefits
- 22.11 Meal and Cafeteria Benefits
- 22.12 Education Assistance
- 22.13 Employee Loans and Salary Advances
- 22.14 Relocation and Mobilization Benefits
- 22.15 Uniforms, PPE and Work Tools
- 22.16 Wellness and Employee Assistance Benefits
- 22.17 Accommodation and Labour Camp Benefits
- 22.18 Benefits and Payroll Integration
- 22.19 Benefits and End-of-Service
- 22.20 Benefits Vendor Management
- 22.21 Benefits Data Privacy
- 22.22 Benefits Audit Checklist
- 22.23 Benefits KPIs
- 22.24 Benefits Risk Matrix
- 22.25 HRMS Benefits Automation Design
- 22.26 Benefits Dashboard
- 22.27 Monthly Benefits Compliance Pack
- 22.28 Sample Benefits Monthly Compliance Certificate
- 22.29 Sample Benefits Exception Register
- 22.30 Sample Medical Insurance Tracker
- 22.31 Key Takeaways

## Out of Scope

- Core EOSB/gratuity calculation engine itself (consumed from EPIC-28; this epic only feeds benefit-related inputs).
- Accommodation/labour-camp operational compliance detail (owned by EPIC-23; this epic only links housing benefit eligibility and cost).
- Payroll run mechanics and WPS file generation (owned by EPIC-10/EPIC-11; this epic supplies benefit earnings/deductions).
- Procurement/contract sourcing of vendors outside HR benefit administration.

## Dependencies

- EPIC-10 (Payroll Management) — benefit earnings/deductions and proration
- EPIC-11 (WPS) — wage-file impact of cash benefits
- EPIC-23 (Accommodation) — housing benefit linkage
- EPIC-28 (EOSB) — benefit treatment in final settlement
- EPIC-08 (Employee Records) / Platform RBAC, rule engine, document store, alerts

## Epic Definition of Done

- [ ] Configurable benefit catalogue and eligibility rules operate per country and legal entity through the rule engine.
- [ ] Every benefit type (22.5–22.17) has master data, eligibility, enrolment/issuance and expiry/renewal tracking.
- [ ] Benefits post correctly to payroll (cash/in-kind, taxable/non-taxable, recoverable) and feed EOSB-relevant inputs.
- [ ] Vendor records, SLAs, policy documents and renewals are tracked with alerts.
- [ ] Sensitive benefit data (medical, dependants) is access-controlled, masked and consent-logged.
- [ ] Audit checklist, risk matrix, KPIs, dashboard and monthly compliance pack/certificate generate from live data.
- [ ] Full audit trail captures every eligibility change, enrolment, exception and approval.

---

## User Stories

### EPIC-22-S01 — Benefits governance, policy & catalogue framework

**Labels:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 8
**As a** HR Manager, **I want** a configurable benefits governance framework and policy library, **so that** every benefit offered is backed by an approved, versioned policy with clear ownership and country scope.

**Description**
Establish the foundational benefits governance model in AuraOS: a benefit catalogue, a policy register linked to each benefit, governance roles (owner, approver, reviewer), and country/entity applicability. This frames all later benefit-specific stories and the objectives of benefits compliance.

**Acceptance Criteria**

- [ ] Given a HR Manager, when they create a benefit catalogue item, then they must link an approved benefit policy version, country scope (UAE/KSA/Bahrain/Qatar/Oman/Kuwait), legal entity and effective dates.
- [ ] Given a benefit policy, when it is published, then prior versions are retained read-only and the change is audit-logged with author and timestamp.
- [ ] Given country scope, when a benefit is statutorily mandatory (e.g. UAE/Qatar medical), then the catalogue flags it as "Mandatory" and blocks deactivation without override approval.
- [ ] Given governance roles, when a user lacks the Benefits Owner role, then create/edit of catalogue and policy is blocked by RBAC.
- [ ] Given a published catalogue, then employees see only benefits applicable to their entity/country in self-service.

**Tasks**

- [ ] Backend: `benefit_catalogue` (id, code, name, category, in_kind/cash, mandatory_flag, country_scope[], legal_entity_id, status) and `benefit_policy` (id, benefit_id, version, body, effective_from, status) schema/migration
- [ ] Backend: governance service for policy versioning + publish workflow
- [ ] Frontend: Benefits Admin — catalogue & policy management screens
- [ ] Rules/Config: country/entity applicability and mandatory-benefit flags
- [ ] Alerts/Workflow: policy approval workflow (owner → approver)
- [ ] Tests: unit (versioning/RBAC) + e2e (publish + self-service visibility)

**Covers:** 22.1, 22.2, 22.3, 22.4
**Dependencies:** —

### EPIC-22-S02 — Benefit eligibility rule engine

**Labels:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 8
**As a** HR Admin, **I want** configurable eligibility rules per benefit, **so that** entitlements are auto-derived from grade, nationality, contract type, location and service period without manual judgement.

**Description**
A central eligibility engine evaluates each employee against benefit rules (e.g. grade band → housing allowance tier, service ≥ 1 yr → annual air ticket, family vs single status). Drives enrolment, payroll values and self-service entitlement display.

**Acceptance Criteria**

- [ ] Given an eligibility rule, when defined, then it supports conditions on grade/band, nationality, contract type, work location, marital/family status and service period.
- [ ] Given an employee record change (e.g. grade promotion), when saved, then eligibility re-evaluates and proposes entitlement changes with effective dating.
- [ ] Given a conflict between two rules, then the engine applies the most specific/highest-priority rule and logs the resolution.
- [ ] Given an ineligible-to-eligible transition, then an enrolment task is auto-created for the relevant benefit.
- [ ] Given any eligibility change, then it is captured in the audit trail with the triggering event.

**Tasks**

- [ ] Backend: `benefit_eligibility_rule` and `employee_benefit_entitlement` entities with effective-dated rows
- [ ] Backend: rule evaluation service triggered by employee/grade/contract events on the event bus
- [ ] Frontend: rule builder UI + entitlement preview per employee
- [ ] Rules/Config: priority/precedence and family-status conditions per country
- [ ] Tests: integration (event-driven re-evaluation) + unit (precedence)

**Covers:** 22.2, 22.3
**Dependencies:** EPIC-22-S01

### EPIC-22-S03 — Medical insurance administration & tracker

**Labels:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 8
**As a** HR Admin, **I want** to administer mandatory medical insurance for employees and dependants, **so that** every required member is covered, renewals never lapse, and we evidence compliance to authorities.

**Description**
Manage medical policies, member enrolment (including dependants), plan tiers, card issuance and renewal/expiry tracking aligned to GCC mandatory health-cover rules (e.g. Dubai DHA / Abu Dhabi DOH, Qatar). Includes the Sample Medical Insurance Tracker register.

**Acceptance Criteria**

- [ ] Given a new joiner in a mandatory-cover emirate/country, when onboarded, then a medical enrolment task is created and joiner cannot be marked benefit-complete until cover is active.
- [ ] Given a policy expiry, when it is 60/30/7 days out, then alerts fire to the Benefits Owner and PRO.
- [ ] Given a dependant added, when enrolled, then plan tier and premium are derived and dependant relationship/documents are stored.
- [ ] Given the Medical Insurance Tracker, then it exports member, plan, card number, validity, premium and renewal status, with sensitive fields RBAC-masked.
- [ ] Given any enrolment/termination, then it is audit-logged and reflected in payroll deduction (employee share) where applicable.

**Tasks**

- [ ] Backend: `medical_policy`, `medical_member` (employee/dependant, plan_tier, card_no, valid_from/to, premium) schema
- [ ] Backend: renewal/expiry alert job + onboarding enrolment trigger
- [ ] Frontend: medical enrolment screen + Medical Insurance Tracker register/export
- [ ] Rules/Config: mandatory-cover rules per emirate/country; employee premium share
- [ ] Alerts/Workflow: 60/30/7-day renewal alerts; lapse escalation
- [ ] Tests: e2e (joiner enrolment block) + unit (expiry alerts)

**Covers:** 22.5, 22.30
**Dependencies:** EPIC-22-S02

### EPIC-22-S04 — Life insurance & personal accident coverage

**Labels:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 5
**As a** HR Admin, **I want** to manage group life and personal accident (GPA) coverage, **so that** sum-assured, beneficiaries and claims are tracked and the policy stays current.

**Description**
Administer group life/GPA policies with sum-assured derived from salary multiples, beneficiary records, and claim event tracking, with renewal alerts and census export to the insurer.

**Acceptance Criteria**

- [ ] Given a covered employee, when their salary changes, then sum-assured (e.g. 24× basic) recalculates and flags census update.
- [ ] Given a beneficiary, when recorded, then relationship and allocation % must total 100% before save.
- [ ] Given a policy renewal, when 60/30 days out, then alert the Benefits Owner and request updated census.
- [ ] Given a claim event (death/disability in service), then a claim record links to the employee and to separation/EOSB where relevant.
- [ ] Given census export, then it includes member, DOB, sum-assured and excludes data the insurer is not entitled to per privacy rules.

**Tasks**

- [ ] Backend: `life_gpa_policy`, `life_member`, `life_beneficiary`, `life_claim` schema
- [ ] Backend: sum-assured calc + census generation service
- [ ] Frontend: coverage & beneficiary management; claim register
- [ ] Rules/Config: salary-multiple and category rules per entity
- [ ] Tests: unit (sum-assured/beneficiary validation)

**Covers:** 22.6
**Dependencies:** EPIC-22-S02

### EPIC-22-S05 — Air ticket entitlement & accrual

**Labels:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 5
**As a** HR Admin, **I want** to manage air-ticket entitlements (annual/biennial, class, family), **so that** tickets/allowances are issued correctly and accrued for cost and EOSB-adjacent settlement.

**Description**
Track ticket eligibility (route, class, single/family, frequency), accrual of ticket value, issuance vs encashment, and balance carry. Feeds payroll (cash option) and final settlement.

**Acceptance Criteria**

- [ ] Given an employee with annual ticket eligibility, when 12 months of service complete, then a ticket entitlement becomes available and is logged.
- [ ] Given a family ticket entitlement, when claimed, then number of tickets is validated against registered eligible dependants.
- [ ] Given an encashment option, when chosen, then ticket value posts to payroll as a benefit earning with country tax treatment.
- [ ] Given separation, then unused accrued ticket value is computed and passed to final settlement.
- [ ] Given any issuance/encashment, then it decrements the entitlement balance and is audit-logged.

**Tasks**

- [ ] Backend: `air_ticket_entitlement`, `air_ticket_transaction` (issue/encash) schema with accrual
- [ ] Backend: accrual + balance service; payroll/settlement feed
- [ ] Frontend: employee ticket request (self-service) + admin issuance
- [ ] Rules/Config: frequency/class/route rules per grade and country
- [ ] Tests: integration (accrual + settlement feed)

**Covers:** 22.7
**Dependencies:** EPIC-22-S02, EPIC-22-S15

### EPIC-22-S06 — Housing benefit (allowance vs provided)

**Labels:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 5
**As a** HR Admin, **I want** to administer housing benefits as either allowance or company-provided accommodation, **so that** entitlement, cost and payroll treatment are correct and linked to accommodation records.

**Description**
Support housing-allowance tiers and company-provided housing, with mutual exclusivity, cost allocation and a link to the Accommodation module (EPIC-23) for provided cases.

**Acceptance Criteria**

- [ ] Given a grade band, when housing eligibility is evaluated, then an allowance tier or "company-provided" type is assigned (not both).
- [ ] Given company-provided housing, then the housing allowance is suppressed in payroll and the accommodation unit is linked.
- [ ] Given a housing allowance, then it posts to payroll as a recurring earning with WPS/wage-file impact flagged.
- [ ] Given a change between allowance and provided, then payroll proration applies from the effective date.
- [ ] Given any change, then it is audit-logged with approver.

**Tasks**

- [ ] Backend: `housing_benefit` (type, tier, amount, accommodation_link_id) schema
- [ ] Backend: mutual-exclusivity + payroll feed service
- [ ] Frontend: housing benefit assignment screen
- [ ] Rules/Config: allowance tiers per grade/country; provided-housing suppression
- [ ] Alerts/Workflow: change approval
- [ ] Tests: unit (exclusivity) + integration (EPIC-23 link, payroll)

**Covers:** 22.8
**Dependencies:** EPIC-22-S02, EPIC-23

### EPIC-22-S07 — Transport, mobile/communication & meal benefits

**Labels:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 5
**As a** HR Admin, **I want** to administer transport, mobile/communication and meal/cafeteria benefits, **so that** allowances, provided services and in-kind values are tracked, costed and posted to payroll.

**Description**
Cover transport (allowance/company bus/fuel), mobile/comms (allowance/plan/SIM), and meals/cafeteria (allowance/provided), each as allowance or in-kind with cost capture and eligibility.

**Acceptance Criteria**

- [ ] Given transport eligibility, when assigned, then the type (allowance / company bus / fuel card) and value are recorded and routed to payroll if cash.
- [ ] Given a mobile benefit, when a corporate SIM/plan is issued, then asset/plan and monthly cost are tracked and recoverable on exit.
- [ ] Given a meal benefit, when provided in-kind (camp/cafeteria), then per-head cost allocates to the employee/cost centre without a payroll cash line.
- [ ] Given allowance variants, then they post to payroll with correct taxable/WPS treatment per country.
- [ ] Given any assignment/change, then it is audit-logged.

**Tasks**

- [ ] Backend: `transport_benefit`, `comm_benefit`, `meal_benefit` schemas with type + value
- [ ] Backend: in-kind cost allocation + payroll feed service
- [ ] Frontend: assignment screens for the three benefit families
- [ ] Rules/Config: eligibility + allowance/in-kind rules per grade/location
- [ ] Tests: integration (payroll + cost allocation)

**Covers:** 22.9, 22.10, 22.11
**Dependencies:** EPIC-22-S02

### EPIC-22-S08 — Education assistance

**Labels:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 5
**As a** Employee (Self-Service), **I want** to claim education assistance for myself or children, **so that** approved tuition support is paid within policy caps and tracked per academic year.

**Description**
Manage education-assistance eligibility (employee professional study and/or children's school fees), annual caps, claim submission with documents, approval and payment, with bond/clawback for sponsored study where applicable.

**Acceptance Criteria**

- [ ] Given an eligible employee, when they submit an education claim, then it validates against the annual cap, children limit and document requirements.
- [ ] Given a claim above the cap, then the excess is blocked unless an exception is approved.
- [ ] Given an approved claim, then payment posts to payroll/AP with tax treatment per country and decrements the annual balance.
- [ ] Given sponsored professional study with a service bond, then a clawback obligation is recorded for recovery on early exit.
- [ ] Given any claim/approval, then it is audit-logged with approver chain.

**Tasks**

- [ ] Backend: `education_benefit`, `education_claim`, `education_bond` schema with caps
- [ ] Backend: cap-validation + clawback service
- [ ] Frontend: employee claim form + manager/HR approval
- [ ] Rules/Config: caps, children limits, bond terms per entity
- [ ] Alerts/Workflow: claim approval workflow
- [ ] Tests: unit (cap/clawback) + e2e (claim flow)

**Covers:** 22.12
**Dependencies:** EPIC-22-S02

### EPIC-22-S09 — Employee loans & salary advances

**Labels:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** to manage employee loans and salary advances with installment recovery, **so that** balances are accurate, deductions stay within legal limits, and outstanding amounts settle on exit.

**Description**
Handle loan/advance requests, eligibility (e.g. max multiples of salary, max deduction % of wage per country), approval, schedule generation, payroll deduction, early settlement and exit recovery — with statutory deduction-cap guardrails.

**Acceptance Criteria**

- [ ] Given a loan request, when eligibility is checked, then it enforces max amount and the statutory monthly deduction cap (e.g. deduction not exceeding the legal % of wage).
- [ ] Given approval, when granted, then an amortization schedule generates and each installment posts as a payroll deduction.
- [ ] Given concurrent loans/advances, then total monthly recovery is capped to the legal limit and excess is rescheduled.
- [ ] Given separation, then the outstanding balance is pushed to final settlement for recovery before payout.
- [ ] Given any request/approval/adjustment, then maker-checker applies (preparer ≠ approver) and is audit-logged.

**Tasks**

- [ ] Backend: `employee_loan`, `loan_schedule`, `salary_advance` schema with balances
- [ ] Backend: amortization + deduction-cap service; settlement recovery feed
- [ ] Frontend: loan/advance request (self-service) + approval + balance view
- [ ] Rules/Config: max amount, deduction-cap % per country
- [ ] Alerts/Workflow: maker-checker approval
- [ ] Tests: unit (cap/amortization) + integration (settlement recovery)

**Covers:** 22.13
**Dependencies:** EPIC-22-S02, EPIC-10

### EPIC-22-S10 — Relocation & mobilization benefits

**Labels:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 3
**As a** HR Admin, **I want** to administer relocation/mobilization benefits for new hires and transfers, **so that** one-off allowances, shipping, temporary accommodation and clawback are tracked.

**Description**
Manage relocation packages (mobilization allowance, shipping, temporary housing, settling-in) with eligibility on hire/transfer, payment, and clawback if the employee leaves within the qualifying period.

**Acceptance Criteria**

- [ ] Given a new hire/transfer with relocation eligibility, when initiated, then package components and caps are assigned per grade/origin.
- [ ] Given relocation payment, then it posts as a one-off benefit with correct tax/WPS treatment.
- [ ] Given a clawback period (e.g. leaving within 12 months), then a pro-rated recovery obligation is created for final settlement.
- [ ] Given any package change, then it is audit-logged with approver.

**Tasks**

- [ ] Backend: `relocation_package`, `relocation_component`, `relocation_clawback` schema
- [ ] Backend: payment + clawback service; settlement feed
- [ ] Frontend: relocation package builder
- [ ] Rules/Config: component caps + clawback periods per grade
- [ ] Tests: unit (clawback proration)

**Covers:** 22.14
**Dependencies:** EPIC-22-S02

### EPIC-22-S11 — Uniforms, PPE & work tools issuance

**Labels:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 5
**As a** HR Admin, **I want** to manage issuance of uniforms, PPE and work tools, **so that** mandatory PPE is provided per role, replacements are tracked, and items are recovered/valued on exit.

**Description**
Track PPE/uniform/tool catalogues, role-based mandatory PPE matrices, issuance with sizes/quantities, replacement cycles, and recovery on separation — linking to HSE PPE requirements (EPIC-24).

**Acceptance Criteria**

- [ ] Given a role with mandatory PPE, when the employee is onboarded, then a PPE issuance task is created and onboarding cannot complete until issued.
- [ ] Given an issuance, then item, size, quantity, condition and issue date are recorded against the employee.
- [ ] Given a replacement cycle, when due (e.g. safety boots every 12 months), then a replacement alert is raised.
- [ ] Given separation, then recoverable items are listed in exit clearance with value for non-return.
- [ ] Given any issuance/recovery, then it is audit-logged and synced with the HSE PPE register.

**Tasks**

- [ ] Backend: `ppe_item`, `ppe_role_matrix`, `ppe_issuance` schema
- [ ] Backend: mandatory-PPE onboarding trigger + replacement-cycle job
- [ ] Frontend: PPE/uniform issuance screen + employee acknowledgement
- [ ] Rules/Config: role→PPE matrix and replacement intervals
- [ ] Alerts/Workflow: issuance/replacement alerts; exit recovery
- [ ] Tests: e2e (onboarding PPE block) + unit (replacement cycle)

**Covers:** 22.15
**Dependencies:** EPIC-22-S02, EPIC-24

### EPIC-22-S12 — Wellness & employee assistance benefits

**Labels:** `user-story`, `benefits` · **Priority:** Could · **Estimate:** 3
**As a** Employee (Self-Service), **I want** access to wellness and employee assistance (EAP) benefits, **so that** I can use health/wellbeing services confidentially while HR tracks enrolment and vendor usage anonymously.

**Description**
Administer wellness programs and EAP (counselling, telehealth, gym) with eligibility, confidential enrolment, and anonymized usage tracking that protects employee privacy.

**Acceptance Criteria**

- [ ] Given an eligible employee, when wellness/EAP is enrolled, then access details are provided and enrolment recorded.
- [ ] Given EAP usage data, then HR sees only aggregated/anonymized metrics, never individual case detail.
- [ ] Given a vendor wellness program, then enrolment counts feed vendor cost reconciliation.
- [ ] Given any enrolment, then privacy consent is captured and audit-logged.

**Tasks**

- [ ] Backend: `wellness_program`, `wellness_enrolment` schema with anonymization
- [ ] Backend: aggregated usage reporting service
- [ ] Frontend: wellness/EAP self-service catalogue
- [ ] Rules/Config: eligibility per entity
- [ ] Tests: unit (anonymization/aggregation)

**Covers:** 22.16
**Dependencies:** EPIC-22-S02, EPIC-22-S14

### EPIC-22-S13 — Accommodation & labour camp benefit linkage

**Labels:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 3
**As a** HR Admin, **I want** accommodation/labour-camp benefits represented as a benefit entitlement linked to the Accommodation module, **so that** eligibility, cost and payroll treatment are consistent for camp-housed workers.

**Description**
Model accommodation as a benefit (provided bed/room or accommodation allowance) that ties to EPIC-23 master data for assignment, with cost allocation and payroll suppression for provided cases.

**Acceptance Criteria**

- [ ] Given accommodation eligibility, when assigned as "provided", then it links to an EPIC-23 bed/room and suppresses any accommodation allowance.
- [ ] Given an accommodation allowance variant, then it posts to payroll with country wage-file treatment.
- [ ] Given a worker moved out of camp, then the benefit ends and payroll prorates from the effective date.
- [ ] Given any assignment/change, then it is audit-logged and reflected on the benefits dashboard.

**Tasks**

- [ ] Backend: `accommodation_benefit` link entity to EPIC-23 unit/bed
- [ ] Backend: cost allocation + payroll feed
- [ ] Frontend: accommodation benefit assignment view
- [ ] Rules/Config: provided vs allowance eligibility per worker category
- [ ] Tests: integration (EPIC-23 link + payroll suppression)

**Covers:** 22.17
**Dependencies:** EPIC-22-S02, EPIC-23

### EPIC-22-S14 — Benefits vendor management & data privacy controls

**Labels:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** to manage benefit vendors and enforce data-privacy controls, **so that** insurer/provider contracts, SLAs and renewals are tracked and only minimum necessary personal data is shared with consent.

**Description**
Maintain a vendor register (insurers, clinics, EAP, transport, catering, telecom) with contract/SLA/renewal tracking, and enforce data-minimization, masking and consent for any benefit data (medical, dependants) shared internally or with vendors.

**Acceptance Criteria**

- [ ] Given a benefit vendor, when recorded, then contract, SLA, policy document, renewal date and DPA/consent status are captured.
- [ ] Given a contract/policy renewal, when 60/30 days out, then an alert fires to the Benefits Owner.
- [ ] Given a data export to a vendor, then only fields the vendor is entitled to are included and the export is logged.
- [ ] Given sensitive benefit fields (diagnosis, dependant medical), then they are masked by default and require elevated RBAC plus a logged reason to view.
- [ ] Given a privacy consent withdrawal, then affected vendor sharing is flagged for review and audit-logged.

**Tasks**

- [ ] Backend: `benefit_vendor`, `vendor_contract`, `data_sharing_log`, `privacy_consent` schema
- [ ] Backend: data-minimization + masking middleware; consent service
- [ ] Frontend: vendor register + privacy/consent admin
- [ ] Rules/Config: field-level entitlement per vendor; country privacy rules
- [ ] Alerts/Workflow: contract/renewal alerts
- [ ] Tests: unit (masking/entitlement) + integration (export filtering)

**Covers:** 22.20, 22.21
**Dependencies:** EPIC-22-S01

### EPIC-22-S15 — Benefits ↔ payroll & EOSB integration

**Labels:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** all benefit values to flow correctly into payroll and final settlement, **so that** earnings, in-kind values, deductions and EOSB-relevant inputs are accurate and proration is automatic.

**Description**
Central integration layer mapping each benefit to payroll element (cash earning, in-kind, deduction, recovery) with country tax/WPS treatment, proration for joiners/leavers, and a feed of benefit-related accruals (tickets, relocation clawback, loan balances) to EOSB/final settlement.

**Acceptance Criteria**

- [ ] Given each benefit, when mapped, then it specifies payroll element, cash/in-kind, taxable/WPS treatment and recoverability.
- [ ] Given a mid-month benefit start/stop, then payroll prorates the value by calendar/working days per policy.
- [ ] Given a payroll lock attempt, when a mandatory benefit input (e.g. medical premium) is missing, then the lock is blocked with a clear reason.
- [ ] Given separation, then outstanding loans, ticket accrual and relocation clawback are passed to final settlement (EPIC-28) for net computation.
- [ ] Given any mapping/posting, then it is audit-logged and reconcilable to the benefits register.

**Tasks**

- [ ] Backend: `benefit_payroll_mapping` + integration service; settlement feed events
- [ ] Backend: proration engine + payroll-lock validation hook
- [ ] Frontend: benefit→payroll mapping admin + reconciliation view
- [ ] Rules/Config: tax/WPS treatment per country and benefit
- [ ] Tests: integration (payroll + settlement) + unit (proration)

**Covers:** 22.18, 22.19
**Dependencies:** EPIC-10, EPIC-11, EPIC-28

### EPIC-22-S16 — Benefits audit checklist & risk matrix

**Labels:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 5
**As a** Internal Auditor, **I want** a configurable benefits audit checklist and risk matrix, **so that** I can verify compliance, flag red flags and maintain a benefits risk register.

**Description**
Provide a digital audit checklist (mandatory cover present, no expired policies, deduction caps respected, consent captured) and a configurable risk matrix/register with likelihood×impact scoring and red-flag rules driven from live benefit data.

**Acceptance Criteria**

- [ ] Given the audit checklist, when run, then each item auto-evaluates against live data where possible (e.g. "all mandatory-cover employees insured") and flags fails.
- [ ] Given the risk matrix, when configured, then risks are scored likelihood×impact and rated low/medium/high with owners and mitigations.
- [ ] Given a red-flag rule (e.g. expired medical policy, loan deduction > legal cap), when triggered, then a risk-register entry is auto-created.
- [ ] Given a completed audit, then results are timestamped, signed off and exportable.
- [ ] Given any checklist/risk change, then it is audit-logged.

**Tasks**

- [ ] Backend: `benefit_audit_checklist`, `benefit_risk_register` schema with scoring
- [ ] Backend: red-flag rule engine over benefit data
- [ ] Frontend: audit checklist runner + risk matrix/heatmap
- [ ] Rules/Config: checklist items, red-flag thresholds, scoring bands
- [ ] Tests: unit (auto-evaluation/scoring)

**Covers:** 22.22, 22.24
**Dependencies:** EPIC-22-S03, EPIC-22-S09, EPIC-22-S14

### EPIC-22-S17 — Benefits KPIs, dashboard & automation design

**Labels:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 5
**As a** Executive / Leadership, **I want** a benefits KPI dashboard with automation, **so that** I can monitor coverage, cost, renewals and exceptions in real time.

**Description**
Deliver benefit KPIs (coverage %, expiring policies, benefit cost per head, exception count, claim turnaround) on an executive dashboard, plus the automation design (event-driven enrolment, alerts, auto-posting) that underpins the module.

**Acceptance Criteria**

- [ ] Given the dashboard, when opened, then it shows coverage %, upcoming renewals (60/30/7), benefit cost per head and open exceptions by country/entity.
- [ ] Given a KPI threshold breach (e.g. coverage < 100% for mandatory benefit), then it is highlighted red and drillable to the affected employees.
- [ ] Given automation design, then event-driven triggers (onboarding, grade change, separation) auto-create benefit tasks per the documented flow.
- [ ] Given RBAC, then dashboard scope respects entity/country and sensitive cost data is role-restricted.

**Tasks**

- [ ] Backend: KPI aggregation queries/materialized views; automation event handlers
- [ ] Frontend: benefits dashboard with drill-downs
- [ ] Rules/Config: KPI thresholds + dashboard RBAC scope
- [ ] Alerts/Workflow: automation triggers wiring
- [ ] Tests: integration (KPI accuracy) + e2e (drill-down RBAC)

**Covers:** 22.23, 22.25, 22.26
**Dependencies:** EPIC-22-S02, EPIC-22-S15

### EPIC-22-S18 — Monthly benefits compliance pack, certificate & exception register

**Labels:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** to generate a monthly benefits compliance pack with a sign-off certificate and exception register, **so that** management can certify benefits compliance and auditors have dated evidence.

**Description**
Auto-compile a monthly pack (coverage status, renewals, exceptions, cost) with the Sample Benefits Monthly Compliance Certificate and the Sample Benefits Exception Register, plus a key-takeaways summary, generated from live data with management certification.

**Acceptance Criteria**

- [ ] Given month-end, when the pack is generated, then it includes coverage, renewals, exceptions, cost and KPI snapshot per entity.
- [ ] Given the compliance certificate, when signed, then it captures the certifying officer, period, scope and is locked/audit-logged.
- [ ] Given the exception register, then each exception records type, employee/benefit, reason, owner, status and resolution date, exportable.
- [ ] Given an unresolved high-severity exception, then certification is blocked or flagged until addressed.
- [ ] Given the pack, then it is versioned, exportable (PDF/Excel) and retained per retention policy.

**Tasks**

- [ ] Backend: `benefit_compliance_pack`, `benefit_compliance_certificate`, `benefit_exception` schema
- [ ] Backend: pack generation + certification lock service
- [ ] Frontend: compliance pack viewer, certificate sign-off, exception register
- [ ] Rules/Config: certification gating rules; exception severities
- [ ] Alerts/Workflow: month-end generation + sign-off workflow
- [ ] Tests: e2e (generate → certify → export)

**Covers:** 22.27, 22.28, 22.29, 22.31
**Dependencies:** EPIC-22-S16, EPIC-22-S17
