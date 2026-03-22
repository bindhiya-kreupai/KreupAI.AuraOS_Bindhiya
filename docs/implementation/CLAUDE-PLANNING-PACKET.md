# AuraOS Feature-Completion Program — Claude Planning Packet

**Document Version**: 1.0
**Last Updated**: March 22, 2026
**Owner**: Claude (Planning Agent)
**Status**: Week 1-2 Planning Complete
**Program Duration**: 16 weeks

---

## Quick Navigation

1. [Mock Inventory](./MOCK-INVENTORY.md)
2. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
3. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
4. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)
5. [AI Agent Work Split](./AI-AGENT-WORKSPLIT.md)
6. [AI Agent Execution Playbook](./AI-AGENT-EXECUTION-PLAYBOOK.md)
7. [Schema Gap Assessment](./SCHEMA-GAP-ASSESSMENT.md)
8. [Audit Schema Design](./AUDIT-SCHEMA-DESIGN.md)
9. [Lifecycle Schema Design](./LIFECYCLE-SCHEMA-DESIGN.md)
10. [Mock Registry Remediation Plan](./MOCK-REGISTRY-REMEDIATION-PLAN.md)
11. [Week 2 Copilot Handoff](./WEEK2-COPILOT-HANDOFF.md)
12. [Audit Coverage Map](./AUDIT-COVERAGE-MAP.md)
13. [Test Strategy — Audit + Lifecycle](./TEST-STRATEGY-AUDIT-LIFECYCLE.md)
14. [Review Gates 2A + 3A](./REVIEW-GATES-2A-3A.md)
15. [Gate 2A Review Report](./GATE-2A-REVIEW-REPORT.md)
16. [Leave Engine Planning](./LEAVE-ENGINE-PLANNING.md)
17. [Attendance Completion Planning](./ATTENDANCE-COMPLETION-PLANNING.md)
18. [Payroll Engine Planning](./PAYROLL-ENGINE-PLANNING.md)
19. [Recruitment Completion Planning](./RECRUITMENT-COMPLETION-PLANNING.md)
20. [Export & Reporting Planning](./EXPORT-REPORTING-PLANNING.md)
21. [Mobile Integration Planning](./MOBILE-INTEGRATION-PLANNING.md)
22. [Gate 3A Review Report](./GATE-3A-REVIEW-REPORT.md)

---

## 1. Executive Assessment

### Program Readiness: READY TO START

Documentation is internally consistent and well-structured across all 21 source documents. All 9 workstreams are at "Not Started" status. Two QA report prerequisites (GAP-001: refresh token, GAP-002: DB-backed roles) have already been resolved.

**Critical finding**: The mock inventory (produced during this planning session) revealed **420+ mock patterns across 182 files**, including a universal catch-all mock handler that silently serves fake data for any unmatched API request. This is significantly larger than initially estimated.

### Top 5 Risks

| # | Risk | Impact |
|---|------|--------|
| R1 | Hidden mock fallbacks persist after backend replacement — universal mock registry masks missing APIs | High |
| R2 | Payroll statutory scope creep across UAE/KSA/India | High |
| R3 | Audit foundation not ready in time for downstream consumers | High |
| R4 | Mock inventory scale (420+ items) may pressure the 16-week timeline | Medium |
| R5 | Mobile depends on all other workstreams completing on time with no buffer | Medium |

### Top 5 Sequencing Constraints

| # | Constraint |
|---|-----------|
| S1 | Audit must be operational by end of Week 3 |
| S2 | Core service completion must precede leave and attendance |
| S3 | Leave and attendance must precede payroll |
| S4 | API contracts must be locked before mobile starts (Week 14) |
| S5 | Employee lifecycle schema must be approved before event hooks |

---

## 2. Pre-Implementation Findings

### Already Resolved (No Action Needed)

| Item | Evidence |
|------|----------|
| GAP-001: Refresh token endpoint | `apps/web/src/app/api/auth/refresh/route.ts` exists and is fully implemented |
| GAP-002: DB-backed roles | `Role`, `UserRole`, `Permission`, `RolePermission` models exist in schema. Enhanced middleware queries DB. Role management APIs exist at `/api/roles/`. |
| BaseService class | Exists at `apps/web/src/lib/services/base.service.ts` |
| Dashboard service migration | 66 of 67 dashboard service files already use APIClient pattern |

### Schema Readiness (Verified Post-Planning)

**Critical finding**: The Prisma schema (6,085 lines) is **far more complete than initially estimated**. 6 of 9 workstreams require ZERO schema changes.

| Workstream | Schema Status | Models Found |
|------------|--------------|-------------|
| Core Services | COMPLETE | 12+ (Employee, Department, Position, Company, Document, Benefits, etc.) |
| Leave Engine | COMPLETE | 8 (LeavePolicy, LeaveBalance, LeaveRequest, LeaveAccrual, LeaveCarryForward, LeaveEncashment, etc.) |
| Attendance | COMPLETE | 8+ (AttendancePunch, AttendanceRecord, Shift, ShiftAssignment, ShiftRoster, ShiftSwap, Overtime, Regularization) |
| Payroll | COMPLETE | 10+ models + 13 compliance models (WPS/GOSI/PF/ESI/TDS for UAE/KSA/India) |
| Recruitment | COMPLETE | 10 (JobRequisition, Candidate, CandidateApplication, Interview, Feedback, Offer, BackgroundCheck, Onboarding) |
| Employee Lifecycle | COMPLETE | 9 (EmploymentHistory, InterCompanyTransfer, EmployeeLifeEvent, ExitRequest, ProbationTracking, etc.) |
| Audit | PARTIAL | 3 models exist but AuditService does NOT persist to DB (Redis-only). Enhancement needed. |
| Export/Reporting | PARTIAL | 5 models exist but no dedicated ExportJob model. |
| Mobile | MISSING | 0 dedicated models. Minimum 3 new models needed. |

**Implication**: The program's primary gap is in the **service layer** connecting existing models to real API endpoints — not in schema design. Implementation can begin immediately for 6 workstreams.

See [Schema Gap Assessment](./SCHEMA-GAP-ASSESSMENT.md) for full analysis.

### Critical Service-Layer Discovery

1. **AuditService** (`apps/web/src/lib/audit/audit.service.ts`): Has `// TODO: Implement with Prisma` comments. Writes only to Redis (7-day TTL). All query methods return empty data. See [AUDIT-SCHEMA-DESIGN.md](./AUDIT-SCHEMA-DESIGN.md).
2. **BaseService.createAuditLog()**: Field mapping bug — writes `module` field that doesn't exist in AuditLog schema (has `entityType`).
3. **Universal Mock Registry**: Unauthenticated catch-all with zero environment gating. See [MOCK-REGISTRY-REMEDIATION-PLAN.md](./MOCK-REGISTRY-REMEDIATION-PLAN.md).

### Still Needs Work

| Item | Status |
|------|--------|
| Universal mock registry (`mock-registry.ts` + `[...route]/route.ts`) | Active — silently masks missing APIs |
| 77 frontend service files with mock arrays | Active — returning static data |
| 70+ API route files with mock patterns | Active — returning fake responses |
| 5 mobile screens with hardcoded mock arrays | Active |
| Audit service stubs | Returns empty arrays and zeros |
| Export service stubs | Returns mock data and fake file URLs |
| Leave accrual database stubs | Not connected to Prisma |
| Payroll job processing | Entirely mock calculations |
| Missing database indexes (GAP-010) | Not yet added |

---

## 3. Workstream Scope Confirmation

### WS-1: Core Service Completion (Weeks 1-4, Critical)

**Objective**: Replace mock-backed services with real, tenant-scoped, database-backed implementations.

**In scope**: Employee, Directory, Approvals, Documents, Benefits, Attendance, Shifts, Workflow, Tenant services; mock inventory and burn-down; shared DTO normalization; universal mock registry remediation.

**Out of scope**: Deep payroll/leave/attendance business logic; UI redesigns; auth flow rewrites; AI/ML features.

**Acceptance criteria**:
1. Mock inventory document exists and is tracked
2. Universal mock registry disabled in production paths
3. Priority module read paths return database data
4. Priority module write paths persist to database and emit audit events
5. Shared DTO shapes documented
6. No `return mockXxx` in production paths for priority modules
7. Tenant isolation verified in every new/updated query
8. Integration tests exist for each replaced service path

### WS-2: Leave Engine Completion (Weeks 5-6, Critical)

**Objective**: Make leave balance behavior deterministic and policy-driven through an authoritative ledger.

**In scope**: Policy model normalization, monthly accrual, leave balance ledger (transaction-based), carry-forward/expiry, encashment, negative balance, deduction on approval, reversal on cancellation, country/policy-specific rules.

**Out of scope**: AI leave analytics, interactive calendar UI, third-party leave connectors.

**Acceptance criteria**:
1. Balances derived from stored ledger transactions
2. Monthly accrual job persists durable entries
3. Approved leave produces deduction; cancellation produces reversal
4. Carry-forward and expiry automated at year-end
5. Reconciliation tool rebuilds balance from history
6. No leave production path returns stubbed values

### WS-3: Attendance Completion (Weeks 7-8, High)

**Objective**: Replace mock attendance with persisted punches, daily calculations, regularization, biometric ingestion, and shift-swap transactions.

**In scope**: Punch persistence, daily attendance calculation, regularization, overtime, biometric ingestion, geo-validation, shift swap (with roster update), anomaly detection.

**Out of scope**: Facial recognition AI, custom hardware drivers, offline mobile attendance, advanced roster UI.

**Acceptance criteria**:
1. Attendance derives from persisted punch data
2. Daily records computed from grouped punches + shift assignments
3. Regularization modifies authoritative records with audit trail
4. Shift swaps update roster transactionally
5. Biometric events ingested and deduplicated
6. Overtime computed from shift + actual hours

### WS-4: Payroll Engine Completion (Weeks 9-11, Critical)

**Objective**: Real payroll engine with employee-level calculation persistence, statutory logic for UAE/KSA/India, payslips, approvals, and reconciliation.

**In scope**: Payroll run lifecycle, 12-stage calculation pipeline, UAE rules, KSA rules, India baseline rules, payslip generation, approval workflow, reconciliation reports, fixture validation.

**Out of scope**: WPS/GOSI portal submission (file generation only), Form 16, additional GCC countries, non-salaried workers.

**Acceptance criteria**:
1. Payroll runs use real employee/attendance/leave data
2. Employee calculations stored and reproducible
3. Country fixtures pass for UAE, KSA, India
4. Payslips generated from persisted results
5. Approval workflow operational
6. Decimal-safe arithmetic throughout
7. Finalized runs locked against mutation

### WS-5: Recruitment Completion (Weeks 12-13, High)

**Objective**: End-to-end recruitment from requisition through offers and analytics.

**In scope**: Requisitions, candidates, pipeline stages, interviews, scorecards, offers, resume ingestion boundary, analytics.

**Out of scope**: AI resume parsing implementation, AI scoring, career portal, video interview, background verification.

**Acceptance criteria**:
1. Pipeline state is durable and auditable
2. Stage transitions follow defined rules
3. Interviews/scorecards persisted
4. Offers have real lifecycle
5. Analytics endpoints query-backed
6. No mock datasets in production paths

### WS-6: Export and Reporting Completion (Week 14, High)

**Objective**: Query-backed, auditable export/reporting pipeline.

**In scope**: Query-backed exports, CSV/Excel/PDF generation, async jobs, object storage, export metadata, audit integration.

**Out of scope**: Dashboard builder, scheduled email reports, ClickHouse, custom KPIs.

**Acceptance criteria**:
1. Exports from authoritative queries
2. Real file generators (not placeholder text)
3. Large exports async with status tracking
4. Files in real object storage with signed URLs
5. Export history persisted
6. Export actions audited

### WS-7: Audit and Compliance Completion (Weeks 2-3, Critical)

**Objective**: Durable, queryable, tenant-scoped audit logging.

**In scope**: Persistent audit writes, search API, resource history, user activity, compliance reporting, retention/archival, access controls.

**Out of scope**: Real-time anomaly detection, SIEM, threat detection, automated compliance scanning.

**Acceptance criteria**:
1. Critical writes persist audit events
2. Search returns real stored data
3. Resource history reconstructable
4. Compliance reports meaningful
5. Audit reads permission-controlled
6. Records immutable through admin flows

### WS-8: Employee Lifecycle History (Weeks 3-4, High)

**Objective**: First-class employee lifecycle timeline model.

**In scope**: Employment history schema, 14 event types, event hooks, backfill, timeline API, UI integration, audit linkage.

**Out of scope**: Predictive career analysis, skills ontology, performance history.

**Acceptance criteria**:
1. New history table exists with required fields
2. Employee changes emit lifecycle events via service hooks
3. Existing employees have baseline history from backfill
4. Backfilled events marked distinctly
5. Timeline API filterable by type and date
6. All events tenant-scoped and auditable

### WS-9: Mobile Integration Completion (Weeks 15-16, High)

**Objective**: Priority mobile screens on real APIs.

**In scope**: Auth/session, paystubs, directory, approvals, notifications, performance, error handling, crash monitoring.

**Out of scope**: Native app development, GPS attendance, offline mode, face recognition, full web parity.

**Acceptance criteria**:
1. Priority screens load real tenant-scoped data
2. Write actions persist through same backend as web
3. Sessions handled with token refresh
4. No priority screen reads from mock arrays
5. Error states distinguish auth/empty/network failures

---

## 4. Cross-Workstream Decisions Needed

### API Contract Decisions

| # | Decision | By When |
|---|----------|---------|
| D1 | Confirm shared list response shape applies universally | Week 1 |
| D2 | Mutation response: full resource vs summary | Week 1 |
| D3 | Leave balance API: separate balance/ledger endpoints | Week 5 |
| D4 | Payroll payslip mobile payload: `?fields=summary` parameter | Week 9 |
| D5 | Recruitment stage definitions: configurable per tenant | Week 12 |

### Schema Decisions

| # | Decision | By When |
|---|----------|---------|
| S1 | Leave balance ledger table design | Week 4 |
| S2 | Employee lifecycle history table design | Week 2 |
| S3 | Payroll result persistence model | Week 8 |
| S4 | Audit log archival table structure | Week 2 |
| S5 | Missing database indexes (GAP-010) | Week 1 |

---

## 5. 16-Week Execution View

### Phase 0: Weeks 1-2 (Setup + Shared Foundations)

| Week | Objective | Claude | Copilot |
|------|-----------|--------|---------|
| 1 | Mock inventory + core service start | Produce mock inventory, confirm scope, Week 1 handoff | Core service read-path replacements, add DB indexes |
| 2 | Audit foundation + shared contracts | Audit planning, schema design | Audit persistence baseline, continue core services |

### Phase 1: Weeks 3-4 (Core Data + Control Plane)

| Week | Objective | Claude | Copilot |
|------|-----------|--------|---------|
| 3 | Audit operational + lifecycle baseline | Lifecycle planning, audit review | Lifecycle schema + hooks, audit search API |
| 4 | Core service operational | Core service review | Core write paths, lifecycle backfill |

### Phase 2: Weeks 5-11 (Workforce Operations)

| Week | Objective | Claude | Copilot |
|------|-----------|--------|---------|
| 5 | Leave engine start | Leave planning, policy scope | Leave ledger, accrual engine |
| 6 | Leave engine close | Leave review | Carry-forward, deduction/reversal |
| 7 | Attendance start | Attendance planning, shift model | Punch persistence, daily processor |
| 8 | Attendance close | Attendance review | Biometric, shift swap, anomalies |
| 9 | Payroll start | Payroll planning, scope freeze | Payroll lifecycle, calculation pipeline |
| 10 | Payroll validation | Payroll review | UAE + KSA rules, payslips |
| 11 | Payroll close | Final payroll review | India rules, reconciliation |

### Phase 3: Weeks 12-14 (Talent + Information Delivery)

| Week | Objective | Claude | Copilot |
|------|-----------|--------|---------|
| 12 | Recruitment start | Recruitment planning | Requisition/candidate/pipeline |
| 13 | Recruitment close | Recruitment review | Offers, analytics |
| 14 | Export/reporting | Export planning + review | Query-backed exports, generators |

### Phase 4: Weeks 15-16 (Mobile + Release)

| Week | Objective | Claude | Copilot |
|------|-----------|--------|---------|
| 15 | Mobile start | Mobile planning, API verification | Replace mock screens |
| 16 | Mobile close + sign-off | Release readiness review | Error handling, crash monitoring |

### Claude Review Gates (12 total)

| Gate | Week | Requirement |
|------|------|-------------|
| 2A | 2 | Audit schema approved |
| 3A | 3 | Audit persistence verified |
| 4A | 4 | Core services off mock data |
| 4B | 4 | Audit coverage for critical writes |
| 6A | 6 | Leave balances authoritative |
| 8A | 8 | Attendance from persisted punches |
| 9A | 9 | Payroll country scope frozen |
| 11A | 11 | Country fixture tests pass |
| 11B | 11 | Decimal precision verified |
| 11C | 11 | Audit coverage verified |
| 13A | 13 | Recruitment operational |
| 14A/B | 14 | Exports authoritative + contracts frozen |
| 16A/B/C | 16 | Mobile off mocks + release gates pass |

---

## 6. Week 1 Copilot Handoff

### Scope Boundary

| # | Task | Files | Acceptance |
|---|------|-------|------------|
| 1 | Add missing database indexes | `packages/@aura/database/prisma/schema.prisma` | Indexes for User, Employee, UserSession, AuditLog, Attendance, Leave |
| 2 | Replace attendanceService.ts mock data | `apps/web/src/services/attendanceService.ts` | Remove MOCK_* arrays, use APIClient pattern |
| 3 | Replace approvalService.ts mock data | `apps/web/src/services/approvalService.ts` | Remove MOCK_REQUESTS, audit on write actions |
| 4 | Replace documentService.ts mock data | `apps/web/src/services/documentService.ts` | Remove MOCK_DOCUMENTS/FOLDERS |
| 5 | Replace benefitsService.ts mock data | `apps/web/src/services/benefitsService.ts` | Remove MOCK_PLANS/DEPENDENTS/ENROLLMENT_WINDOW |
| 6 | Replace directoryService.ts mock data | `apps/web/src/services/directoryService.ts` | Remove MOCK_EMPLOYEES/DEPARTMENTS/LOCATIONS |
| 7 | Add integration tests | `apps/web/src/__tests__/` | Tenant isolation + permission enforcement per module |

### Deferred Items

- recruitmentService.ts (Week 12)
- Leave accrual (Week 5)
- Payroll jobs (Week 9)
- Mobile screens (Week 15)
- Audit schema design (Week 2)
- Export service (Week 14)

### Required Reading

1. CLAUDE.md
2. .github/copilot-instructions.md
3. docs/implementation/GUIDE-CORE-SERVICE-COMPLETION.md
4. docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md
5. docs/implementation/MOCK-INVENTORY.md
6. This document (Section 6)

---

## 7. Open Questions

| # | Question | Affects | By When |
|---|----------|---------|---------|
| Q1 | Who performs product sign-off for each phase? | All | Week 1 |
| Q2 | Are leave policy rules defined for UAE/KSA/India? | Leave | Week 4 |
| Q3 | Are statutory rates confirmed by compliance? | Payroll | Week 8 |
| Q4 | Is object storage configured in dev/staging? | Export | Week 12 |
| Q5 | What shift model exists in Prisma schema? | Attendance | Week 6 |
| Q6 | Are there existing employees needing lifecycle backfill? | Lifecycle | Week 2 |
| Q7 | Expected payroll run concurrency requirements? | Payroll | Week 8 |
| Q8 | Do existing Pact contract tests cover modified APIs? | All | Week 1 |

### Assumptions

1. Dashboard service files (66/67) with APIClient are connected to real backend APIs
2. Prisma schema has models for most entities being worked on
3. Redis is available in dev/staging
4. Timeline starts after planning packet approval
5. Copilot has full repo access and can run tests locally
6. Statutory rates are indicative until compliance confirms
7. No parallel refactoring/migration work will cause conflicts

---

## Related Documents

1. [Mock Inventory](./MOCK-INVENTORY.md)
2. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
3. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
4. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)
5. [AI Agent Work Split](./AI-AGENT-WORKSPLIT.md)
6. [AI Agent Execution Playbook](./AI-AGENT-EXECUTION-PLAYBOOK.md)
7. [AI Agent Workstream Prompts](./AI-AGENT-WORKSTREAM-PROMPTS.md)
8. [Schema Gap Assessment](./SCHEMA-GAP-ASSESSMENT.md)
9. [Audit Schema Design](./AUDIT-SCHEMA-DESIGN.md)
10. [Lifecycle Schema Design](./LIFECYCLE-SCHEMA-DESIGN.md)
11. [Mock Registry Remediation Plan](./MOCK-REGISTRY-REMEDIATION-PLAN.md)
12. [Week 2 Copilot Handoff](./WEEK2-COPILOT-HANDOFF.md)
