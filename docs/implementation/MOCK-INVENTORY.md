# AuraOS Mock Data Inventory

**Document Version**: 1.0
**Last Updated**: March 22, 2026
**Owner**: Claude (Planning Agent)
**Status**: Active Burn-Down List
**Total Mock Patterns Found**: 420+
**Total Files Affected**: 182

---

## Critical Finding: Universal Mock Registry

**The repo contains a catch-all mock handler that silently serves fake data for ANY unmatched API request.**

| File | Description | Impact |
|------|-------------|--------|
| `apps/web/src/lib/mock-registry.ts` | Central mock data registry with ~25 hardcoded mock arrays covering industry, collaboration, mobile, energy, master-data domains | All unmatched API requests silently return mock data |
| `apps/web/src/app/api/[...route]/route.ts` | Catch-all route handler that intercepts GET/POST/PUT/DELETE for any unmatched path and serves mock data or generic success responses | **Masks missing API implementations** — features appear to work but are not real |

**Remediation**: This is the single highest-priority item. It must be removed or disabled in production paths to expose which APIs are actually missing. Recommend converting it to a dev-only middleware with explicit opt-in.

---

## Summary Statistics

| Category | File Count | Mock Patterns | P0 | P1 | P2 |
|----------|-----------|--------------|-----|-----|-----|
| Universal Mock Registry | 2 | ~25 registry entries + catch-all | 2 | 0 | 0 |
| Frontend Services (`/services/`) | 77 | ~245 mock variables | 18 | 45 | 14 |
| Dashboard Services | 2 | 6 TODO stubs + 1 mock fallback | 2 | 0 | 0 |
| Backend Lib/Services | 19 | 30+ mock methods/stubs | 5 | 11 | 3 |
| API Routes | 70+ | 80+ mock patterns | 32 | 35 | 3 |
| Mobile Screens | 6 | 6 mock arrays | 5 | 1 | 0 |
| Queue/Job Files | 3 | 12+ mock functions | 3 | 0 | 0 |
| Export/Audit/Reporting | 3 | 15+ mock stubs | 3 | 0 | 0 |
| **TOTAL** | **~182** | **~420+** | **70** | **92** | **20** |

---

## Priority Definitions

- **P0**: Business-critical production path. Must be resolved within the feature-completion program.
- **P1**: Important for operational completeness. Should be resolved within the program timeline.
- **P2**: Nice-to-have. Can be deferred beyond the 16-week program if needed.

---

## Section 1: Frontend Service Files (`apps/web/src/services/`)

### Core HR & People (P0)

| File | Mock Variables | Module |
|------|---------------|--------|
| `attendanceService.ts` | `MOCK_ATTENDANCE_LOG`, `MOCK_TEAM_ATTENDANCE`, `MOCK_ANOMALIES` | Attendance |
| `directoryService.ts` | `MOCK_EMPLOYEES`, `MOCK_DEPARTMENTS`, `MOCK_LOCATIONS` | Directory |
| `positionService.ts` | `MOCK_POSITIONS`, `MOCK_POSITION_HISTORY` | Position Management |
| `positionManagementService.ts` | `MOCK_POSITIONS`, `MOCK_HISTORY` | Position Management |
| `approvalService.ts` | `MOCK_REQUESTS` (8 records) | Approvals |
| `biometricService.ts` | `MOCK_DEVICES`, `MOCK_PUNCHES`, `MOCK_ENROLLMENTS` | Biometric |
| `shiftService.ts` | `MOCK_SHIFT_PATTERNS`, `MOCK_ROSTER_EMPLOYEES`, `MOCK_SHIFT_SWAP_REQUESTS`, `MOCK_OVERTIME_REQUESTS` | Shifts |
| `shiftManagementService.ts` | `MOCK_SHIFT_PATTERNS`, `MOCK_SWAP_REQUESTS`, `MOCK_OPEN_SHIFTS`, `MOCK_DIFFERENTIALS` | Shift Management |
| `benefitsService.ts` | `MOCK_PLANS`, `MOCK_DEPENDENTS`, `MOCK_ENROLLMENT_WINDOW` | Benefits |
| `benefitsClaimsService.ts` | `MOCK_ENROLLED_PLANS`, `MOCK_CLAIMS`, `MOCK_COBRA_RECORDS` | Benefits Claims |
| `tenantService.ts` | `MOCK_TENANTS`, `MOCK_USAGE` | Multi-Tenant |
| `tenantProvisioningService.ts` | `MOCK_USAGE` | Tenant Provisioning |
| `authService.ts` | 5 mock variables | Authentication |
| `recruitmentService.ts` | `MOCK_JOB_POSTINGS` (5), `MOCK_CANDIDATES` (16), `MOCK_ANALYTICS` | Recruitment |
| `workflowAutomationService.ts` | `MOCK_WORKFLOWS`, `MOCK_INSTANCES`, `MOCK_DELEGATIONS` | Workflow Automation |
| `workflowEngineService.ts` | 3 mock variables | Workflow Engine |
| `earnedWageService.ts` | `MOCK_POLICY`, `MOCK_TRANSACTIONS`, `MOCK_ANALYTICS` | Earned Wage Access |
| `documentService.ts` | `MOCK_FOLDERS`, `MOCK_DOCUMENTS` | Document Vault |

### P1 Frontend Services

| File | Mock Variables | Module |
|------|---------------|--------|
| `employeeRelationsService.ts` | `MOCK_CASES`, `MOCK_NOTES` | Employee Relations |
| `exitManagementService.ts` | `MOCK_EXITS` | Exit Management |
| `exitService.ts` | `MOCK_EXIT_PROCESSES` | Exit Management |
| `profileChangeService.ts` | 1 mock variable | Core HR |
| `payEquityService.ts` | 6 mock variables | Pay Equity |
| `loanService.ts` | `MOCK_LOANS`, `MOCK_POLICIES` | Employee Loans |
| `pensionEosbService.ts` | 2 mock variables | Pension/EOSB |
| `overtimeService.ts` | 1 mock variable | Overtime |
| `expenseService.ts` | `MOCK_REPORTS`, `MOCK_POLICIES`, `MOCK_ANALYTICS` | Expense Management |
| `benefitsAnalyticsService.ts` | `MOCK_PLAN_PERFORMANCE` | Benefits Analytics |
| `benefitsComplianceService.ts` | `MOCK_COVERAGE_MONTHS` | ACA Compliance |
| `lifeInsuranceService.ts` | `MOCK_LIFE_PLANS`, `MOCK_ENROLLMENTS` | Life Insurance |
| `cobraService.ts` | 1 mock variable | COBRA |
| `acaErisaService.ts` | 4 mock variables | ACA/ERISA |
| `fmlaService.ts` | `MOCK_FMLA_REQUESTS`, `mockData` | FMLA |
| `assessmentService.ts` | 5 mock variables | Assessments |
| `jobDistributionService.ts` | 6 mock variables | Job Distribution |
| `deiHiringService.ts` | 5 mock variables | DEI Hiring |
| `internalMobilityService.ts` | 5 mock variables | Internal Mobility |
| `successionService.ts` | 3 mock variables | Succession |
| `learningCatalogService.ts` | 4 mock variables | Learning Catalog |
| `learningAnalyticsService.ts` | 7 mock variables | Learning Analytics |
| `complianceTrainingService.ts` | 5 mock variables | Compliance Training |
| `competency-library.service.ts` | 13 mock references | Competency Library |
| `complianceFrameworkService.ts` | 4 mock variables | Compliance Frameworks |
| `complianceAuditAnalyticsService.ts` | 9 mock variables | Compliance Audit |
| `dataGovernanceService.ts` | 4 mock variables | Data Governance |
| `laborComplianceService.ts` | `mockHours` | Labor Compliance |
| `policyManagementService.ts` | `MOCK_POLICIES`, `MOCK_ACKNOWLEDGEMENTS` | Policy Management |
| `communicationsService.ts` | 4 mock variables | Communications |
| `letterService.ts` | `MOCK_TEMPLATES`, `MOCK_REQUESTS` | Letters |
| `letterEngineService.ts` | `MOCK_TEMPLATES`, `MOCK_GENERATED` | Letter Engine |
| `reportGenerationService.ts` | `MOCK_HISTORY`, `MOCK_SCHEDULED` | Reporting |
| `accessCertificationService.ts` | 3 mock variables | Access Certification |
| `accessGovernanceService.ts` | 5 mock variables | Access Governance |
| `featureFlagService.ts` | `MOCK_AUDIT`, `MOCK_FLAGS` | Feature Flags |
| `customFieldsService.ts` | `MOCK_FIELDS`, `MOCK_VALUES` | Custom Fields |
| `multiEntityService.ts` | `MOCK_ENTITIES`, `MOCK_TRANSFERS` | Multi-Entity |
| `legalEntityService.ts` | `MOCK_ENTITIES`, `MOCK_TRANSFERS` | Legal Entity |
| `searchService.ts` | 3 mock variables | Enterprise Search |
| `helpdeskService.ts` | `MOCK_TICKETS`, `MOCK_KNOWLEDGE_BASE` | Helpdesk |
| `unionService.ts` | 5 mock variables | Union Management |
| `visaService.ts` | 3 mock variables | Visa/Immigration |
| `assetManagementService.ts` | `MOCK_ASSETS` | Asset Management |
| `aiGovernanceService.ts` | 7 mock variables | AI Governance |
| `aiService.ts` | 3 mock variables | AI Services |

### P2 Frontend Services

| File | Mock Variables | Module |
|------|---------------|--------|
| `providerDirectoryService.ts` | 3 mock variables | Provider Directory |
| `externalContentService.ts` | 4 mock variables | External Content |
| `wellnessService.ts` | 4 mock variables | Wellness |
| `surveyService.ts` | 2 mock variables | Surveys |
| `gamificationService.ts` | 6 mock variables | Gamification |
| `oneOnOneService.ts` | 2 mock variables | 1-on-1 Meetings |
| `mobileSecurityService.ts` | 2 mock variables | Mobile Security |
| `cloudInfraService.ts` | 4 mock variables | Cloud Infrastructure |
| `taskAggregatorService.ts` | 1 mock variable | Task Aggregator |
| `offlineService.ts` | 1 mock variable | Offline Support |
| `aiSchedulingService.ts` | 2 mock variables | AI Scheduling |
| `benchmarkingService.ts` | 4 mock variables | Benchmarking |
| `onaService.ts` | 7 mock variables | ONA |
| `peopleModelingService.ts` | 1 mock variable | People Modeling |

---

## Section 2: Dashboard Services

| File | Mock Pattern | Module | Priority |
|------|-------------|--------|----------|
| `apps/web/src/app/dashboard/recruitment/services.ts` | Hardcoded mock stats in catch block (totalRequisitions, applicationsBySource, etc.) | Recruitment Dashboard | P0 |
| `apps/web/src/app/dashboard/manager/services.ts` | 4 TODO stub methods returning hardcoded report data + mock JSON export | Manager Dashboard | P0 |

---

## Section 3: Backend Services (`apps/web/src/lib/services/`)

### P0 Backend Services

| File | Mock Pattern | Module |
|------|-------------|--------|
| `reporting/report.service.ts` | `generateMockData()` method — all reports return mock data | Reporting |
| `attendance/attendance.service.ts` | "DATABASE OPERATIONS (Stubs)" — all DB ops are stubs | Attendance |
| `leave/leave-accrual.service.ts` | "DATABASE OPERATIONS (Stubs)" — not connected to database | Leave Accrual |
| `employee/employee.service.ts` | "TODO: Implement when EmploymentHistory table is added" | Employee |
| `shift-management.service.ts` | "TODO: Actually swap the roster entries" | Shift Management |

### P1 Backend Services

| File | Mock Pattern | Module |
|------|-------------|--------|
| `agentic-ai/agent-framework.service.ts` | `mockQueryData()`, `mockCreateRecord()`, `mockGenerateReport()` | Agent Framework |
| `agentic-ai/recruitment-agent.service.ts` | `mockInterviews[]`, `mockCandidates[]` | Recruitment Agent |
| `agentic-ai/hr-agent.service.ts` | `mockRequests: LeaveRequest[]` | HR Agent |
| `agentic-ai/analytics-agent.service.ts` | "Generate mock trend data", "Mock anomaly detection" | Analytics Agent |
| `ai/job-board-integration.service.ts` | `mockApplications`, mock quality scores | Job Board |
| `ai/attrition.service.ts` | "DATA FETCHING (Stubs)" | Attrition Prediction |
| `engagement/dei.service.ts` | Multiple mock calculations | DEI Analytics |
| `compliance/labour-law.service.ts` | "return false as placeholder" | Labour Law |
| `search/enterprise-search.ts` | `seedMockData()` on module load | Enterprise Search |
| `bulk-operations/bulk-import-engine.ts` | "Minimal XLSX binary stub" | Bulk Import |

### P2 Backend Services

| File | Mock Pattern | Module |
|------|-------------|--------|
| `ai/interview-scheduler.service.ts` | "mock calculation" | Interview Scheduler |
| `engagement/wellness.service.ts` | "Mock data - in production would calculate from historical data" | Wellness |
| `engagement/esg.service.ts` | "Mock comprehensive ESG metrics" | ESG |
| `engagement/recognition.service.ts` | "Participation rate (mock)" | Recognition |
| `database/db-performance-monitor.ts` | "MOCK DATA GENERATORS" | DB Monitoring |

---

## Section 4: API Routes (`apps/web/src/app/api/`)

### P0 API Routes

**Payroll & Tax**
- `api/v1/tax-documents/route.ts` — `mockTaxDocuments`
- `api/v1/tax-documents/[id]/route.ts` — `mockTaxDocument`
- `api/v1/tax-documents/[id]/download/route.ts` — `mockPdfContent`
- `api/v1/payroll/pay-stubs/[id]/download/route.ts` — `mockPayStubData`, `generateMockPDF()`
- `api/v1/payroll/direct-deposit/verify/route.ts` — mock amounts
- `api/v1/payroll/approve/[runId]/route.ts` — "TODO: Implement actual approval logic"
- `api/v1/payroll/status/[runId]/route.ts` — "TODO: Implement actual status retrieval"

**Statutory**
- `api/v1/statutory/esi/returns/route.ts` — `mockESIReturn`
- `api/v1/statutory/pf/returns/route.ts` — `mockPFReturn`
- `api/v1/statutory/pt/calculations/route.ts` — `mockPTCalculation`
- `api/v1/compliance/india/esi/route.ts` — `mockSummary`
- `api/v1/compliance/india/pf/route.ts` — `mockSummary`
- `api/v1/compliance/india/tds/route.ts` — `mockSummary`

**Leave**
- `api/v1/leave/requests/[id]/approve/route.ts` — `mockApprovedLeave`
- `api/v1/leave/requests/[id]/reject/route.ts` — `mockRejectedLeave`

**Attendance**
- `api/attendance/field-force/route.ts` — `mockFieldVisits`
- `api/attendance/punch-rules/route.ts` — `mockPunchRules`
- `api/attendance/time-capture/route.ts` — `mockTimeCaptures`
- `api/attendance/comp-off/route.ts` — `mockCompOffs`
- `api/attendance/ip-restriction/route.ts` — `mockIPRestrictions`
- `api/attendance/geo-fencing/route.ts` — `mockGeoFences`
- `api/attendance/rules/route.ts` — `mockRules`
- `api/attendance/shift-swap/route.ts` — `mockSwaps`
- `api/attendance/roster/route.ts` — `mockRosters`
- `api/v1/attendance/biometric/verify/route.ts` — "Mock biometric verification"
- `api/v1/attendance/geofence/validate/route.ts` — "Mock geofence validation"

**Shifts & Overtime**
- `api/v1/shifts/open/route.ts` — `mockOpenShifts`
- `api/v1/shifts/patterns/route.ts` — `mockShiftPatterns`
- `api/v1/shifts/swaps/route.ts` — `mockSwapRequests`
- `api/v1/overtime/approvals/route.ts` — `mockApprovals`

**Benefits**
- `api/v1/benefits/plans/[id]/route.ts` — `mockPlanDetail`

**Documents & Dependents**
- `api/v1/documents/[id]/download/route.ts` — `mockFileContent`
- `api/v1/dependents/route.ts` — `mockDependents`
- `api/v1/dependents/[id]/route.ts` — `mockDependent`

**Auth**
- `api/auth/forgot-password/route.ts` — "TODO: Send email with reset link"
- `api/auth/password-reset/request/route.ts` — "TODO: Send password reset email"
- `api/auth/oauth/okta/route.ts` — "TODO: Store state in session"

**Compensation**
- `api/compensation/salary-components/route.ts` — "return mock created response"
- `api/compensation/increment-cycles/route.ts` — "return mock"

**Integrations**
- `api/v1/integrations/slack/oauth/callback/route.ts` — `xoxb-mock-token`
- `api/v1/integrations/teams/oauth/callback/route.ts` — `eyJ0-mock-teams-token`

### P1 API Routes

**Benefits**
- `api/v1/benefits/providers/route.ts`, `nearby/route.ts`, `[npi]/route.ts` — mock providers
- `api/v1/benefits/formulary/route.ts` — mock formulary
- `api/v1/benefits/cobra/*` — 5 route files with mock COBRA data
- `api/v1/benefits/compliance/nondiscrimination/route.ts` — mock test result

**Admin**
- `api/v1/admin/assets/route.ts` — `mockAssets`
- `api/v1/admin/policies/route.ts`, `[id]/route.ts`, `acknowledgements/route.ts` — mock policies
- `api/v1/admin/access-certifications/route.ts`, `[id]/reviews/route.ts` — mock campaigns

**Compliance**
- `api/v1/compliance/emiratisation/route.ts` — mock Saudization
- `api/v1/compliance/labor/meal-breaks/route.ts` — mock violation detection
- `api/v1/leave/encash/route.ts` — placeholder daily rate

**Attendance**
- `api/attendance/work-from-home/route.ts` — `mockWFH`
- `api/attendance/time-rounding/route.ts` — `mockRoundingRules`

**Scheduling**
- `api/v1/scheduling/generate/route.ts` — mock AI-generated schedule
- `api/v1/scheduling/what-if/route.ts` — mock analysis

**HR & Succession**
- `api/v1/hr/succession/route.ts` — mock successors
- `api/v1/hr/succession/nine-box/route.ts` — mock performance scores

**Webhooks**
- `api/v1/webhooks/[id]/route.ts` — `mockWebhookDetails`
- `api/v1/webhooks/[id]/logs/route.ts` — `mockDeliveryLogs`

**AI**
- `api/ai/attrition/route.ts` — mock summary
- `api/ai/org-health/route.ts` — mock org health data
- `api/ai/chatbot/route.ts` — mock intent detection
- `api/ai-automation/org-health/route.ts` — mock data

**Industry**
- `api/industry-manufacturing/*` — 13 route files using shared `data.ts` mock
- `api/industry-aviation/*` — 5 route files with mock data
- `api/industry-healthcare/*` — 3 route files with in-memory mock
- `api/industry-retail/*` — 1 route file with mock
- `api/core-hr/document-templates/route.ts` — empty array placeholder
- `api/core-hr/mass-updates/route.ts` — empty array placeholder

**GraphQL**
- `api/v1/graphql/route.ts` — "TODO: Import actual services"

---

## Section 5: Mobile App

| File | Mock Variables | Module | Priority |
|------|---------------|--------|----------|
| `apps/mobile/src/screens/Paystubs.tsx` | `mockPaystubs` | Paystubs | P0 |
| `apps/mobile/src/screens/Approvals.tsx` | `mockApprovals` | Approvals | P0 |
| `apps/mobile/src/screens/Notifications.tsx` | `mockNotifications` | Notifications | P0 |
| `apps/mobile/src/screens/Directory.tsx` | `mockEmployees` | Directory | P0 |
| `apps/mobile/src/screens/notifications/NotificationsScreen.tsx` | `mockNotifications` | Notifications v2 | P0 |
| `apps/mobile/src/screens/performance/PerformanceScreen.tsx` | "Mock data for goals" | Performance | P1 |

---

## Section 6: Queue/Job Files

| File | Mock Pattern | Module | Priority |
|------|-------------|--------|----------|
| `apps/web/src/lib/queue/queue.service.ts` | `tenantId: 'default'` TODO | Queue Service | P0 |
| `apps/web/src/lib/queue/jobs/payroll.job.ts` | `getEmployeesForPayroll()` returns mock Array(50), `calculateEmployeePayroll()` entirely mock | Payroll Jobs | P0 |
| `apps/web/src/lib/queue/jobs/report.job.ts` | 5 mock data fetch functions, mock Excel/PDF generators, mock upload URL | Report Jobs | P0 |

---

## Section 7: Export/Audit/Reporting Backend

| File | Mock Pattern | Module | Priority |
|------|-------------|--------|----------|
| `apps/web/src/lib/audit/audit.service.ts` | `search()` returns empty, `getResourceAuditTrail()` returns `[]`, `getUserActivity()` returns `[]`, `generateComplianceReport()` returns zeros | Audit Service | P0 |
| `apps/web/src/lib/export/export.service.ts` | 3 mock data fetch functions, mock Excel/PDF generators, mock upload URL | Export Service | P0 |
| `apps/web/src/lib/services/reporting/report.service.ts` | `generateMockData()` for all reports | Reporting Service | P0 |

---

## Workstream Mapping

| Workstream | P0 Files | P1 Files | P2 Files |
|-----------|---------|---------|---------|
| Core Service Completion | 18 frontend + 2 dashboard + 5 backend + 6 API routes | 45 frontend + 35 API routes | 14 frontend + 3 API routes |
| Leave Engine | 1 backend service + 3 API routes | 1 API route | 0 |
| Attendance | 3 frontend + 1 backend + 12 API routes | 2 API routes | 0 |
| Payroll Engine | 2 frontend + 1 job file + 7 API routes | 0 | 0 |
| Recruitment | 1 frontend + 1 dashboard | 4 frontend | 0 |
| Export & Reporting | 2 backend + 1 job file | 2 frontend | 0 |
| Audit & Compliance | 1 backend | 4 frontend + 2 backend | 0 |
| Employee Lifecycle | 1 backend | 0 | 0 |
| Mobile Integration | 5 screens | 1 screen | 0 |

---

## Burn-Down Tracking

This section should be updated as mock data is replaced.

### Phase 0-1 (Weeks 1-4): Target P0 items in Core Service, Audit, Lifecycle
- [ ] Universal mock registry disabled in production paths
- [ ] Priority frontend services replaced (attendance, approvals, documents, benefits, directory)
- [ ] Audit service connected to Prisma
- [ ] Employee lifecycle history table created
- [ ] Database indexes added

### Phase 2 (Weeks 5-11): Target P0 items in Leave, Attendance, Payroll
- [ ] Leave accrual service connected to database
- [ ] Leave approval/rejection routes operational
- [ ] Attendance backend stubs replaced
- [ ] Attendance API routes operational
- [ ] Payroll job processing real
- [ ] Tax document routes operational
- [ ] Statutory compliance routes operational

### Phase 3 (Weeks 12-14): Target P0 items in Recruitment, Export
- [ ] Recruitment service mock replaced
- [ ] Report and export services connected to real data
- [ ] Report job file operational

### Phase 4 (Weeks 15-16): Target P0 items in Mobile
- [ ] All 5 priority mobile screens API-backed

---

## Related Documents

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Claude Planning Packet](./CLAUDE-PLANNING-PACKET.md)
