# EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 24 – Health, Safety and Welfare Compliance
> **Module:** HSE · **Labels:** `epic`, `gcc-compliance`, `hse`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver an HSE & Welfare compliance module in AuraOS that operationalizes employer duty of care across GCC worksites — HSE policy and organization, risk assessment and hierarchy of controls, heat-stress/midday-break enforcement, PPE, training and toolbox talks, permit-to-work, incident reporting and injury handling, emergency and fire safety, first aid, occupational health surveillance, welfare and contractor HSE — fully integrated with HR data and producing registers, certificates, KPIs, dashboards and audit evidence.

## Business Value

Reduces fatalities, injuries and regulatory penalties in a heavily enforced GCC domain (e.g. mandatory midday-break/heat-stress rules, civil-defence fire requirements, work-injury reporting to authorities and GOSI occupational-hazard branch). Provides defensible duty-of-care evidence, automates expiry-driven training/PPE/permit controls, links injuries to social-insurance claims and separation, and gives leadership real-time HSE risk visibility.

## Requirements Covered (handbook sections)

- 24.1 Introduction
- 24.2 Objectives of HSE and Welfare Compliance
- 24.3 GCC HSE Compliance Landscape
- 24.4 Employer Duty of Care
- 24.5 HSE Policy
- 24.6 HSE Organization and Responsibilities
- 24.7 Risk Assessment
- 24.8 Hierarchy of Controls
- 24.9 Heat Stress Compliance
- 24.10 Personal Protective Equipment
- 24.11 Safety Training
- 24.12 Toolbox Talks
- 24.13 Permit-to-Work
- 24.14 Incident Reporting
- 24.15 Work Injury Handling
- 24.16 Emergency Preparedness
- 24.17 Fire Safety
- 24.18 First Aid and Medical Support
- 24.19 Contractor HSE Management
- 24.20 Welfare Compliance
- 24.21 Occupational Health Surveillance
- 24.22 HSE and HR Integration
- 24.23 HSE Audit Checklist
- 24.24 HSE KPIs
- 24.25 HSE Risk Matrix
- 24.26 HRMS / HSE Automation Design
- 24.27 HSE Dashboard
- 24.28 Monthly HSE Compliance Pack
- 24.29 Sample HSE Monthly Compliance Certificate
- 24.30 Sample Incident Register
- 24.31 Sample Corrective Action Register
- 24.32 Key Takeaways

## Out of Scope

- Accommodation/camp-specific fire, hygiene and welfare standards (owned by EPIC-23; this epic provides aligned HSE standards).
- PPE benefit issuance master/replacement cycles (owned by EPIC-22; this epic enforces HSE PPE requirements and compliance).
- GOSI/occupational-hazard contribution mechanics (owned by EPIC-13; this epic feeds injury data to claims).
- Detailed environmental/quality management beyond worker health & safety.

## Dependencies

- EPIC-22 (Benefits) — PPE issuance linkage
- EPIC-23 (Accommodation) — fire/first-aid/welfare standards alignment
- EPIC-13 (GOSI) — occupational-injury claim feed
- EPIC-27/EPIC-28 (Separation/EOSB) — injury/death-in-service linkage
- Platform RBAC, rule engine, workflow, document store, alerts, dashboards

## Epic Definition of Done

- [ ] HSE policy, organization/responsibilities and duty-of-care framework are configured per country.
- [ ] Risk assessments with hierarchy-of-controls and residual scoring drive control actions.
- [ ] Heat-stress midday-break rules, PPE, training, toolbox talks and permit-to-work are enforced with alerts and gating.
- [ ] Incident reporting, injury handling, emergency/fire, first aid and occupational-health surveillance operate end-to-end with corrective actions.
- [ ] Contractor HSE and welfare compliance are tracked; HSE data integrates with HR records and authority/GOSI feeds.
- [ ] Audit checklist, risk matrix, KPIs, dashboard and monthly compliance pack/certificate generate from live data.
- [ ] Full audit trail captures every assessment, permit, incident, training and corrective action.

---

## User Stories

### EPIC-24-S01 — HSE governance, duty of care & policy framework

**Labels:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 5
**As a** HSE Manager, **I want** an HSE governance framework anchored to employer duty of care and a versioned HSE policy, **so that** safety obligations, landscape and country scope are codified and approved.

**Description**
Establish HSE governance: objectives, the GCC HSE landscape, employer duty-of-care obligations, and a versioned HSE policy with country scope. Frames the module and the legal basis for all controls.

**Acceptance Criteria**

- [ ] Given the HSE policy, when published, then it captures version, country scope, duty-of-care commitments and effective dates with prior versions read-only.
- [ ] Given the landscape register, then each obligation links to the relevant authority/regulation per country (e.g. midday-break decree, civil defence, MoL/MOHRE OSH).
- [ ] Given RBAC, when a user lacks the HSE Owner role, then policy edits are blocked.
- [ ] Given any policy change, then it is audit-logged with author and timestamp.

**Tasks**

- [ ] Backend: `hse_policy`, `hse_obligation`, `hse_authority` schema with versioning
- [ ] Backend: policy publish/version service
- [ ] Frontend: HSE policy & obligation register admin
- [ ] Rules/Config: duty-of-care obligations + authority mapping per country
- [ ] Tests: unit (versioning/RBAC)

**Covers:** 24.1, 24.2, 24.3, 24.4, 24.5
**Dependencies:** —

### EPIC-24-S02 — HSE organization & responsibilities

**Labels:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 3
**As a** HSE Manager, **I want** to model the HSE organization and responsibilities, **so that** safety officers, first-aiders, fire wardens and responsible managers are assigned with required ratios and competencies.

**Description**
Define HSE roles (HSE officer, safety supervisor, first-aider, fire warden, permit issuer) and assign them to sites/employees with required ratios, certifications and validity, integrated with HR records.

**Acceptance Criteria**

- [ ] Given a site, when staffed, then required HSE roles and minimum ratios (e.g. first-aiders per N workers) are checklisted and gaps flagged.
- [ ] Given an HSE role assignment, then the holder's certification and validity are tracked with expiry alerts.
- [ ] Given a role-holder separation, then the vacancy is flagged for reassignment.
- [ ] Given any assignment change, then it is audit-logged.

**Tasks**

- [ ] Backend: `hse_role`, `hse_role_assignment` schema linked to employee records
- [ ] Backend: ratio-gap + certification-expiry service
- [ ] Frontend: HSE org & responsibilities screen
- [ ] Rules/Config: required roles + ratios per site type/country
- [ ] Alerts/Workflow: certification expiry + vacancy alerts
- [ ] Tests: unit (ratio/expiry)

**Covers:** 24.6
**Dependencies:** EPIC-24-S01

### EPIC-24-S03 — Risk assessment & hierarchy of controls

**Labels:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 8
**As a** HSE Officer, **I want** to conduct risk assessments with likelihood×severity scoring and apply the hierarchy of controls, **so that** hazards are evaluated, controls assigned, and residual risk tracked to an acceptable level.

**Description**
A risk-assessment workflow (HIRA/JSA) for tasks/areas: identify hazards, score initial risk (likelihood × severity), apply controls down the hierarchy (elimination → substitution → engineering → administrative → PPE), compute residual risk, assign owners and review dates.

**Acceptance Criteria**

- [ ] Given a risk assessment, when created, then hazards are listed with likelihood×severity producing an initial risk rating per a configurable matrix.
- [ ] Given controls, when assigned, then they are classified by hierarchy level and residual risk recalculates.
- [ ] Given residual risk above tolerance, then the assessment cannot be approved until further controls are added or an exception is approved.
- [ ] Given a review date, when due, then a reassessment alert fires.
- [ ] Given any assessment/control change, then it is audit-logged with assessor and approver.

**Tasks**

- [ ] Backend: `risk_assessment`, `hazard`, `control_measure` (hierarchy_level) schema with scoring
- [ ] Backend: residual-risk engine + review-due job
- [ ] Frontend: risk-assessment builder + control register
- [ ] Rules/Config: risk matrix bands + tolerance thresholds per country
- [ ] Alerts/Workflow: approval gating + reassessment alerts
- [ ] Tests: unit (scoring/residual) + e2e (gating)

**Covers:** 24.7, 24.8
**Dependencies:** EPIC-24-S01

### EPIC-24-S04 — Heat stress & midday-break compliance

**Labels:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** to enforce heat-stress controls and the seasonal midday-break ban, **so that** outdoor work stops during prohibited hours and heat-stress measures are evidenced.

**Description**
Enforce GCC midday-break rules (e.g. UAE/Qatar/Oman/KSA prohibition of outdoor work during peak summer afternoon hours over the summer period) with scheduling/attendance integration, plus heat-stress measures (shaded rest, water/electrolytes, acclimatization, WBGT monitoring) and exemptions, producing evidence.

**Acceptance Criteria**

- [ ] Given the midday-break period (configurable dates and hours per country, e.g. mid-June to mid-September, 12:30–15:00), then outdoor-work scheduling/attendance during banned hours is blocked or flagged as a violation.
- [ ] Given a heat-stress plan, when configured, then shaded rest areas, water provision, WBGT thresholds and acclimatization steps are recorded per site.
- [ ] Given a WBGT/heat reading above threshold, then a work-suspension alert is raised and logged.
- [ ] Given a permitted exemption (e.g. emergency work), then it requires approval and is logged with justification.
- [ ] Given any violation/exemption, then it is audit-logged and surfaces on the dashboard for authority evidence.

**Tasks**

- [ ] Backend: `heat_stress_rule`, `heat_reading`, `midday_break_violation` schema; attendance-integration hook
- [ ] Backend: banned-hours enforcement + WBGT-threshold service
- [ ] Frontend: heat-stress plan + violation/exemption register
- [ ] Rules/Config: country midday-break dates/hours, WBGT thresholds, exemptions
- [ ] Alerts/Workflow: work-suspension alerts; exemption approval
- [ ] Tests: unit (banned-hours/threshold) + integration (attendance)

**Covers:** 24.9
**Dependencies:** EPIC-24-S01

### EPIC-24-S05 — PPE compliance enforcement

**Labels:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 5
**As a** HSE Officer, **I want** to define and enforce PPE requirements per role/hazard and verify issuance/usage, **so that** mandatory PPE is in place and gaps are flagged.

**Description**
Define role/hazard→PPE requirement matrices (driven by risk assessments), verify issuance against the EPIC-22 PPE issuance records, and track PPE compliance (inspection, condition, replacement) and non-compliance.

**Acceptance Criteria**

- [ ] Given a role/hazard, when PPE is defined, then the required PPE set is derived from the risk assessment and applicable standards.
- [ ] Given a worker on a hazardous task, when PPE issuance is checked against EPIC-22 records, then missing/expired PPE is flagged and may block task/permit start.
- [ ] Given a PPE inspection, when a defect is found, then a replacement/corrective action is created.
- [ ] Given any PPE requirement/compliance change, then it is audit-logged.

**Tasks**

- [ ] Backend: `ppe_requirement` (role/hazard) schema; compliance-check service against EPIC-22
- [ ] Backend: PPE-gap + inspection service
- [ ] Frontend: PPE requirement matrix + compliance view
- [ ] Rules/Config: hazard→PPE rules per country/standard
- [ ] Alerts/Workflow: PPE-gap alerts; permit-start block
- [ ] Tests: integration (EPIC-22 link + permit gating)

**Covers:** 24.10
**Dependencies:** EPIC-24-S03, EPIC-22

### EPIC-24-S06 — Safety training & competency

**Labels:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 5
**As a** HSE Officer, **I want** to manage safety training and competency records, **so that** mandatory training is completed, certifications stay valid, and untrained workers are restricted from hazardous tasks.

**Description**
Manage safety-training catalogue, role-based mandatory-training matrices, scheduling, completion, certification validity and competency verification, integrated with HR records and gating permit/task assignment.

**Acceptance Criteria**

- [ ] Given a role, when mandatory training is defined, then required courses and refresh intervals are assigned per worker.
- [ ] Given a training expiry, when 30 days out, then a renewal alert fires; when expired, the worker is flagged non-compliant.
- [ ] Given a hazardous task/permit, when the worker lacks valid required training, then assignment/permit is blocked.
- [ ] Given training completion, then certificate and validity are stored against the employee record.
- [ ] Given any training/competency change, then it is audit-logged.

**Tasks**

- [ ] Backend: `safety_course`, `training_matrix`, `training_record` schema with validity
- [ ] Backend: expiry + competency-gating service
- [ ] Frontend: training catalogue + matrix + employee competency view
- [ ] Rules/Config: mandatory courses + refresh intervals per role/country
- [ ] Alerts/Workflow: renewal alerts; task/permit gating
- [ ] Tests: unit (expiry) + integration (permit gating)

**Covers:** 24.11
**Dependencies:** EPIC-24-S01

### EPIC-24-S07 — Toolbox talks

**Labels:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 3
**As a** Line Manager, **I want** to record toolbox talks with attendance, **so that** daily/weekly safety briefings are evidenced and topic coverage is tracked.

**Description**
Capture toolbox-talk sessions (topic, presenter, date, site, attendance with worker acknowledgement) and track frequency/coverage against requirements, with reminders.

**Acceptance Criteria**

- [ ] Given a toolbox talk, when logged, then topic, presenter, site, date and attendee list (with acknowledgement) are captured.
- [ ] Given a required frequency (e.g. daily pre-task / weekly), when not met for a site, then a gap is flagged.
- [ ] Given attendance, then it links to worker records and missing-worker coverage is reportable.
- [ ] Given any toolbox-talk record, then it is audit-logged.

**Tasks**

- [ ] Backend: `toolbox_talk`, `toolbox_attendance` schema
- [ ] Backend: frequency-coverage service
- [ ] Frontend: toolbox-talk capture (mobile) + attendance
- [ ] Rules/Config: required frequency per site/activity
- [ ] Alerts/Workflow: missed-talk reminders
- [ ] Tests: unit (coverage)

**Covers:** 24.12
**Dependencies:** EPIC-24-S06

### EPIC-24-S08 — Permit-to-work

**Labels:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 8
**As a** HSE Officer, **I want** an electronic permit-to-work system for high-risk activities, **so that** hot work, confined space, work at height, electrical and excavation are authorized with controls before work starts.

**Description**
Manage permit lifecycle (request → risk/control verification → issue → extend → close) for high-risk activities with mandatory pre-conditions (risk assessment present, PPE/training verified, isolations confirmed), validity windows and maker-checker authorization.

**Acceptance Criteria**

- [ ] Given a permit request, when submitted, then permit type, location, validity window and required controls are captured.
- [ ] Given issuance, when authorized, then it enforces preconditions (linked risk assessment approved, workers' training/PPE valid) and applies maker-checker (issuer ≠ requester).
- [ ] Given an expired or revoked permit, then associated work is flagged as unauthorized and an alert is raised.
- [ ] Given concurrent conflicting permits (e.g. hot work near confined space), then a conflict is flagged for review.
- [ ] Given any permit action, then it is audit-logged with timestamps and authorizers.

**Tasks**

- [ ] Backend: `work_permit`, `permit_control`, `permit_authorization` schema with lifecycle
- [ ] Backend: precondition-validation + conflict-detection service
- [ ] Frontend: permit request/issue/close workflow screens
- [ ] Rules/Config: permit types + required controls per activity/country
- [ ] Alerts/Workflow: maker-checker; expiry/conflict alerts
- [ ] Tests: e2e (request → issue → close) + unit (precondition/conflict)

**Covers:** 24.13
**Dependencies:** EPIC-24-S03, EPIC-24-S05, EPIC-24-S06

### EPIC-24-S09 — Incident reporting & incident register

**Labels:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 8
**As a** HSE Officer, **I want** to report and investigate incidents/near-misses, **so that** events are captured, classified, investigated and corrective actions tracked. Includes the Sample Incident Register.

**Description**
Capture incidents/near-misses/unsafe acts with classification (severity, type), investigation (root cause, e.g. 5-why), corrective/preventive actions, and authority-notification flags where required, producing the incident register.

**Acceptance Criteria**

- [ ] Given an incident, when reported, then type, severity, location, persons involved, immediate action and witnesses are captured (mobile-friendly).
- [ ] Given a reportable incident (e.g. lost-time injury, fatality), then an authority/GOSI-notification flag and statutory timeline alert are raised.
- [ ] Given an investigation, when conducted, then root cause and corrective/preventive actions with owners and due dates are recorded.
- [ ] Given the Incident Register, then it exports incident, date, type, severity, status and corrective-action status.
- [ ] Given any incident/investigation/action, then it is audit-logged.

**Tasks**

- [ ] Backend: `incident`, `incident_investigation`, `corrective_action` schema with classification
- [ ] Backend: reportability + statutory-timeline service
- [ ] Frontend: incident reporting (mobile) + Incident Register export
- [ ] Rules/Config: reportability thresholds + notification timelines per country
- [ ] Alerts/Workflow: authority-notification + corrective-action escalation
- [ ] Tests: e2e (report → investigate → close) + unit (reportability)

**Covers:** 24.14, 24.30
**Dependencies:** EPIC-24-S01

### EPIC-24-S10 — Work injury handling & GOSI/social-insurance linkage

**Labels:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 5
**As a** HR Admin, **I want** to handle work injuries end-to-end including authority/GOSI occupational-injury linkage, **so that** medical treatment, sick leave, compensation and claims are managed and evidenced.

**Description**
Manage work-injury cases from an incident: medical treatment, work-injury sick leave, fitness-to-return, disability assessment, and linkage to GOSI occupational-hazard branch / authority injury reporting and to separation/EOSB for death or permanent disability.

**Acceptance Criteria**

- [ ] Given a work injury, when opened from an incident, then medical records, injury leave and treatment are tracked with confidentiality.
- [ ] Given an occupational injury in KSA, then a GOSI occupational-hazard claim record is created and notification timeline enforced.
- [ ] Given a return-to-work, when fitness is assessed, then restrictions/modified duties are recorded.
- [ ] Given death in service or permanent disability, then it links to EPIC-27/EPIC-28 for settlement and to life/GPA claims.
- [ ] Given any injury record/action, then it is audit-logged with sensitive medical data masked.

**Tasks**

- [ ] Backend: `work_injury`, `injury_leave`, `gosi_injury_claim` schema
- [ ] Backend: claim/notification + return-to-work service; separation/EOSB feed
- [ ] Frontend: work-injury case management screen
- [ ] Rules/Config: occupational-injury notification rules per country (GOSI etc.)
- [ ] Alerts/Workflow: claim-timeline alerts; settlement linkage
- [ ] Tests: integration (GOSI/EOSB feed) + unit (timeline)

**Covers:** 24.15
**Dependencies:** EPIC-24-S09, EPIC-13, EPIC-27, EPIC-28

### EPIC-24-S11 — Emergency preparedness & fire safety

**Labels:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 8
**As a** HSE Officer, **I want** to manage emergency preparedness and fire safety across sites, **so that** emergency plans, drills, fire equipment and civil-defence certificates are current and evidenced.

**Description**
Manage emergency response plans (evacuation, assembly points, wardens, contacts), drills, and fire safety (extinguishers, alarms, detectors, exits, civil-defence certificate) with service/drill scheduling and certificate-expiry alerts, aligned with EPIC-23 accommodation fire safety.

**Acceptance Criteria**

- [ ] Given a site, when configured, then an emergency plan (evacuation routes, assembly points, wardens, emergency contacts) is recorded and gaps flagged.
- [ ] Given fire equipment, when registered, then extinguisher service, alarm/detector tests and civil-defence certificate validity are tracked with 60/30-day expiry alerts.
- [ ] Given a scheduled drill, when due, then it is created; completion is recorded and overdue drills flagged.
- [ ] Given an expired fire certificate or overdue drill, then the site is flagged high-risk and a corrective action is created.
- [ ] Given any emergency/fire record, then it is audit-logged.

**Tasks**

- [ ] Backend: `emergency_plan`, `fire_equipment`, `fire_certificate`, `drill` schema
- [ ] Backend: certificate-expiry + drill-due service
- [ ] Frontend: emergency plan + fire safety registers
- [ ] Rules/Config: service intervals, drill frequency, certificate types per country
- [ ] Alerts/Workflow: expiry/overdue-drill alerts; non-conformance → corrective action
- [ ] Tests: unit (expiry/overdue) + integration (EPIC-23 alignment)

**Covers:** 24.16, 24.17
**Dependencies:** EPIC-24-S01, EPIC-23

### EPIC-24-S12 — First aid & medical support

**Labels:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 3
**As a** HSE Officer, **I want** to manage first-aid and medical support provision, **so that** trained first-aiders, kits and clinic/ambulance access meet requirements per site.

**Description**
Track first-aid provision (trained first-aiders per ratio, first-aid kits/rooms, nearest clinic/hospital, ambulance arrangements) with expiry/restock alerts, aligned with EPIC-23 medical controls.

**Acceptance Criteria**

- [ ] Given a site, when configured, then required first-aiders per occupancy and first-aid resources are checklisted and gaps flagged.
- [ ] Given a first-aid kit, when restock/expiry is due, then an alert is raised.
- [ ] Given a first-aider certification expiry, then a renewal alert fires.
- [ ] Given any first-aid record, then it is audit-logged.

**Tasks**

- [ ] Backend: `first_aid_provision`, `first_aider_cert`, `first_aid_kit` schema
- [ ] Backend: ratio-gap + expiry service
- [ ] Frontend: first-aid & medical support screen
- [ ] Rules/Config: first-aider ratios + kit contents per country
- [ ] Alerts/Workflow: expiry/restock alerts
- [ ] Tests: unit (ratio/expiry)

**Covers:** 24.18
**Dependencies:** EPIC-24-S02, EPIC-23

### EPIC-24-S13 — Contractor HSE management

**Labels:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 5
**As a** HSE Manager, **I want** to govern contractor HSE compliance, **so that** contractor workers meet the same safety standards and contractor performance is tracked.

**Description**
Extend HSE to contractors: pre-qualification (HSE plan, training, insurance), site induction, permit participation, incident attribution, and contractor HSE scorecards for procurement decisions.

**Acceptance Criteria**

- [ ] Given a contractor, when onboarded, then HSE pre-qualification (plan, training records, insurance) is verified before site access.
- [ ] Given a contractor worker, when on site, then required induction/training/PPE are verified and gaps block access.
- [ ] Given a contractor-attributed incident, then it is recorded against the contractor's HSE scorecard.
- [ ] Given poor contractor HSE performance, then it is flagged for procurement review.
- [ ] Given any contractor HSE record, then it is audit-logged.

**Tasks**

- [ ] Backend: `contractor_hse_profile`, `contractor_hse_score`, `contractor_induction` schema
- [ ] Backend: pre-qualification + scorecard service
- [ ] Frontend: contractor HSE register + scorecard
- [ ] Rules/Config: pre-qualification + induction requirements per country
- [ ] Alerts/Workflow: access-block on gaps; procurement flag
- [ ] Tests: integration (induction gating + scorecard)

**Covers:** 24.19
**Dependencies:** EPIC-24-S06, EPIC-24-S09

### EPIC-24-S14 — Welfare compliance

**Labels:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** to track worker welfare compliance, **so that** rest, hydration, sanitation, breaks and wellbeing provisions on worksites are evidenced beyond accommodation.

**Description**
Track worksite welfare provisions (drinking water, shaded rest, sanitation, rest breaks, prayer facilities, worker wellbeing) with checklists and verification, complementing EPIC-23 accommodation welfare.

**Acceptance Criteria**

- [ ] Given a worksite, when assessed, then mandatory welfare provisions are checklisted and deficiencies flagged.
- [ ] Given a welfare deficiency, then a corrective action is created.
- [ ] Given a verification, then it is recorded with date and verifier.
- [ ] Given any welfare record, then it is audit-logged.

**Tasks**

- [ ] Backend: `welfare_provision`, `welfare_check` schema
- [ ] Backend: completeness service
- [ ] Frontend: welfare compliance checklist
- [ ] Rules/Config: mandatory worksite welfare provisions per country
- [ ] Alerts/Workflow: deficiency → corrective action
- [ ] Tests: unit (completeness)

**Covers:** 24.20
**Dependencies:** EPIC-24-S01

### EPIC-24-S15 — Occupational health surveillance

**Labels:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** to manage occupational health surveillance, **so that** workers exposed to hazards receive required medical screening and fitness monitoring with confidential records.

**Description**
Manage health-surveillance programs for exposure-based roles (e.g. noise, dust/silica, chemicals, heat), scheduling baseline/periodic medicals, recording fitness outcomes confidentially, and flagging required follow-up.

**Acceptance Criteria**

- [ ] Given an exposure-based role, when assigned, then required surveillance type and frequency are derived from the risk assessment.
- [ ] Given a surveillance due date, when approaching, then a screening alert fires; overdue screenings flag the worker.
- [ ] Given a screening result, when recorded, then fitness status/restrictions are stored confidentially with RBAC and masking.
- [ ] Given an adverse result, then a follow-up/medical-restriction action is created.
- [ ] Given any surveillance record, then it is audit-logged with sensitive data protected.

**Tasks**

- [ ] Backend: `health_surveillance_program`, `surveillance_record` schema with confidentiality
- [ ] Backend: scheduling + due/overdue service
- [ ] Frontend: surveillance program + confidential result entry
- [ ] Rules/Config: exposure→surveillance type/frequency per country
- [ ] Alerts/Workflow: screening-due alerts; adverse-result follow-up
- [ ] Tests: unit (scheduling/masking)

**Covers:** 24.21
**Dependencies:** EPIC-24-S03

### EPIC-24-S16 — HSE & HR integration

**Labels:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 5
**As a** System Administrator, **I want** HSE to integrate with HR data and downstream modules, **so that** training, PPE, injuries, competencies and roles stay synchronized across the platform.

**Description**
Provide the integration layer connecting HSE to HR records (employee/role/site), payroll (injury leave), social insurance (GOSI claims), separation/EOSB (injury/death) and benefits (PPE), via the event bus, ensuring single-source-of-truth and consistent audit.

**Acceptance Criteria**

- [ ] Given an HR event (hire/transfer/role change/separation), then HSE re-evaluates required training/PPE/roles for the worker.
- [ ] Given a work-injury leave, then it posts to payroll/leave with correct treatment.
- [ ] Given an HSE competency/PPE gap, then it is visible on the employee HR record.
- [ ] Given a separation due to injury/death, then HSE data flows to EOSB/final settlement.
- [ ] Given any integration event, then it is audit-logged and reconcilable.

**Tasks**

- [ ] Backend: HSE integration service + event handlers on the bus
- [ ] Backend: employee-record HSE-status projection
- [ ] Frontend: HSE summary on employee profile
- [ ] Rules/Config: event→HSE-action mappings
- [ ] Tests: integration (HR/payroll/GOSI/EOSB events)

**Covers:** 24.22
**Dependencies:** EPIC-24-S05, EPIC-24-S06, EPIC-24-S10

### EPIC-24-S17 — HSE audit checklist & risk matrix

**Labels:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 5
**As a** Internal Auditor, **I want** a configurable HSE audit checklist and risk matrix, **so that** I can verify HSE compliance, flag red flags and maintain an HSE risk register.

**Description**
Digital HSE audit checklist (valid permits, current training/PPE, drills done, certificates valid, midday-break adherence) and a configurable risk matrix/register with likelihood×severity scoring and red-flag rules from live data.

**Acceptance Criteria**

- [ ] Given the audit checklist, when run, then items auto-evaluate against live data (e.g. "no expired fire certificate", "no overdue safety training", "no midday-break violation") and flag fails.
- [ ] Given the risk matrix, then risks are scored likelihood×severity, rated, and assigned owners/mitigations.
- [ ] Given a red-flag rule (e.g. open high-severity incident, expired permit, training gap), then a risk-register entry is auto-created.
- [ ] Given a completed audit, then it is timestamped, signed off and exportable.
- [ ] Given any checklist/risk change, then it is audit-logged.

**Tasks**

- [ ] Backend: `hse_audit_checklist`, `hse_risk_register` schema with scoring
- [ ] Backend: red-flag rule engine over HSE data
- [ ] Frontend: audit checklist runner + risk matrix/heatmap
- [ ] Rules/Config: checklist items, red-flag thresholds, scoring bands
- [ ] Tests: unit (auto-evaluation/scoring)

**Covers:** 24.23, 24.25
**Dependencies:** EPIC-24-S04, EPIC-24-S08, EPIC-24-S09, EPIC-24-S11

### EPIC-24-S18 — HSE KPIs, dashboard & automation design

**Labels:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 5
**As a** Executive / Leadership, **I want** an HSE KPI dashboard with automation, **so that** I can monitor injury rates, training, permits, incidents and compliance in real time.

**Description**
Deliver HSE KPIs (LTIFR/TRIR, near-miss count, training compliance %, open corrective actions, permit compliance, midday-break violations) on a dashboard, plus the automation design (event-driven training/PPE checks, expiry alerts, permit gating, incident escalation).

**Acceptance Criteria**

- [ ] Given the dashboard, when opened, then it shows LTIFR/TRIR, near-misses, training compliance %, open corrective actions and expiring certificates by site/country.
- [ ] Given a KPI breach (e.g. training compliance below threshold, rising injury rate), then it is highlighted red and drillable.
- [ ] Given automation design, then event-driven triggers (training due, certificate expiry, incident, permit) auto-create tasks per the documented flow.
- [ ] Given RBAC, then dashboard scope respects site/country and sensitive medical data is role-restricted.

**Tasks**

- [ ] Backend: KPI aggregation views (LTIFR/TRIR etc.); automation event handlers
- [ ] Frontend: HSE dashboard with drill-downs
- [ ] Rules/Config: KPI thresholds + dashboard RBAC scope
- [ ] Alerts/Workflow: automation triggers wiring
- [ ] Tests: integration (KPI accuracy) + e2e (drill-down RBAC)

**Covers:** 24.24, 24.26, 24.27
**Dependencies:** EPIC-24-S09, EPIC-24-S16

### EPIC-24-S19 — Monthly HSE compliance pack, certificate & corrective action register

**Labels:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** to generate a monthly HSE compliance pack with a sign-off certificate and corrective action register, **so that** management can certify HSE compliance and auditors/authorities have dated evidence. Includes the Sample Corrective Action Register.

**Description**
Auto-compile a monthly HSE pack (incidents, injuries, training, permits, drills, certificates, corrective actions, KPIs) with the Sample HSE Monthly Compliance Certificate and the Sample Corrective Action Register, plus a key-takeaways summary, with management certification.

**Acceptance Criteria**

- [ ] Given month-end, when the pack is generated, then it includes incidents, injury stats, training/PPE compliance, permits, drills, certificate status and open corrective actions per site/entity.
- [ ] Given the compliance certificate, when signed, then it captures certifying officer, period, scope and is locked/audit-logged.
- [ ] Given the Corrective Action Register, then each action records source (incident/inspection/audit), owner, due date, severity, status and closure evidence.
- [ ] Given an unresolved high-severity action or open reportable incident, then certification is blocked or flagged until addressed.
- [ ] Given the pack, then it is versioned, exportable (PDF/Excel) and retained per retention policy.

**Tasks**

- [ ] Backend: `hse_compliance_pack`, `hse_compliance_certificate` schema; corrective-action aggregation
- [ ] Backend: pack generation + certification lock service
- [ ] Frontend: compliance pack viewer, certificate sign-off, Corrective Action Register export
- [ ] Rules/Config: certification gating rules; action severities
- [ ] Alerts/Workflow: month-end generation + sign-off workflow
- [ ] Tests: e2e (generate → certify → export)

**Covers:** 24.28, 24.29, 24.31, 24.32
**Dependencies:** EPIC-24-S17, EPIC-24-S18
