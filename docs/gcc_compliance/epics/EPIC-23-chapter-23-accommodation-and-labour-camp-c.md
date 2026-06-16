# EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 23 – Accommodation and Labour Camp Compliance
> **Module:** Welfare · **Labels:** `epic`, `gcc-compliance`, `welfare`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver an Accommodation & Labour Camp compliance module in AuraOS that manages accommodation master data, room/bed allocation and occupancy controls, and enforces health/hygiene, fire, electrical, food, welfare and medical-safety standards across company camps and provided housing. It supports inspections, contractor and female/family accommodation controls, cost allocation, maintenance, and produces registers, certificates, KPIs and audit evidence aligned to GCC labour-accommodation regulations.

## Business Value

Avoids serious penalties, camp closures and reputational damage from sub-standard worker accommodation (a high-enforcement area for MOHRE, MHRSD/Ministry of Municipal & Rural Affairs, and welfare authorities). Enforces occupancy density and safety limits, evidences periodic inspections, protects worker dignity and privacy, and gives leadership real-time visibility of accommodation risk and cost.

## Requirements Covered (handbook sections)

- 23.1 Introduction
- 23.2 Objectives of Accommodation Compliance
- 23.3 GCC Accommodation Compliance Landscape
- 23.4 Authorities Involved
- 23.5 Accommodation Policy
- 23.6 Accommodation Types
- 23.7 Accommodation Eligibility
- 23.8 Accommodation Master Data
- 23.9 Room and Bed Allocation
- 23.10 Occupancy Controls
- 23.11 Health, Hygiene and Sanitation
- 23.12 Fire and Life Safety
- 23.13 Electrical and Utility Safety
- 23.14 Kitchen, Dining and Food Safety
- 23.15 Worker Welfare Facilities
- 23.16 Medical and Emergency Controls
- 23.17 Transport Linkage
- 23.18 Accommodation and Payroll
- 23.19 Accommodation Cost Allocation
- 23.20 Maintenance Management
- 23.21 Accommodation Inspections
- 23.22 Contractor Accommodation Compliance
- 23.23 Female Accommodation Controls
- 23.24 Family Accommodation Controls
- 23.25 Accommodation Data Privacy and Dignity
- 23.26 Accommodation Audit Checklist
- 23.27 Accommodation KPIs
- 23.28 Accommodation Risk Matrix
- 23.29 HRMS Accommodation Automation Design
- 23.30 Accommodation Dashboard
- 23.31 Monthly Accommodation Compliance Pack
- 23.32 Sample Accommodation Monthly Compliance Certificate
- 23.33 Sample Room and Bed Register
- 23.34 Sample Accommodation Inspection Register
- 23.35 Sample Accommodation Complaint Register
- 23.36 Key Takeaways

## Out of Scope

- Housing-benefit eligibility and payroll allowance logic (owned by EPIC-22; this epic consumes the linkage).
- General HSE risk assessment and incident management beyond accommodation (owned by EPIC-24).
- Physical construction/facility procurement of camps.
- Transport route planning beyond the accommodation→site linkage record.

## Dependencies

- EPIC-22 (Employee Benefits) — accommodation benefit eligibility/cost link
- EPIC-24 (HSE) — fire/emergency, medical and inspection standards alignment
- EPIC-10 (Payroll) — accommodation deduction/cost feed
- Platform RBAC, rule engine, document store, alerts, dashboards

## Epic Definition of Done

- [ ] Accommodation master data (sites/buildings/rooms/beds) is modelled with capacity and status.
- [ ] Bed/room allocation enforces occupancy density and segregation rules per country.
- [ ] Hygiene, fire, electrical, food-safety, welfare and medical controls are tracked as checklist standards with certificates and expiry alerts.
- [ ] Inspections, complaints, maintenance and corrective actions are logged with workflows.
- [ ] Contractor, female and family accommodation controls are enforced with privacy/dignity safeguards.
- [ ] Cost allocation and payroll feed operate; KPIs, dashboard, risk matrix and monthly compliance pack/certificate generate from live data.
- [ ] Full audit trail captures every allocation, inspection, complaint and corrective action.

---

## User Stories

### EPIC-23-S01 — Accommodation governance, policy & landscape framework

**Labels:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 5
**As a** HR Manager, **I want** an accommodation governance framework, policy library and authority register, **so that** accommodation standards are anchored to approved policy and the relevant GCC authorities per country.

**Description**
Establish governance for accommodation compliance: objectives, the GCC landscape, the authorities involved (e.g. MOHRE/UAE, MHRSD & municipalities/KSA, welfare bodies), and a versioned accommodation policy that defines standards, roles and country scope. Frames all later stories.

**Acceptance Criteria**

- [ ] Given a HR Manager, when an accommodation policy is published, then it captures version, country scope, standards referenced and effective dates with prior versions retained read-only.
- [ ] Given the authorities register, then each accommodation standard links to the issuing authority/regulation per country.
- [ ] Given RBAC, when a user lacks the Accommodation Owner role, then policy/standard edits are blocked.
- [ ] Given a published policy, then it is visible to inspectors and camp bosses in the module.
- [ ] Given any policy/standard change, then it is audit-logged with author and timestamp.

**Tasks**

- [ ] Backend: `accommodation_policy`, `accommodation_authority`, `accommodation_standard` schema with versioning
- [ ] Backend: policy publish/version service
- [ ] Frontend: policy & authority register admin
- [ ] Rules/Config: country scope + authority-to-standard mapping
- [ ] Tests: unit (versioning/RBAC)

**Covers:** 23.1, 23.2, 23.3, 23.4, 23.5
**Dependencies:** —

### EPIC-23-S02 — Accommodation master data & types

**Labels:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 8
**As a** HR Admin, **I want** to maintain accommodation master data across sites, buildings, rooms and beds with type classification, **so that** every accommodation asset and its capacity is registered and reportable.

**Description**
Model the accommodation hierarchy (location/camp → building/block → room → bed) with type (labour camp, staff accommodation, villa, family unit, female accommodation), capacity, area, amenities, ownership (owned/leased) and status. This is the spine for allocation, occupancy and inspections.

**Acceptance Criteria**

- [ ] Given an accommodation site, when created, then it records type, location, authority permit/license number, capacity, ownership and status.
- [ ] Given a room, when created, then it records floor area, designed bed capacity and amenity attributes (AC, ablutions ratio).
- [ ] Given a bed, then it has a unique identifier and status (vacant/occupied/blocked/maintenance).
- [ ] Given a permit/license expiry, when 60/30 days out, then an alert fires to the Accommodation Owner.
- [ ] Given any master-data change, then it is audit-logged.

**Tasks**

- [ ] Backend: `accommodation_site`, `building`, `room`, `bed` schema (type, capacity, area, amenities, license_no, status)
- [ ] Backend: hierarchy + capacity rollup service; license-expiry alert job
- [ ] Frontend: master-data management with hierarchy tree
- [ ] Rules/Config: accommodation type catalogue per country
- [ ] Alerts/Workflow: license/permit expiry alerts
- [ ] Tests: unit (capacity rollup) + integration (hierarchy)

**Covers:** 23.6, 23.8
**Dependencies:** EPIC-23-S01

### EPIC-23-S03 — Accommodation eligibility & assignment

**Labels:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 5
**As a** HR Admin, **I want** configurable accommodation eligibility rules, **so that** workers are assigned the correct accommodation type and entitlement based on category, grade and status.

**Description**
Define eligibility for accommodation (provided bed in camp vs staff housing vs family/female unit) by worker category, grade, gender, marital/family status and contract, linking to the EPIC-22 housing/accommodation benefit.

**Acceptance Criteria**

- [ ] Given a worker, when eligibility is evaluated, then it derives accommodation type/entitlement from category, grade, gender and family status.
- [ ] Given an eligibility result, then assignment is restricted to compatible accommodation types (e.g. female worker → female accommodation only).
- [ ] Given a benefit linkage, then the accommodation assignment ties to the EPIC-22 accommodation benefit and suppresses any housing allowance.
- [ ] Given a category change, then eligibility re-evaluates and proposes reassignment.
- [ ] Given any eligibility/assignment change, then it is audit-logged.

**Tasks**

- [ ] Backend: `accommodation_eligibility_rule`, `accommodation_assignment` schema
- [ ] Backend: eligibility evaluation service + EPIC-22 link
- [ ] Frontend: eligibility builder + assignment screen
- [ ] Rules/Config: type/gender/family eligibility per country
- [ ] Tests: integration (eligibility + benefit link)

**Covers:** 23.7
**Dependencies:** EPIC-23-S02, EPIC-22

### EPIC-23-S04 — Room/bed allocation & occupancy controls

**Labels:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 8
**As a** HR Admin, **I want** to allocate beds/rooms and enforce occupancy density limits, **so that** no room exceeds the legal maximum occupants and segregation rules are respected.

**Description**
Manage bed/room allocation, check-in/check-out, transfers and vacancy, with hard occupancy controls (max persons per room, minimum floor area per worker, gender and nationality/company segregation where required). Produces the Sample Room and Bed Register.

**Acceptance Criteria**

- [ ] Given a bed allocation, when attempted, then the system blocks it if it would exceed the room's legal max occupancy or breach minimum area-per-worker.
- [ ] Given segregation rules, when allocating, then mixing genders in a room or non-compatible categories is blocked.
- [ ] Given an occupancy threshold (e.g. > 90% camp occupancy), then a capacity alert is raised.
- [ ] Given the Room and Bed Register, then it exports site/room/bed, occupant, check-in date and occupancy status.
- [ ] Given any allocation/transfer/check-out, then bed status updates and the change is audit-logged.

**Tasks**

- [ ] Backend: allocation service with occupancy/segregation guardrails; `bed_allocation` history
- [ ] Backend: occupancy rollup + threshold alert job
- [ ] Frontend: allocation board (vacant/occupied) + Room and Bed Register export
- [ ] Rules/Config: max occupancy, min area/worker, segregation per country
- [ ] Alerts/Workflow: over-occupancy/capacity alerts
- [ ] Tests: unit (occupancy/segregation blocks) + e2e (allocation flow)

**Covers:** 23.9, 23.10, 23.33
**Dependencies:** EPIC-23-S03

### EPIC-23-S05 — Health, hygiene & sanitation standards

**Labels:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** to track health/hygiene/sanitation standards per accommodation, **so that** ablution ratios, cleaning, pest control and waste management meet regulatory minimums and are evidenced.

**Description**
Configure hygiene standards (toilet/shower ratio per workers, cleaning frequency, pest-control schedule, waste management, potable water) as checklist items with evidence and periodic verification.

**Acceptance Criteria**

- [ ] Given a site, when hygiene standards are evaluated, then sanitary-fixture ratios (e.g. 1 toilet/shower per N workers) are computed against occupancy and flagged if breached.
- [ ] Given pest-control/cleaning schedules, when a service is due/overdue, then an alert is raised.
- [ ] Given a potable-water test, when recorded, then result and certificate are stored with validity/expiry.
- [ ] Given a hygiene non-conformance, then a corrective action is auto-created.
- [ ] Given any standard update/verification, then it is audit-logged.

**Tasks**

- [ ] Backend: `hygiene_standard`, `hygiene_check`, `service_schedule` schema
- [ ] Backend: ratio-computation + schedule-due service
- [ ] Frontend: hygiene checklist + service schedule screen
- [ ] Rules/Config: fixture ratios, cleaning/pest frequencies per country
- [ ] Alerts/Workflow: overdue-service alerts; non-conformance → corrective action
- [ ] Tests: unit (ratio breach) + integration (corrective action)

**Covers:** 23.11
**Dependencies:** EPIC-23-S04

### EPIC-23-S06 — Fire, life & electrical/utility safety

**Labels:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** to track fire/life safety and electrical/utility safety per accommodation, **so that** extinguishers, alarms, exits, certificates and electrical inspections are current and evidenced.

**Description**
Manage fire and life safety (extinguishers, alarms, smoke detectors, emergency exits, evacuation drills, civil-defence certificate) and electrical/utility safety (DEWA/SEWA-equivalent connection, earth/RCD testing, generator/AC safety) with certificate expiry and drill tracking, aligned with EPIC-24 fire safety.

**Acceptance Criteria**

- [ ] Given fire-safety assets, when registered, then extinguisher service dates, alarm tests and civil-defence certificate validity are tracked with 60/30-day expiry alerts.
- [ ] Given evacuation drills, when scheduled, then completion is recorded and overdue drills are flagged.
- [ ] Given electrical safety, when an inspection (earth/RCD/wiring) is recorded, then result and next-due date are stored and overdue inspections flagged.
- [ ] Given an expired fire/electrical certificate, then the site is flagged high-risk on the dashboard and a corrective action is created.
- [ ] Given any safety record, then it is audit-logged.

**Tasks**

- [ ] Backend: `fire_safety_asset`, `evacuation_drill`, `electrical_inspection`, `safety_certificate` schema
- [ ] Backend: certificate-expiry + drill-due alert jobs
- [ ] Frontend: fire & electrical safety registers
- [ ] Rules/Config: service intervals, drill frequency, certificate types per country
- [ ] Alerts/Workflow: 60/30-day expiry + overdue-drill alerts; non-conformance → corrective action
- [ ] Tests: unit (expiry/overdue) + integration (EPIC-24 alignment)

**Covers:** 23.12, 23.13
**Dependencies:** EPIC-23-S04, EPIC-24

### EPIC-23-S07 — Kitchen, dining & food safety

**Labels:** `user-story`, `welfare` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** to track kitchen/dining and food-safety standards, **so that** catering hygiene, food-handler health cards and municipality approvals are evidenced.

**Description**
Manage food-safety standards for camp kitchens/messes/dining: food-handler health cards, kitchen hygiene inspections, temperature logs, pest control, and municipality/catering licenses, with expiry alerts.

**Acceptance Criteria**

- [ ] Given a food handler, when assigned, then a valid health/occupational card is required and expiry tracked with 30-day alerts.
- [ ] Given a kitchen, when inspected, then hygiene score and findings are recorded; failing scores create corrective actions.
- [ ] Given a catering license/municipality approval, when expiring, then a 60/30-day alert fires.
- [ ] Given temperature/storage logs, then non-compliant readings are flagged.
- [ ] Given any food-safety record, then it is audit-logged.

**Tasks**

- [ ] Backend: `food_handler`, `kitchen_inspection`, `catering_license` schema
- [ ] Backend: health-card/license expiry service
- [ ] Frontend: food-safety register + inspection form
- [ ] Rules/Config: card/license validity + hygiene scoring per country
- [ ] Alerts/Workflow: expiry alerts; failing inspection → corrective action
- [ ] Tests: unit (expiry) + integration (corrective action)

**Covers:** 23.14
**Dependencies:** EPIC-23-S04

### EPIC-23-S08 — Worker welfare facilities & transport linkage

**Labels:** `user-story`, `welfare` · **Priority:** Should · **Estimate:** 5
**As a** HR Admin, **I want** to track welfare facilities and link accommodation to transport, **so that** rest, recreation, laundry, prayer and connectivity facilities are provided and worker transport to site is recorded.

**Description**
Register welfare facilities (recreation, laundry, prayer rooms, internet, common rooms, cooling) per accommodation, and link each accommodation to its worker-transport arrangement (route, vehicle, journey duration) coordinating with EPIC-22 transport benefit.

**Acceptance Criteria**

- [ ] Given an accommodation, when configured, then mandatory welfare facilities are checklisted and missing facilities flagged.
- [ ] Given a transport linkage, when recorded, then route, vehicle, pickup times and journey duration are stored and excessive travel time is flagged.
- [ ] Given a welfare-facility deficiency, then a corrective action is created.
- [ ] Given any welfare/transport record, then it is audit-logged.

**Tasks**

- [ ] Backend: `welfare_facility`, `accommodation_transport_link` schema
- [ ] Backend: facility-completeness + travel-time check service
- [ ] Frontend: welfare facilities checklist + transport linkage screen
- [ ] Rules/Config: mandatory facilities + max journey time per country
- [ ] Tests: unit (completeness/travel-time)

**Covers:** 23.15, 23.17
**Dependencies:** EPIC-23-S04, EPIC-22

### EPIC-23-S09 — Medical & emergency controls

**Labels:** `user-story`, `welfare` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** to manage medical and emergency controls per accommodation, **so that** first-aid provision, clinic access, emergency contacts and response readiness are evidenced.

**Description**
Track on-site medical provision (first-aid kits/rooms, trained first-aiders, nearest clinic/hospital, ambulance access), emergency contact boards and emergency response plans, aligned with EPIC-24 emergency preparedness/first aid.

**Acceptance Criteria**

- [ ] Given an accommodation, when configured, then required first-aid resources and trained first-aiders per occupancy are checklisted and gaps flagged.
- [ ] Given emergency information, then emergency contacts, nearest hospital and response plan are recorded and current.
- [ ] Given a first-aid kit, when expiry/restock is due, then an alert is raised.
- [ ] Given a medical/emergency deficiency, then a corrective action is created.
- [ ] Given any record, then it is audit-logged.

**Tasks**

- [ ] Backend: `medical_provision`, `emergency_plan`, `first_aider` link schema
- [ ] Backend: first-aider-ratio + kit-expiry service
- [ ] Frontend: medical & emergency controls screen
- [ ] Rules/Config: first-aider ratios + kit contents per country
- [ ] Alerts/Workflow: kit-expiry alerts; deficiency → corrective action
- [ ] Tests: unit (ratio/expiry)

**Covers:** 23.16
**Dependencies:** EPIC-23-S04, EPIC-24

### EPIC-23-S10 — Accommodation payroll & cost allocation

**Labels:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** accommodation to feed payroll and cost allocation, **so that** any worker deductions and the rent/utility/maintenance cost per occupant are accurate and posted to the right cost centre.

**Description**
Handle accommodation-related payroll (deductions where permitted, suppression of housing allowance for provided cases) and allocate total accommodation cost (rent, utilities, maintenance, catering) per occupant/cost centre/project for chargeback.

**Acceptance Criteria**

- [ ] Given provided accommodation, then any housing allowance is suppressed and only permitted deductions post to payroll.
- [ ] Given total site cost, when allocated, then it distributes per occupant-night/cost-centre/project for the period.
- [ ] Given a mid-month move, then cost allocation and any deduction prorate by occupancy days.
- [ ] Given a payroll lock, when an accommodation deduction input is missing for an assigned worker, then the lock flags the gap.
- [ ] Given any cost/payroll posting, then it is reconcilable and audit-logged.

**Tasks**

- [ ] Backend: `accommodation_cost`, `cost_allocation` schema; payroll feed service
- [ ] Backend: occupant-night allocation + proration engine
- [ ] Frontend: cost allocation + chargeback report
- [ ] Rules/Config: permitted-deduction rules per country; allocation basis
- [ ] Tests: integration (payroll + allocation) + unit (proration)

**Covers:** 23.18, 23.19
**Dependencies:** EPIC-23-S04, EPIC-10, EPIC-22

### EPIC-23-S11 — Maintenance management

**Labels:** `user-story`, `welfare` · **Priority:** Should · **Estimate:** 5
**As a** HR Admin, **I want** to manage accommodation maintenance requests and preventive maintenance, **so that** defects are resolved within SLA and assets stay safe and habitable.

**Description**
Handle reactive maintenance requests (raised by workers/inspectors) and preventive maintenance schedules (AC servicing, plumbing, pest, generator) with priority, SLA, assignment and closure, feeding safety/hygiene compliance.

**Acceptance Criteria**

- [ ] Given a maintenance request, when raised, then it captures category, priority, location/bed, and SLA target by priority.
- [ ] Given an overdue request, when SLA is breached, then it escalates with an alert.
- [ ] Given a preventive-maintenance schedule, when due, then a work order auto-generates.
- [ ] Given a safety-critical defect (e.g. electrical, fire), then it is flagged high-priority and linked to the relevant safety standard.
- [ ] Given any request/closure, then it is audit-logged with completion evidence.

**Tasks**

- [ ] Backend: `maintenance_request`, `pm_schedule`, `work_order` schema with SLA
- [ ] Backend: SLA-breach escalation + PM auto-generation job
- [ ] Frontend: maintenance request + work-order board
- [ ] Rules/Config: priority→SLA matrix; PM intervals
- [ ] Alerts/Workflow: SLA escalation; safety-critical routing
- [ ] Tests: unit (SLA) + integration (PM generation)

**Covers:** 23.20
**Dependencies:** EPIC-23-S05, EPIC-23-S06

### EPIC-23-S12 — Accommodation inspections & inspection register

**Labels:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** to schedule and conduct accommodation inspections with a digital checklist, **so that** periodic inspections are evidenced, findings tracked and corrective actions closed. Includes the Sample Accommodation Inspection Register.

**Description**
A mobile-friendly inspection workflow covering hygiene, fire, electrical, food, welfare and occupancy, with scoring, photo evidence, findings → corrective actions, and a complete inspection register for authority/internal audit.

**Acceptance Criteria**

- [ ] Given an inspection schedule, when an inspection is due (e.g. monthly), then it is created and an overdue inspection is flagged.
- [ ] Given an inspection, when conducted, then each checklist item is rated with photo evidence and an overall score computed.
- [ ] Given a failed item, then a corrective action with owner, due date and severity is auto-created.
- [ ] Given the Inspection Register, then it exports site, date, inspector, score, findings and corrective-action status.
- [ ] Given any inspection/corrective action, then it is audit-logged and reflects on the dashboard.

**Tasks**

- [ ] Backend: `inspection_schedule`, `inspection`, `inspection_item`, `corrective_action` schema
- [ ] Backend: scoring + overdue-inspection job; corrective-action lifecycle
- [ ] Frontend: mobile inspection form + Inspection Register export
- [ ] Rules/Config: checklist templates + frequency per accommodation type/country
- [ ] Alerts/Workflow: overdue-inspection alerts; corrective-action escalation
- [ ] Tests: e2e (inspect → finding → corrective action) + unit (scoring)

**Covers:** 23.21, 23.34
**Dependencies:** EPIC-23-S05, EPIC-23-S06, EPIC-23-S07

### EPIC-23-S13 — Contractor accommodation compliance

**Labels:** `user-story`, `welfare` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** to govern contractor/third-party accommodation, **so that** subcontracted worker housing meets the same standards and contractor non-compliance is tracked.

**Description**
Extend accommodation compliance to contractor-provided or third-party-leased accommodation: register contractor accommodations, require the same standards/inspections, and track contractor compliance status for procurement decisions.

**Acceptance Criteria**

- [ ] Given a contractor accommodation, when registered, then it is linked to the contractor and subject to the same standard checklists and inspections.
- [ ] Given a contractor accommodation inspection, when failing, then a non-compliance is recorded against the contractor with a remediation deadline.
- [ ] Given repeated/serious non-compliance, then the contractor is flagged for procurement review.
- [ ] Given any contractor accommodation record, then it is audit-logged and visible on the dashboard.

**Tasks**

- [ ] Backend: `contractor_accommodation`, `contractor_noncompliance` schema
- [ ] Backend: contractor compliance-status service
- [ ] Frontend: contractor accommodation register + compliance status
- [ ] Rules/Config: standard applicability + escalation thresholds
- [ ] Alerts/Workflow: non-compliance remediation + procurement flag
- [ ] Tests: integration (contractor inspection + flagging)

**Covers:** 23.22
**Dependencies:** EPIC-23-S12

### EPIC-23-S14 — Female & family accommodation controls with privacy/dignity

**Labels:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** dedicated controls for female and family accommodation plus privacy/dignity safeguards, **so that** segregation, security and worker dignity are enforced and sensitive data is protected.

**Description**
Enforce female-accommodation controls (segregation, dedicated security/wardens, restricted access) and family-accommodation controls (unit eligibility, dependant verification), and apply privacy/dignity safeguards across all accommodation data (no public exposure of occupant lists, RBAC, masked sensitive fields).

**Acceptance Criteria**

- [ ] Given female accommodation, when allocating, then only female occupants are permitted and access/security controls (warden, restricted entry) are recorded.
- [ ] Given family accommodation, when allocating, then family eligibility and dependant documents are verified before assignment.
- [ ] Given accommodation occupant data, then it is RBAC-restricted, occupant lists are not publicly exposed, and sensitive fields are masked.
- [ ] Given a privacy/dignity policy, then complaints relating to dignity are routed to a confidential channel.
- [ ] Given any female/family allocation or data access, then it is audit-logged.

**Tasks**

- [ ] Backend: `female_accommodation_control`, `family_unit_eligibility`, privacy/masking middleware
- [ ] Backend: segregation enforcement + dignity-complaint routing
- [ ] Frontend: female/family allocation screens with restricted access
- [ ] Rules/Config: segregation, security and family-eligibility rules per country
- [ ] Tests: unit (segregation/masking) + e2e (restricted access)

**Covers:** 23.23, 23.24, 23.25
**Dependencies:** EPIC-23-S04

### EPIC-23-S15 — Accommodation complaint register

**Labels:** `user-story`, `welfare` · **Priority:** Should · **Estimate:** 3
**As a** Employee (Self-Service), **I want** to raise accommodation complaints and track resolution, **so that** issues (overcrowding, hygiene, maintenance, dignity) are addressed and evidenced. Includes the Sample Accommodation Complaint Register.

**Description**
A complaint channel for accommodation issues with categorization, confidentiality option, routing to maintenance/inspection, SLA and resolution tracking, producing the complaint register.

**Acceptance Criteria**

- [ ] Given a worker, when they raise a complaint, then category, accommodation/bed, description and confidentiality flag are captured.
- [ ] Given a complaint, when logged, then it routes to the right owner (maintenance/HSE/welfare) with an SLA.
- [ ] Given an overdue complaint, then it escalates.
- [ ] Given the Complaint Register, then it exports complaint, category, status, owner and resolution date.
- [ ] Given any complaint/resolution, then it is audit-logged and dignity-related complaints stay confidential.

**Tasks**

- [ ] Backend: `accommodation_complaint` schema with routing/SLA
- [ ] Backend: routing + escalation service
- [ ] Frontend: complaint submission (self-service) + Complaint Register export
- [ ] Rules/Config: category→owner routing + SLA
- [ ] Alerts/Workflow: complaint escalation
- [ ] Tests: e2e (raise → route → resolve)

**Covers:** 23.35
**Dependencies:** EPIC-23-S11, EPIC-23-S14

### EPIC-23-S16 — Accommodation audit checklist & risk matrix

**Labels:** `user-story`, `welfare` · **Priority:** Should · **Estimate:** 5
**As a** Internal Auditor, **I want** a configurable accommodation audit checklist and risk matrix, **so that** I can verify compliance, flag red flags and maintain an accommodation risk register.

**Description**
Digital audit checklist (occupancy within limits, valid certificates, inspections current, corrective actions closed) and a configurable risk matrix/register with likelihood×impact scoring and red-flag rules from live data.

**Acceptance Criteria**

- [ ] Given the audit checklist, when run, then items auto-evaluate against live data (e.g. "no room over legal occupancy", "all civil-defence certificates valid") and flag fails.
- [ ] Given the risk matrix, then risks are scored likelihood×impact, rated, and assigned owners/mitigations.
- [ ] Given a red-flag rule (e.g. expired fire certificate, occupancy breach, overdue inspection), then a risk-register entry is auto-created.
- [ ] Given a completed audit, then it is timestamped, signed off and exportable.
- [ ] Given any checklist/risk change, then it is audit-logged.

**Tasks**

- [ ] Backend: `accommodation_audit_checklist`, `accommodation_risk_register` schema with scoring
- [ ] Backend: red-flag rule engine over accommodation data
- [ ] Frontend: audit checklist runner + risk matrix/heatmap
- [ ] Rules/Config: checklist items, red-flag thresholds, scoring bands
- [ ] Tests: unit (auto-evaluation/scoring)

**Covers:** 23.26, 23.28
**Dependencies:** EPIC-23-S04, EPIC-23-S06, EPIC-23-S12

### EPIC-23-S17 — Accommodation KPIs, dashboard & automation design

**Labels:** `user-story`, `welfare` · **Priority:** Should · **Estimate:** 5
**As a** Executive / Leadership, **I want** an accommodation KPI dashboard with automation, **so that** I can monitor occupancy, compliance, inspection scores and cost in real time.

**Description**
Deliver accommodation KPIs (occupancy %, compliance %, inspection score, open corrective actions, expiring certificates, cost per occupant) on a dashboard, plus the automation design (event-driven allocation, inspection scheduling, expiry alerts) underpinning the module.

**Acceptance Criteria**

- [ ] Given the dashboard, when opened, then it shows occupancy %, compliance %, average inspection score, open corrective actions and expiring certificates by site/country.
- [ ] Given a KPI breach (e.g. occupancy > legal limit, inspection score below threshold), then it is highlighted red and drillable to the site.
- [ ] Given automation design, then event-driven triggers (assignment, inspection due, certificate expiry) auto-create tasks per the documented flow.
- [ ] Given RBAC, then dashboard scope respects site/country and sensitive data is role-restricted.

**Tasks**

- [ ] Backend: KPI aggregation views; automation event handlers
- [ ] Frontend: accommodation dashboard with drill-downs
- [ ] Rules/Config: KPI thresholds + dashboard RBAC scope
- [ ] Alerts/Workflow: automation triggers wiring
- [ ] Tests: integration (KPI accuracy) + e2e (drill-down RBAC)

**Covers:** 23.27, 23.29, 23.30
**Dependencies:** EPIC-23-S04, EPIC-23-S12

### EPIC-23-S18 — Monthly accommodation compliance pack & certificate

**Labels:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** to generate a monthly accommodation compliance pack with a sign-off certificate, **so that** management can certify accommodation compliance and auditors/authorities have dated evidence.

**Description**
Auto-compile a monthly pack (occupancy, inspections, certificates, complaints, corrective actions, cost) with the Sample Accommodation Monthly Compliance Certificate and a key-takeaways summary, generated from live data with management certification.

**Acceptance Criteria**

- [ ] Given month-end, when the pack is generated, then it includes occupancy, inspection results, certificate status, complaints and open corrective actions per site/entity.
- [ ] Given the compliance certificate, when signed, then it captures certifying officer, period, scope and is locked/audit-logged.
- [ ] Given an unresolved high-severity finding (e.g. occupancy breach, expired fire certificate), then certification is blocked or flagged until addressed.
- [ ] Given the pack, then it is versioned, exportable (PDF/Excel) and retained per retention policy.
- [ ] Given the key-takeaways summary, then it surfaces top risks and trend vs prior month.

**Tasks**

- [ ] Backend: `accommodation_compliance_pack`, `accommodation_compliance_certificate` schema
- [ ] Backend: pack generation + certification lock service
- [ ] Frontend: compliance pack viewer + certificate sign-off
- [ ] Rules/Config: certification gating rules
- [ ] Alerts/Workflow: month-end generation + sign-off workflow
- [ ] Tests: e2e (generate → certify → export)

**Covers:** 23.31, 23.32, 23.36
**Dependencies:** EPIC-23-S16, EPIC-23-S17
