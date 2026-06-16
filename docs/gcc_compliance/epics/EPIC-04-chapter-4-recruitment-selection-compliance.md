# EPIC-04: Chapter 4 – Recruitment & Selection Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 4 – Recruitment & Selection Compliance
> **Module:** Recruitment · **Labels:** `epic`, `gcc-compliance`, `recruitment`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver an AuraOS recruitment module that governs the full hire lifecycle — from an approved vacancy (EPIC-03) through compliant requisitions, job descriptions, sourcing, agency control, screening, interviews, assessments, background and immigration-eligibility verification, compensation benchmarking and offer initiation — with anti-discrimination and candidate-data-privacy controls enforced at every step. The module must embed GCC nationalization-first sourcing and produce recruitment KPIs, a compliance dashboard and an audit checklist.

## Business Value

Reduces legal exposure from discriminatory or non-compliant hiring, prevents hiring of work-ineligible candidates, and enforces nationalization-first sourcing to protect Emiratisation/Nitaqat/Bahrainization standing. Auditable consent, screening and selection records defend against labour-authority and data-privacy challenges, while agency, benchmarking and KPI controls cut cost-per-hire and time-to-fill.

## Requirements Covered (handbook sections)

- 4.1 Introduction
- 4.2 Recruitment Governance Framework
- 4.3 Recruitment Lifecycle
- 4.4 Job Requisition Compliance
- 4.5 Job Description Compliance
- 4.6 Candidate Sourcing Compliance
- 4.7 Recruitment Agency Compliance
- 4.8 Nationalization Compliance During Recruitment
- 4.9 Candidate Screening Compliance
- 4.10 Interview Compliance
- 4.11 Anti-Discrimination Compliance
- 4.12 Candidate Assessments
- 4.13 Background Verification
- 4.14 Immigration Eligibility Verification
- 4.15 Compensation Benchmarking
- 4.16 Offer Management
- 4.17 Candidate Data Privacy
- 4.18 Recruitment KPIs
- 4.19 Recruitment Compliance Dashboard
- 4.20 Recruitment Audit Checklist
- 4.21 Common Recruitment Risks

## Out of Scope

- Workforce planning, headcount budgeting and manpower-requisition approval (covered in EPIC-03).
- Offer-letter generation, salary-structure design, conditional offers, medical fitness and contract preparation (covered in EPIC-05).
- Onboarding, master-data creation and joining formalities (covered in EPIC-06).
- Work-permit/visa filing execution with authorities (covered in EPIC-07).

## Dependencies

- EPIC-02 (Country Rule Engine — nationalization, eligibility, privacy rules)
- EPIC-03 (Approved vacancy / manpower requisition input)

## Epic Definition of Done

- [ ] Recruitment governance, lifecycle stages and stage-gate controls are configurable and enforced end-to-end.
- [ ] Job requisitions and JDs pass compliance validation (approved vacancy link, non-discriminatory language) before posting.
- [ ] Nationalization-first sourcing and authority-platform posting checks are enforced per country.
- [ ] Candidate screening, interviews and assessments are structured, scored and bias-controlled with full records.
- [ ] Background and immigration-eligibility verification gate progression with status tracking and alerts.
- [ ] Candidate data privacy (consent, retention, access, deletion) is enforced across the candidate lifecycle.
- [ ] Recruitment KPIs, compliance dashboard, audit checklist and risk register are live with red-flag detection.
- [ ] All recruitment decisions and data accesses are captured in the immutable audit trail.

---

## User Stories

### EPIC-04-S01 — Recruitment governance framework & lifecycle stage-gates

**Labels:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**As a** HR Manager, **I want** a configurable recruitment governance framework with defined lifecycle stages and stage-gates, **so that** every hire follows one controlled, auditable process.

**Description**
Establishes the recruitment process backbone: ownership/roles, the lifecycle from approved vacancy → sourcing → screening → interview → assessment → verification → offer, and configurable stage-gate rules (a candidate cannot advance until the prior stage's mandatory controls are satisfied). Captures the introduction, governance framework and lifecycle sections as the engine all other stories plug into.

**Acceptance Criteria**

- [ ] Given a vacancy, when a recruitment case opens, then it inherits position, JD and nationalization expectation from the EPIC-03 requisition.
- [ ] Given lifecycle stages, when configured, then each has entry/exit controls and an owner role enforced by RBAC.
- [ ] Given a stage-gate, when mandatory controls are unmet, then advancing the candidate is blocked with reasons.
- [ ] Given a recruitment case, when progressed, then SLA timers per stage start and breaches are flagged.
- [ ] Given any stage transition, when performed, then actor, decision and timestamp are audit-logged.

**Tasks**

- [ ] Backend: `recruitment_case` + `recruitment_stage` entities (vacancyId, stage, owner, slaDays, status) + migration.
- [ ] Backend: stage-gate engine consuming `vacancy.approved` events.
- [ ] Frontend: recruitment pipeline (kanban) with stage controls.
- [ ] Rules/Config: configurable stages, gates and SLAs per entity/country.
- [ ] Alerts/Workflow: SLA-breach alerts; stage-transition notifications.
- [ ] Tests: unit (gate logic) + e2e (vacancy→case→stage progression).

**Covers:** 4.1, 4.2, 4.3
**Dependencies:** EPIC-03

### EPIC-04-S02 — Job requisition & job description compliance

**Labels:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**As a** HR Admin, **I want** recruitment requisitions and JDs validated for compliance, **so that** only approved, funded, non-discriminatory roles are advertised.

**Description**
Links the recruitment requisition to the approved EPIC-03 manpower requisition and enforces JD compliance: mandatory fields (duties, grade, qualifications, localization flag), non-discriminatory language screening (no age/gender/nationality bias unless a lawful occupational requirement), and reusable JD templates with version control and approval before posting.

**Acceptance Criteria**

- [ ] Given a recruitment requisition, when created, then it must reference an approved EPIC-03 requisition or be blocked.
- [ ] Given a JD, when saved, then mandatory fields are validated and biased phrases (age limit, gender, nationality preference) are flagged unless justified as a bona fide requirement.
- [ ] Given a JD, when approved, then it is version-locked and only the approved version can be posted.
- [ ] Given a nationalization-reserved role, when the JD is built, then localization preference is reflected per country rules.
- [ ] Given any JD edit/approval, when performed, then it is audit-logged.

**Tasks**

- [ ] Backend: `job_description` entity (caseId, duties, qualifications, gradeId, localizationFlag, version, status) + migration.
- [ ] Backend: JD compliance/bias-language validation service.
- [ ] Frontend: JD builder with template library and inline compliance flags.
- [ ] Rules/Config: biased-phrase dictionary and bona-fide exceptions per country.
- [ ] Alerts/Workflow: JD approval routing (preparer ≠ approver).
- [ ] Tests: unit (bias detection) + integration (requisition link enforcement).

**Covers:** 4.4, 4.5
**Dependencies:** EPIC-04-S01

### EPIC-04-S03 — Candidate sourcing compliance & authority-platform posting

**Labels:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**As a** HR Admin, **I want** sourcing channels and authority-platform postings managed compliantly, **so that** mandatory local job-portal advertising and approved channels are used before external hiring.

**Description**
Manages sourcing channels (internal, referral, portals, agencies) and enforces country-specific mandatory advertising — e.g., posting on the national jobs platform / labour portal before/while sourcing expatriates — with proof-of-posting capture. Tracks candidate source for KPI and nationalization analysis.

**Acceptance Criteria**

- [ ] Given a vacancy, when sourcing starts, then required authority-platform/local-portal posting is created and proof captured.
- [ ] Given an expatriate-targeted role, when posted, then the system verifies mandatory local advertising occurred first per country rule.
- [ ] Given a candidate, when added, then source channel is mandatory and stored for analytics.
- [ ] Given an internal/referral candidate, when sourced, then the relevant policy controls (e.g., referral eligibility) apply.
- [ ] Given any sourcing action, when performed, then it is audit-logged with the posting evidence link.

**Tasks**

- [ ] Backend: `sourcing_channel` + `job_posting` entities (caseId, channel, platform, postedAt, proofDocId) + migration.
- [ ] Backend: mandatory-posting rule check per country.
- [ ] Frontend: sourcing/posting management screen with proof upload.
- [ ] Rules/Config: country mandatory-advertising rules and channel catalogue.
- [ ] Alerts/Workflow: alert if external sourcing precedes mandatory local posting.
- [ ] Tests: unit (rule check) + integration (proof capture).

**Covers:** 4.6
**Dependencies:** EPIC-04-S01

### EPIC-04-S04 — Recruitment agency compliance & vendor control

**Labels:** `user-story`, `recruitment` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** recruitment agencies onboarded and controlled, **so that** only licensed agencies are used and no banned fees are charged to candidates.

**Description**
Maintains an agency register with licence/permit details, validity, country approval, fee terms and a no-candidate-fee attestation (candidate-paid recruitment fees are prohibited in GCC). Restricts requisition assignment to compliant, in-date agencies and tracks agency-sourced candidate performance.

**Acceptance Criteria**

- [ ] Given an agency, when onboarded, then licence number, validity, jurisdiction and fee model are captured with documents.
- [ ] Given an agency with an expired/invalid licence, when assignment is attempted, then it is blocked.
- [ ] Given an agency engagement, when created, then a no-candidate-fee attestation is required and stored.
- [ ] Given a licence nearing expiry, when within 60/30/7 days, then an alert is raised.
- [ ] Given any agency change, when saved, then it is audit-logged.

**Tasks**

- [ ] Backend: `recruitment_agency` + `agency_engagement` entities (licenceNo, validTo, jurisdiction, feeModel, attestation) + migration.
- [ ] Backend: agency-eligibility validation service.
- [ ] Frontend: agency register and engagement screen.
- [ ] Rules/Config: country agency-licensing and fee-prohibition rules.
- [ ] Alerts/Workflow: 60/30/7-day licence-expiry alerts.
- [ ] Tests: unit (eligibility) + integration (blocked expired agency).

**Covers:** 4.7
**Dependencies:** EPIC-04-S03

### EPIC-04-S05 — Nationalization compliance during recruitment

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** nationalization-first controls enforced during recruitment, **so that** GCC-national candidates are prioritised and localization targets are advanced before expatriate hires.

**Description**
Applies the entity's localization gap (from EPIC-03) to recruitment: prioritises national candidates in the pipeline, requires documented justification before progressing an expatriate for a nationalization-reserved or gap-entity role, and simulates the localization/Nitaqat-band impact of a prospective hire. Flags fake/artificial localization risk signals (e.g., national hired but not genuinely deployed) for later monitoring.

**Acceptance Criteria**

- [ ] Given a gap entity, when expatriate candidates are advanced, then a localization justification is mandatory and recorded.
- [ ] Given national candidates in the pipeline, when present, then they are surfaced/prioritised per configured rule.
- [ ] Given a prospective hire, when evaluated, then localization % / Nitaqat band impact is simulated and shown.
- [ ] Given a UAE/KSA/BH/OM entity, when recruiting, then country-specific nationalization rules apply via the rule engine.
- [ ] Given any nationalization override, when made, then approver, reason and timestamp are audit-logged.

**Tasks**

- [ ] Backend: nationalization-recruitment service reading EPIC-03 localization plan + rule engine.
- [ ] Backend: hire-impact simulation (localization %, Nitaqat band).
- [ ] Frontend: pipeline national-priority indicators + justification capture.
- [ ] Rules/Config: per-country nationalization-during-recruitment rules.
- [ ] Alerts/Workflow: justification/approval workflow for expatriate progression in gap entities.
- [ ] Tests: unit (impact sim) + integration (justification gating).

**Covers:** 4.8
**Dependencies:** EPIC-03, EPIC-04-S01

### EPIC-04-S06 — Candidate screening compliance

**Labels:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**As a** HR Admin, **I want** structured, criteria-based candidate screening, **so that** shortlisting is consistent, job-related and free of prohibited criteria.

**Description**
Implements criteria-based screening against the approved JD: mandatory vs preferred requirements, knockout questions and a scored shortlist. Prohibited screening factors (age, gender, marital status, nationality unless lawful) are excluded from scoring, and rejection reasons are constrained to job-related, defensible categories.

**Acceptance Criteria**

- [ ] Given a JD, when screening is configured, then criteria derive from JD requirements with weightings.
- [ ] Given a candidate, when screened, then a job-related score and pass/fail against knockouts are produced.
- [ ] Given a rejection, when recorded, then a reason from an approved, non-discriminatory list is mandatory.
- [ ] Given prohibited factors, when present in data, then they are excluded from scoring and flagged.
- [ ] Given any screening decision, when made, then it is audit-logged with the scoring basis.

**Tasks**

- [ ] Backend: `screening_criteria` + `candidate_screening` entities + migration.
- [ ] Backend: scoring + knockout evaluation service.
- [ ] Frontend: screening console with scored shortlist.
- [ ] Rules/Config: prohibited-factor list and approved rejection-reason catalogue.
- [ ] Alerts/Workflow: notify recruiter on shortlist completion.
- [ ] Tests: unit (scoring/knockouts) + integration (prohibited-factor exclusion).

**Covers:** 4.9
**Dependencies:** EPIC-04-S02

### EPIC-04-S07 — Interview compliance & structured evaluation

**Labels:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**As a** Line Manager, **I want** structured, panel-based interviews with standardized scorecards, **so that** selection is consistent, evidence-based and defensible.

**Description**
Provides interview scheduling, panels, structured question sets tied to competencies and standardized scorecards. Restricts free-text to job-related observations, blocks prohibited questions guidance, and consolidates panel scores into a recommendation. Produces the digital Interview Evaluation record.

**Acceptance Criteria**

- [ ] Given an interview, when scheduled, then panel members, stage and competency set are defined.
- [ ] Given a panellist, when scoring, then they complete a structured scorecard per competency with evidence notes.
- [ ] Given panel completion, when reached, then scores aggregate into a consolidated recommendation.
- [ ] Given prohibited interview topics, when surfaced as guidance, then interviewers are warned and topics excluded from scoring.
- [ ] Given any interview record, when saved, then it is audit-logged and access-restricted.

**Tasks**

- [ ] Backend: `interview` + `interview_scorecard` entities (panel, competencies, scores) + migration.
- [ ] Backend: score aggregation + recommendation service.
- [ ] Frontend: interview scheduler + structured scorecard form.
- [ ] Rules/Config: competency frameworks and prohibited-topic guidance.
- [ ] Alerts/Workflow: panel reminders; recommendation routing.
- [ ] Tests: unit (aggregation) + integration (scorecard completeness gate).

**Covers:** 4.10
**Dependencies:** EPIC-04-S06

### EPIC-04-S08 — Anti-discrimination compliance & bias controls

**Labels:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** anti-discrimination controls across the recruitment lifecycle, **so that** hiring decisions are free from prohibited bias and demonstrably fair.

**Description**
Cross-cutting anti-discrimination layer: configurable protected attributes, masking of prohibited fields during screening/interview, equal-treatment checks, and adverse-impact analytics comparing selection rates across groups. Surfaces a bias red-flag where rejection patterns correlate with protected attributes.

**Acceptance Criteria**

- [ ] Given protected attributes, when configured per country, then those fields are masked in screening/interview views.
- [ ] Given selection outcomes, when analysed, then selection rates by group are computed for adverse-impact monitoring.
- [ ] Given a rejection pattern correlated with a protected attribute, when detected, then a bias red-flag is raised.
- [ ] Given a decision, when recorded, then it must cite job-related justification, not a protected factor.
- [ ] Given any access to protected data, when it occurs, then it is audit-logged.

**Tasks**

- [ ] Backend: protected-attribute masking middleware + adverse-impact analytics service.
- [ ] Backend: bias red-flag detection rules.
- [ ] Frontend: equal-treatment indicators + adverse-impact report.
- [ ] Rules/Config: per-country protected-attribute list.
- [ ] Alerts/Workflow: bias red-flag alert to Compliance.
- [ ] Tests: unit (adverse-impact calc) + integration (masking enforcement).

**Covers:** 4.11
**Dependencies:** EPIC-04-S06, EPIC-04-S07

### EPIC-04-S09 — Candidate assessments management

**Labels:** `user-story`, `recruitment` · **Priority:** Should · **Estimate:** 3
**As a** HR Admin, **I want** to administer and record candidate assessments, **so that** validated, job-related tests support selection consistently.

**Description**
Manages assessment definitions (technical, psychometric, language, role-play), assignment to candidates, result capture and pass thresholds. Ensures assessments are job-related and applied uniformly to comparable candidates, with results feeding the selection scorecard.

**Acceptance Criteria**

- [ ] Given an assessment type, when configured, then scoring scale, pass threshold and job-relevance are defined.
- [ ] Given a candidate, when assigned an assessment, then result and pass/fail are captured against the threshold.
- [ ] Given comparable candidates, when assessed, then the same assessment set is applied uniformly.
- [ ] Given assessment results, when available, then they feed the consolidated selection score.
- [ ] Given any assessment record, when saved, then it is audit-logged.

**Tasks**

- [ ] Backend: `assessment` + `candidate_assessment` entities + migration.
- [ ] Backend: result-capture + threshold evaluation service.
- [ ] Frontend: assessment assignment and result screen.
- [ ] Rules/Config: assessment catalogue and thresholds per role family.
- [ ] Alerts/Workflow: notify on assessment completion/failure.
- [ ] Tests: unit (threshold logic) + integration (score feed).

**Covers:** 4.12
**Dependencies:** EPIC-04-S07

### EPIC-04-S10 — Background verification management

**Labels:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** background verification tracked as a gating control, **so that** education, employment, criminal and reference checks are completed and cleared before offer.

**Description**
Tracks background-verification (BGV) cases per candidate with consent capture, check types (education, prior employment, criminal/police clearance, references, professional licences), vendor/result and overall clearance status. BGV completion is a stage-gate to offer; discrepancies route to review. Candidate consent is mandatory before any check.

**Acceptance Criteria**

- [ ] Given a candidate, when BGV starts, then explicit consent is captured before any check is initiated.
- [ ] Given configured check types, when run, then each result (clear/discrepant/pending) is recorded with evidence.
- [ ] Given a discrepancy, when found, then the case routes to review and blocks offer progression.
- [ ] Given all checks clear, when complete, then BGV status = Cleared and the offer gate opens.
- [ ] Given any BGV access/change, when performed, then it is audit-logged (sensitive-data access tracked).

**Tasks**

- [ ] Backend: `bgv_case` + `bgv_check` entities (type, vendor, result, consentDocId, status) + migration.
- [ ] Backend: BGV gating service tied to offer stage-gate.
- [ ] Frontend: BGV tracker with consent capture and discrepancy review.
- [ ] Rules/Config: mandatory check types per country/role.
- [ ] Alerts/Workflow: discrepancy escalation; BGV-overdue alerts.
- [ ] Tests: unit (gate logic) + integration (consent enforcement, offer block).

**Covers:** 4.13
**Dependencies:** EPIC-04-S01

### EPIC-04-S11 — Immigration eligibility verification

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**As a** PRO / Immigration Officer, **I want** candidate work-eligibility verified before offer, **so that** only candidates eligible for a work permit/visa in the target country are progressed.

**Description**
Verifies immigration eligibility per country: nationality/quota eligibility, age and qualification attestation requirements, prior labour bans, profession/occupation availability and existing-sponsorship/NOC needs. Produces an eligibility decision that gates offer issuance and pre-populates downstream work-permit readiness (EPIC-05/EPIC-07).

**Acceptance Criteria**

- [ ] Given a candidate and target country, when eligibility is checked, then nationality/quota, age, qualification-attestation and ban-status rules are evaluated via the rule engine.
- [ ] Given an existing in-country sponsorship, when detected, then NOC/transfer requirements are flagged.
- [ ] Given a profession not open to the candidate's nationality, when evaluated, then progression is blocked with reason.
- [ ] Given an eligibility result, when Cleared, then it gates offer and feeds work-permit-readiness data.
- [ ] Given any eligibility decision, when made, then it is audit-logged.

**Tasks**

- [ ] Backend: `immigration_eligibility` entity (countryCode, nationality, profession, banStatus, nocRequired, status) + migration.
- [ ] Backend: eligibility rule service (quota/age/qualification/ban/profession).
- [ ] Frontend: eligibility verification screen with decision and evidence.
- [ ] Rules/Config: per-country immigration eligibility rules (MOHRE/Qiwa/LMRA/etc.).
- [ ] Alerts/Workflow: block offer when not Cleared; PRO notification.
- [ ] Tests: unit (rule eval) + integration (offer gating, NOC flag).

**Covers:** 4.14
**Dependencies:** EPIC-02, EPIC-04-S01

### EPIC-04-S12 — Compensation benchmarking

**Labels:** `user-story`, `recruitment` · **Priority:** Should · **Estimate:** 5
**As a** HR Manager, **I want** compensation benchmarked against market and internal bands, **so that** proposed pay is competitive, equitable and within budget before an offer is initiated.

**Description**
Provides benchmarking against market survey data and internal grade/salary bands (EPIC-09), with internal-equity comparison (similar roles), budget-line check (EPIC-03) and approval flags when a proposal sits outside band. Outputs a recommended range that seeds offer salary-structure design in EPIC-05.

**Acceptance Criteria**

- [ ] Given a role and grade, when benchmarked, then market range and internal band min/mid/max are shown.
- [ ] Given a proposed salary, when outside band, then an exception/approval flag is raised.
- [ ] Given comparable internal incumbents, when compared, then internal-equity position is displayed.
- [ ] Given a proposal, when checked, then it validates against the EPIC-03 budget line.
- [ ] Given any benchmarking output, when finalised, then it is recorded and audit-logged.

**Tasks**

- [ ] Backend: `comp_benchmark` entity (roleId, gradeId, marketRange, internalBand, proposed, equityIndex) + migration.
- [ ] Backend: benchmarking + internal-equity service.
- [ ] Frontend: benchmarking view with range, equity and budget check.
- [ ] Rules/Config: market data sources and band config per entity.
- [ ] Alerts/Workflow: out-of-band approval flag.
- [ ] Tests: unit (equity/range calc) + integration (budget validation).

**Covers:** 4.15
**Dependencies:** EPIC-03, EPIC-09

### EPIC-04-S13 — Offer initiation & selection-to-offer handover

**Labels:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**As a** HR Manager, **I want** to initiate an offer from a cleared, selected candidate, **so that** the recruitment record hands a complete, verified candidate package to Offer Management.

**Description**
Consolidates selection outcome, benchmark, BGV and immigration-eligibility status into a selection-and-offer-approval record, validates all gates are cleared, and emits a `candidate.selected` event with the package to EPIC-05 Offer Management. This is the recruitment-side boundary of offer handling (full offer governance lives in EPIC-05).

**Acceptance Criteria**

- [ ] Given a selected candidate, when offer initiation starts, then BGV-cleared, eligibility-cleared and benchmark-completed gates are verified.
- [ ] Given an unmet gate, when offer initiation is attempted, then it is blocked listing the missing controls.
- [ ] Given a nationalization-reserved role, when offered to a non-national, then the recorded justification accompanies the package.
- [ ] Given gates cleared, when initiated, then a `candidate.selected` event with the package is published to EPIC-05.
- [ ] Given any offer initiation, when performed, then it is audit-logged.

**Tasks**

- [ ] Backend: `offer_initiation` record + package assembler service.
- [ ] Backend: gate-verification + event emission (`candidate.selected`).
- [ ] Frontend: selection-and-offer-approval summary screen.
- [ ] Rules/Config: required-gate set per country/role.
- [ ] Alerts/Workflow: handover notification to Offer Management.
- [ ] Tests: integration (gate block) + e2e (selected→event to EPIC-05).

**Covers:** 4.16
**Dependencies:** EPIC-04-S10, EPIC-04-S11, EPIC-04-S12, EPIC-05

### EPIC-04-S14 — Candidate data privacy, consent & retention

**Labels:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** candidate personal data governed by consent, access control, retention and deletion rules, **so that** recruitment complies with GCC data-privacy laws.

**Description**
Implements candidate-data-privacy controls across the lifecycle: lawful-basis/consent capture at application, purpose limitation, role-based access to candidate PII and sensitive data, configurable retention (e.g., purge unsuccessful candidates after a defined period), candidate data-subject requests (access/erasure) and a processing log. Anchors the consent referenced by screening, BGV and eligibility stories.

**Acceptance Criteria**

- [ ] Given a candidate application, when received, then consent and lawful basis are captured before processing.
- [ ] Given candidate PII/sensitive data, when accessed, then RBAC restricts visibility and access is logged.
- [ ] Given a retention rule, when an unsuccessful candidate exceeds the period, then their data is purged/anonymised automatically.
- [ ] Given a data-subject request, when raised, then access/erasure is fulfilled and recorded within the configured window.
- [ ] Given any consent/retention/erasure action, when performed, then it is audit-logged in the processing register.

**Tasks**

- [ ] Backend: `candidate_consent` + `data_retention_rule` + `dsr_request` entities + migration.
- [ ] Backend: retention/purge scheduler + DSR fulfilment service.
- [ ] Frontend: consent capture, privacy-access controls, DSR handling screen.
- [ ] Rules/Config: per-country retention periods and lawful-basis options.
- [ ] Alerts/Workflow: retention-due jobs; DSR SLA alerts.
- [ ] Tests: unit (retention scheduler) + integration (RBAC, DSR erasure).

**Covers:** 4.17
**Dependencies:** EPIC-04-S01

### EPIC-04-S15 — Recruitment KPIs & compliance dashboard

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**As a** Executive / Leadership, **I want** recruitment KPIs and a compliance dashboard, **so that** hiring efficiency and compliance posture are visible in real time.

**Description**
Delivers recruitment KPIs (time-to-fill, time-to-hire, cost-per-hire, offer-acceptance rate, source effectiveness, national-hire ratio, pipeline conversion) and a compliance dashboard surfacing control status (JD-bias flags, BGV/eligibility clearance rates, nationalization progress, privacy/retention compliance, agency-licence validity). Filterable by country/entity/department with export.

**Acceptance Criteria**

- [ ] Given the KPI view, when opened, then time-to-fill, cost-per-hire, acceptance rate and national-hire ratio render with trend.
- [ ] Given the compliance dashboard, when opened, then BGV/eligibility clearance, bias flags, nationalization gap and privacy status are shown.
- [ ] Given filters, when applied, then all tiles recompute by country/entity/department/period.
- [ ] Given a threshold breach (e.g., time-to-fill > target), when detected, then it is highlighted.
- [ ] Given RBAC, when viewed, then data is scoped to authorised entities; export available.

**Tasks**

- [ ] Backend: recruitment KPI aggregation views + compliance-status service.
- [ ] Backend: export service (PDF/Excel).
- [ ] Frontend: KPI + compliance dashboards with filters.
- [ ] Rules/Config: KPI targets and compliance thresholds per entity.
- [ ] Alerts/Workflow: threshold-breach alerts.
- [ ] Tests: unit (KPI calc) + integration (filter scoping/export).

**Covers:** 4.18, 4.19
**Dependencies:** EPIC-04-S05, EPIC-04-S10, EPIC-04-S11, EPIC-04-S14

### EPIC-04-S16 — Recruitment audit checklist & common-risk register

**Labels:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**As a** Internal Auditor, **I want** a recruitment audit checklist and a common-risk register with red-flags, **so that** I can verify governance and capture recruitment risks and findings.

**Description**
Implements the recruitment audit checklist as a configurable digital checklist (pass/fail/N-A + evidence) and codifies the chapter's common recruitment risks (discriminatory JD, missing BGV, ineligible hire, candidate-paid agency fee, weak nationalization progress, consent/retention gaps) into an auto-run red-flag and risk register with likelihood×impact scoring and corrective-action tracking.

**Acceptance Criteria**

- [ ] Given the audit checklist, when configured, then items are grouped by control area with evidence slots.
- [ ] Given red-flag rules, when run, then exceptions (no consent, BGV skipped, ineligible offer, expired agency) are listed with drill-down.
- [ ] Given the risk register, when populated, then each common risk has likelihood, impact, score, owner and mitigation.
- [ ] Given a checklist fail or red-flag, when raised, then a finding/corrective action with owner and due date is created.
- [ ] Given audit completion, when finalised, then a signed audit pack is exported and audit-logged.

**Tasks**

- [ ] Backend: `recruitment_audit_checklist`, `audit_finding`, `recruitment_risk` entities + migration.
- [ ] Backend: red-flag rule engine over recruitment data.
- [ ] Frontend: checklist runner + risk register + corrective-action tracker.
- [ ] Rules/Config: checklist templates, red-flag rules and risk scoring per entity.
- [ ] Alerts/Workflow: overdue-finding alerts; audit sign-off workflow.
- [ ] Tests: unit (red-flag rules/scoring) + e2e (checklist→finding→export).

**Covers:** 4.20, 4.21
**Dependencies:** EPIC-04-S10, EPIC-04-S11, EPIC-04-S14
