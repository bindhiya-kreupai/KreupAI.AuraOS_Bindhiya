# AuraOS Pending Implementation Backlog

Source: `AuraOS Issuess.xlsx` / `Sheet1`.

This document is intended for AI Developer execution. It converts the tracker into an implementation-ready backlog and preserves every pending row from the source workbook. Completed rows are intentionally excluded from the implementation checklist.

## Execution Rules for AI Developer

- Treat every checklist item below as a required implementation task unless explicitly marked as `In Progress` and already completed in code after verification.
- Do not replace real persistence with `localStorage`, mock arrays, placeholder IDs, browser `alert()`, `prompt()`, or cosmetic-only UI actions.
- If a route currently renders a generic hub, replace it with the required real page or intentionally remove/redirect it only when the task explicitly allows that option.
- For every API mentioned, verify request/response contracts, error handling, tenant scoping, authentication/session user resolution, loading states, empty states, and permission checks.
- For every button/action mentioned, ensure the UI has a real handler, meaningful success/error feedback, and refreshes data after mutation.
- For every filter/export/import/reporting task, implement usable filters, pagination where needed, and export/import validation where applicable.
- For every duplicate API/page naming issue, choose and document one canonical route/service and update navigation, breadcrumbs, and imports consistently.
- Preserve multi-tenant behavior and avoid hardcoded company, employee, tenant, country, or current-user values.
- Add or update tests where possible: service/unit tests for data mapping, API integration tests, and UI smoke tests for the main user actions.

## Backlog Summary

- Total source rows: 741
- Pending rows included in this file: 702
- In Progress: 10
- Not Started: 692
- Completed rows excluded from checklist: 39

### Pending Count by Module

| Module                        | Pending Count |
| ----------------------------- | ------------: |
| GCC Compliance Module         |           209 |
| Performance Module            |            47 |
| Localization Module           |            29 |
| Leave Module                  |            24 |
| Compliance Module             |            23 |
| Learning Module               |            19 |
| Benefits Module               |            19 |
| Audit & Security Module       |            18 |
| Compensation Module           |            17 |
| Competency Library Module     |            16 |
| Engagement Module             |            16 |
| Recruitment Components Module |            16 |
| DEI Module                    |            15 |
| HR Helpdesk Module            |            14 |
| Core HR Module                |            13 |
| Finance Module                |            12 |
| Global Mobility Module        |            12 |
| Career Planning Module        |            12 |
| Health & Safety Module        |            11 |
| HRSD Module                   |            11 |
| Integration Hub Module        |            10 |
| Reports Components Module     |            10 |
| Contract Workforce Module     |            10 |
| Construction Module           |             9 |
| Alumni Network Module         |             9 |
| Org Design Module             |             9 |
| Attendance Module             |             8 |
| Companies Module              |             8 |
| Gamification Module           |             8 |
| Performance Components Module |             8 |
| Labor Relations Module        |             8 |
| Onboarding Module             |             8 |
| HR Policies Compliance Module |             7 |
| HR Forms Compliance Module    |             7 |
| Payroll Components Module     |             7 |
| ESS Module                    |             7 |
| Job Library Module            |             6 |
| HR Budgeting Module           |             4 |
| MSS Module                    |             3 |
| Offboarding Module            |             3 |

### Pending Count by Assignee

| Assignee     | Pending Count |
| ------------ | ------------: |
| Unassigned   |           674 |
| Siva         |             6 |
| Kiruthiga    |             4 |
| Deeksha      |             4 |
| Nivithrasri  |             2 |
| Badmasri     |             2 |
| Bindhiya     |             2 |
| Sharon       |             2 |
| Devadharshni |             2 |
| Anubhav      |             2 |
| Sandhiya     |             1 |
| Hirudhanya   |             1 |

## Implementation Checklist

## Attendance Module

- [x] **AURA-001 — Shift Swapping: Wire 'View Full Roster' button**
  - **Status:** In Progress
  - **Assignee:** Nivithrasri
  - **Due Date:** 24/06/2026
  - **Page / Route:** `/dashboard/attendance/shift-swapping`
  - **Related API / Service:** `/api/v1/attendance/schedules`
  - **Description / Acceptance Criteria:** Add navigation so View Full Roster opens/links to the full roster view instead of doing nothing.

- [x] **AURA-002 — Shift Swapping: Replace 'current-user-id' placeholder with session employee ID**
  - **Status:** Not Started
  - **Assignee:** Nivithrasri
  - **Due Date:** 25/06/2026
  - **Page / Route:** `/dashboard/attendance/shift-swapping`
  - **Related API / Service:** `/api/attendance/shift-swap`
  - **Description / Acceptance Criteria:** Shift swap requests currently use a hardcoded current-user-id placeholder instead of the authenticated session's employee ID. Replace with real session-derived employee ID.

- [x] **AURA-003 — Roster Assignment: Implement Filter button functionality**
  - **Status:** Not Started
  - **Assignee:** Badmasri
  - **Due Date:** 24/06/2026
  - **Page / Route:** `/dashboard/attendance/roster-assignment`
  - **Related API / Service:** `/api/v1/employees, /api/v1/shifts, /api/v1/shift-rosters`
  - **Description / Acceptance Criteria:** Filter control is currently disabled or has no handler. Implement filtering of the roster grid by relevant criteria (employee, shift, date range).

- [x] **AURA-004 — Attendance Exceptions: Add bulk row selection and wire 'Approve Selected'**
  - **Status:** In Progress
  - **Assignee:** Bindhiya
  - **Due Date:** 22/06/2026
  - **Page / Route:** `/dashboard/attendance/attendance-exceptions`
  - **Related API / Service:** `POST /api/attendance/exceptions`
  - **Description / Acceptance Criteria:** Per-row approve/reject actions work, but there is no row selection UI, so the bulk 'Approve Selected' action has nothing to act on. Add checkboxes/row selection and connect bulk approve to POST /api/attendance/exceptions.

- [x] **AURA-005 — Attendance Exceptions: Implement Filter button functionality**
  - **Status:** In Progress
  - **Assignee:** Bindhiya
  - **Due Date:** 22/06/2026
  - **Page / Route:** `/dashboard/attendance/attendance-exceptions`
  - **Related API / Service:** `GET /api/attendance/exceptions`
  - **Description / Acceptance Criteria:** Filter control currently has no handler. Implement filtering of exceptions list by type, date, or employee.

- [x] **AURA-006 — Field Force: Persist beat planning via API instead of prompt-only flow**
  - **Status:** In Progress
  - **Assignee:** Badmasri
  - **Due Date:** 24/06/2026
  - **Page / Route:** `/dashboard/attendance/field-force`
  - **Related API / Service:** `FieldForceService / /api/attendance/field-force`
  - **Description / Acceptance Criteria:** Plan Beat' currently only shows a browser prompt() with no API persistence. Build a proper beat-planning form/modal and connect it to FieldForceService so plans are saved server-side. Replace decorative map with real visit/location data.

- [x] **AURA-007 — Regularization Request: Wire per-row 'MoreHorizontal' action menu**
  - **Status:** In Progress
  - **Assignee:** Sandhiya
  - **Due Date:** 23/06/2026
  - **Page / Route:** `/dashboard/attendance/regularization-request`
  - **Related API / Service:** `/api/attendance/regularization-request, /api/attendance/regularization`
  - **Description / Acceptance Criteria:** The per-row overflow menu (MoreHorizontal icon) currently has no handler. Implement the menu with relevant row actions (view detail, edit, cancel, etc.) and wire them to the regularization API.

- [x] **AURA-008 — GPS Attendance: Wire 'Live Tracking', 'Add Geofence', 'Import KML', 'Enable Tracking' buttons**
  - **Status:** In Progress
  - **Assignee:** Hirudhanya
  - **Due Date:** 26/06/2026
  - **Page / Route:** `/attendance/gps-attendance`
  - **Related API / Service:** `TBD — likely shares /api/attendance/geo-fencing and field-force endpoints`
  - **Description / Acceptance Criteria:** API data is fetched but the UI renders hardcoded pins/zones and none of these four buttons have handlers. Connect each to live geofence/tracking data and appropriate write actions; remove hardcoded pins once live data is wired.

## Companies Module

- [x] **AURA-009 — Feature Coverage: Expand form fields and wire Import/Export**
  - **Status:** In Progress
  - **Assignee:** Sharon
  - **Due Date:** 29/06/2026
  - **Page / Route:** `/dashboard/admin/master-data/companies`
  - **Related API / Service:** `createCompanySchema, updateCompanySchema; export API missing`
  - **Description / Acceptance Criteria:** API supports email, phone, address, industry, website, registrationNumber, status; UI only has code, name, taxId. Import shows alert stub; Export calls ?export=csv but master-data route has no export handler.

- [x] **AURA-010 — Navigation: Fix Legal Entities link to existing companies page**
  - **Status:** Not Started
  - **Assignee:** Sharon
  - **Due Date:** 29/06/2026
  - **Page / Route:** `(modules)/master-data/page.tsx`
  - **Related API / Service:** `GET /api/v1/hr/entities or /api/companies`
  - **Description / Acceptance Criteria:** Hub links Legal Entities to /core-hr/entities which has no page (404). Retarget to /master-data/companies or /core-hr/companies.

- [x] **AURA-011 — Missing Page: Create Legal Entities management page**
  - **Status:** In Progress
  - **Assignee:** Kiruthiga
  - **Due Date:** 2026-01-07 (Excel serial: 46029)
  - **Page / Route:** `/core-hr/entities`
  - **Related API / Service:** `GET /api/v1/hr/entities, /api/companies/*`
  - **Description / Acceptance Criteria:** GET /api/v1/hr/entities exists with employee/dept/location counts but no UI. Build list/detail page; optionally wire CRUD to /api/companies.

- [x] **AURA-012 — Missing Page: Create company detail page**
  - **Status:** Not Started
  - **Assignee:** Kiruthiga
  - **Due Date:** 2026-01-07 (Excel serial: 46029)
  - **Page / Route:** `/companies/[id]`
  - **Related API / Service:** `GET /api/companies/[id]?includeRelations=true`
  - **Description / Acceptance Criteria:** No detail view for single company with relations (includeRelations=true).

- [x] **AURA-013 — Orphan Components: Mount or delete mock legal entity UI**
  - **Status:** Not Started
  - **Assignee:** Devadharshni
  - **Due Date:** 2026-02-07 (Excel serial: 46060)
  - **Page / Route:** `components/hr/LegalEntityManagement.tsx`
  - **Related API / Service:** `legalEntityService.ts (MOCK) → should use /api/companies`
  - **Description / Acceptance Criteria:** Full multi-tab UI (entities, transfers, consolidated metrics) using mock legalEntityService. Not imported by any page.

- [x] **AURA-014 — Orphan Components: Mount or delete multi-entity mock components**
  - **Status:** Not Started
  - **Assignee:** Devadharshni
  - **Due Date:** 2026-02-07 (Excel serial: 46060)
  - **Page / Route:** `components/hr/EntityManagementDashboard.tsx, InterEntityTransfer.tsx`
  - **Related API / Service:** `multiEntityService.ts (MOCK)`
  - **Description / Acceptance Criteria:** EntityManagementDashboard and InterEntityTransfer use mock multiEntityService. Not imported by any route.

- [x] **AURA-015 — Entity Switcher: Wire EntitySwitcher to live company list**
  - **Status:** Not Started
  - **Assignee:** Kiruthiga
  - **Due Date:** 2026-01-07 (Excel serial: 46029)
  - **Page / Route:** `(modules)/core-hr/components/EntitySwitcher.tsx`
  - **Related API / Service:** `GET /api/v1/companies or GET /api/companies`
  - **Description / Acceptance Criteria:** Hardcoded 4 entities; Manage Legal Entities button has no href/handler. Used on Core HR hub.

- [x] **AURA-016 — API Duplication: Consolidate company dropdown source**
  - **Status:** Not Started
  - **Assignee:** Kiruthiga
  - **Due Date:** 01/07/0206 (verify year; source value appears unusual)
  - **Page / Route:** `Employees/Departments/Locations pages`
  - **Related API / Service:** `/api/v1/companies, /api/master-data/companies, /api/companies`
  - **Description / Acceptance Criteria:** Employees/departments use /api/v1/companies; companies admin uses /api/master-data/companies; full /api/companies API is unused. Pick one canonical API.

## Compensation Module

- [x] **AURA-017 — Grade Bands: Wire grade CRUD and display pay bands**
  - **Status:** In Progress
  - **Assignee:** Anubhav
  - **Due Date:** 2026-01-07 (Excel serial: 46029)
  - **Page / Route:** `/dashboard/compensation/grade-bands`
  - **Related API / Service:** `GET/POST/PUT/DELETE /api/compensation/grades`
  - **Description / Acceptance Criteria:** GET /api/compensation/grades works but API returns bands: [] always. Add New Grade and Edit Structure buttons have no handlers.

- [x] **AURA-018 — Compensation Planning: Wire create/revise compensation actions**
  - **Status:** In Progress
  - **Assignee:** Anubhav
  - **Due Date:** 2026-01-07 (Excel serial: 46029)
  - **Page / Route:** `/dashboard/compensation/compensation-planning`
  - **Related API / Service:** `GET/POST/PUT /api/compensation/employee-compensation, GET /api/compensation/analytics`
  - **Description / Acceptance Criteria:** Employee comp list and metrics cards load via GET employee-compensation and analytics. No write actions in UI despite POST/PUT existing.

- [x] **AURA-019 — Increment Planning: Implement increment-proposals API and wire Save/Submit**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compensation/increment-planning`
  - **Related API / Service:** `GET/POST/PUT /api/compensation/increment-cycles; /increment-proposals (missing)`
  - **Description / Acceptance Criteria:** GET increment-cycles works. IncrementProposalService.getProposals() → /increment-proposals 404. Save and Submit buttons have no handlers. Budget utilization expects totalUsed not returned by API.

- [x] **AURA-020 — Bonus Management: Wire bonus page to /api/compensation/bonuses**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compensation/bonus-management`
  - **Related API / Service:** `GET/POST/PUT /api/compensation/bonuses`
  - **Description / Acceptance Criteria:** Page calls /bonus-schemes and /bonus-payouts (404). Should map to /bonuses. Release Bonus and Edit Rules buttons unwired.

- [x] **AURA-021 — Equity / Stock: Implement stock-grants API or consolidate duplicate pages**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compensation/equity-management, /stock-options`
  - **Related API / Service:** `/api/compensation/stock-grants (missing)`
  - **Description / Acceptance Criteria:** StockGrantService.getGrants() → /stock-grants 404. equity-management and stock-options are duplicate pages against missing API.

- [x] **AURA-022 — Loans: Implement loan APIs or consolidate duplicate pages**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compensation/loan-advances, /loans`
  - **Related API / Service:** `/api/compensation/loan-schemes, /employee-loans (missing)`
  - **Description / Acceptance Criteria:** LoanService calls /loan-schemes and /employee-loans (404). loan-advances and loans are duplicate pages. New Request button unwired.

- [x] **AURA-023 — Arrears: Implement arrears-requests API and wire Run Calculation**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compensation/arrears-processing`
  - **Related API / Service:** `/api/compensation/arrears-requests (missing)`
  - **Description / Acceptance Criteria:** ArrearsService.getRequests() → /arrears-requests 404. Run Calculation button has no handler.

- [x] **AURA-024 — Total Rewards: Implement total-rewards API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compensation/total-rewards`
  - **Related API / Service:** `/api/compensation/total-rewards (missing)`
  - **Description / Acceptance Criteria:** TotalRewardsService.getStatements() → /total-rewards 404. Page shows empty or error state.

- [x] **AURA-025 — Market Benchmarking: Implement market-benchmarks API and wire search filter**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compensation/market-benchmarking`
  - **Related API / Service:** `/api/compensation/market-benchmarks (missing)`
  - **Description / Acceptance Criteria:** MarketBenchmarkService.getBenchmarks() → /market-benchmarks 404. Search input has no filter logic.

- [x] **AURA-026 — Budget Simulation: Implement budget-simulations API and wire Save Scenario**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compensation/budget-simulation`
  - **Related API / Service:** `GET /api/compensation/analytics; /budget-simulations (missing)`
  - **Description / Acceptance Criteria:** BudgetSimulationService.getSimulations() → /budget-simulations 404. Base metrics load from analytics. Sliders are client-side only; Save Scenario unwired.

- [x] **AURA-027 — Expense Reimbursement: Wire expense claims CRUD and approve/reject**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compensation/expense-reimbursement`
  - **Related API / Service:** `GET/POST/PUT/DELETE /api/compensation/expense-claims`
  - **Description / Acceptance Criteria:** GET expense-claims works (best-wired page). New Expense button, upload drop zone, and approve/reject row actions unwired despite POST/PUT/DELETE existing.

- [x] **AURA-028 — Settings: Build compensation settings admin UI**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `No page`
  - **Related API / Service:** `GET/PUT /api/compensation/settings`
  - **Description / Acceptance Criteria:** GET/PUT /api/compensation/settings implemented but no page imports or renders settings.

- [x] **AURA-029 — Legacy UI: Replace mock tab UI with dashboard services**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/compensation`
  - **Related API / Service:** `None — mock only`
  - **Description / Acceptance Criteria:** All 11 tabs use hardcoded mock data with no API calls. SalaryReview, BudgetAllocation, BenchmarkComparison, CompReviewHistory tabs render without required props.

- [x] **AURA-030 — Legacy UI: Wire CompensationPlanner to live APIs**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/(modules)/compensation-planning`
  - **Related API / Service:** `Compensation dashboard services.ts`
  - **Description / Acceptance Criteria:** CompensationPlanner uses MOCK_EMPLOYEES, MOCK_DEPARTMENTS, etc. No service integration.

- [x] **AURA-031 — Orphan Components: Mount or remove orphan compensation dashboards**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/compensation/PayEquityDashboard.tsx, EWADashboard.tsx`
  - **Related API / Service:** `None — mock only`
  - **Description / Acceptance Criteria:** PayEquityDashboard and EWADashboard are self-contained mock components with zero page imports.

- [x] **AURA-032 — Dead Code: Wire hooks to pages or remove dead code**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `dashboard/compensation/hooks/useCompensation.ts, src/hooks/useCompensation.ts`
  - **Related API / Service:** `useCompensation hooks; compensationService.ts → /api/v1/compensation/* (missing)`
  - **Description / Acceptance Criteria:** Dashboard useCompensation never imported; seeds sampleComponents/sampleGrades on init. src/hooks/useCompensation targets non-existent /api/v1/compensation/\*.

- [x] **AURA-033 — Analytics: Align analytics with /api/compensation/analytics**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/analytics/compensation-analytics`
  - **Related API / Service:** `/api/v1/analytics/compensation vs /api/compensation/analytics`
  - **Description / Acceptance Criteria:** Page uses /api/v1/analytics/compensation (separate from /api/compensation/analytics used by dashboard pages). Consider consolidation.

## Competency Library Module

- [ ] **AURA-034 — Service Layer: Remove or gate silent mock fallback**
  - **Status:** Not Started
  - **Assignee:** Deeksha
  - **Due Date:** 2026-02-07 (Excel serial: 46060)
  - **Page / Route:** `competency-library.service.ts`
  - **Related API / Service:** `competency-library.service.ts`
  - **Description / Acceptance Criteria:** fetchWithFallback returns embedded MOCK\_\* data on API error with success: true, hiding integration failures from UI.

- [ ] **AURA-035 — Competency Catalog: Fix category filter and wire CategoryService**
  - **Status:** Not Started
  - **Assignee:** Deeksha
  - **Due Date:** 2026-02-07 (Excel serial: 46060)
  - **Page / Route:** `/dashboard/performance/competency-library/competency-catalog`
  - **Related API / Service:** `GET /api/competency-library/categories, GET/POST /competencies`
  - **Description / Acceptance Criteria:** CategoryService imported but never called; filter pills use hardcoded COMPETENCY_CATEGORIES and send category name as categoryId (API expects UUID). Import button is alert-only stub.

- [ ] **AURA-036 — Competency Catalog: Replace stub with service-backed catalog page**
  - **Status:** Not Started
  - **Assignee:** Deeksha
  - **Due Date:** 2026-02-07 (Excel serial: 46060)
  - **Page / Route:** `/dashboard/performance/competency-assessment/competency-catalog`
  - **Related API / Service:** `CompetencyService → /api/competency-library/competencies`
  - **Description / Acceptance Criteria:** 6 hardcoded competency cards; search/filters non-functional. Imports CompetencyService but never calls it.

- [ ] **AURA-037 — Proficiency Levels: Replace stub with FrameworkService-backed page**
  - **Status:** Not Started
  - **Assignee:** Deeksha
  - **Due Date:** 2026-02-07 (Excel serial: 46060)
  - **Page / Route:** `/dashboard/performance/competency-assessment/proficiency-levels`
  - **Related API / Service:** `FrameworkService → /api/competency-library/frameworks`
  - **Description / Acceptance Criteria:** Static L1–L5 sidebar and content with no API integration. Real page exists at competency-library/proficiency-levels.

- [ ] **AURA-038 — Job-Competency Map: Load departments from org API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-library/job-competency-map`
  - **Related API / Service:** `JobRoleService → /api/competency-library/job-roles`
  - **Description / Acceptance Criteria:** CRUD via JobRoleService works with mock fallback. Department filter uses hardcoded DEPARTMENTS array instead of org structure.

- [ ] **AURA-039 — Job-Competency Map: Replace stub with service-backed mapping page**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-assessment/job-competency-map`
  - **Related API / Service:** `JobRoleService → /api/competency-library/job-roles`
  - **Description / Acceptance Criteria:** Hardcoded roles and mappings; Map New Role and Add Competency buttons unwired.

- [ ] **AURA-040 — Skill Assessment: Wire assessment results submission and employee/cycle data**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-library/skill-assessment`
  - **Related API / Service:** `POST /api/competency-library/assessments/[id]/results; AssessmentService.submitResults`
  - **Description / Acceptance Criteria:** AssessmentService CRUD works with mock fallback. No UI to rate/submit competency results. Employee picker and cycle banners use inline arrays. Send Reminders, Continue Assessment, Start Assessment unwired.

- [ ] **AURA-041 — Skill Assessment: Replace stub with service-backed assessment page**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-assessment/skill-assessment`
  - **Related API / Service:** `AssessmentService → /api/competency-library/assessments`
  - **Description / Acceptance Criteria:** Hardcoded cycles and assessments; all action buttons unwired.

- [ ] **AURA-042 — Gap Analysis: Wire gap-analysis CRUD and development plan list/detail**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-library/gap-analysis`
  - **Related API / Service:** `POST/PUT/DELETE /api/competency-library/gap-analysis; GET/PUT/DELETE /development-plans`
  - **Description / Acceptance Criteria:** Reads analyses via GapAnalysisService; creates dev plans only. Cannot create/edit/delete gap analyses. Cannot list/view/update existing development plans. Refresh and Export Report unwired.

- [ ] **AURA-043 — Gap Analysis: Wire Assign Training and scope filter**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-assessment/gap-analysis`
  - **Related API / Service:** `GET /api/competency-library/gap-analysis`
  - **Description / Acceptance Criteria:** GET /api/competency-library/gap-analysis wired (read-only). Scope dropdown and Assign Training button unwired.

- [ ] **AURA-044 — Legacy Split: Unify competency data model**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-assessment/page.tsx`
  - **Related API / Service:** `/api/performance/competencies vs /api/competency-library/competencies`
  - **Description / Acceptance Criteria:** Landing page uses performance/core/services.CompetencyService → /api/performance/competencies (prisma.competency) not competency-library catalog. Add Competency button unwired.

- [ ] **AURA-045 — Orphan API: Build assessment results rating UI**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/api/competency-library/assessments/[id]/results`
  - **Related API / Service:** `GET/POST /api/competency-library/assessments/[id]/results`
  - **Description / Acceptance Criteria:** GET/POST assessment results endpoint has no UI consumer. AssessmentService.submitResults defined but never called.

- [ ] **AURA-046 — Orphan Hooks: Wire useCompetencyLibrary hooks to pages or remove**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `hooks/useCompetencyLibrary.ts`
  - **Related API / Service:** `All competency-library services`
  - **Description / Acceptance Criteria:** Full hook suite (useCompetencies, useFrameworks, etc.) wrapping all services — zero page imports found.

- [ ] **AURA-047 — Validators: Enforce Zod validators in API routes**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `lib/validators/competency-library.ts`
  - **Related API / Service:** `All POST/PUT /api/competency-library/* endpoints`
  - **Description / Acceptance Criteria:** Zod schemas exported but not wired into any POST/PUT API route handlers.

- [ ] **AURA-048 — Module Shell: Replace placeholder with dashboard hub link**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/competency-library`
  - **Related API / Service:** `N/A — routing/IA fix`
  - **Description / Acceptance Criteria:** ModulePage isImplemented=false stub while 5 dashboard subpages exist under competency-library/.

- [ ] **AURA-049 — Cross-Module: Align workforce gap analysis with competency-library API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/workforce-planning/gap-analysis`
  - **Related API / Service:** `GET /api/competency-library/gap-analysis?type=workforce`
  - **Description / Acceptance Criteria:** Uses GET /api/competency-library/gap-analysis?type=workforce (direct fetch). Ensure consistent data model with competency-library gap-analysis page.

## Compliance Module

- [ ] **AURA-050 — Labor Relations: Implement labor-laws API and wire UI**
  - **Status:** Not Started
  - **Assignee:** Siva
  - **Due Date:** 2026-03-07 (Excel serial: 46088)
  - **Page / Route:** `/dashboard/compliance/labor-law-compliance`
  - **Related API / Service:** `/api/compliance/labor-laws, /api/compliance/records (missing)`
  - **Description / Acceptance Criteria:** LaborLawService calls /api/compliance/labor-laws (404). Page displays hardcoded FLSA/OSHA/EEO/FMLA cards. View All Updates unwired.

- [ ] **AURA-051 — Labor Relations: Implement POSH API and wire action buttons**
  - **Status:** Not Started
  - **Assignee:** Siva
  - **Due Date:** 2026-03-07 (Excel serial: 46088)
  - **Page / Route:** `/dashboard/compliance/posh`
  - **Related API / Service:** `/api/compliance/posh/* (missing)`
  - **Description / Acceptance Criteria:** Service calls /api/compliance/posh/complaints and /committees (404). Renders hardcoded ICC members. Policy Doc, Secure Report, View Training Records, Schedule Awareness Session unwired.

- [ ] **AURA-052 — Labor Relations: Implement grievances API and wire View Details**
  - **Status:** Not Started
  - **Assignee:** Siva
  - **Due Date:** 2026-03-07 (Excel serial: 46088)
  - **Page / Route:** `/dashboard/compliance/grievance-management`
  - **Related API / Service:** `/api/compliance/grievances (missing)`
  - **Description / Acceptance Criteria:** Service call fails; hardcoded stats/cases shown. View Details button unwired.

- [ ] **AURA-053 — Labor Relations: Implement disciplinary API and merge duplicate pages**
  - **Status:** Not Started
  - **Assignee:** Siva
  - **Due Date:** 2026-03-07 (Excel serial: 46088)
  - **Page / Route:** `/dashboard/compliance/disciplinary, /disciplinary-actions`
  - **Related API / Service:** `/api/compliance/disciplinary (missing)`
  - **Description / Acceptance Criteria:** Two duplicate pages call /api/compliance/disciplinary (404). Falls back to hardcoded CASES. New Case and row action menu unwired.

- [ ] **AURA-054 — Labor Relations: Implement audits API and wire Schedule Audit**
  - **Status:** Not Started
  - **Assignee:** Siva
  - **Due Date:** 2026-03-07 (Excel serial: 46088)
  - **Page / Route:** `/dashboard/compliance/audits`
  - **Related API / Service:** `/api/compliance/audits (missing)`
  - **Description / Acceptance Criteria:** Service call fails; hardcoded 92% score. Schedule Audit button unwired.

- [ ] **AURA-055 — Labor Relations: Implement unions API and wire CRUD actions**
  - **Status:** Not Started
  - **Assignee:** Siva
  - **Due Date:** 2026-03-07 (Excel serial: 46088)
  - **Page / Route:** `/dashboard/compliance/union-database`
  - **Related API / Service:** `/api/compliance/unions (missing)`
  - **Description / Acceptance Criteria:** Hardcoded union cards. Add Union, View Members, Contact Rep buttons unwired.

- [ ] **AURA-056 — Labor Relations: Implement CBA API and wire Draft New Proposal**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance/collective-bargaining`
  - **Related API / Service:** `/api/compliance/unions/cba (missing)`
  - **Description / Acceptance Criteria:** Hardcoded negotiations. Draft New Proposal button unwired.

- [ ] **AURA-057 — Labor Relations: Implement whistleblower API and wire report form**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance/whistleblower`
  - **Related API / Service:** `/api/compliance/whistleblower (missing)`
  - **Description / Acceptance Criteria:** Report form exists but Submit Report and Track Case Status buttons have no handlers.

- [ ] **AURA-058 — Labor Relations: Implement arbitrations API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance/arbitration`
  - **Related API / Service:** `/api/compliance/arbitrations (missing)`
  - **Description / Acceptance Criteria:** Hardcoded arbitrator list and cases. No service backend.

- [ ] **AURA-059 — Labor Relations: Implement strikes API and wire Deploy/Standby**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance/strike-management`
  - **Related API / Service:** `/api/compliance/strikes (missing)`
  - **Description / Acceptance Criteria:** Hardcoded strike cards. Deploy and Standby buttons unwired.

- [ ] **AURA-060 — Labor Relations: Implement communication log API and wire Filter Logs**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance/communication-log`
  - **Related API / Service:** `/api/compliance/communication-log (missing)`
  - **Description / Acceptance Criteria:** No service at all; explicitly sets empty array then shows hardcoded log entries. Filter Logs unwired.

- [ ] **AURA-061 — Orphan API: Wire India PT calculator to india-statutory page**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/api/compliance/india-professional-tax`
  - **Related API / Service:** `GET/POST /api/compliance/india-professional-tax`
  - **Description / Acceptance Criteria:** GET/POST india-professional-tax endpoint exists but no page calls it. india-statutory page uses /api/india-statutory instead.

- [ ] **AURA-062 — Partial API: Wire POST calculator actions on labour-law page**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/labour-law`
  - **Related API / Service:** `POST /api/compliance/labour-law`
  - **Description / Acceptance Criteria:** Page only GETs config by country. POST actions (calculateAnnualLeave, validateWorkingHours, etc.) unused.

- [ ] **AURA-063 — Orphan API: Wire overtime/validation engine to attendance pages**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `POST /api/compliance/working-hours`
  - **Related API / Service:** `POST /api/compliance/working-hours`
  - **Description / Acceptance Criteria:** Working-hours POST engine (7 actions) has no UI consumer. Only GET used by ramadan-auto-switch.

- [ ] **AURA-064 — Partial API: Wire remaining hijri-calendar actions**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/api/compliance/hijri-calendar`
  - **Related API / Service:** `GET /api/compliance/hijri-calendar?action=*`
  - **Description / Acceptance Criteria:** Only isRamadan action used by ramadan-auto-switch. 11 other actions (holidays, eid, format, etc.) unused.

- [ ] **AURA-065 — Orphan API: Wire overview to service catalog endpoint**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `GET /api/compliance (root)`
  - **Related API / Service:** `GET /api/compliance`
  - **Description / Acceptance Criteria:** GET /api/compliance returns supported countries/service catalog but no page calls root endpoint.

- [ ] **AURA-066 — Payroll Compliance: Replace MOCK_ALERTS with live observability API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/alerts`
  - **Related API / Service:** `/api/v1/compliance/observability`
  - **Description / Acceptance Criteria:** Alerts page uses hardcoded MOCK_ALERTS despite /api/v1/compliance/observability existing.

- [ ] **AURA-067 — Security Framework: Implement /v1/compliance/frameworks backend or remove mock**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/security/compliance`
  - **Related API / Service:** `/api/v1/compliance/frameworks, controls (missing)`
  - **Description / Acceptance Criteria:** complianceFrameworkService tries /v1/compliance/frameworks, controls, evidence — no routes exist; falls back to MOCK_SOC2/ISO controls.

- [ ] **AURA-068 — Duplication: Consolidate three parallel compliance UI tracks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `WPS / GOSI / Nitaqat`
  - **Related API / Service:** `/api/compliance/* vs /api/v1/wps-compliance/* vs /api/v1/gosi-compliance/*`
  - **Description / Acceptance Criteria:** Three tracks: payroll-compliance/_ (calculators wired to /api/compliance/_), EPIC dashboards (/api/v1/_-compliance/_), and (modules)/payroll-compliance/\* mock workspaces. Pick one surface per domain.

- [ ] **AURA-069 — Duplication: Differentiate payroll labour-law vs labor-law-compliance**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `Labour Law pages`
  - **Related API / Service:** `GET /api/compliance/labour-law vs /api/compliance/labor-laws (missing)`
  - **Description / Acceptance Criteria:** payroll-compliance/labour-law uses /api/compliance/labour-law (GCC). dashboard/compliance/labor-law-compliance shows US hardcoded laws with broken service. Clarify scope or merge.

- [ ] **AURA-070 — Orphan Components: Mount or remove orphan compliance presentation components**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/compliance/*.tsx (14 files)`
  - **Related API / Service:** `Varies — /api/compliance/* and /api/v1/compliance/* endpoints`
  - **Description / Acceptance Criteria:** WpsDashboard, GosiDashboard, GratuityCalculator, StatutoryReportsDashboard, India PF/ESI/TDS dashboards, etc. — zero @/components/compliance/ imports in codebase. All use internal MOCK\_\* data.

- [ ] **AURA-071 — Module Shell: Replace mock workspaces with wired dashboard re-exports**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/payroll-compliance/{wps,gosi,eosb,india-statutory}`
  - **Related API / Service:** `N/A — routing/IA fix`
  - **Description / Acceptance Criteria:** 4 key module workspaces are standalone mock UIs while dashboard pages are API-wired. Most other module routes re-export dashboard pages.

- [ ] **AURA-072 — Analytics/Settings: Implement compliance analytics and settings APIs**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `dashboard/compliance/services.ts`
  - **Related API / Service:** `/api/compliance/analytics, /api/compliance/settings (missing)`
  - **Description / Acceptance Criteria:** ComplianceAnalyticsService → /api/compliance/analytics and ComplianceSettingsService → /api/compliance/settings — both missing, no pages.

## Core HR Module

- [x] **AURA-073 — Auto-Numbering: Persist sequence config to API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/core-hr/auto-numbering`
  - **Related API / Service:** `AutoNumberService → /api/core-hr/auto-numbers`
  - **Description / Acceptance Criteria:** Save/reset must PUT/POST to server; overrides must not be browser-only. Page uses localStorage key auraos.coreHr.autoNumbers.v1.

- [x] **AURA-074 — Letter Generation: Wire Create New Letter and Preview/Download/Print**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/core-hr/letter-generation`
  - **Related API / Service:** `LetterService → /api/core-hr/letters; DocumentTemplateService → /api/core-hr/document-templates`
  - **Description / Acceptance Criteria:** Create New Letter calls handleAction with no API. Template sidebar is hardcoded (5 names). Preview/Download/Print are view-only with no PDF fetch.

- [x] **AURA-075 — Document Management: Wire document delete, preview/download, and real AI scan**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/core-hr/document-management`
  - **Related API / Service:** `DocumentService → /api/core-hr/documents`
  - **Description / Acceptance Criteria:** Delete calls DocumentService.verifyDocument() which is a no-op GET stub. Preview/Download unwired. scanDocumentAI uses setTimeout fake OCR.

- [x] **AURA-076 — Employee Life Events: Wire Approve/Reject to API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/core-hr/employee-life-events`
  - **Related API / Service:** `LifeEventService.processEvent → /api/core-hr/life-events`
  - **Description / Acceptance Criteria:** handleAction only updates React state. handleWish passes employee name as eventId to processEvent instead of real event ID.

- [x] **AURA-077 — Anniversary Alerts: Implement send notifications**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/core-hr/anniversary-alerts`
  - **Related API / Service:** `AnniversaryService → /api/core-hr/anniversaries`
  - **Description / Acceptance Criteria:** UI calls AnniversaryService.sendNotifications() which is empty stub.

- [x] **AURA-078 — Confirmation Letters: Wire Preview and PDF download**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/core-hr/confirmation-letters`
  - **Related API / Service:** `ConfirmationLetterService → /api/core-hr/confirmation-letters`
  - **Description / Acceptance Criteria:** Eye/Preview and PDF buttons have no handlers.

- [x] **AURA-079 — Employee ID Cards: Wire card generation and revoke**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/core-hr/employee-id-cards`
  - **Related API / Service:** `IDCardService.issueIDCard, generateCard → /api/core-hr/id-cards`
  - **Description / Acceptance Criteria:** No issue/generate flow; print is window.print() only.

- [x] **AURA-080 — Cost Center: Wire export report and budget allocation**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/core-hr/cost-center`
  - **Related API / Service:** `CostCenterService → /api/core-hr/cost-centers`
  - **Description / Acceptance Criteria:** Download button triggers alert(). CostCenterService.allocateBudget() is no-op.

- [x] **AURA-081 — Mass Updates: Upload file payload and wire preview**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/core-hr/mass-updates`
  - **Related API / Service:** `MassUpdateService → /api/core-hr/mass-updates`
  - **Description / Acceptance Criteria:** Upload creates metadata record only; CSV file not sent. MassUpdateService.previewUpdate() returns empty stub.

- [x] **AURA-082 — Exit Management: Wire clearance item updates and templates**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/core-hr/exit-management`
  - **Related API / Service:** `ExitService → /api/core-hr/exits`
  - **Description / Acceptance Criteria:** Clearance shown read-only; no UI to complete items. ExitService.getAllClearanceTemplates() returns [].

- [x] **AURA-083 — Position Management: Remove mock fallback data**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/core-hr/position-management`
  - **Related API / Service:** `PositionService.getAllPositions → /api/core-hr/positions`
  - **Description / Acceptance Criteria:** On API error, service returns 2 hardcoded positions instead of empty/error state.

- [x] **AURA-084 — Life Events: Add workflow actions or consolidate routes**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/core-hr/life-events`
  - **Related API / Service:** `LifeEventService → /api/core-hr/life-events`
  - **Description / Acceptance Criteria:** Read-only list vs duplicate employee-life-events with actions. Consolidate or add create/approve on one page.

- [x] **AURA-085 — Architecture: Wire or remove dead hook and duplicate service layer**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `hooks/useCoreHR.ts`
  - **Related API / Service:** `hooks/useCoreHR.ts; employee-database/services.ts`
  - **Description / Acceptance Criteria:** useCoreHR seeds 15+ localStorage keys when API empty but no page uses it. Orphan employee-database/services.ts calls /api/employees (wrong endpoint).

## Gamification Module

- [x] **AURA-086 — Platform: Create entire /api/gamification/\* API surface**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `Module-wide`
  - **Related API / Service:** `dashboard/gamification/services.ts; lib/services/engagement/gamification.service.ts`
  - **Description / Acceptance Criteria:** Zero /api/gamification/\* routes exist. All 8 sub-pages attempt API fetch and get 404. Backend ref exists at lib/services/engagement/gamification.service.ts but no HTTP route exposes it.

- [x] **AURA-087 — Points System: Fix data binding and wire Redeem Rewards**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gamification/points-system`
  - **Related API / Service:** `PointsService → /gamification/points/*`
  - **Description / Acceptance Criteria:** Fetches accounts via API (404) but renders hardcoded balance 2,450 and stats. Redeem Rewards button has no handler.

- [x] **AURA-088 — Leaderboards: Handle empty response and wire scope tabs**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gamification/leaderboards`
  - **Related API / Service:** `LeaderboardsService → /gamification/leaderboards`
  - **Description / Acceptance Criteria:** Assumes leaderboard[0..2] exist; will crash on empty array after 404. Global/Team/Regional tabs have no filter logic.

- [x] **AURA-089 — Challenges: Wire Join Challenge and render API list**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gamification/challenges`
  - **Related API / Service:** `ChallengesService → /gamification/challenges`
  - **Description / Acceptance Criteria:** Hero + list use hardcoded content; Join button unwired. Fetches challenges but UI ignores challenges state for main cards.

- [x] **AURA-090 — Missions: Bind missions from API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gamification/missions`
  - **Related API / Service:** `MissionsService → /gamification/missions`
  - **Description / Acceptance Criteria:** Fetches missions but renders hardcoded 3-item list; streak banner hardcoded.

- [x] **AURA-091 — Virtual Currency: Bind wallet and wire Transfer/Cash Out/Convert**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gamification/virtual-currency`
  - **Related API / Service:** `VirtualCurrencyService → /gamification/currency/*`
  - **Description / Acceptance Criteria:** Hardcoded 2,450 AC, username, exchange rate. Three action buttons unwired.

- [x] **AURA-092 — Badges: Fix badge shape mapping**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gamification/badges`
  - **Related API / Service:** `BadgesService.getBadges`
  - **Description / Acceptance Criteria:** UI expects badge.icon, badge.title; API types use different shape.

- [x] **AURA-093 — Architecture: Wire or remove useGamification hook**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `hooks/useGamification.ts`
  - **Related API / Service:** `hooks/useGamification.ts; components/learning/GamificationHub.tsx`
  - **Description / Acceptance Criteria:** Full CRUD hook never imported by any page. Duplicate gamification: services/gamificationService.ts mock for learning vs dashboard REST.

## Engagement Module

- [x] **AURA-094 — Surveys: Fix API response unwrapping**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/engagement/surveys, /pulse-surveys, /polls-quizzes`
  - **Related API / Service:** `SurveyService → /api/engagement/surveys; APIClient.unwrapList`
  - **Description / Acceptance Criteria:** SurveyService.getSurveys() returns raw { success, data, meta }; pages check Array.isArray → always empty even when DB has data.

- [x] **AURA-095 — Surveys: Wire Start Survey and survey responses API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/engagement/surveys`
  - **Related API / Service:** `SurveyService.submitResponse; /api/engagement/survey-responses (missing)`
  - **Description / Acceptance Criteria:** Start Survey button has no handler. Missing /api/engagement/survey-responses endpoint.

- [x] **AURA-096 — Events: Fix response unwrapping and wire RSVP**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/engagement/events, /event-calendar, /birthday-anniversary`
  - **Related API / Service:** `EventService → /api/engagement/events; /api/engagement/rsvps (missing)`
  - **Description / Acceptance Criteria:** Same wrapped-list bug as surveys. handleRsvp updates local state only; no POST persisted.

- [x] **AURA-097 — Innovation: Create ideas API and wire submit/vote**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/engagement/innovation, /suggestion-box`
  - **Related API / Service:** `/api/engagement/ideas (missing); InnovationService.createIdea, voteIdea`
  - **Description / Acceptance Criteria:** InnovationService.getIdeas() → 404. Submit Idea modal opens but submit not connected; votes are local state only.

- [x] **AURA-098 — CSR: Create CSR activities API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/engagement/csr-activities`
  - **Related API / Service:** `/api/engagement/csr-activities (missing)`
  - **Description / Acceptance Criteria:** CSRService.getActivities() → 404.

- [x] **AURA-099 — Newsletter: Create newsletters API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/engagement/newsletter`
  - **Related API / Service:** `/api/engagement/newsletters (missing)`
  - **Description / Acceptance Criteria:** NewsletterService.getNewsletters() → 404.

- [x] **AURA-100 — Social Feed: Wire compose post and like/comment/share**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/engagement/social-feed`
  - **Related API / Service:** `SocialFeedService → /api/engagement/posts; /posts/{id}/like (missing)`
  - **Description / Acceptance Criteria:** Post/Send, image, emoji buttons unwired. Interaction buttons decorative.

- [x] **AURA-101 — Recognition Wall: Wire Give Kudos and like/comment**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/engagement/recognition-wall`
  - **Related API / Service:** `SocialFeedService.createPost (type=recognition)`
  - **Description / Acceptance Criteria:** Give Kudos button unwired. Like/comment buttons have no handlers.

- [x] **AURA-102 — Classifieds: Create dedicated classifieds API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/engagement/classifieds`
  - **Related API / Service:** `Missing classifieds API; misuses SocialFeedService`
  - **Description / Acceptance Criteria:** Filters SocialFeedService.getPosts() for type===classified — wrong domain model. Post Ad modal submit not connected.

- [x] **AURA-103 — Rewards Catalog: Create rewards catalog API and wire Redeem**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/engagement/rewards-catalog`
  - **Related API / Service:** `Missing rewards API; link to gamification points`
  - **Description / Acceptance Criteria:** Misuses social posts filtered by type===reward; balance hardcoded 0 pts. Redeem button unwired.

- [x] **AURA-104 — Referral Program: Create referral program API and wire share buttons**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/engagement/referral-program`
  - **Related API / Service:** `Missing referral API`
  - **Description / Acceptance Criteria:** Misuses social posts type===referral; link/bonus hardcoded. Copy/LinkedIn/Twitter share unwired.

- [x] **AURA-105 — Pulse Checks: Wire Launch Pulse Check and trend data**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/engagement/pulse-checks`
  - **Related API / Service:** `SurveyService.submitResponse; /api/engagement/analytics`
  - **Description / Acceptance Criteria:** handleSendPulse toggles UI only; charts (sentimentData, deptData) never populated.

- [x] **AURA-106 — Analytics: Wire gamification/wellness metrics and Export**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/engagement/engagement-analytics`
  - **Related API / Service:** `EngagementAnalyticsService; missing gamification metrics`
  - **Description / Acceptance Criteria:** Badges/challenges/wellness hardcoded to 0; time-range select doesn't refetch. Export button unwired.

- [x] **AURA-107 — Settings: Expose engagement settings admin UI**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `Module-wide`
  - **Related API / Service:** `GET/PUT /api/engagement/settings`
  - **Description / Acceptance Criteria:** EngagementSettingsService exists; no settings page.

- [x] **AURA-108 — Navigation: Complete hub feature list**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/engagement`
  - **Related API / Service:** `ModuleGrid`
  - **Description / Acceptance Criteria:** Hub lists 10 features; 10+ pages exist but aren't in grid (surveys, newsletter, innovation, events, rewards-catalog, wall, etc.).

- [x] **AURA-109 — Architecture: Wire or remove useEngagement hook**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `hooks/useEngagement.ts`
  - **Related API / Service:** `hooks/useEngagement.ts`
  - **Description / Acceptance Criteria:** Central hook loads all domains; no page uses it.

## Health & Safety Module

- [x] **AURA-110 — Navigation: Link orphan pages in hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/health-safety`
  - **Related API / Service:** `ModuleGrid`
  - **Description / Acceptance Criteria:** ModuleGrid lists 5 features but /incidents and /emergency pages exist and are not linked from hub.

- [x] **AURA-111 — Incident Reporting: Wire submit form and photo upload**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/health-safety/incident-reporting`
  - **Related API / Service:** `POST /api/health-safety/incidents; IncidentService.create`
  - **Description / Acceptance Criteria:** Submit Report button and form fields are uncontrolled with no handler. Add Photo Evidence is decorative only.

- [x] **AURA-112 — Incident Reporting: Wire detail view**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/health-safety/incident-reporting`
  - **Related API / Service:** `GET /api/health-safety/incidents (list only)`
  - **Description / Acceptance Criteria:** View Details buttons have no onClick, route, or GET-by-id API.

- [x] **AURA-113 — Incidents Dashboard: Wire Report Incident and fix schema mapping**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/health-safety/incidents`
  - **Related API / Service:** `GET/POST /api/health-safety/incidents; HealthSafetyIncident model`
  - **Description / Acceptance Criteria:** Report Incident button unwired. UI expects date/id/status Open|Investigating|Closed; API returns incidentDate/incidentNumber/REPORTED|INVESTIGATING|RESOLVED|CLOSED. Days Without Incident uses Math.random().

- [x] **AURA-114 — Incidents Dashboard: Wire emergency sidebar from API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/health-safety/incidents`
  - **Related API / Service:** `GET /api/health-safety/emergency; EmergencyService.getContacts`
  - **Description / Acceptance Criteria:** Sidebar emergency contacts hardcoded (911/EXT) instead of EmergencyService.

- [x] **AURA-115 — COVID Tracker: Add dedicated COVID API and wire daily check**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/health-safety/covid-tracker`
  - **Related API / Service:** `GET /api/health-safety/checkups (proxy reuse); missing COVID API`
  - **Description / Acceptance Criteria:** Page reuses HealthCheckupService with string filters. Submit Report for daily temperature/symptom check is unwired.

- [x] **AURA-116 — Health Checkups: Wire booking actions and fix schema mapping**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/health-safety/health-checkups`
  - **Related API / Service:** `POST /api/health-safety/checkups; HealthCheckupService.create`
  - **Description / Acceptance Criteria:** Book Appointment, Reschedule, Details, View Report unwired. UI expects type/date/doctor/clinic; API returns checkupType/scheduledFor/result/employeeId.

- [x] **AURA-117 — Emergency Contacts: Wire add contact and fix schema mapping**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/health-safety/emergency-contacts`
  - **Related API / Service:** `POST /api/health-safety/emergency; HealthSafetyEmergencyContact model`
  - **Description / Acceptance Criteria:** Add Personal Contact unwired. UI filters type emergency/workplace/personal and uses contact.number; API uses FIRE|MEDICAL|SECURITY|UTILITY and phone.

- [x] **AURA-118 — Emergency Response: Wire SOS dispatch and geolocation**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/health-safety/emergency`
  - **Related API / Service:** `Missing alert dispatch and GPS/workplace API`
  - **Description / Acceptance Criteria:** SOS countdown/alert is client-only simulation. Current location hardcoded as Office Location.

- [x] **AURA-119 — Safety Training: Add enrollment/progress model and wire course actions**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/health-safety/safety-training`
  - **Related API / Service:** `GET /api/health-safety/training; missing enrollment/completion API`
  - **Description / Acceptance Criteria:** UI shows per-employee progress/deadline but API schema is catalog-only. Play course tiles and Download certification unwired.

- [x] **AURA-120 — Services: Wire orphan settings/analytics services**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `dashboard/health-safety/services.ts`
  - **Related API / Service:** `GET/PUT /api/health-safety/settings`
  - **Description / Acceptance Criteria:** HealthSafetySettingsService and HealthSafetyAnalyticsService defined but no page imports them. AnalyticsService.getMetrics() calls /settings instead of metrics endpoint.

## HR Policies Compliance Module

- [x] **AURA-121 — Policies: Add create/edit policy and document viewer**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-policies-compliance/policies`
  - **Related API / Service:** `POST /api/v1/hr-policies-compliance/policies (publish/archive only); hrPolicyService`
  - **Description / Acceptance Criteria:** UI only lists/publishes/archives; no create or edit policy form. Table shows metadata only; no document viewer or download.

- [x] **AURA-122 — Acknowledgements: Add per-policy ack list and employee workflow**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-policies-compliance/acknowledgements`
  - **Related API / Service:** `GET /api/v1/hr-policies-compliance/dashboard; PolicyAcknowledgement model`
  - **Description / Acceptance Criteria:** Page shows aggregate KPIs only; no per-employee or per-policy acknowledgement table. No employee self-acknowledge UI.

- [x] **AURA-123 — Exceptions: Add policy picker UX**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-policies-compliance/exceptions`
  - **Related API / Service:** `GET /api/v1/hr-policies-compliance/policies`
  - **Description / Acceptance Criteria:** Raise form requires raw policyId UUID; no dropdown/search against policies list.

- [x] **AURA-124 — Reviews: Structured review form and policy context**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-policies-compliance/reviews`
  - **Related API / Service:** `POST /api/v1/hr-policies-compliance/reviews`
  - **Description / Acceptance Criteria:** Complete Review uses window.prompt for outcome/notes. Table shows truncated policyId only; no policy title or link.

- [x] **AURA-125 — Certificate: Attestation UI and certificate export**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-policies-compliance/certificate`
  - **Related API / Service:** `POST /api/v1/hr-policies-compliance/certificate; hrPolicyCertificateService`
  - **Description / Acceptance Criteria:** Sign sends hardcoded attestations [{field:attest,value:OK}]. No PDF/download or signed certificate viewer after sign.

- [x] **AURA-126 — Dashboard: Loading/error states and KPI drill-down**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-policies-compliance`
  - **Related API / Service:** `GET /api/v1/hr-policies-compliance/dashboard`
  - **Description / Acceptance Criteria:** No loading spinner or error UI when dashboard fetch fails. KPI tiles not clickable links to filtered sub-pages.

- [x] **AURA-127 — API: Add create-draft and dedicated acknowledgements API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/api/v1/hr-policies-compliance/policies`
  - **Related API / Service:** `hrPolicyService; hrPolicyCertificateService.dashboard`
  - **Description / Acceptance Criteria:** POST route supports publish/archive only; no create-draft. No /acknowledgements route; data only via dashboard aggregate.

## HR Forms Compliance Module

- [x] **AURA-128 — Signatures: Build signatures UI**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `No page (orphan API)`
  - **Related API / Service:** `GET /api/v1/hr-forms-compliance/signatures; hrFormSubmissionService.listSignatures`
  - **Description / Acceptance Criteria:** GET /api/v1/hr-forms-compliance/signatures exists but no page consumes it.

- [x] **AURA-129 — Templates: Create custom template and wire supersede**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-forms-compliance/templates`
  - **Related API / Service:** `POST /api/v1/hr-forms-compliance/templates; hrFormTemplateService`
  - **Description / Acceptance Criteria:** Only seed-defaults and publish; no create/edit template or schema editor. API supports supersede action but UI has no Supersede button.

- [x] **AURA-130 — Routings: Template picker and stage management**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-forms-compliance/routings`
  - **Related API / Service:** `GET /api/v1/hr-forms-compliance/templates; hrFormRoutingService.upsertStage`
  - **Description / Acceptance Criteria:** Stage form requires manual templateId entry. Only upsert-stage supported; no delete or reorder controls.

- [x] **AURA-131 — Submissions: Dynamic form render and e-signature audit trail**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-forms-compliance/submissions`
  - **Related API / Service:** `POST /api/v1/hr-forms-compliance/submissions; GET /signatures`
  - **Description / Acceptance Criteria:** Start submission collects IDs only; no form fields from template schema. No UI to view per-stage signatures. Reject uses window.prompt.

- [x] **AURA-132 — Submissions: Fix status filter and automate writeback**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-forms-compliance/submissions`
  - **Related API / Service:** `GET/POST /api/v1/hr-forms-compliance/submissions`
  - **Description / Acceptance Criteria:** Filter dropdown omits SUBMITTED. Writeback success/failure marked manually; no integrated writeback engine UI.

- [x] **AURA-133 — Certificate: Attestation UI and certificate export**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-forms-compliance/certificate`
  - **Related API / Service:** `POST /api/v1/hr-forms-compliance/certificate; hrFormCertificateService`
  - **Description / Acceptance Criteria:** Sign sends hardcoded attestations array. No PDF/download or signed certificate viewer.

- [x] **AURA-134 — Dashboard: Loading/error states and KPI drill-down**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-forms-compliance`
  - **Related API / Service:** `GET /api/v1/hr-forms-compliance/dashboard`
  - **Description / Acceptance Criteria:** No loading spinner or error UI. KPI tiles not linked to filtered views.

## HR Helpdesk Module

- [ ] **AURA-135 — Architecture: Consolidate duplicate helpdesk modules**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk vs /dashboard/helpdesk`
  - **Related API / Service:** `TicketManagementService; useHelpdesk; dashboard/helpdesk/services.ts`
  - **Description / Acceptance Criteria:** Parallel wired helpdesk exists at /dashboard/helpdesk with TicketManagementService and useHelpdesk; hr-helpdesk is separate mock UI with no services.ts.

- [ ] **AURA-136 — Tickets: Wire ticket list, create, and kanban drag-drop**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/tickets`
  - **Related API / Service:** `GET/POST /api/helpdesk/tickets; TicketManagementService`
  - **Description / Acceptance Criteria:** Page uses hardcoded TICKETS mock array. Create Ticket unwired. handleDragEnd is no-op; status changes not saved.

- [ ] **AURA-137 — Tickets: Wire assign ticket**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/tickets`
  - **Related API / Service:** `TicketManagementService.updateTicket`
  - **Description / Acceptance Criteria:** Assign buttons on cards unwired. POST /helpdesk/tickets/{id}/assign route missing.

- [ ] **AURA-138 — Knowledge Base: Wire article API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/knowledge-base`
  - **Related API / Service:** `KnowledgeBaseService → /helpdesk/knowledge-base (missing)`
  - **Description / Acceptance Criteria:** Uses MOCK CATEGORIES/ARTICLES arrays. Wired sibling at /dashboard/helpdesk/knowledge-base calls KnowledgeBaseService but API route missing.

- [ ] **AURA-139 — Request Portal: Wire requests list and new request**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/request-portal`
  - **Related API / Service:** `Missing service-request API`
  - **Description / Acceptance Criteria:** Table populated from hardcoded inline array of 3 requests. New Request button unwired.

- [ ] **AURA-140 — Service Catalog: Wire catalog API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/service-catalog`
  - **Related API / Service:** `Missing service-catalog API`
  - **Description / Acceptance Criteria:** Category cards and search hardcoded/static. Browse Services links go nowhere.

- [ ] **AURA-141 — Case Management: Wire cases API and actions**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/case-management`
  - **Related API / Service:** `Missing case-management API`
  - **Description / Acceptance Criteria:** Hardcoded 3-case list and static detail thread. Close Case, attach, and send note unwired.

- [ ] **AURA-142 — Chat Support: Wire realtime chat**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/chat-support`
  - **Related API / Service:** `Missing chat API`
  - **Description / Acceptance Criteria:** Static mock conversation; Send button and input unwired; no websocket/chat backend.

- [ ] **AURA-143 — Omnichannel: Wire channel integrations**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/omnichannel`
  - **Related API / Service:** `GET /api/helpdesk/settings; missing omnichannel API`
  - **Description / Acceptance Criteria:** Hardcoded Email/Slack/Teams/Phone cards. Connect Now and Manage Settings unwired.

- [ ] **AURA-144 — Performance Metrics: Wire analytics**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/performance-metrics`
  - **Related API / Service:** `GET /api/helpdesk/analytics; AnalyticsService`
  - **Description / Acceptance Criteria:** KPI cards and chart area are hardcoded placeholders.

- [ ] **AURA-145 — Service Automation: Wire workflow engine**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/service-automation`
  - **Related API / Service:** `workflow-engine module (not linked)`
  - **Description / Acceptance Criteria:** Hardcoded workflow cards. Edit Workflow, View Logs, Create New Automation unwired.

- [ ] **AURA-146 — Continuous Improvement: Wire feedback API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/continuous-improvement`
  - **Related API / Service:** `Missing feedback/improvement API`
  - **Description / Acceptance Criteria:** Improvement opportunities and survey quote hardcoded. Create Task unwired.

- [ ] **AURA-147 — Navigation: Add orphan routes to hub grid**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk`
  - **Related API / Service:** `ModuleGrid`
  - **Description / Acceptance Criteria:** ModuleGrid features omit tickets and knowledge-base even though both pages exist.

- [ ] **AURA-148 — Helpdesk Services: Implement missing API routes and fix SLA path**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `dashboard/helpdesk/services.ts`
  - **Related API / Service:** `Existing: /api/helpdesk/tickets, /agents, /sla, /analytics, /settings`
  - **Description / Acceptance Criteria:** Missing routes: /helpdesk/knowledge-base, /canned-responses, /escalation-matrices, /alerts, /sla-policies, ticket PUT/assign/comments. SLATrackingService calls /sla-policies but API is /api/helpdesk/sla.

## Finance Module

- [ ] **AURA-149 — Vendors: Wire vendor list and actions**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/finance/vendors`
  - **Related API / Service:** `VendorService; GET/POST /api/finance/vendors`
  - **Description / Acceptance Criteria:** Page uses MOCK_VENDORS inline; ignores VendorService and /api/finance/vendors. Add Vendor and Filter buttons unwired.

- [ ] **AURA-150 — Vendors: Wire approve/reject/edit actions**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/finance/vendors/vendor-onboarding`
  - **Related API / Service:** `VendorService.approveVendor, rejectVendor`
  - **Description / Acceptance Criteria:** Icon buttons have no onClick; data from empty API stub.

- [ ] **AURA-151 — Budget: Wire Approve/Reject buttons**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/finance/budget/approvals, /approval-workflow`
  - **Related API / Service:** `BudgetService.approveBudget, rejectBudget`
  - **Description / Acceptance Criteria:** Approve/Reject buttons decorative only on both pages.

- [ ] **AURA-152 — Budget: Wire Preview/Use and remove mock fallback**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/finance/budget/budget-templates`
  - **Related API / Service:** `BudgetTemplateService; GET/POST /api/finance/templates`
  - **Description / Acceptance Criteria:** Buttons unwired; shows hardcoded templates when API empty.

- [ ] **AURA-153 — Budget: Wire Run/Save/New Scenario and remove mock fallback**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/finance/budget/scenario-planning`
  - **Related API / Service:** `BudgetScenarioService; GET/POST /api/finance/scenarios`
  - **Description / Acceptance Criteria:** Play/Save/Trash buttons unwired; mock scenarios when API empty.

- [ ] **AURA-154 — Assets: Persist asset create to API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/finance/assets/capital-assets, /operational-assets`
  - **Related API / Service:** `FinancialAssetService.createAsset; POST /api/finance/assets`
  - **Description / Acceptance Criteria:** handleSubmit updates local state only, never calls API.

- [ ] **AURA-155 — Assets: Fix data model**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/finance/assets/cost-centers`
  - **Related API / Service:** `Needs dedicated cost-center API`
  - **Description / Acceptance Criteria:** Uses FinancialAssetService.getAssets() mapped to cost-center shape incorrectly.

- [ ] **AURA-156 — Assets: Fix route target**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/finance/assets`
  - **Related API / Service:** `N/A — routing fix`
  - **Description / Acceptance Criteria:** Re-exports admin assets page, not finance asset hub.

- [ ] **AURA-157 — Petty Cash: Wire policy CRUD**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/finance/petty-cash/policy-controls`
  - **Related API / Service:** `PettyCashService; new policy API`
  - **Description / Acceptance Criteria:** Approval/category rules hardcoded; only funds fetched from empty API.

- [ ] **AURA-158 — API: Implement DB-backed finance routes**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `Module-wide`
  - **Related API / Service:** `Prisma + tenant scoping for /api/finance/*`
  - **Description / Acceptance Criteria:** All /api/finance/\* GET routes return empty arrays; sub-routes missing despite services calling /budgets/{id}, /transactions, etc.

- [ ] **AURA-159 — Architecture: Adopt useFinance or remove dead code**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `hooks/useFinance.ts`
  - **Related API / Service:** `hooks/useFinance.ts`
  - **Description / Acceptance Criteria:** Hook duplicates page-level fetch logic but is unused by any page.

- [ ] **AURA-160 — Cross-cutting: Wire Export/Download buttons**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `Multiple finance pages`
  - **Related API / Service:** `Export/reporting APIs (missing)`
  - **Description / Acceptance Criteria:** Present on disbursements, reconciliation, depreciation, cost-centers, contracts, compliance — no handlers.

## Job Library Module

- [ ] **AURA-161 — Catalog: Wire Add Role, search/filter, and row actions**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/job-library/job-catalog`
  - **Related API / Service:** `GET/POST /api/job-library/catalog`
  - **Description / Acceptance Criteria:** POST exists at /api/job-library/catalog but Add Role button has no handler. Search, Filter, row actions unwired.

- [ ] **AURA-162 — Families: Create API and wire UI**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/job-library/job-families`
  - **Related API / Service:** `/api/job-library/families (missing)`
  - **Description / Acceptance Criteria:** Entire page is inline mock cards. New Family button unwired.

- [ ] **AURA-163 — Evaluation: Create API and wire Start Grading**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/job-library/job-evaluation`
  - **Related API / Service:** `/api/job-library/evaluations (missing)`
  - **Description / Acceptance Criteria:** Pending/completed evaluations hardcoded; chart placeholder. Start Grading unwired.

- [ ] **AURA-164 — Templates: Create API and wire Preview/Edit/Use Template**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/job-library/job-posting-templates`
  - **Related API / Service:** `/api/job-library/posting-templates (missing)`
  - **Description / Acceptance Criteria:** Templates hardcoded. All action buttons unwired.

- [ ] **AURA-165 — Compensation: Create API and wire Adjust Strategy**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/job-library/market-pricing`
  - **Related API / Service:** `/api/job-library/market-pricing (missing) or compensation integration`
  - **Description / Acceptance Criteria:** Salary benchmarks hardcoded. Adjust Strategy and filter buttons unwired.

- [ ] **AURA-166 — Architecture: Add service layer**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `Module-wide`
  - **Related API / Service:** `New dashboard/job-library/services.ts`
  - **Description / Acceptance Criteria:** No services.ts or hooks; only raw fetch on catalog page.

## Learning Module

- [x] **AURA-167 — API: Add missing legacy routes and align v1 paths**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `Module-wide`
  - **Related API / Service:** `/api/learning/* (missing); /api/v1/learning/* (exists, unwired)`
  - **Description / Acceptance Criteria:** Services call endpoints with no route files: training-sessions, external-training, mentoring-programs, training-budgets, knowledge-articles, training-feedback, assessment-attempts. Rich v1 routes exist but services.ts uses /learning/\* only.

- [x] **AURA-168 — Catalog: Remove mock fallback**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/learning/catalog`
  - **Related API / Service:** `CourseService → /api/learning/courses`
  - **Description / Acceptance Criteria:** Falls back to 8 hardcoded courses on empty/error.

- [x] **AURA-169 — Catalog: Wire Enroll/Filter/Search**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/learning/course-catalog, /library`
  - **Related API / Service:** `EnrollmentService → /api/learning/enrollments`
  - **Description / Acceptance Criteria:** Buttons and inputs mostly unwired.

- [x] **AURA-170 — Paths: Use rich path components**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/learning/learning-paths`
  - **Related API / Service:** `src/services/learningService.ts; components/learning/LearningPaths`
  - **Description / Acceptance Criteria:** Inline list UI; LearningPaths/PathBuilder live under (modules) not dashboard.

- [x] **AURA-171 — AI: Wire real recommendations API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/learning/ai-recommendations`
  - **Related API / Service:** `/api/v1/learning/paths/recommend; /api/ai/learning`
  - **Description / Acceptance Criteria:** Shows all courses as recommendations; no AI/recommend API.

- [x] **AURA-172 — Mentoring: Fix API path to v1 mentorship**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/learning/mentoring`
  - **Related API / Service:** `MentoringService → /api/v1/learning/mentorship`
  - **Description / Acceptance Criteria:** Calls missing /learning/mentoring-programs; v1 route is /api/v1/learning/mentorship.

- [x] **AURA-173 — Calendar: Add training session API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/learning/calendar, /training-calendar`
  - **Related API / Service:** `/api/learning/training-sessions (missing)`
  - **Description / Acceptance Criteria:** TrainingSessionService calls missing route.

- [x] **AURA-174 — Attendance: Wire Mark All Present and session actions**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/learning/attendance-tracking`
  - **Related API / Service:** `TrainingSessionService.markAttendance`
  - **Description / Acceptance Criteria:** Buttons unwired.

- [x] **AURA-175 — External Training: Add API and wire Submit Certificate**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/learning/external-training`
  - **Related API / Service:** `ExternalTrainingService (missing API)`
  - **Description / Acceptance Criteria:** Missing route; Submit Certificate button unwired.

- [x] **AURA-176 — Budget: Add training budget API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/learning/training-budget`
  - **Related API / Service:** `TrainingBudgetService (missing API)`
  - **Description / Acceptance Criteria:** Missing route.

- [x] **AURA-177 — Knowledge: Add knowledge API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/learning/knowledge-repository, /learning-community`
  - **Related API / Service:** `KnowledgeBaseService (missing API)`
  - **Description / Acceptance Criteria:** Missing route for both pages.

- [x] **AURA-178 — Feedback: Add training feedback API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/learning/training-feedback`
  - **Related API / Service:** `TrainingFeedbackService (missing API)`
  - **Description / Acceptance Criteria:** Missing route.

- [x] **AURA-179 — Quiz: Use QuizBuilder component**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/learning/quiz-builder`
  - **Related API / Service:** `components/learning/QuizBuilder`
  - **Description / Acceptance Criteria:** Page is thin list; full builder is in (modules)/quiz-assessment.

- [x] **AURA-180 — Compliance: Consolidate compliance stacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/learning/compliance vs /compliance-training`
  - **Related API / Service:** `/api/v1/learning/compliance-training/*`
  - **Description / Acceptance Criteria:** Two compliance UIs: one uses compliance-training components + v1 API; other filters courses via CourseService.

- [x] **AURA-181 — Enrollment: Wire Approve/Reject**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/learning/enrollment`
  - **Related API / Service:** `EnrollmentService`
  - **Description / Acceptance Criteria:** Buttons unwired.

- [x] **AURA-182 — Certifications: Wire Download/Share**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/learning/certifications`
  - **Related API / Service:** `CertificationService → /api/learning/certifications`
  - **Description / Acceptance Criteria:** Buttons unwired.

- [ ] **AURA-183 — Components: Mount orphan components or delete**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/learning/*.tsx`
  - **Related API / Service:** `Varies — components/learning/*`
  - **Description / Acceptance Criteria:** GamificationHub, ContentMarketplace, LearningDashboard, LearningAnalyticsDashboard, SCORMPlayer, etc. — 10+ components unused by dashboard/learning.

- [x] **AURA-184 — Duplication: Merge duplicate routes**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `catalog vs course-catalog; calendar vs training-calendar`
  - **Related API / Service:** `N/A — routing consolidation`
  - **Description / Acceptance Criteria:** Two pages per feature with overlapping purpose.

- [ ] **AURA-185 — Architecture: Adopt or remove dead hook**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `hooks/useLearning.ts`
  - **Related API / Service:** `hooks/useLearning.ts; data.ts`
  - **Description / Acceptance Criteria:** Hook with sample seeding never used by any dashboard page.

## Construction Module

- [x] **AURA-186 — Platform: Implement /api/construction/\* API surface**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `Module-wide`
  - **Related API / Service:** `dashboard/construction/services.ts; hooks/useConstruction.ts`
  - **Description / Acceptance Criteria:** All 8 pages use inline hardcoded data. services.ts defines 20+ endpoints; all return 501. useConstruction hook never imported.

- [x] **AURA-187 — Project Management: Connect data layer and wire New Project**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/construction/project-management`
  - **Related API / Service:** `ProjectManagementService → /api/construction/projects (missing)`
  - **Description / Acceptance Criteria:** Inline mock projects; no API or hook. New Project button unwired.

- [x] **AURA-188 — Site Safety: Connect data layer and wire Report Incident**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/construction/site-safety`
  - **Related API / Service:** `SiteSafetyService → /api/construction/safety/* (missing)`
  - **Description / Acceptance Criteria:** Hardcoded audits/incident-free counter. Report Incident unwired.

- [x] **AURA-189 — Equipment Leasing: Connect data layer and wire CTAs**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/construction/equipment-leasing`
  - **Related API / Service:** `EquipmentLeasingService → /api/construction/equipment/leases (missing)`
  - **Description / Acceptance Criteria:** Hardcoded equipment cards. Rent Equipment and Report Issue unwired.

- [x] **AURA-190 — Subcontractor Portal: Connect data layer and wire vendor actions**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/construction/subcontractor-portal`
  - **Related API / Service:** `SubcontractorPortalService → /api/construction/subcontractors (missing)`
  - **Description / Acceptance Criteria:** Hardcoded vendor table. Add Vendor and contract/invoice icons unwired.

- [x] **AURA-191 — Site Safety (HSE): Orphan route — link from hub or remove**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/construction/safety`
  - **Related API / Service:** `SiteSafetyService (missing APIs)`
  - **Description / Acceptance Criteria:** Duplicate safety UX not in hub ModuleGrid. Report Hazard, View Signatures, Start New Inspection unwired.

- [x] **AURA-192 — Staffing: Create staffing API and wire roster actions**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/construction/staffing`
  - **Related API / Service:** `/api/construction/staffing (missing — not in services.ts)`
  - **Description / Acceptance Criteria:** Orphan route; crew allocation UI with no backend. Manage Roster, transport, View Available Staff unwired.

- [x] **AURA-193 — Unions: Wire union/grievance API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/construction/unions`
  - **Related API / Service:** `unionService (mock); /api/v1/er-compliance/grievances`
  - **Description / Acceptance Criteria:** Orphan route; grievance/CBA UI hardcoded. View Details unwired. Could align with /api/v1/er-compliance/grievances.

- [x] **AURA-194 — Navigation: Link orphan pages in hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/construction`
  - **Related API / Service:** `ModuleGrid`
  - **Description / Acceptance Criteria:** Hub lists 4 features; safety, staffing, unions routes unreachable from grid.

## DEI Module

- [x] **AURA-195 — Platform: Implement /api/dei/\* API surface**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `Module-wide`
  - **Related API / Service:** `dashboard/dei/services.ts (30+ endpoints missing)`
  - **Description / Acceptance Criteria:** All 8 sub-pages call /api/dei/\* → 501 via catch-all. Pages render hardcoded data; fetched state unused. useDEI hook never imported.

- [x] **AURA-196 — Diversity Metrics: Fix API and render live data**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/dei/diversity-metrics`
  - **Related API / Service:** `DiversityMetricsService; alt: GET /api/v1/analytics/diversity`
  - **Description / Acceptance Criteria:** Fetches /api/dei/metrics (501); renders hardcoded charts; metrics state unused. Filter and Export Report unwired.

- [x] **AURA-197 — Inclusion Survey: Fix API and wire Launch New Survey**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/dei/inclusion-survey`
  - **Related API / Service:** `InclusionSurveyService → /api/dei/surveys (missing)`
  - **Description / Acceptance Criteria:** Fetches surveys (501); displays hardcoded list. Launch New Survey unwired.

- [x] **AURA-198 — Pay Equity: Fix API schema and wire live compensation data**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/dei/pay-equity-analysis`
  - **Related API / Service:** `PayEquityService; alt: GET /api/v1/analytics/compensation`
  - **Description / Acceptance Criteria:** API type ≠ chart fields; summary cards hardcoded.

- [x] **AURA-199 — Bias Training: Fix API schema mapping**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/dei/bias-training`
  - **Related API / Service:** `BiasTrainingService → /api/dei/training (missing)`
  - **Description / Acceptance Criteria:** UI expects title/thumb/status; API returns trainingName/modules.

- [x] **AURA-200 — ERG Management: Fix API and wire ERG actions**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/dei/erg-management`
  - **Related API / Service:** `ERGService → /api/dei/ergs (missing)`
  - **Description / Acceptance Criteria:** Fetches ERGs (501); renders hardcoded ergs array. Propose New ERG, Join Group, message unwired.

- [x] **AURA-201 — Mentorship: Wire to v1 mentorship API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/dei/mentorship-program`
  - **Related API / Service:** `MentorshipService; alt: GET /api/v1/learning/mentorship (real)`
  - **Description / Acceptance Criteria:** Fetches programs (501); shows hardcoded mentors. Request, Message, Reschedule unwired.

- [x] **AURA-202 — Accessibility: Fix API and wire review actions**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/dei/accessibility`
  - **Related API / Service:** `AccessibilityService → /api/dei/accessibility (missing)`
  - **Description / Acceptance Criteria:** Fetches requests (501); hardcoded pending list. Review and View Audit Report unwired.

- [x] **AURA-203 — DEI Goals: Fix schema and wire goal CRUD**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/dei/dei-goals`
  - **Related API / Service:** `DEIGoalsService → /api/dei/goals (missing)`
  - **Description / Acceptance Criteria:** Field mismatch (goalName vs title). Add New Goal, Create Annual Goal, View Key Results unwired.

- [x] **AURA-204 — Analytics (parallel): Consolidate with DEI module**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/analytics/dei-dashboard`
  - **Related API / Service:** `GET /api/v1/analytics/diversity`
  - **Description / Acceptance Criteria:** Only DEI page with live Prisma API; disconnected from /dashboard/dei/\* module.

- [x] **AURA-205 — Recruitment (parallel): Mount or remove orphan DEI dashboard**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/recruitment/DEIDashboard.tsx`
  - **Related API / Service:** `deiHiringService.ts (mock)`
  - **Description / Acceptance Criteria:** DEIDashboard + deiHiringService fully built but never imported anywhere.

- [x] **AURA-206 — Hub: Mark as preview until APIs ship**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/dei`
  - **Related API / Service:** `dashboard/layout.tsx PREVIEW_MODULES`
  - **Description / Acceptance Criteria:** Module not in PREVIEW_MODULES despite demo UI with 501 API calls.

## Integration Hub Module

- [x] **AURA-207 — Dashboard: Wire stats cards and integrations grid**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/integration-hub`
  - **Related API / Service:** `GET /api/integrations?type=connections; POST /api/integrations (connect/disconnect/sync)`
  - **Description / Acceptance Criteria:** KPI cards (Connected: 12, Available: 45, etc.) and integration cards (Slack, Teams, DocuSign) are hardcoded mock constants. Sync/Connect/Disconnect buttons have no handlers.

- [x] **AURA-208 — Dashboard: Wire quick actions and OAuth callback handling**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/integration-hub`
  - **Related API / Service:** `/api/v1/webhooks; /api/v1/integrations/slack/oauth/callback; /api/v1/integrations/teams/oauth/callback`
  - **Description / Acceptance Criteria:** Browse Marketplace, Create Webhook, View Logs buttons use href: #. Slack/Teams OAuth redirects land with ?connected=/ ?error= query params but page never reads them.

- [x] **AURA-209 — Webhooks: Wire webhook list, Add Webhook, and row actions**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/integration-hub/webhook-manager`
  - **Related API / Service:** `GET/POST /api/v1/webhooks; PUT/DELETE /api/v1/webhooks/[id]; POST /api/v1/webhooks/[id]/test`
  - **Description / Acceptance Criteria:** Table shows 3 hardcoded webhooks; no fetch. Add Webhook button has no onClick. Edit/Delete buttons inert.

- [x] **AURA-210 — App Directory: Wire app catalog and Install/Configure actions**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/integration-hub/app-directory`
  - **Related API / Service:** `GET /api/integrations?type=catalog; POST /api/integrations/connectors`
  - **Description / Acceptance Criteria:** Apps rendered from inline array; category filters and search non-functional. Per-app Install/Configure buttons have no API calls.

- [x] **AURA-211 — API Marketplace: Wire API catalog and key management**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/integration-hub/api-marketplace`
  - **Related API / Service:** `GET /api/integrations?type=marketplace; GET/POST /api/v1/admin/api-keys`
  - **Description / Acceptance Criteria:** Core HR/Payroll/Recruitment API cards are mock. Connect/Manage/Docs unwired. Generate New Key is static mock.

- [x] **AURA-212 — Architecture: Consolidate with admin integrations or wire hub to existing APIs**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `N/A (parallel wired path)`
  - **Related API / Service:** `integrationService.ts vs /api/integrations; components/integrations/* (orphan mock components)`
  - **Description / Acceptance Criteria:** Wired reference exists at /dashboard/admin/integrations/_ using /api/integrations and /api/v1/webhooks. integrationService.ts targets non-existent /api/v1/integrations/_ CRUD and is never imported.

## Global Mobility Module

- [x] **AURA-213 — Visa: Wire visa table and expiry alerts**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/mobility/visa-immigration`
  - **Related API / Service:** `VisaImmigrationService → /api/mobility/visa-applications (missing); alt: GET /api/v1/visa-permits?expiringWithinDays=30`
  - **Description / Acceptance Criteria:** Employee visa rows are inline mock array; search unwired. 3 Work Permits expiring banner is static text. Details button has no handler.

- [x] **AURA-214 — Relocation: Wire tier policies and active relocations**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/mobility/relocation-packages`
  - **Related API / Service:** `RelocationPackageService → /api/mobility/relocation-packages (missing)`
  - **Description / Acceptance Criteria:** Tier 1/2/3 cards are static marketing copy. Active move cards (Sarah Connor, etc.) are inline mock. View Policy Details unwired.

- [x] **AURA-215 — Tax: Wire tax calculator and compliance deadlines**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/mobility/expat-tax-manager`
  - **Related API / Service:** `ExpatTaxService.calculateTaxLiability; /api/mobility/expat-tax-profiles (missing)`
  - **Description / Acceptance Criteria:** Home/host selects and salary input don't trigger calculation; results static. Filing status list is hardcoded mock.

- [x] **AURA-216 — Orphan Routes: Consolidate or wire duplicate pages**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/mobility/immigration, /relocation, /tax`
  - **Related API / Service:** `/api/v1/immigration-compliance/*; RelocationPackageService; ExpatTaxService`
  - **Description / Acceptance Criteria:** Three alternate pages not linked from ModuleGrid; all mock including Initiate Transfer. Duplicate visa/relocation/tax UX.

- [ ] **AURA-217 — Platform: Create /api/mobility/\* routes and wire useMobility hook**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `Module-wide`
  - **Related API / Service:** `mobility/services.ts; mobility/hooks/useMobility.ts; mobility/data.ts (~1500 lines seed)`
  - **Description / Acceptance Criteria:** All service endpoints under /api/mobility/\* have zero matching route handlers. useMobility() auto-fetches on mount but never imported by any page.

## Alumni Network Module

- [x] **AURA-218 — Directory: Wire alumni cards, search, and social actions**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/alumni-network/alumni-directory`
  - **Related API / Service:** `AlumniDirectoryService → /api/alumni-network/profiles (missing); alt: GET /api/offboarding/alumni`
  - **Description / Acceptance Criteria:** Profile cards from inline mock array. Search box has no handler. LinkedIn/Mail icon buttons unwired.

- [x] **AURA-219 — Events: Wire event list and RSVP**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/alumni-network/events-reunions`
  - **Related API / Service:** `EventsService → /api/alumni-network/events, /reunions (missing)`
  - **Description / Acceptance Criteria:** Event cards are inline mock; no fetch. RSVP buttons have no registration flow. Reunions sub-domain not shown.

- [x] **AURA-220 — Jobs: Wire job listings and Post a Job**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/alumni-network/alumni-jobs`
  - **Related API / Service:** `JobsService → /api/alumni-network/jobs (missing)`
  - **Description / Acceptance Criteria:** Job cards are inline mock. Post a Job button has no form/modal. Job row click has cursor-pointer but no apply/save flow.

- [x] **AURA-221 — Platform: Wire hook and bridge offboarding alumni API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `Module-wide`
  - **Related API / Service:** `alumni-network/hooks/useAlumniNetwork.ts; alumni-network/services.ts; GET /api/offboarding/alumni`
  - **Description / Acceptance Criteria:** useAlumniNetwork() + full service layer exist but zero page imports. All /api/alumni-network/\* routes missing. Completed exits available via /api/offboarding/alumni (offboarding only).

- [x] **AURA-222 — Duplication: Consolidate duplicate mock alumni page**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/community/alumni`
  - **Related API / Service:** `N/A — routing consolidation`
  - **Description / Acceptance Criteria:** Separate mock directory at /dashboard/community/alumni also unwired.

## Payroll Components Module

- [x] **AURA-223 — Payroll Run: Mount component and wire run lifecycle to v1 API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/payroll/PayrollRunDashboard.tsx (orphan)`
  - **Related API / Service:** `/api/v1/payroll/runs; /calculate; /finalize; /approve; PayrollRunService`
  - **Description / Acceptance Criteria:** PayrollRunDashboard has zero page imports; full mock pipeline via setTimeout. payroll-processing page only calls createPayrollRun; no calculate/finalize/approve.

- [x] **AURA-224 — GL Posting: Mount GL UI and wire Post/Reverse/Download**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/payroll/GLPostingDashboard.tsx (orphan)`
  - **Related API / Service:** `/api/v1/payroll/gl/generate; /gl/journals; /gl/journals/[id]/post; /export`
  - **Description / Acceptance Criteria:** GLPostingDashboard orphan; Post/Reverse are local mock. Download journal has empty onClick.

- [x] **AURA-225 — Bank File: Merge with bank-file-generation page**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/payroll/BankFileManager.tsx (orphan)`
  - **Related API / Service:** `BankFileService → /api/payroll/bank-file/generate`
  - **Description / Acceptance Criteria:** BankFileManager orphan with richer multi-format UI unused. bank-file-generation page: Configure Formats unwired; download generates client-side sample CSV.

- [x] **AURA-226 — Payslips: Mount or merge with payslip-generation page**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/payroll/PayslipGenerator.tsx (orphan)`
  - **Related API / Service:** `PayslipService; /api/v1/payroll/pay-stubs/[id]/download`
  - **Description / Acceptance Criteria:** PayslipGenerator orphan with mock employees. payslip-generation page: Publish All uses alert() stub; Bulk Email/Download PDF unwired.

- [x] **AURA-227 — Variance Report: Mount on payroll-reports page**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/payroll/PayrollVarianceReport.tsx (orphan)`
  - **Related API / Service:** `/api/payroll/reports; /api/payroll/reports/stats`
  - **Description / Acceptance Criteria:** PayrollVarianceReport orphan with full MoM mock report. payroll-reports: PDF/Excel buttons have no handlers.

- [x] **AURA-228 — Salary Structure: Mount in compensation salary-structure page**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/payroll/SalaryStructureBuilder.tsx (orphan)`
  - **Related API / Service:** `/api/v1/payroll/salary-structures; /simulate; SalaryStructureService`
  - **Description / Acceptance Criteria:** SalaryStructureBuilder orphan; jurisdiction-aware builder unused. compensation/salary-structure page read-only; Add/Edit unwired.

- [x] **AURA-229 — Salary Revision: Mount in compensation increment-planning**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/payroll/SalaryRevision.tsx (orphan)`
  - **Related API / Service:** `/api/v1/payroll/retroactive; IncrementProposalService`
  - **Description / Acceptance Criteria:** SalaryRevision orphan; Submit for Approval shows success UI only with no API call.

## Performance Components Module

- [ ] **AURA-230 — Continuous Feedback: Fix routing and schema contract**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/continuous-feedback vs /dashboard/performance/continuous-feedback`
  - **Related API / Service:** `/api/performance/feedback; FeedbackService`
  - **Description / Acceptance Criteria:** (modules)/performance/continuous-feedback re-exports 360 config page (localStorage) not ContinuousFeedback component. Service payload ≠ API schema (category/toId vs employeeId/providedBy).

- [ ] **AURA-231 — Feedback Form: Wire employee picker and persist reactions/comments**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/continuous-feedback`
  - **Related API / Service:** `Employee directory API; missing /feedback/[id]/reactions, /comments routes`
  - **Description / Acceptance Criteria:** FeedbackForm uses hardcoded MOCK_TEAM. toggleReaction/addComment never call API.

- [ ] **AURA-232 — Calibration: Wire PerformanceCalibration to calibration API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance-calibration vs /dashboard/performance/calibration`
  - **Related API / Service:** `/api/v1/performance/calibration; /api/performance/calibrations; CalibrationService`
  - **Description / Acceptance Criteria:** PerformanceCalibration 100% mock; Save Calibration button has no onClick. Wired calibration page uses reviews + finalize; no 9-box DnD from component.

- [ ] **AURA-233 — 9-Box: Persist calibration to backend**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/nine-box`
  - **Related API / Service:** `/api/v1/performance/calibration`
  - **Description / Acceptance Criteria:** Save writes localStorage only.

- [ ] **AURA-234 — Goal Alignment: Wire GoalAlignmentTree to goals API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/goal-alignment vs /dashboard/performance/goal-alignment`
  - **Related API / Service:** `GoalService → /api/performance/goals; /api/v1/performance/goals/alignment`
  - **Description / Acceptance Criteria:** goal-alignment passes MOCK_ALIGNMENT_GOALS to GoalAlignmentTree. performance/goal-alignment uses simpler inline tree instead of ReactFlow component.

- [ ] **AURA-235 — Check-In Templates: Wire templates CRUD and consolidate routes**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/check-in-templates vs /dashboard/performance/check-in-templates`
  - **Related API / Service:** `Check-in template API (missing); /api/performance/cycles (misused)`
  - **Description / Acceptance Criteria:** check-in-templates uses MOCK_CHECKIN_TEMPLATES; onUseTemplate empty. performance/check-in-templates: Copy/Edit/Use unwired; create is prompt() + localStorage.

- [ ] **AURA-236 — 1:1 Notes: Consolidate OneOnOneNotes with meetings page**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/check-in-templates (notes tab) vs /dashboard/performance/1-on-1-meetings`
  - **Related API / Service:** `/api/performance/one-on-one; /api/v1/performance/one-on-ones`
  - **Description / Acceptance Criteria:** OneOnOneNotes with MOCK_SESSIONS; all notes/actions local. Separate 1100-line 1-on-1-meetings page uses OneOnOneMeetingService but component unused.

- [ ] **AURA-237 — Praise Wall: Wire PraiseWall to recognition API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/check-in-templates (praise tab) vs /dashboard/performance/recognition-wall`
  - **Related API / Service:** `/api/performance/feedback (type=RECOGNITION)`
  - **Description / Acceptance Criteria:** PraiseWall mock posts; reactions/comments local. recognition-wall derives from review strengths; Give Recognition likely unwired.

## Recruitment Components Module

- [ ] **AURA-238 — Dashboard: Mount or delete recruitment KPI dashboard**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/recruitment/RecruitmentDashboard.tsx (orphan)`
  - **Related API / Service:** `RecruitmentService → /v1/recruitment/jobs, /candidates, /stats`
  - **Description / Acceptance Criteria:** Full KPI dashboard with service-backed jobs/candidates/stats never imported; duplicate vs scattered recruitment pages.

- [ ] **AURA-239 — Pipeline: Wire to application-tracking page**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/recruitment/CandidatePipeline.tsx (orphan)`
  - **Related API / Service:** `/v1/recruitment/candidates; /candidates/[id]/stage`
  - **Description / Acceptance Criteria:** Kanban with drag-drop stage moves via moveCandidateStage; application-tracking reimplements pipeline inline.

- [ ] **AURA-240 — Job Distribution: Wire or remove job distribution UI**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/recruitment/JobDistributionDashboard.tsx (orphan)`
  - **Related API / Service:** `JobDistributionService (mock); no distribution API`
  - **Description / Acceptance Criteria:** Job board publishing, source effectiveness, referral programs — entire JobDistributionService is mock.

- [ ] **AURA-241 — Interviews: Fix service contract and mount component**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/recruitment/InterviewManagement.tsx (orphan)`
  - **Related API / Service:** `/v1/recruitment/interviews; /interviews/[id]/feedback`
  - **Description / Acceptance Criteria:** Calls non-existent RecruitmentService.getInterviews/getAnalytics; would fail at runtime. Superseded by interview-management page.

- [ ] **AURA-242 — Talent CRM: Wire to talent pool page**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/recruitment/TalentCRMDashboard.tsx (orphan)`
  - **Related API / Service:** `/v1/recruitment/candidates; /stats`
  - **Description / Acceptance Criteria:** CRM tabs call missing getAnalytics(); campaigns are mock. talent-pool page uses separate inline UI.

- [ ] **AURA-243 — Internal Mobility: Replace career/internal-mobility inline UI**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/recruitment/InternalMobilityPortal.tsx (orphan)`
  - **Related API / Service:** `InternalMobilityService (mock)`
  - **Description / Acceptance Criteria:** Career page uses hardcoded job cards; rich portal component orphaned; InternalMobilityService is mock.

- [ ] **AURA-244 — Assessments: Wire to assessment-tests page**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/recruitment/AssessmentCenter.tsx (orphan)`
  - **Related API / Service:** `AssessmentService (mock); needs assessment API`
  - **Description / Acceptance Criteria:** Assessment page explicitly disabled; AssessmentCenter + AssessmentService mock-only.

- [ ] **AURA-245 — DEI Hiring: Consolidate with analytics/dei-dashboard**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/recruitment/DEIDashboard.tsx (orphan)`
  - **Related API / Service:** `Page: /api/v1/analytics/diversity; Component: DEIHiringService (mock)`
  - **Description / Acceptance Criteria:** Two DEI implementations: live /api/v1/analytics/diversity on page vs mock DEIHiringService in component.

- [ ] **AURA-246 — Interview Scheduler: Wire schedule confirmation to API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/(modules)/interview-scheduler`
  - **Related API / Service:** `/api/v1/recruitment/interviews/schedule`
  - **Description / Acceptance Criteria:** Confirm/send only toggles UI state; MOCK_INTERVIEWERS. No POST to schedule endpoint.

- [ ] **AURA-247 — Background Check: Wire to live background-check API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/(modules)/background-check`
  - **Related API / Service:** `/api/v1/recruitment/background-check`
  - **Description / Acceptance Criteria:** Portal uses default mocks; no onInitiateCheck. Live flow exists at /dashboard/recruitment/background-verification.

- [ ] **AURA-248 — E-Signature: Wire envelope actions to offers API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/(modules)/e-signature`
  - **Related API / Service:** `/api/v1/recruitment/offers/e-sign`
  - **Description / Acceptance Criteria:** All envelopes mock; Send/Void/Resend/Download callbacks not provided. Live offers at offer-management via JobOfferService.

- [ ] **AURA-249 — Resume Parsing: Call parse API instead of mock**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/(modules)/ai-resume-parser`
  - **Related API / Service:** `POST /api/v1/recruitment/resume/parse`
  - **Description / Acceptance Criteria:** Upload simulates with MOCK_RESUME. API exists at /api/v1/recruitment/resume/parse.

- [ ] **AURA-250 — AI Matching: Wire match API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/(modules)/ai-candidate-matching`
  - **Related API / Service:** `/api/v1/recruitment/candidates/match`
  - **Description / Acceptance Criteria:** Page injects mock candidates/job. No rank/shortlist API calls.

- [ ] **AURA-251 — Referrals: Wire referral submit and consolidate with live page**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/(modules)/employee-referral`
  - **Related API / Service:** `/api/v1/recruitment/referrals`
  - **Description / Acceptance Criteria:** handleSubmitReferral is empty; all tabs use mocks. Live referrals page at /dashboard/recruitment/referrals.

- [ ] **AURA-252 — Communication: Wire messaging API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/(modules)/candidate-communication`
  - **Related API / Service:** `Missing candidate messaging API`
  - **Description / Acceptance Criteria:** Send message updates local threads only. No messaging route found.

- [ ] **AURA-253 — Video Interview: Wire interview session API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/(modules)/video-interview`
  - **Related API / Service:** `/api/v1/recruitment/interviews/[id]`
  - **Description / Acceptance Criteria:** Mock participants/chat; recording playback uses MOCK_RECORDING. No WebRTC or interview API.

## Reports Components Module

- [x] **AURA-254 — Dashboard: Mount as reports home**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/reports/ReportDashboard.tsx (orphan)`
  - **Related API / Service:** `ReportGenerationService; missing /v1/reports/* routes`
  - **Description / Acceptance Criteria:** Favorites, history, scheduled reports UI never used. ReportGenerationService targets missing /v1/reports/templates, /history, /schedules.

- [x] **AURA-255 — Template Builder: Mount or merge with CustomReportBuilder**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/reports/ReportBuilder.tsx (orphan)`
  - **Related API / Service:** `/v1/reports/generate; /templates/*/preview (missing routes)`
  - **Description / Acceptance Criteria:** Full template-picker wizard with generate/preview orphaned. Templates fallback to mock list.

- [x] **AURA-256 — Viewer: Wire post-generation preview/download**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/reports/ReportViewer.tsx (orphan)`
  - **Related API / Service:** `ReportGenerationService.getGeneratedReport`
  - **Description / Acceptance Criteria:** Report preview/download component never mounted.

- [x] **AURA-257 — Scheduler: Wire to schedule API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/reports/ReportScheduler.tsx (orphan)`
  - **Related API / Service:** `GET/POST /api/v1/analytics/reports/schedule`
  - **Description / Acceptance Criteria:** Uses mockSchedules local state. Schedule API exists but unused.

- [x] **AURA-258 — Recipients: Wire recipient selector to directory API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/reports/RecipientSelector.tsx (orphan)`
  - **Related API / Service:** `Employee/directory API TBD`
  - **Description / Acceptance Criteria:** Mock recipient list; needed by scheduler.

- [x] **AURA-259 — Custom Builder: Wire Run Report, filters, and preview**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/(modules)/report-builder`
  - **Related API / Service:** `/api/v1/analytics/reports/custom/; /api/v1/reports/[id]/execute`
  - **Description / Acceptance Criteria:** Save/delete wired to /api/v1/analytics/reports/custom/. Run button has no handler. FilterBuilder not connected; preview is static mock.

- [x] **AURA-260 — Custom Builder (sub): Replace mock column/preview data**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `ColumnPicker, ReportPreview, DataSourceSelector`
  - **Related API / Service:** `Schema/metadata API needed`
  - **Description / Acceptance Criteria:** Static catalogs and mockPreviewData/mockChartData; ignores selected columns/filters.

- [x] **AURA-261 — Analytics: Consolidate duplicate inline builders**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/analytics/report-builder, /dashboard-builder`
  - **Related API / Service:** `/api/v1/analytics/headcount`
  - **Description / Acceptance Criteria:** Third and fourth report-builder implementations. Save/Run/Export buttons unwired. Preview from /api/v1/analytics/headcount only.

- [x] **AURA-262 — People Analytics: Wire secondary analytics tabs**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/(modules)/people-analytics`
  - **Related API / Service:** `GET /api/v1/analytics/people/`
  - **Description / Acceptance Criteria:** Main fetch wired to /api/v1/analytics/people/. Secondary tabs (turnover/diversity/flight-risk) are display shells.

- [x] **AURA-263 — Service Layer: Align service with actual API routes**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `ReportGenerationService`
  - **Related API / Service:** `/api/v1/reports; /api/v1/report-executions; /api/v1/analytics/reports/*`
  - **Description / Acceptance Criteria:** Service references /v1/reports/templates, /generate, /history, /schedules — routes missing. Retarget to /api/v1/reports + /api/v1/analytics/reports/\*.

## Audit & Security Module

- [x] **AURA-264 — Audit Logs: Wire Export CSV, filters, pagination, and log detail view**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/security/audit-logs`
  - **Related API / Service:** `AuditLogService / GET /api/security/audit-logs`
  - **Description / Acceptance Criteria:** Connect Export CSV, Apply Filters, Load More Logs, and filter inputs to AuditLogService. Replace inline hardcoded fallback array with proper empty-state handling. Add log detail modal/panel on row click.

- [x] **AURA-265 — Role-based Access: Wire Create Custom Role, Edit, and permission toggles**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/security/role-based-access`
  - **Related API / Service:** `RoleService / GET/POST/PUT/DELETE /api/security/roles`
  - **Description / Acceptance Criteria:** Connect Create Custom Role and Edit (Edit3 icon) to RoleService create/update. Replace hardcoded PERMISSIONS matrix with API-driven data. Make permission toggles functional via PUT /api/security/roles/:id.

- [x] **AURA-266 — Alert Rules: Replace inline mock with SecurityAlertService and wire CRUD**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/security/alert-rules`
  - **Related API / Service:** `SecurityAlertService / GET/POST/PUT /api/security/alerts`
  - **Description / Acceptance Criteria:** Page uses inline hardcoded rules array (5 items). Replace with SecurityAlertService.getAll/create/update/delete. Wire Add Rule, Edit, Delete, and status toggle buttons.

- [x] **AURA-267 — Compliance Framework: Implement /api/v1/compliance/\* backend routes**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/security/compliance`
  - **Related API / Service:** `/api/v1/compliance/frameworks, controls, timeline (missing)`
  - **Description / Acceptance Criteria:** ComplianceFrameworkService calls /api/v1/compliance/\* but no matching routes exist in repo — all calls fall back to mock SOC2/ISO controls. Implement frameworks, controls, evidence upload, and test endpoints with Prisma persistence.

- [x] **AURA-268 — Access Governance: Implement /api/v1/access-governance/\* backend and wire New Campaign**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/security/access-governance`
  - **Related API / Service:** `/api/v1/access-governance/* (missing)`
  - **Description / Acceptance Criteria:** AccessGovernanceService calls endpoints that do not exist — all fall back to in-service mocks. Implement SoD rules, violations, reviews, and matrix APIs. Wire New Campaign and Review buttons.

- [x] **AURA-269 — Policy Acknowledgement: Wire Send Reminders, View Report, and Download per policy**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/security/policy-acknowledgement`
  - **Related API / Service:** `None currently — needs new API`
  - **Description / Acceptance Criteria:** Page uses hardcoded stats (92%, 45, 6) and inline policy list. Build API for policy acknowledgement tracking. Wire Send Reminders, View Report, and Download buttons.

- [x] **AURA-270 — Dual Authentication: Wire Save Policies, MFA method selection, and enforcement toggles**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/security/dual-authentication`
  - **Related API / Service:** `None currently — needs MFA policy API`
  - **Description / Acceptance Criteria:** Page uses hardcoded MFA stats and static toggle states. Build MFA policy API. Wire Save Policies, MFA method cards, enforcement rule toggles, and View All Users.

- [x] **AURA-271 — Field-level Security: Wire role selection and mask toggles to API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/security/field-level-security`
  - **Related API / Service:** `None currently — needs new API`
  - **Description / Acceptance Criteria:** Role selection buttons are static (HR Manager always 'Editing'). Mask toggles are display-only. Build field-level security config API and wire role switching and mask persistence.

- [x] **AURA-272 — GDPR Tools: Wire New DSAR Request, View, Anonymize, and consent toggles**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/security/gdpr-tools`
  - **Related API / Service:** `None currently — needs DSAR/consent API`
  - **Description / Acceptance Criteria:** Page uses hardcoded DSAR list and static consent manager. Build DSAR/consent APIs. Wire New DSAR Request, View per request, consent toggles, and Anonymize User Data.

- [x] **AURA-273 — Data Retention: Wire Update Policies and Reset per policy**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/security/data-retention`
  - **Related API / Service:** `None currently — needs retention policy API`
  - **Description / Acceptance Criteria:** Page uses inline retention policy array and hardcoded storage stats. Build data retention policy API. Wire Update Policies and Reset (RotateCcw) per policy.

- [x] **AURA-274 — Compliance Tracker: Wire View Evidence, Manage Compliance, and Certificate Details**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/security/compliance-tracker`
  - **Related API / Service:** `None currently — static mock cards`
  - **Description / Acceptance Criteria:** Page uses hardcoded SOC2/GDPR/ISO cards separate from /security/compliance enterprise page. Wire action buttons or consolidate with compliance framework page.

- [x] **AURA-275 — Document Access Logs: Implement search and action filter functionality**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/security/document-access-logs`
  - **Related API / Service:** `None currently — needs document access log API`
  - **Description / Acceptance Criteria:** Search input is uncontrolled with no filter logic. All Actions / Viewed / Downloaded / Printed filter buttons have no handlers. Build document access log API and wire filters.

- [x] **AURA-276 — Login Logs: Build login logs API and replace hardcoded session table**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/security/login-logs`
  - **Related API / Service:** `None currently — needs login logs API`
  - **Description / Acceptance Criteria:** Page uses hardcoded summary stats and inline session table (5 rows). Implement login/session audit API and wire live data.

- [x] **AURA-277 — Approval Logs: Build approval logs API and replace hardcoded table**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/security/approval-logs`
  - **Related API / Service:** `None currently — needs approval logs API`
  - **Description / Acceptance Criteria:** Page uses inline hardcoded table rows (6 items). Implement approval audit log API backed by workflow/approval engine data.

- [x] **AURA-278 — Security Settings: Build settings admin page using SecuritySettingsService**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/security`
  - **Related API / Service:** `SecuritySettingsService / GET/PUT /api/security/settings`
  - **Description / Acceptance Criteria:** SecuritySettingsService (GET/PUT /api/security/settings) exists but no page imports it. Build security settings admin UI and wire to existing API.

- [x] **AURA-279 — Orphaned Hook: Wire useSecurity hook to pages or remove dead code**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `apps/web/src/app/dashboard/security/hooks/useSecurity.ts`
  - **Related API / Service:** `useSecurity hook + data.ts sample seeds`
  - **Description / Acceptance Criteria:** useSecurity loads all four services and seeds data.ts samples when API returns empty, but is never imported by any page. Either wire into a security dashboard or remove.

- [x] **AURA-280 — Module Route: Replace module placeholder with dashboard hub link or embed**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/audit-security`
  - **Related API / Service:** `N/A — routing/IA fix`
  - **Description / Acceptance Criteria:** (modules)/audit-security renders ModulePage with isImplemented=false while full dashboard hub exists at /dashboard/security. Replace placeholder with redirect or embed of /dashboard/security.

- [x] **AURA-281 — Duplicate Pages: Deduplicate compliance, GDPR, audit-trail, and policy-ack pages**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `Multiple (/security/* vs /dashboard/compliance/*)`
  - **Related API / Service:** `N/A — IA/consolidation`
  - **Description / Acceptance Criteria:** Overlapping pages exist across security and compliance modules (GDPR tools, policy acknowledgement, audit trail, compliance tracker). Consolidate or clearly differentiate scope.

## Benefits Module

- [x] **AURA-282 — Benefit Types: Wire Add New Benefit, Edit, and Delete to plans API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits/benefit-types`
  - **Related API / Service:** `BenefitPlanService / GET/POST/PUT/DELETE /api/benefits/plans`
  - **Description / Acceptance Criteria:** Page loads plans via GET /api/benefits/plans but Add New Benefit, Edit, and Delete have no onClick handlers. Wire CRUD to BenefitPlanService.

- [x] **AURA-283 — Dependent Management: Wire Add Dependent, menu actions, and Upload Verification Docs**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits/dependent-management`
  - **Related API / Service:** `DependentService / /api/benefits/dependents`
  - **Description / Acceptance Criteria:** Page loads dependents via GET /api/benefits/dependents but write actions are missing. Wire Add Dependent form, MoreVertical menu, and document upload to DependentService.

- [x] **AURA-284 — Claims: Wire Filter, Submit Claim, and row click navigation**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits/claims`
  - **Related API / Service:** `ClaimService / /api/benefits/claims`
  - **Description / Acceptance Criteria:** Page loads claims read-only. Wire Filter control, Submit Claim button, and ChevronRight row click to open claim detail. Fix hardcoded 0% deductible bar.

- [x] **AURA-285 — Open Enrollment: Wire Confirm Enrollment to POST enrollments**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits/enrollment`
  - **Related API / Service:** `EnrollmentService / POST /api/benefits/enrollments`
  - **Description / Acceptance Criteria:** Plans load via GET /api/benefits/plans?status=ACTIVE but Confirm Enrollment has no handler. Connect to POST /api/benefits/enrollments via EnrollmentService.

- [x] **AURA-286 — Insurance Coverage: Wire Download All Cards, Copy, Contact carrier, Find a Doctor**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits/insurance-coverage`
  - **Related API / Service:** `GET /api/benefits/plans, /api/benefits/enrollments`
  - **Description / Acceptance Criteria:** Page derives active plan from live plans + enrollments but action buttons have no handlers. Wire carrier contact, card download, and provider lookup actions.

- [x] **AURA-287 — HSA / FSA: Wire View All, Submit Claim, Change Contribution, Order New Card**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits/hsa-fsa`
  - **Related API / Service:** `GET /api/benefits/plans?category=FSA_HSA; /api/v1/benefits HSA/FSA routes exist`
  - **Description / Acceptance Criteria:** Page proxies FSA_HSA plans and claims with fake account balances. Wire action buttons to dedicated HSA/FSA v1 endpoints or build dashboard routes.

- [x] **AURA-288 — Plan Eligibility: Implement eligibility API route and wire Create Rule**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits/plan-eligibility`
  - **Related API / Service:** `EligibilityService — /api/benefits/eligibility/* (missing)`
  - **Description / Acceptance Criteria:** GET /api/benefits/eligibility/employee/EMP-001 returns 404. Route missing. Replace hardcoded EMP-001 with session employee. Wire Create New Eligibility Rule.

- [x] **AURA-289 — Enrollment Window: Implement enrollment-windows API and render live data**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits/enrollment-window`
  - **Related API / Service:** `EnrollmentWindowService — /api/benefits/enrollment-windows (missing)`
  - **Description / Acceptance Criteria:** GET /api/benefits/enrollment-windows returns 404. Fetch runs but UI shows hardcoded 'Annual Open Enrollment 2025'. Implement route and bind windows state to UI.

- [x] **AURA-290 — Provider Directory: Implement providers API or proxy to v1 and wire Search/Call/Book**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits/provider-directory`
  - **Related API / Service:** `/api/benefits/providers (missing) or /api/v1/benefits/providers`
  - **Description / Acceptance Criteria:** GET /api/benefits/providers returns 404 (v1 providers API exists). Wire Search, Call, and Book Online buttons.

- [x] **AURA-291 — Exception Handling: Implement qualifying-events API and wire Approve/Reject/Message**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits/exception-handling`
  - **Related API / Service:** `QualifyingEventService — /api/benefits/qualifying-events (missing)`
  - **Description / Acceptance Criteria:** GET /api/benefits/qualifying-events returns 404. Wire Approve, Reject, and Message row actions once API exists (v1 life-event route may apply).

- [x] **AURA-292 — Claim Status: Fix response unwrapping and bind UI to selected claim**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits/claim-status`
  - **Related API / Service:** `ClaimService / GET /api/benefits/claims`
  - **Description / Acceptance Criteria:** Calls ClaimService.getClaims but sets setClaims(data) instead of data.data. Fetched claims state unused; hardcoded demo claim #CLM-002 shown. Fix unwrap and wire document download.

- [x] **AURA-293 — Perks Marketplace: Wire View Details navigation**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits/perks-marketplace`
  - **Related API / Service:** `GET /api/benefits/plans?status=ACTIVE`
  - **Description / Acceptance Criteria:** Page maps active plans to perk cards. View Details has no handler or navigation.

- [x] **AURA-294 — Wellness Tracker: Wire Browse All and replace hardcoded wellness metrics**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits/wellness-tracker`
  - **Related API / Service:** `GET /api/benefits/plans?category=WELLNESS`
  - **Description / Acceptance Criteria:** Wellness plan existence check works but metrics (score 72, zero steps) are hardcoded. Wire Browse All challenges and integrate wearable/activity API.

- [ ] **AURA-295 — Notification: Render settings API data and wire Create New Campaign**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits/notification`
  - **Related API / Service:** `BenefitSettingsService / GET/PUT /api/benefits/settings`
  - **Description / Acceptance Criteria:** GET /api/benefits/settings is fetched but never rendered. Page shows hardcoded campaigns + templates. Wire settings to UI and Create New Campaign action.

- [x] **AURA-296 — Benefits Enrollment (stub): Implement sub-feature pages or remove dead ModuleGrid links**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits/benefits-enrollment`
  - **Related API / Service:** `N/A — routing fix`
  - **Description / Acceptance Criteria:** ModuleGrid links to plan-selection, coverage-level, etc. all lead to 404. Real wizard lives at /dashboard/(modules)/benefits-enrollment. Consolidate or implement child routes.

- [ ] **AURA-297 — Module Route: Replace mock tab components with live API services**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/benefits`
  - **Related API / Service:** `BenefitsClaimsService (mock) vs /api/benefits/* and /api/v1/benefits/*`
  - **Description / Acceptance Criteria:** All 7 tabs (Dashboard, HSA/FSA, Wellness, Retirement, Claims, COBRA, Perks) use in-memory mock services. Replace BenefitsClaimsService mocks with dashboard services.ts or unified v1 client.

- [ ] **AURA-298 — Enrollment Wizard: Align BenefitsEnrollmentService paths with v1 API contracts**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/(modules)/benefits-enrollment`
  - **Related API / Service:** `BenefitsEnrollmentService / /api/v1/benefits/*`
  - **Description / Acceptance Criteria:** Wizard calls /api/v1/benefits/\* with path mismatches (/v1/benefits vs /v1/benefits/plans, missing dependents/window routes). Fix service paths and DependentSelection submit.

- [x] **AURA-299 — Session / Identity: Replace hardcoded EMP-001 with session employee ID**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `plan-eligibility, claim-status`
  - **Related API / Service:** `Cross-cutting — session/auth layer`
  - **Description / Acceptance Criteria:** Plan Eligibility and Claim Status use hardcoded employeeId EMP-001. Replace with authenticated session employee context.

- [ ] **AURA-300 — Orphan Components: Mount or remove unrouted benefits components**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `components/benefits/*.tsx`
  - **Related API / Service:** `Varies — v1 COBRA/compliance APIs exist but unused`
  - **Description / Acceptance Criteria:** BenefitsAnalyticsDashboard, BenefitsComplianceDashboard, ACAComplianceDashboard, COBRAAdministration, LifeInsuranceDashboard, PensionEOSBDashboard, and ProviderDirectory.tsx have no page routes. Mount or delete.

## Career Planning Module

- [x] **AURA-301 — Backend Foundation: Implement all /api/career/\* routes matching services.ts contracts**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/api/career/*`
  - **Related API / Service:** `CareerLadderService, MobilityService, CareerGoalService, etc. — all /api/career/* (missing)`
  - **Description / Acceptance Criteria:** Full service layer exists in dashboard/career/services.ts but zero /api/career/\* routes are implemented. All service calls would 404. Implement ladders, paths, mobility, goals, aspirations, mentorship, and settings endpoints.

- [x] **AURA-302 — Career Hub: Add index page or redirect to first sub-feature**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/career`
  - **Related API / Service:** `N/A — routing fix`
  - **Description / Acceptance Criteria:** No page.tsx exists at /dashboard/career — likely 404. Super-admin menu may point here. Add ModuleGrid hub or redirect to career-ladders.

- [x] **AURA-303 — Career Ladders: Wire page to CareerLadderService and View Detailed Rubric**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/career/career-ladders`
  - **Related API / Service:** `CareerLadderService / GET /api/career/ladders (missing)`
  - **Description / Acceptance Criteria:** Page uses hardcoded L1-L5 engineer ladder. Wire to GET /api/career/ladders. Connect View Detailed Rubric button and ladder step node clicks.

- [x] **AURA-304 — Internal Mobility: Wire job cards, My Applications, and View Details to mobility API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/career/internal-mobility`
  - **Related API / Service:** `MobilityService / /api/career/mobility-* (missing)`
  - **Description / Acceptance Criteria:** Page uses hardcoded recommended jobs (3) and job board (6). Wire My Applications, job card clicks, and View Details to MobilityService.

- [x] **AURA-305 — Career Goals: Wire Add New Goal, row menu, and checkboxes to goals API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/career/career-goals`
  - **Related API / Service:** `CareerGoalService / /api/career/goals (missing)`
  - **Description / Acceptance Criteria:** Page uses hardcoded 4 goals with progress %. Wire Add New Goal, MoreVertical menu, and checkbox toggles to CareerGoalService CRUD.

- [x] **AURA-306 — Career Aspirations: Wire Save Changes, path/department toggles, and form to aspirations API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/career/aspirations`
  - **Related API / Service:** `CareerAspirationService / /api/career/aspirations (missing)`
  - **Description / Acceptance Criteria:** Page uses hardcoded form defaults and static AI suggestion. Wire Save Changes, path/department toggle buttons, relocate select, and AI Coach to CareerAspirationService.

- [x] **AURA-307 — Module Route: Replace placeholder with links to /dashboard/career/\* subpages**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/career-planning`
  - **Related API / Service:** `N/A — routing/IA fix`
  - **Description / Acceptance Criteria:** (modules)/career-planning shows ModulePage isImplemented=false while 4 dashboard subpages already exist. Replace placeholder with hub linking to dashboard career pages.

- [x] **AURA-308 — ESS Career Marketplace: Wire Save Interests and Apply to profile API and mobility service**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/(modules)/career`
  - **Related API / Service:** `CareerInterestService / /api/my-services/profile; MobilityService (missing)`
  - **Description / Acceptance Criteria:** InternalJobMarketplace uses MOCK_JOBS. CareerInterestsProfile uses hardcoded defaults. Save Interests shows local toast only. Apply generates fake APP-{timestamp}. Wire to /api/my-services/profile careerInterests and mobility applications API.

- [x] **AURA-309 — Career Site Builder: Wire Preview and Publish to recruitment career-site API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/(modules)/career-site`
  - **Related API / Service:** `GET/PUT /api/v1/recruitment/career-site (exists, not wired)`
  - **Description / Acceptance Criteria:** CareerSiteBuilder uses MOCK_LISTINGS and local state. Preview button has no handler. Publish sets local flag only. Wire to GET/PUT /api/v1/recruitment/career-site.

- [x] **AURA-310 — Orphaned Infrastructure: Wire useCareer hook to pages or remove dead code**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `dashboard/career/hooks/useCareer.ts`
  - **Related API / Service:** `useCareer hook + data.ts sample fixtures`
  - **Description / Acceptance Criteria:** useCareer loads all career services and seeds localStorage on empty but is never imported by any page. Wire to dashboard pages or remove.

- [ ] **AURA-311 — Internal Mobility (duplication): Consolidate three parallel internal mobility implementations**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `Multiple implementations`
  - **Related API / Service:** `InternalMobilityService (mock) + MobilityService (missing API)`
  - **Description / Acceptance Criteria:** Static internal-mobility page, InternalJobMarketplace component, and InternalMobilityService mock class are separate unconnected implementations. Unify into one service-backed flow.

- [x] **AURA-312 — Career Site (duplication): Consolidate career site builder implementations**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `Multiple implementations`
  - **Related API / Service:** `/api/v1/recruitment/career-site`
  - **Description / Acceptance Criteria:** Three implementations: (modules)/career-site (mock), recruitment/career-site (API-backed), legacy components/career/CareerSiteBuilder. Consolidate on API-backed version.

## Alumni Network Module

- [x] **AURA-313 — Alumni Network: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/alumni-network`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-314 — Alumni Directory: Replace mock/hardcoded data with live API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/alumni-network/alumni-directory`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page uses hardcoded or mock data; no fetch/service calls detected.

- [x] **AURA-315 — Alumni Jobs: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/alumni-network/alumni-jobs`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [x] **AURA-316 — Events & Reunions: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/alumni-network/events-reunions`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

## Contract Workforce Module

- [ ] **AURA-317 — Contract Workforce: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/recruitment/vendors`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-318 — Compliance Docs: Implement feature domain and API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/recruitment/vendors/compliance-docs`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page renders VendorUnsupportedState — backend domain not built.

- [ ] **AURA-319 — Contract Renewal: Implement feature domain and API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/recruitment/vendors/contract-renewal`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page renders VendorUnsupportedState — backend domain not built.

- [ ] **AURA-320 — Contract Types: Implement feature domain and API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/recruitment/vendors/contract-types`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page renders VendorUnsupportedState — backend domain not built.

- [ ] **AURA-321 — Invoice Processing: Implement feature domain and API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/recruitment/vendors/invoice-processing`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page renders VendorUnsupportedState — backend domain not built.

- [ ] **AURA-322 — Management: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/recruitment/vendors/management`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-323 — Performance Rating: Implement feature domain and API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/recruitment/vendors/performance-rating`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page renders VendorUnsupportedState — backend domain not built.

- [ ] **AURA-324 — Rate Cards: Implement feature domain and API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/recruitment/vendors/rate-cards`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page renders VendorUnsupportedState — backend domain not built.

- [ ] **AURA-325 — Timesheet: Implement feature domain and API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/recruitment/vendors/timesheet`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page renders VendorUnsupportedState — backend domain not built.

- [ ] **AURA-326 — Vendor Management: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/recruitment/vendors/vendor-management`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

## DEI Module

- [x] **AURA-327 — DEI: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/dei`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-328 — Diversity Metrics: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/dei/diversity-metrics`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-329 — Mentorship Program: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/dei/mentorship-program`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

## ESS Module

- [x] **AURA-330 — ESS: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/my-services`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-331 — Grievances: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/my-services/grievances`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-332 — My Documents: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/my-services/my-documents`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [x] **AURA-333 — Profile Changes: Wire page to backend API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/my-services/profile-changes`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page renders inline static arrays with no fetch/service detected.

- [x] **AURA-334 — Request Center: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/my-services/request-center`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-335 — Tax Declaration: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/my-services/tax-declaration`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-336 — Team Directory: Replace mock/hardcoded data with live API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/my-services/team-directory`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page uses hardcoded or mock data; no fetch/service calls detected.

## GCC Compliance Module

- [ ] **AURA-337 — Assignment Register (capacity gated): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/accommodation-compliance/assignment-register-capacity-gated`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Assignment Register (capacity gated)' resolves to /dashboard/accommodation-compliance/assignment-register-capacity-gated but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-338 — Complaint Register (48h default SLA): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/accommodation-compliance/complaint-register-48h-default-sla`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Complaint Register (48h default SLA)' resolves to /dashboard/accommodation-compliance/complaint-register-48h-default-sla but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-339 — Inspection Register (CRITICAL/MAJOR/MINOR findings): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/accommodation-compliance/inspection-register-critical-major-minor-findings`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Inspection Register (CRITICAL/MAJOR/MINOR findings)' resolves to /dashboard/accommodation-compliance/inspection-register-critical-major-minor-findings but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-340 — Monthly Compliance Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/accommodation-compliance/monthly-compliance-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Compliance Certificate' resolves to /dashboard/accommodation-compliance/monthly-compliance-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-341 — Site Master (DORMITORY / LABOUR_CAMP / VILLA): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/accommodation-compliance/site-master-dormitory-labour-camp-villa`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Site Master (DORMITORY / LABOUR_CAMP / VILLA)' resolves to /dashboard/accommodation-compliance/site-master-dormitory-labour-camp-villa but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-342 — Biometric & Geolocation Consent Register: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/attendance-compliance/biometric-geolocation-consent-register`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Biometric & Geolocation Consent Register' resolves to /dashboard/attendance-compliance/biometric-geolocation-consent-register but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-343 — Country × Grade Policy (tolerances, SLAs, Ramadan): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/attendance-compliance/country-grade-policy-tolerances-slas-ramadan`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Country × Grade Policy (tolerances, SLAs, Ramadan)' resolves to /dashboard/attendance-compliance/country-grade-policy-tolerances-slas-ramadan but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-344 — Fraud Register (BUDDY_PUNCH / GEO_MISMATCH / TIME_DRIFT): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/attendance-compliance/fraud-register-buddy-punch-geo-mismatch-time-drift`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Fraud Register (BUDDY_PUNCH / GEO_MISMATCH / TIME_DRIFT)' resolves to /dashboard/attendance-compliance/fraud-register-buddy-punch-geo-mismatch-time-drift but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-345 — Monthly Compliance Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/attendance-compliance/monthly-compliance-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Compliance Certificate' resolves to /dashboard/attendance-compliance/monthly-compliance-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-346 — Bahraini Hires & Artificial-Risk: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/bahrainization-compliance/bahraini-hires-artificial-risk`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Bahraini Hires & Artificial-Risk' resolves to /dashboard/bahrainization-compliance/bahraini-hires-artificial-risk but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-347 — Establishment Scope: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/bahrainization-compliance/establishment-scope`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Establishment Scope' resolves to /dashboard/bahrainization-compliance/establishment-scope but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-348 — Monthly Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/bahrainization-compliance/monthly-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Certificate' resolves to /dashboard/bahrainization-compliance/monthly-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-349 — Ratio Snapshots & LMRA Gating: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/bahrainization-compliance/ratio-snapshots-lmra-gating`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Ratio Snapshots & LMRA Gating' resolves to /dashboard/bahrainization-compliance/ratio-snapshots-lmra-gating but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-350 — Sector × Size Targets: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/bahrainization-compliance/sector-size-targets`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Sector × Size Targets' resolves to /dashboard/bahrainization-compliance/sector-size-targets but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-351 — Tender Eligibility: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/bahrainization-compliance/tender-eligibility`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Tender Eligibility' resolves to /dashboard/bahrainization-compliance/tender-eligibility but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-352 — Benefit Catalogue (medical, life, ticket, housing, etc.): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits-compliance/benefit-catalogue-medical-life-ticket-housing-etc`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Benefit Catalogue (medical, life, ticket, housing, etc.)' resolves to /dashboard/benefits-compliance/benefit-catalogue-medical-life-ticket-housing-etc but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-353 — Coverage Register + Renewal + Accrual: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits-compliance/coverage-register-renewal-accrual`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Coverage Register + Renewal + Accrual' resolves to /dashboard/benefits-compliance/coverage-register-renewal-accrual but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-354 — Exceptions & Mandatory-Gap Detection: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits-compliance/exceptions-mandatory-gap-detection`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Exceptions & Mandatory-Gap Detection' resolves to /dashboard/benefits-compliance/exceptions-mandatory-gap-detection but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-355 — Monthly Compliance Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits-compliance/monthly-compliance-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Compliance Certificate' resolves to /dashboard/benefits-compliance/monthly-compliance-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-356 — Vendor Management & DPA Tracking: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/benefits-compliance/vendor-management-dpa-tracking`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Vendor Management & DPA Tracking' resolves to /dashboard/benefits-compliance/vendor-management-dpa-tracking but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-357 — Checklist Templates: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/checklist-engine/checklist-templates`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Checklist Templates' resolves to /dashboard/checklist-engine/checklist-templates but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-358 — Compliance Certificates: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/checklist-engine/compliance-certificates`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Compliance Certificates' resolves to /dashboard/checklist-engine/compliance-certificates but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-359 — Exception Register: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/checklist-engine/exception-register`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Exception Register' resolves to /dashboard/checklist-engine/exception-register but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-360 — Run Workspace: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/checklist-engine/run-workspace`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Run Workspace' resolves to /dashboard/checklist-engine/run-workspace but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-361 — Checklist Items (ER · Disciplinary · Separation · EOSB · Visa-Exit): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance-audit-register/checklist-items-er-disciplinary-separation-eosb-visa-exit`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Checklist Items (ER · Disciplinary · Separation · EOSB · Visa-Exit)' resolves to /dashboard/compliance-audit-register/checklist-items-er-disciplinary-separation-eosb-visa-exit but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-362 — Mandatory item completion enforcement: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance-audit-register/mandatory-item-completion-enforcement`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Mandatory item completion enforcement' resolves to /dashboard/compliance-audit-register/mandatory-item-completion-enforcement but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-363 — Per-domain default seeds: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance-audit-register/per-domain-default-seeds`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Per-domain default seeds' resolves to /dashboard/compliance-audit-register/per-domain-default-seeds but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-364 — Risk Register with L × I → band auto-derivation: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance-audit-register/risk-register-with-l-i-band-auto-derivation`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Risk Register with L × I → band auto-derivation' resolves to /dashboard/compliance-audit-register/risk-register-with-l-i-band-auto-derivation but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-365 — Annual Audit Plan: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance-calendar/annual-audit-plan`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Annual Audit Plan' resolves to /dashboard/compliance-calendar/annual-audit-plan but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-366 — Monthly Calendar Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance-calendar/monthly-calendar-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Calendar Certificate' resolves to /dashboard/compliance-calendar/monthly-calendar-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-367 — Recurrence Rules: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance-calendar/recurrence-rules`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Recurrence Rules' resolves to /dashboard/compliance-calendar/recurrence-rules but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-368 — Task Register: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance-calendar/task-register`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Task Register' resolves to /dashboard/compliance-calendar/task-register but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-369 — HR Audit Cycles & Findings: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/document-retention-compliance/hr-audit-cycles-findings`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'HR Audit Cycles & Findings' resolves to /dashboard/document-retention-compliance/hr-audit-cycles-findings but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-370 — HR Document Register (auto retentionUntil): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/document-retention-compliance/hr-document-register-auto-retentionuntil`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'HR Document Register (auto retentionUntil)' resolves to /dashboard/document-retention-compliance/hr-document-register-auto-retentionuntil but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-371 — Monthly Compliance Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/document-retention-compliance/monthly-compliance-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Compliance Certificate' resolves to /dashboard/document-retention-compliance/monthly-compliance-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-372 — Retention Schedule (per record type × country): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/document-retention-compliance/retention-schedule-per-record-type-country`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Retention Schedule (per record type × country)' resolves to /dashboard/document-retention-compliance/retention-schedule-per-record-type-country but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-373 — Schedule: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/document-retention-compliance/schedule`
  - **Related API / Service:** `/api/v1/document-retention-compliance/schedule`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/document-retention-compliance/schedule) but mock/hardcoded UI remains.

- [ ] **AURA-374 — Annual Targets: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/emiratisation-compliance/annual-targets`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Annual Targets' resolves to /dashboard/emiratisation-compliance/annual-targets but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-375 — Checkpoint Snapshots: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/emiratisation-compliance/checkpoint-snapshots`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Checkpoint Snapshots' resolves to /dashboard/emiratisation-compliance/checkpoint-snapshots but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-376 — Establishment Scope: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/emiratisation-compliance/establishment-scope`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Establishment Scope' resolves to /dashboard/emiratisation-compliance/establishment-scope but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-377 — Monthly Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/emiratisation-compliance/monthly-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Certificate' resolves to /dashboard/emiratisation-compliance/monthly-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-378 — Dispute Register: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/eosb-compliance/dispute-register`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Dispute Register' resolves to /dashboard/eosb-compliance/dispute-register but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-379 — Finalized Calculations (DRAFT→APPROVED→SETTLED): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/eosb-compliance/finalized-calculations-draft-approved-settled`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Finalized Calculations (DRAFT→APPROVED→SETTLED)' resolves to /dashboard/eosb-compliance/finalized-calculations-draft-approved-settled but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-380 — Monthly Accruals & GL Posting: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/eosb-compliance/monthly-accruals-gl-posting`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Accruals & GL Posting' resolves to /dashboard/eosb-compliance/monthly-accruals-gl-posting but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-381 — Monthly Compliance Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/eosb-compliance/monthly-compliance-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Compliance Certificate' resolves to /dashboard/eosb-compliance/monthly-compliance-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-382 — Grievance Register (multi-channel + SLA): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/er-compliance/grievance-register-multi-channel-sla`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Grievance Register (multi-channel + SLA)' resolves to /dashboard/er-compliance/grievance-register-multi-channel-sla but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-383 — Investigation Register: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/er-compliance/investigation-register`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Investigation Register' resolves to /dashboard/er-compliance/investigation-register but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-384 — Monthly Compliance Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/er-compliance/monthly-compliance-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Compliance Certificate' resolves to /dashboard/er-compliance/monthly-compliance-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-385 — 21-Domain RAG Status Grid: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/executive-compliance/21-domain-rag-status-grid`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature '21-Domain RAG Status Grid' resolves to /dashboard/executive-compliance/21-domain-rag-status-grid but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-386 — Compliance Review Calendar: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/executive-compliance/compliance-review-calendar`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Compliance Review Calendar' resolves to /dashboard/executive-compliance/compliance-review-calendar but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-387 — Compliance Risk Heatmap (L × I): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/executive-compliance/compliance-risk-heatmap-l-i`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Compliance Risk Heatmap (L × I)' resolves to /dashboard/executive-compliance/compliance-risk-heatmap-l-i but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-388 — Corrective Action Register: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/executive-compliance/corrective-action-register`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Corrective Action Register' resolves to /dashboard/executive-compliance/corrective-action-register but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-389 — Executive Monthly Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/executive-compliance/executive-monthly-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Executive Monthly Certificate' resolves to /dashboard/executive-compliance/executive-monthly-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-390 — Compliance Risk Register: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gcc-landscape/compliance-risk-register`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Compliance Risk Register' resolves to /dashboard/gcc-landscape/compliance-risk-register but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-391 — Countries & Entities: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gcc-landscape/countries-entities`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Countries & Entities' resolves to /dashboard/gcc-landscape/countries-entities but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-392 — Country Reference Dataset: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gcc-landscape/country-reference-dataset`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Country Reference Dataset' resolves to /dashboard/gcc-landscape/country-reference-dataset but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-393 — Digital Maturity Scorecard: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gcc-landscape/digital-maturity-scorecard`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Digital Maturity Scorecard' resolves to /dashboard/gcc-landscape/digital-maturity-scorecard but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-394 — Executive Landscape: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gcc-landscape/executive-landscape`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Executive Landscape' resolves to /dashboard/gcc-landscape/executive-landscape but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-395 — GCC Personas / RBAC: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gcc-landscape/gcc-personas-rbac`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'GCC Personas / RBAC' resolves to /dashboard/gcc-landscape/gcc-personas-rbac but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-396 — Platform Alerts: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gcc-landscape/platform-alerts`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Platform Alerts' resolves to /dashboard/gcc-landscape/platform-alerts but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-397 — Workforce Classification: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gcc-landscape/workforce-classification`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Workforce Classification' resolves to /dashboard/gcc-landscape/workforce-classification but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-398 — Workforce KPI Baseline: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gcc-landscape/workforce-kpi-baseline`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Workforce KPI Baseline' resolves to /dashboard/gcc-landscape/workforce-kpi-baseline but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-399 — Change Requests: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gcc-rule-library/change-requests`
  - **Related API / Service:** `/api/v1/gcc-rule-library/rule-change-requests, /api/v1/gcc-rule-library/rule-change-requests${qs}`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/gcc-rule-library/rule-change-requests, /api/v1/gcc-rule-library/rule-change-requests${qs}) but mock/hardcoded UI remains.

- [ ] **AURA-400 — Country Risk Matrix: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gcc-rule-library/country-risk-matrix`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Country Risk Matrix' resolves to /dashboard/gcc-rule-library/country-risk-matrix but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-401 — GCC Comparison Tables: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gcc-rule-library/gcc-comparison-tables`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'GCC Comparison Tables' resolves to /dashboard/gcc-rule-library/gcc-comparison-tables but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-402 — Monthly Country Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gcc-rule-library/monthly-country-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Country Certificate' resolves to /dashboard/gcc-rule-library/monthly-country-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-403 — Rule Change Requests (Maker-Checker, Rollback): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gcc-rule-library/rule-change-requests-maker-checker-rollback`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Rule Change Requests (Maker-Checker, Rollback)' resolves to /dashboard/gcc-rule-library/rule-change-requests-maker-checker-rollback but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-404 — Rule Packs (UAE/KSA/BH/QA/OM/KW): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gcc-rule-library/rule-packs-uae-ksa-bh-qa-om-kw`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Rule Packs (UAE/KSA/BH/QA/OM/KW)' resolves to /dashboard/gcc-rule-library/rule-packs-uae-ksa-bh-qa-om-kw but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-405 — Employee Registrations: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gosi-compliance/employee-registrations`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Employee Registrations' resolves to /dashboard/gosi-compliance/employee-registrations but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-406 — Monthly Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gosi-compliance/monthly-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Certificate' resolves to /dashboard/gosi-compliance/monthly-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-407 — Wages & Contributions: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gosi-compliance/wages-contributions`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Wages & Contributions' resolves to /dashboard/gosi-compliance/wages-contributions but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-408 — Monthly Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gpssa-compliance/monthly-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Certificate' resolves to /dashboard/gpssa-compliance/monthly-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-409 — Wages & Contributions: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/gpssa-compliance/wages-contributions`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Wages & Contributions' resolves to /dashboard/gpssa-compliance/wages-contributions but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-410 — Comp-Off Ledger (6-month expiry): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/holidays-compliance/comp-off-ledger-6-month-expiry`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Comp-Off Ledger (6-month expiry)' resolves to /dashboard/holidays-compliance/comp-off-ledger-6-month-expiry but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-411 — Country × Holiday Class Pay Rules (base × + OT ×): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/holidays-compliance/country-holiday-class-pay-rules-base-ot`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Country × Holiday Class Pay Rules (base × + OT ×)' resolves to /dashboard/holidays-compliance/country-holiday-class-pay-rules-base-ot but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-412 — Holiday Work Approval (auto comp-off accrual): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/holidays-compliance/holiday-work-approval-auto-comp-off-accrual`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Holiday Work Approval (auto comp-off accrual)' resolves to /dashboard/holidays-compliance/holiday-work-approval-auto-comp-off-accrual but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-413 — Monthly Compliance Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/holidays-compliance/monthly-compliance-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Compliance Certificate' resolves to /dashboard/holidays-compliance/monthly-compliance-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-414 — Monthly Compliance Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-forms-compliance/monthly-compliance-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Compliance Certificate' resolves to /dashboard/hr-forms-compliance/monthly-compliance-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-415 — Routing & SLA Config: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-forms-compliance/routing-sla-config`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Routing & SLA Config' resolves to /dashboard/hr-forms-compliance/routing-sla-config but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-416 — Routings: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-forms-compliance/routings`
  - **Related API / Service:** `/api/v1/hr-forms-compliance/routings`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/hr-forms-compliance/routings) but mock/hardcoded UI remains.

- [ ] **AURA-417 — Template Catalogue (8 lifecycle groups, versioned): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-forms-compliance/template-catalogue-8-lifecycle-groups-versioned`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Template Catalogue (8 lifecycle groups, versioned)' resolves to /dashboard/hr-forms-compliance/template-catalogue-8-lifecycle-groups-versioned but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-418 — Writeback Status & SLA Breach Detection: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-forms-compliance/writeback-status-sla-breach-detection`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Writeback Status & SLA Breach Detection' resolves to /dashboard/hr-forms-compliance/writeback-status-sla-breach-detection but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-419 — Acknowledgement Coverage (≥90% required): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-policies-compliance/acknowledgement-coverage-90-required`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Acknowledgement Coverage (≥90% required)' resolves to /dashboard/hr-policies-compliance/acknowledgement-coverage-90-required but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-420 — Certificate: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-policies-compliance/certificate`
  - **Related API / Service:** `/api/v1/hr-policies-compliance/certificate`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/hr-policies-compliance/certificate) but mock/hardcoded UI remains.

- [ ] **AURA-421 — Exception Register: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-policies-compliance/exception-register`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Exception Register' resolves to /dashboard/hr-policies-compliance/exception-register but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-422 — Monthly Compliance Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-policies-compliance/monthly-compliance-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Compliance Certificate' resolves to /dashboard/hr-policies-compliance/monthly-compliance-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-423 — Policy Lifecycle (publish auto-creates 12-month review): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-policies-compliance/policy-lifecycle-publish-auto-creates-12-month-review`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Policy Lifecycle (publish auto-creates 12-month review)' resolves to /dashboard/hr-policies-compliance/policy-lifecycle-publish-auto-creates-12-month-review but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-424 — Scheduled Reviews: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-policies-compliance/scheduled-reviews`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Scheduled Reviews' resolves to /dashboard/hr-policies-compliance/scheduled-reviews but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-425 — Approval Templates: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hrms-config/approval-templates`
  - **Related API / Service:** `/api/v1/hrms-config/approval-templates`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/hrms-config/approval-templates) but mock/hardcoded UI remains.

- [ ] **AURA-426 — Approval Workflow Templates: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hrms-config/approval-workflow-templates`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Approval Workflow Templates' resolves to /dashboard/hrms-config/approval-workflow-templates but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-427 — Audit Settings: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hrms-config/audit-settings`
  - **Related API / Service:** `/api/v1/hrms-config/audit-settings`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/hrms-config/audit-settings) but mock/hardcoded UI remains.

- [ ] **AURA-428 — Audit Trail Capture Policy per Domain: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hrms-config/audit-trail-capture-policy-per-domain`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Audit Trail Capture Policy per Domain' resolves to /dashboard/hrms-config/audit-trail-capture-policy-per-domain but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-429 — Config Objects: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hrms-config/config-objects`
  - **Related API / Service:** `/api/v1/hrms-config/config-objects, /api/v1/hrms-config/workspaces`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/hrms-config/config-objects, /api/v1/hrms-config/workspaces) but mock/hardcoded UI remains.

- [ ] **AURA-430 — Config Objects Registry · Maker-Checker (21 domains): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hrms-config/config-objects-registry-maker-checker-21-domains`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Config Objects Registry · Maker-Checker (21 domains)' resolves to /dashboard/hrms-config/config-objects-registry-maker-checker-21-domains but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-431 — Data Migration Plans · Run Validation: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hrms-config/data-migration-plans-run-validation`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Data Migration Plans · Run Validation' resolves to /dashboard/hrms-config/data-migration-plans-run-validation but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-432 — Integration Connectors · Health + Secret Rotation: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hrms-config/integration-connectors-health-secret-rotation`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Integration Connectors · Health + Secret Rotation' resolves to /dashboard/hrms-config/integration-connectors-health-secret-rotation but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-433 — Monthly + Go-Live Certificate (with gating): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hrms-config/monthly-go-live-certificate-with-gating`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly + Go-Live Certificate (with gating)' resolves to /dashboard/hrms-config/monthly-go-live-certificate-with-gating but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-434 — Notification Rules: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hrms-config/notification-rules`
  - **Related API / Service:** `/api/v1/hrms-config/notification-rules`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/hrms-config/notification-rules) but mock/hardcoded UI remains.

- [ ] **AURA-435 — Notification Rules (multi-channel, bilingual): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hrms-config/notification-rules-multi-channel-bilingual`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Notification Rules (multi-channel, bilingual)' resolves to /dashboard/hrms-config/notification-rules-multi-channel-bilingual but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-436 — Rule Sets: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hrms-config/rule-sets`
  - **Related API / Service:** `/api/v1/hrms-config/rule-sets`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/hrms-config/rule-sets) but mock/hardcoded UI remains.

- [ ] **AURA-437 — Versioned Country Rule Sets: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hrms-config/versioned-country-rule-sets`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Versioned Country Rule Sets' resolves to /dashboard/hrms-config/versioned-country-rule-sets but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-438 — Certificate: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hse-compliance/certificate`
  - **Related API / Service:** `/api/v1/hse-compliance/certificate`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/hse-compliance/certificate) but mock/hardcoded UI remains.

- [ ] **AURA-439 — Incident Register (NEAR_MISS → FATALITY + GOSI notify): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hse-compliance/incident-register-near-miss-fatality-gosi-notify`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Incident Register (NEAR_MISS → FATALITY + GOSI notify)' resolves to /dashboard/hse-compliance/incident-register-near-miss-fatality-gosi-notify but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-440 — Monthly Compliance Certificate (LTIFR): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hse-compliance/monthly-compliance-certificate-ltifr`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Compliance Certificate (LTIFR)' resolves to /dashboard/hse-compliance/monthly-compliance-certificate-ltifr but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-441 — Permit-to-Work (HOT_WORK / CONFINED_SPACE / WAH): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hse-compliance/permit-to-work-hot-work-confined-space-wah`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Permit-to-Work (HOT_WORK / CONFINED_SPACE / WAH)' resolves to /dashboard/hse-compliance/permit-to-work-hot-work-confined-space-wah but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-442 — Risk Assessments (L × S → residual band): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hse-compliance/risk-assessments-l-s-residual-band`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Risk Assessments (L × S → residual band)' resolves to /dashboard/hse-compliance/risk-assessments-l-s-residual-band but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-443 — Emergency Drill Tracker · First-Aid Stations · Welfare Inspections: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hse-visa-extensions/emergency-drill-tracker-first-aid-stations-welfare-inspections`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Emergency Drill Tracker · First-Aid Stations · Welfare Inspections' resolves to /dashboard/hse-visa-extensions/emergency-drill-tracker-first-aid-stations-welfare-inspections but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-444 — Safety Officer Registry · Heat-Stress Rules · Toolbox Talks: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hse-visa-extensions/safety-officer-registry-heat-stress-rules-toolbox-talks`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Safety Officer Registry · Heat-Stress Rules · Toolbox Talks' resolves to /dashboard/hse-visa-extensions/safety-officer-registry-heat-stress-rules-toolbox-talks but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-445 — Visa-Exit Benefits Closure (insurance/accommodation/EOS/loan): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hse-visa-extensions/visa-exit-benefits-closure-insurance-accommodation-eos-loan`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Visa-Exit Benefits Closure (insurance/accommodation/EOS/loan)' resolves to /dashboard/hse-visa-extensions/visa-exit-benefits-closure-insurance-accommodation-eos-loan but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-446 — Visa-Exit Comm Templates (bilingual) · TRANSFER PRO chain: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hse-visa-extensions/visa-exit-comm-templates-bilingual-transfer-pro-chain`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Visa-Exit Comm Templates (bilingual) · TRANSFER PRO chain' resolves to /dashboard/hse-visa-extensions/visa-exit-comm-templates-bilingual-transfer-pro-chain but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-447 — Visa-Exit Dependents Register (cascade): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hse-visa-extensions/visa-exit-dependents-register-cascade`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Visa-Exit Dependents Register (cascade)' resolves to /dashboard/hse-visa-extensions/visa-exit-dependents-register-cascade but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-448 — Audit Checklist: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/immigration-compliance/audit-checklist`
  - **Related API / Service:** `/api/v1/immigration-compliance/audit-checklist`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/immigration-compliance/audit-checklist) but mock/hardcoded UI remains.

- [ ] **AURA-449 — Authorization Matrix: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/immigration-compliance/authorization-matrix`
  - **Related API / Service:** `/api/v1/immigration-compliance/authorization-matrix`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/immigration-compliance/authorization-matrix) but mock/hardcoded UI remains.

- [ ] **AURA-450 — Country Authorization Matrix (MOHRE/ICP/GDRFA/MHRSD/Qiwa/LMRA/PAM): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/immigration-compliance/country-authorization-matrix-mohre-icp-gdrfa-mhrsd-qiwa-lmra-pam`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Country Authorization Matrix (MOHRE/ICP/GDRFA/MHRSD/Qiwa/LMRA/PAM)' resolves to /dashboard/immigration-compliance/country-authorization-matrix-mohre-icp-gdrfa-mhrsd-qiwa-lmra-pam but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-451 — Immigration Audit Checklist & Risk Register: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/immigration-compliance/immigration-audit-checklist-risk-register`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Immigration Audit Checklist & Risk Register' resolves to /dashboard/immigration-compliance/immigration-audit-checklist-risk-register but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-452 — Monthly Compliance Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/immigration-compliance/monthly-compliance-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Compliance Certificate' resolves to /dashboard/immigration-compliance/monthly-compliance-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-453 — Renewal Alert Ladder (60/30/7-day + EXPIRED): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/immigration-compliance/renewal-alert-ladder-60-30-7-day-expired`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Renewal Alert Ladder (60/30/7-day + EXPIRED)' resolves to /dashboard/immigration-compliance/renewal-alert-ladder-60-30-7-day-expired but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-454 — Renewal Alerts: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/immigration-compliance/renewal-alerts`
  - **Related API / Service:** `/api/v1/immigration-compliance/renewal-alerts`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/immigration-compliance/renewal-alerts) but mock/hardcoded UI remains.

- [ ] **AURA-455 — Risk Register: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/immigration-compliance/risk-register`
  - **Related API / Service:** `/api/v1/immigration-compliance/risk-register`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/immigration-compliance/risk-register) but mock/hardcoded UI remains.

- [ ] **AURA-456 — Transfer Case: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/immigration-compliance/transfer-case`
  - **Related API / Service:** `/api/v1/immigration-compliance/transfer-case`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/immigration-compliance/transfer-case) but mock/hardcoded UI remains.

- [ ] **AURA-457 — Transfer & Mobility Cases (REQUESTED → APPROVED → COMPLETED): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/immigration-compliance/transfer-mobility-cases-requested-approved-completed`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Transfer & Mobility Cases (REQUESTED → APPROVED → COMPLETED)' resolves to /dashboard/immigration-compliance/transfer-mobility-cases-requested-approved-completed but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-458 — Executive Scorecard: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/kpi-scorecard/executive-scorecard`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Executive Scorecard' resolves to /dashboard/kpi-scorecard/executive-scorecard but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-459 — KPI Catalogue: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/kpi-scorecard/kpi-catalogue`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'KPI Catalogue' resolves to /dashboard/kpi-scorecard/kpi-catalogue but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-460 — Monthly KPI Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/kpi-scorecard/monthly-kpi-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly KPI Certificate' resolves to /dashboard/kpi-scorecard/monthly-kpi-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-461 — Threshold Library: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/kpi-scorecard/threshold-library`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Threshold Library' resolves to /dashboard/kpi-scorecard/threshold-library but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-462 — Country × Leave Code Entitlement (annual/sick/maternity/Hajj): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/leave-compliance/country-leave-code-entitlement-annual-sick-maternity-hajj`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Country × Leave Code Entitlement (annual/sick/maternity/Hajj)' resolves to /dashboard/leave-compliance/country-leave-code-entitlement-annual-sick-maternity-hajj but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-463 — Medical Evidence Vault (RESTRICTED + retention): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/leave-compliance/medical-evidence-vault-restricted-retention`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Medical Evidence Vault (RESTRICTED + retention)' resolves to /dashboard/leave-compliance/medical-evidence-vault-restricted-retention but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-464 — Misuse Register (Monday/Friday pattern, medical forgery): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/leave-compliance/misuse-register-monday-friday-pattern-medical-forgery`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Misuse Register (Monday/Friday pattern, medical forgery)' resolves to /dashboard/leave-compliance/misuse-register-monday-friday-pattern-medical-forgery but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-465 — Monthly Compliance Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/leave-compliance/monthly-compliance-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Compliance Certificate' resolves to /dashboard/leave-compliance/monthly-compliance-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-466 — Fake / Artificial Detection (GPSSA × Payroll × WPS): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/nationalisation-overlay/fake-artificial-detection-gpssa-payroll-wps`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Fake / Artificial Detection (GPSSA × Payroll × WPS)' resolves to /dashboard/nationalisation-overlay/fake-artificial-detection-gpssa-payroll-wps but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-467 — National L&D Plans: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/nationalisation-overlay/national-l-d-plans`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'National L&D Plans' resolves to /dashboard/nationalisation-overlay/national-l-d-plans but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-468 — Saudi Profession-Localisation Codes (S09): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/nationalisation-overlay/saudi-profession-localisation-codes-s09`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Saudi Profession-Localisation Codes (S09)' resolves to /dashboard/nationalisation-overlay/saudi-profession-localisation-codes-s09 but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-469 — Saudi Professions: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/nationalisation-overlay/saudi-professions`
  - **Related API / Service:** `/api/v1/nationalisation-overlay/saudi-professions, /api/v1/nationalisation-overlay/saudi-professions${qs}`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/nationalisation-overlay/saudi-professions, /api/v1/nationalisation-overlay/saudi-professions${qs}) but mock/hardcoded UI remains.

- [ ] **AURA-470 — TA Pipeline Tags · Requisition + Job/Position: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/nationalisation-overlay/ta-pipeline-tags-requisition-job-position`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'TA Pipeline Tags · Requisition + Job/Position' resolves to /dashboard/nationalisation-overlay/ta-pipeline-tags-requisition-job-position but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-471 — Band Snapshots: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/nitaqat-compliance/band-snapshots`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Band Snapshots' resolves to /dashboard/nitaqat-compliance/band-snapshots but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-472 — Band Thresholds: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/nitaqat-compliance/band-thresholds`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Band Thresholds' resolves to /dashboard/nitaqat-compliance/band-thresholds but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-473 — Establishment Scope: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/nitaqat-compliance/establishment-scope`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Establishment Scope' resolves to /dashboard/nitaqat-compliance/establishment-scope but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-474 — Monthly Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/nitaqat-compliance/monthly-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Certificate' resolves to /dashboard/nitaqat-compliance/monthly-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-475 — Privilege Check: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/nitaqat-compliance/privilege-check`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Privilege Check' resolves to /dashboard/nitaqat-compliance/privilege-check but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-476 — Audit Checklist: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/org-compliance/audit-checklist`
  - **Related API / Service:** `/api/v1/org-compliance/audit-checklist`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/org-compliance/audit-checklist) but mock/hardcoded UI remains.

- [ ] **AURA-477 — Monthly Compliance Certificate (Overhire/Aged>90d/Unapproved): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/org-compliance/monthly-compliance-certificate-overhire-aged-90d-unapproved`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Compliance Certificate (Overhire/Aged>90d/Unapproved)' resolves to /dashboard/org-compliance/monthly-compliance-certificate-overhire-aged-90d-unapproved but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-478 — Org Audit Checklist (13 categories): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/org-compliance/org-audit-checklist-13-categories`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Org Audit Checklist (13 categories)' resolves to /dashboard/org-compliance/org-audit-checklist-13-categories but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-479 — Position Control: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/org-compliance/position-control`
  - **Related API / Service:** `/api/v1/org-compliance/position-control`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/org-compliance/position-control) but mock/hardcoded UI remains.

- [ ] **AURA-480 — Position Control & Headcount Budget: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/org-compliance/position-control-headcount-budget`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Position Control & Headcount Budget' resolves to /dashboard/org-compliance/position-control-headcount-budget but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-481 — Vacancy: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/org-compliance/vacancy`
  - **Related API / Service:** `/api/v1/org-compliance/vacancy`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/org-compliance/vacancy) but mock/hardcoded UI remains.

- [ ] **AURA-482 — Vacancy Register (raise/approve/fill with ageing): Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/org-compliance/vacancy-register-raise-approve-fill-with-ageing`
  - **Related API / Service:** `/api/v1/org-compliance/vacancy`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/org-compliance/vacancy) but mock/hardcoded UI remains.

- [ ] **AURA-483 — Budget Control: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/overtime-compliance/budget-control`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Budget Control' resolves to /dashboard/overtime-compliance/budget-control but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-484 — Monthly Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/overtime-compliance/monthly-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Certificate' resolves to /dashboard/overtime-compliance/monthly-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-485 — OT Policies (country × grade): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/overtime-compliance/ot-policies-country-grade`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'OT Policies (country × grade)' resolves to /dashboard/overtime-compliance/ot-policies-country-grade but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-486 — Rate Cards (country × OT type): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/overtime-compliance/rate-cards-country-ot-type`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Rate Cards (country × OT type)' resolves to /dashboard/overtime-compliance/rate-cards-country-ot-type but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-487 — Payroll Governance & Compliance: Wire page to backend API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page renders inline static arrays with no fetch/service detected.

- [ ] **AURA-488 — Alerts: Replace mock/hardcoded data with live API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/alerts`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page uses hardcoded or mock data; no fetch/service calls detected.

- [ ] **AURA-489 — Audit Finding: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/audit-finding`
  - **Related API / Service:** `/api/v1/payroll-compliance/audit-finding`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/payroll-compliance/audit-finding) but mock/hardcoded UI remains.

- [ ] **AURA-490 — Audit Findings Register: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/audit-findings-register`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Audit Findings Register' resolves to /dashboard/payroll-compliance/audit-findings-register but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-491 — Bahrain Sio: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/bahrain-sio`
  - **Related API / Service:** `/api/compliance/bahrain-sio`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/compliance/bahrain-sio) but mock/hardcoded UI remains.

- [ ] **AURA-492 — Eosb: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/eosb`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-493 — End Of Service Benefits Calculator: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/eosb/end-of-service-benefits-calculator`
  - **Related API / Service:** `/api/compliance/eosb`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/compliance/eosb) but mock/hardcoded UI remains.

- [ ] **AURA-494 — Gosi: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/gosi`
  - **Related API / Service:** `/api/compliance/gosi`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/compliance/gosi) but mock/hardcoded UI remains.

- [ ] **AURA-495 — Governance: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/governance`
  - **Related API / Service:** `/api/v1/payroll-compliance/governance`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/payroll-compliance/governance) but mock/hardcoded UI remains.

- [ ] **AURA-496 — Governance Controls (8 categories): Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/governance-controls-8-categories`
  - **Related API / Service:** `/api/v1/payroll-compliance/governance`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/payroll-compliance/governance) but mock/hardcoded UI remains.

- [ ] **AURA-497 — India Statutory: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/india-statutory`
  - **Related API / Service:** `/api/india-statutory`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/india-statutory) but mock/hardcoded UI remains.

- [ ] **AURA-498 — Monthly Compliance Certificate (Recon/Bank-File/GL): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/monthly-compliance-certificate-recon-bank-file-gl`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Compliance Certificate (Recon/Bank-File/GL)' resolves to /dashboard/payroll-compliance/monthly-compliance-certificate-recon-bank-file-gl but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-499 — Oman Spf: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/oman-spf`
  - **Related API / Service:** `/api/compliance/oman-spf`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/compliance/oman-spf) but mock/hardcoded UI remains.

- [ ] **AURA-500 — Overview: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/overview`
  - **Related API / Service:** `/api/compliance/bahrain-sio, /api/compliance/eosb, /api/compliance/gosi, /api/compliance/kuwait-pifss, /api/compliance/labour-law`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/compliance/bahrain-sio, /api/compliance/eosb, /api/compliance/gosi) but @ts-nocheck contract drift.

- [ ] **AURA-501 — Payroll Risk Register (L×I bands): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/payroll-risk-register-l-i-bands`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Payroll Risk Register (L×I bands)' resolves to /dashboard/payroll-compliance/payroll-risk-register-l-i-bands but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-502 — Qatar Wps: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/qatar-wps`
  - **Related API / Service:** `/api/compliance/qatar-wps`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/compliance/qatar-wps) but mock/hardcoded UI remains.

- [ ] **AURA-503 — Risk Register: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/payroll-compliance/risk-register`
  - **Related API / Service:** `/api/v1/payroll-compliance/risk-register`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/payroll-compliance/risk-register) but mock/hardcoded UI remains.

- [ ] **AURA-504 — Audit Checklist: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/records-compliance/audit-checklist`
  - **Related API / Service:** `/api/v1/records-compliance/audit-checklist`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/records-compliance/audit-checklist) but mock/hardcoded UI remains.

- [ ] **AURA-505 — Completeness: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/records-compliance/completeness`
  - **Related API / Service:** `/api/v1/records-compliance/completeness`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/records-compliance/completeness) but mock/hardcoded UI remains.

- [ ] **AURA-506 — Document Matrix: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/records-compliance/document-matrix`
  - **Related API / Service:** `/api/v1/records-compliance/document-matrix`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/records-compliance/document-matrix) but mock/hardcoded UI remains.

- [ ] **AURA-507 — Mandatory Document Matrix (country × code): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/records-compliance/mandatory-document-matrix-country-code`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Mandatory Document Matrix (country × code)' resolves to /dashboard/records-compliance/mandatory-document-matrix-country-code but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-508 — Monthly Compliance Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/records-compliance/monthly-compliance-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Compliance Certificate' resolves to /dashboard/records-compliance/monthly-compliance-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-509 — Per-Employee Completeness Score (GREEN/AMBER/RED): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/records-compliance/per-employee-completeness-score-green-amber-red`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Per-Employee Completeness Score (GREEN/AMBER/RED)' resolves to /dashboard/records-compliance/per-employee-completeness-score-green-amber-red but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-510 — Records Audit Checklist: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/records-compliance/records-audit-checklist`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Records Audit Checklist' resolves to /dashboard/records-compliance/records-audit-checklist but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-511 — Records Risk Register (L×I): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/records-compliance/records-risk-register-l-i`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Records Risk Register (L×I)' resolves to /dashboard/records-compliance/records-risk-register-l-i but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-512 — Risk Register: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/records-compliance/risk-register`
  - **Related API / Service:** `/api/v1/records-compliance/risk-register`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/records-compliance/risk-register) but mock/hardcoded UI remains.

- [ ] **AURA-513 — Clearance: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/separation-compliance/clearance`
  - **Related API / Service:** `/api/v1/separation-compliance/clearance`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/separation-compliance/clearance) but mock/hardcoded UI remains.

- [ ] **AURA-514 — Exit Clearance Checklist (HR/IT/FIN/SEC/LM/ADMIN): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/separation-compliance/exit-clearance-checklist-hr-it-fin-sec-lm-admin`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Exit Clearance Checklist (HR/IT/FIN/SEC/LM/ADMIN)' resolves to /dashboard/separation-compliance/exit-clearance-checklist-hr-it-fin-sec-lm-admin but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-515 — Handover: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/separation-compliance/handover`
  - **Related API / Service:** `/api/v1/separation-compliance/handover`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/separation-compliance/handover) but mock/hardcoded UI remains.

- [ ] **AURA-516 — Handover & Exit Interview: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/separation-compliance/handover-exit-interview`
  - **Related API / Service:** `/api/v1/separation-compliance/handover`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/separation-compliance/handover) but mock/hardcoded UI remains.

- [ ] **AURA-517 — Monthly Compliance Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/separation-compliance/monthly-compliance-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Compliance Certificate' resolves to /dashboard/separation-compliance/monthly-compliance-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-518 — Notice / Garden Leave / Buyout Tracking: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/separation-compliance/notice-garden-leave-buyout-tracking`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Notice / Garden Leave / Buyout Tracking' resolves to /dashboard/separation-compliance/notice-garden-leave-buyout-tracking but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-519 — Separation Case Orchestration (10 types): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/separation-compliance/separation-case-orchestration-10-types`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Separation Case Orchestration (10 types)' resolves to /dashboard/separation-compliance/separation-case-orchestration-10-types but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-520 — Monthly Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/sio-compliance/monthly-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Certificate' resolves to /dashboard/sio-compliance/monthly-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-521 — Wages & Contributions: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/sio-compliance/wages-contributions`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Wages & Contributions' resolves to /dashboard/sio-compliance/wages-contributions but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-522 — EOS↔SIO Funding · Return-to-Work Plans: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/structural-extensions/eos-sio-funding-return-to-work-plans`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'EOS↔SIO Funding · Return-to-Work Plans' resolves to /dashboard/structural-extensions/eos-sio-funding-return-to-work-plans but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-523 — Fatigue Rules · OT Fraud Detection: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/structural-extensions/fatigue-rules-ot-fraud-detection`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Fatigue Rules · OT Fraud Detection' resolves to /dashboard/structural-extensions/fatigue-rules-ot-fraud-detection but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-524 — Holiday Change-Management · Redundancy Batches: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/structural-extensions/holiday-change-management-redundancy-batches`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Holiday Change-Management · Redundancy Batches' resolves to /dashboard/structural-extensions/holiday-change-management-redundancy-batches but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-525 — Job Architecture · Salary Bands · DoA Matrix: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/structural-extensions/job-architecture-salary-bands-doa-matrix`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Job Architecture · Salary Bands · DoA Matrix' resolves to /dashboard/structural-extensions/job-architecture-salary-bands-doa-matrix but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-526 — Payroll Calendar Control · Variance Register: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/structural-extensions/payroll-calendar-control-variance-register`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Payroll Calendar Control · Variance Register' resolves to /dashboard/structural-extensions/payroll-calendar-control-variance-register but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-527 — Separation Retention · Physical Locations · Finding-Risk Links: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/structural-extensions/separation-retention-physical-locations-finding-risk-links`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Separation Retention · Physical Locations · Finding-Risk Links' resolves to /dashboard/structural-extensions/separation-retention-physical-locations-finding-risk-links but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-528 — Audit Checklist: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/talent-acquisition-compliance/audit-checklist`
  - **Related API / Service:** `/api/v1/talent-acquisition-compliance/audit-checklist, /api/v1/talent-acquisition-compliance/audit-checklist${stageFilter`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/talent-acquisition-compliance/audit-checklist, /api/v1/talent-acquisition-compliance/audit-checklist${stageFilter ) but mock/hardcoded UI remains.

- [ ] **AURA-529 — Lifecycle Audit Checklist (5 stages, 25 categories): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/talent-acquisition-compliance/lifecycle-audit-checklist-5-stages-25-categories`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Lifecycle Audit Checklist (5 stages, 25 categories)' resolves to /dashboard/talent-acquisition-compliance/lifecycle-audit-checklist-5-stages-25-categories but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-530 — Monthly TA Compliance Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/talent-acquisition-compliance/monthly-ta-compliance-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly TA Compliance Certificate' resolves to /dashboard/talent-acquisition-compliance/monthly-ta-compliance-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-531 — Risk Register: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/talent-acquisition-compliance/risk-register`
  - **Related API / Service:** `/api/v1/talent-acquisition-compliance/risk-register`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/talent-acquisition-compliance/risk-register) but mock/hardcoded UI remains.

- [ ] **AURA-532 — Stage Breakdown (PLANNING/SOURCING/SELECTION/OFFER/PRE-EMPLOYMENT): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/talent-acquisition-compliance/stage-breakdown-planning-sourcing-selection-offer-pre-employment`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Stage Breakdown (PLANNING/SOURCING/SELECTION/OFFER/PRE-EMPLOYMENT)' resolves to /dashboard/talent-acquisition-compliance/stage-breakdown-planning-sourcing-selection-offer-pre-employment but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-533 — TA Risk Register (L×I bands): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/talent-acquisition-compliance/ta-risk-register-l-i-bands`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'TA Risk Register (L×I bands)' resolves to /dashboard/talent-acquisition-compliance/ta-risk-register-l-i-bands but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-534 — Authority Portal Evidence: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/visa-exit-compliance/authority-portal-evidence`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Authority Portal Evidence' resolves to /dashboard/visa-exit-compliance/authority-portal-evidence but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-535 — Evidence: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/visa-exit-compliance/evidence`
  - **Related API / Service:** `/api/v1/visa-exit-compliance/evidence`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/visa-exit-compliance/evidence) but mock/hardcoded UI remains.

- [ ] **AURA-536 — Exit Case Orchestration (auto-seed PRO actions): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/visa-exit-compliance/exit-case-orchestration-auto-seed-pro-actions`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Exit Case Orchestration (auto-seed PRO actions)' resolves to /dashboard/visa-exit-compliance/exit-case-orchestration-auto-seed-pro-actions but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-537 — Monthly Compliance Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/visa-exit-compliance/monthly-compliance-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Compliance Certificate' resolves to /dashboard/visa-exit-compliance/monthly-compliance-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-538 — PRO Action Register: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/visa-exit-compliance/pro-action-register`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'PRO Action Register' resolves to /dashboard/visa-exit-compliance/pro-action-register but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-539 — Pro Actions: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/visa-exit-compliance/pro-actions`
  - **Related API / Service:** `/api/v1/visa-exit-compliance/pro-actions`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/visa-exit-compliance/pro-actions) but mock/hardcoded UI remains.

- [ ] **AURA-540 — Accommodation Transport Routes · Clinics · Maintenance Tickets: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/workforce-extensions/accommodation-transport-routes-clinics-maintenance-tickets`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Accommodation Transport Routes · Clinics · Maintenance Tickets' resolves to /dashboard/workforce-extensions/accommodation-transport-routes-clinics-maintenance-tickets but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-541 — Contractor Assignments (Attendance/Holidays/Accommodation/HSE): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/workforce-extensions/contractor-assignments-attendance-holidays-accommodation-hse`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Contractor Assignments (Attendance/Holidays/Accommodation/HSE)' resolves to /dashboard/workforce-extensions/contractor-assignments-attendance-holidays-accommodation-hse but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-542 — Employee Loans + Salary Advances (with amortization): Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/workforce-extensions/employee-loans-salary-advances-with-amortization`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Employee Loans + Salary Advances (with amortization)' resolves to /dashboard/workforce-extensions/employee-loans-salary-advances-with-amortization but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-543 — Uniform / PPE / Tools Issuance Register: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/workforce-extensions/uniform-ppe-tools-issuance-register`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Uniform / PPE / Tools Issuance Register' resolves to /dashboard/workforce-extensions/uniform-ppe-tools-issuance-register but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-544 — Monthly Certificate: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/wps-compliance/monthly-certificate`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'Monthly Certificate' resolves to /dashboard/wps-compliance/monthly-certificate but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

- [ ] **AURA-545 — WPS Submissions: Create feature page or link from module hub**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/wps-compliance/wps-submissions`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Menu feature 'WPS Submissions' resolves to /dashboard/wps-compliance/wps-submissions but no page.tsx exists. Module hub exists at /dashboard/gcc-landscape; add route or ModuleGrid tile.

## Global Mobility Module

- [x] **AURA-546 — Global Mobility: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/mobility`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-547 — Expat Tax Manager: Replace mock/hardcoded data with live API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/mobility/expat-tax-manager`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page uses hardcoded or mock data; no fetch/service calls detected.

- [x] **AURA-548 — Immigration: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/mobility/immigration`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [x] **AURA-549 — Relocation: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/mobility/relocation`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [x] **AURA-550 — Relocation Packages: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/mobility/relocation-packages`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [x] **AURA-551 — Tax: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/mobility/tax`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [x] **AURA-552 — Visa & Immigration: Replace mock/hardcoded data with live API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/mobility/visa-immigration`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page uses hardcoded or mock data; no fetch/service calls detected.

## HR Budgeting Module

- [ ] **AURA-553 — HR Budgeting: Wire page to backend API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/finance/budget`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page renders inline static arrays with no fetch/service detected.

- [ ] **AURA-554 — Approvals: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/finance/budget/approvals`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-555 — Budget Templates: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/finance/budget/budget-templates`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-556 — Scenario Planning: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/finance/budget/scenario-planning`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

## HRSD Module

- [ ] **AURA-557 — HRSD: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [ ] **AURA-558 — Case Management: Replace mock/hardcoded data with live API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/case-management`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page uses hardcoded or mock data; no fetch/service calls detected.

- [ ] **AURA-559 — Chat Support: Replace mock/hardcoded data with live API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/chat-support`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page uses hardcoded or mock data; no fetch/service calls detected.

- [ ] **AURA-560 — Continuous Improvement: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/continuous-improvement`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-561 — Knowledge Base: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/knowledge-base`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-562 — Omnichannel: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/omnichannel`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-563 — Performance Metrics: Replace mock/hardcoded data with live API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/performance-metrics`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page uses hardcoded or mock data; no fetch/service calls detected.

- [ ] **AURA-564 — Request Portal: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/request-portal`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-565 — Service Automation: Replace mock/hardcoded data with live API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/service-automation`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page uses hardcoded or mock data; no fetch/service calls detected.

- [ ] **AURA-566 — Service Catalog: Replace mock/hardcoded data with live API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/service-catalog`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page uses hardcoded or mock data; no fetch/service calls detected.

- [ ] **AURA-567 — Tickets: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/hr-helpdesk/tickets`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

## Integration Hub Module

- [x] **AURA-568 — Integration Hub: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/integration-hub`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-569 — API Marketplace: Replace mock/hardcoded data with live API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/integration-hub/api-marketplace`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page uses hardcoded or mock data; no fetch/service calls detected.

- [x] **AURA-570 — App Directory: Replace mock/hardcoded data with live API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/integration-hub/app-directory`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page uses hardcoded or mock data; no fetch/service calls detected.

- [x] **AURA-571 — Webhook Manager: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/integration-hub/webhook-manager`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

## Labor Relations Module

- [ ] **AURA-572 — Labor Relations: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [ ] **AURA-573 — Compliance Tracker: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance/compliance-tracker`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-574 — Data Retention: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance/data-retention`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-575 — Gdpr Tools: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance/gdpr-tools`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-576 — Policy Acknowledgement: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance/policy-acknowledgement`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-577 — Regulatory Reports: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance/regulatory-reports`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-578 — Statutory Compliance: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance/statutory-compliance`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-579 — Whistleblower: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/compliance/whistleblower`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

## Leave Module

- [x] **AURA-580 — Accrual Engine: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/leave/accrual-engine`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-581 — Ai Insights: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/leave/ai-insights`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-582 — Employee Balances: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/leave/balances/employee-balances`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-583 — Holidays: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/leave/calendar/holidays`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-584 — Dashboard: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/leave/dashboard`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-585 — Hajj Leave: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/leave/hajj-leave`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-586 — Holiday Management: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/leave/holiday-management`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-587 — Leave Balance: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/leave/leave-balance`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-588 — Leave Types: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/leave/leave-types`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-589 — Pending Approvals: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/leave/pending-approvals`
  - **Related API / Service:** `/api/manager/approvals`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/manager/approvals) but mock/hardcoded UI remains.

- [x] **AURA-590 — Leave: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/leave`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-591 — Holiday Management: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/leave/holiday-management`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-592 — Leave Balance: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/leave/leave-balance`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-593 — Leave Types: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/leave/leave-types`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-594 — Accrual Engine: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/leave/accrual-engine`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-595 — AI Insights: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/leave/ai-insights`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-596 — Employee Balances: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/leave/balances/employee-balances`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-597 — Holidays: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/leave/calendar/holidays`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-598 — Dashboard: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/leave/dashboard`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-599 — Hajj Leave: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/leave/hajj-leave`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-600 — Holiday Management: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/leave/holiday-management`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-601 — Leave Balance: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/leave/leave-balance`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-602 — Leave Types: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/leave/leave-types`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-603 — Pending Approvals: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/leave/pending-approvals`
  - **Related API / Service:** `/api/manager/approvals`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/manager/approvals) but mock/hardcoded UI remains.

## Localization Module

- [x] **AURA-604 — Localization: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/localization`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-605 — Address Formats: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/localization/address-formats`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-606 — Bank Integration: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/localization/bank-integration`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains; @ts-nocheck contract drift.

- [x] **AURA-607 — Calendar Types: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/localization/calendar-types`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [x] **AURA-608 — Country Specific Fields: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/localization/country-specific-fields`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-609 — Date Time Formats: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/localization/date-time-formats`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-610 — Government Reports: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/localization/government-reports`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [x] **AURA-611 — Multi Currency: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/localization/multi-currency`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-612 — Multi Language: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/localization/multi-language`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-613 — Regional Holidays: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/localization/regional-holidays`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-614 — Statutory Compliance: Wire page to backend API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/localization/statutory-compliance`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page renders inline static arrays with no fetch/service detected.

- [x] **AURA-615 — Tax Regimes: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/localization/tax-regimes`
  - **Related API / Service:** `/api/master-data/tax-regimes`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/master-data/tax-regimes) but mock/hardcoded UI remains.

- [x] **AURA-616 — Localization: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/localization`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-617 — Address Formats: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/localization/address-formats`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [x] **AURA-618 — Calendar Types: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/localization/calendar-types`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [x] **AURA-619 — Date Time Formats: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/localization/date-time-formats`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [x] **AURA-620 — Government Reports: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/localization/government-reports`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [x] **AURA-621 — Localization: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/localization`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-622 — Address Formats: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/localization/address-formats`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [x] **AURA-623 — Bank Integration: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/localization/bank-integration`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains; @ts-nocheck contract drift.

- [x] **AURA-624 — Calendar Types: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/localization/calendar-types`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [x] **AURA-625 — Country-Specific Fields: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/localization/country-specific-fields`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-626 — Date/Time Formats: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/localization/date-time-formats`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [x] **AURA-627 — Government Reports: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/localization/government-reports`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [x] **AURA-628 — Multi-Currency: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/localization/multi-currency`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-629 — Multi-Language: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/localization/multi-language`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-630 — Regional Holidays: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/localization/regional-holidays`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [x] **AURA-631 — Statutory Compliance: Wire page to backend API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/localization/statutory-compliance`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page renders inline static arrays with no fetch/service detected.

- [x] **AURA-632 — Tax Regimes: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/localization/tax-regimes`
  - **Related API / Service:** `/api/master-data/tax-regimes`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/master-data/tax-regimes) but mock/hardcoded UI remains.

## MSS Module

- [ ] **AURA-633 — Approval Center: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/manager/approval-center`
  - **Related API / Service:** `/api/manager/approvals`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/manager/approvals) but mock/hardcoded UI remains.

- [ ] **AURA-634 — Delegation: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/manager/delegation`
  - **Related API / Service:** `/api/manager/delegation`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/manager/delegation) but mock/hardcoded UI remains.

- [ ] **AURA-635 — Team Dashboard: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/manager/team-dashboard`
  - **Related API / Service:** `/api/manager/approvals, /api/manager/team`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/manager/approvals, /api/manager/team) but mock/hardcoded UI remains.

## Offboarding Module

- [ ] **AURA-636 — Offboarding: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/offboarding`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [ ] **AURA-637 — Clearance Checklist: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/offboarding/clearance-checklist`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-638 — Exit Interview: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/offboarding/exit-interview`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

## Onboarding Module

- [x] **AURA-639 — Onboarding: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/onboarding`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-640 — 30-60-90 Day Plan: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/onboarding/30-60-90-day-plan`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but @ts-nocheck contract drift.

- [x] **AURA-641 — Benefits: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/onboarding/benefits`
  - **Related API / Service:** `/api/v1/onboarding/benefits, /api/v1/onboarding/benefits/${selectedEnrollment.id}/issue-card`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/onboarding/benefits, /api/v1/onboarding/benefits/${selectedEnrollment.id}/issue-card) but mock/hardcoded UI remains.

- [x] **AURA-642 — Country Rules: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/onboarding/country-rules`
  - **Related API / Service:** `/api/v1/onboarding/country-rules`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/onboarding/country-rules) but mock/hardcoded UI remains.

- [x] **AURA-643 — First Day Experience: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/onboarding/first-day-experience`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but @ts-nocheck contract drift.

- [x] **AURA-644 — Induction Program: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/onboarding/induction-program`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but @ts-nocheck contract drift.

- [x] **AURA-645 — Payroll: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/onboarding/payroll`
  - **Related API / Service:** `/api/v1/onboarding/payroll, /api/v1/onboarding/payroll/${selectedProfile.id}/approve`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/onboarding/payroll, /api/v1/onboarding/payroll/${selectedProfile.id}/approve) but mock/hardcoded UI remains.

- [x] **AURA-646 — Social Insurance: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/onboarding/social-insurance`
  - **Related API / Service:** `/api/v1/onboarding/social-insurance, /api/v1/onboarding/social-insurance/${selectedRegistration.id}/register`
  - **Description / Acceptance Criteria:** Page calls APIs (/api/v1/onboarding/social-insurance, /api/v1/onboarding/social-insurance/${selectedRegistration.id}/register) but mock/hardcoded UI remains.

## Org Design Module

- [x] **AURA-647 — Org Design: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/org-design`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [x] **AURA-648 — Change Management: Wire page to backend API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/org-design/change-management`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page renders inline static arrays with no fetch/service detected.

- [x] **AURA-649 — Matrix Structure: Replace mock/hardcoded data with live API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/org-design/matrix-structure`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page uses hardcoded or mock data; no fetch/service calls detected.

- [x] **AURA-650 — Org Analytics: Wire page to backend API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/org-design/org-analytics`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page renders inline static arrays with no fetch/service detected.

- [x] **AURA-651 — Org Chart Builder: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/org-design/org-chart-builder`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [x] **AURA-652 — Position Hierarchy: Wire page to backend API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/org-design/position-hierarchy`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page renders inline static arrays with no fetch/service detected.

- [x] **AURA-653 — Scenario Planning: Replace mock/hardcoded data with live API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/org-design/scenario-planning`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page uses hardcoded or mock data; no fetch/service calls detected.

- [x] **AURA-654 — Span of Control: Wire page to backend API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/org-design/span-of-control`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page renders inline static arrays with no fetch/service detected.

- [x] **AURA-655 — Succession Pool: Wire page to backend API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/org-design/succession-pool`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page renders inline static arrays with no fetch/service detected.

## Performance Module

- [ ] **AURA-656 — Performance: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/performance`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-657 — 360 Feedback: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/performance/360-feedback`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains; localStorage persistence.

- [ ] **AURA-658 — 9 Box Grid: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/performance/9-box-grid`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but localStorage persistence.

- [ ] **AURA-659 — Ai Insights: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/performance/ai-insights`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but @ts-nocheck contract drift.

- [ ] **AURA-660 — Competency Framework: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/performance/competency-framework`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-661 — Continuous Feedback: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/performance/continuous-feedback`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but localStorage persistence.

- [ ] **AURA-662 — Dashboard: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/performance/dashboard`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [ ] **AURA-663 — Feedback: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/performance/feedback`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but localStorage persistence.

- [ ] **AURA-664 — Goal Setting Okr Mbo: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/performance/goal-setting-okr-mbo`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-665 — Review Cycles: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/performance/review-cycles`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-666 — Reviews: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/(modules)/performance/reviews`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-667 — Performance: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [ ] **AURA-668 — 1 On 1 Meetings: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/1-on-1-meetings`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-669 — 360 Feedback: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/360-feedback`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains; localStorage persistence.

- [ ] **AURA-670 — Check In Templates: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/check-in-templates`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but localStorage persistence.

- [ ] **AURA-671 — Competency Assessment: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-assessment`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-672 — Competency Catalog: Replace mock/hardcoded data with live API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-assessment/competency-catalog`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page uses hardcoded or mock data; no fetch/service calls detected.

- [ ] **AURA-673 — Job Competency Map: Replace mock/hardcoded data with live API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-assessment/job-competency-map`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page uses hardcoded or mock data; no fetch/service calls detected.

- [ ] **AURA-674 — Proficiency Levels: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-assessment/proficiency-levels`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-675 — Skill Assessment: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-assessment/skill-assessment`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-676 — Competency Library: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-library`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-677 — Competency Catalog: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-library/competency-catalog`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-678 — Gap Analysis: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-library/gap-analysis`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-679 — Job Competency Map: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-library/job-competency-map`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-680 — Proficiency Levels: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-library/proficiency-levels`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-681 — Skill Assessment: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/competency-library/skill-assessment`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-682 — Continuous Feedback: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/continuous-feedback`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but localStorage persistence.

- [ ] **AURA-683 — Goal Setting: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/goal-setting`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-684 — Library: Replace mock/hardcoded data with live API**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/goal-setting/library`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page uses hardcoded or mock data; no fetch/service calls detected.

- [ ] **AURA-685 — Manager Assessment: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/manager-assessment`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-686 — Nine Box: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/nine-box`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but localStorage persistence.

- [ ] **AURA-687 — Performance Analytics: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/performance-analytics`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but @ts-nocheck contract drift.

- [ ] **AURA-688 — Recognition Wall: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/recognition-wall`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but localStorage persistence.

- [ ] **AURA-689 — Review Cycles: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/review-cycles`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-690 — Reward Linkage: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/reward-linkage`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but localStorage persistence.

- [ ] **AURA-691 — Self Assessment: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/dashboard/performance/self-assessment`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-692 — Performance: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/performance`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-693 — 360 Feedback: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/performance/360-feedback`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains; localStorage persistence.

- [ ] **AURA-694 — 9-Box Grid: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/performance/9-box-grid`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but localStorage persistence.

- [ ] **AURA-695 — AI Insights: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/performance/ai-insights`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but @ts-nocheck contract drift.

- [ ] **AURA-696 — Competency Framework: Manual review required**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/performance/competency-framework`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page exists; automated heuristics could not classify wiring.

- [ ] **AURA-697 — Continuous Feedback: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/performance/continuous-feedback`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but localStorage persistence.

- [ ] **AURA-698 — Dashboard: Replace hub with functional page or add child route**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/performance/dashboard`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page is a ModuleGrid navigation shell with no data/API integration.

- [ ] **AURA-699 — Feedback: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/performance/feedback`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but localStorage persistence.

- [ ] **AURA-700 — Goal Setting (OKR/MBO): Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/performance/goal-setting-okr-mbo`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-701 — Review Cycles: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/performance/review-cycles`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

- [ ] **AURA-702 — Reviews: Complete API integration and remove mock/local fallbacks**
  - **Status:** Not Started
  - **Assignee:** Unassigned
  - **Due Date:** Not specified
  - **Page / Route:** `/performance/reviews`
  - **Related API / Service:** `Not specified`
  - **Description / Acceptance Criteria:** Page calls APIs (service layer) but mock/hardcoded UI remains.

## Final Definition of Done

- All checklist items are either implemented or explicitly removed from scope with documented approval.
- No reachable navigation link points to a 404, placeholder hub, unmounted mock component, or dead button.
- All localStorage/mock/seed-only behavior called out in this backlog is replaced by tenant-safe backend persistence or intentionally removed.
- All duplicate APIs/routes are rationalized and documented.
- All affected pages pass smoke testing for load, create/update/delete where applicable, filtering, export/import where applicable, and permission/tenant checks.
- Backlog status is updated in the original tracker after verification.
