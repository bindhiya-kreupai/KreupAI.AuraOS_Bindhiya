# Payroll Engine Completion — Claude Planning Document

**Document Version**: 1.0
**Last Updated**: March 22, 2026
**Owner**: Claude (Planning Agent)
**Workstream**: WS-2 Payroll Engine Completion (Weeks 9-11)
**Status**: Planning Complete — Ready for Copilot Handoff

---

## Quick Navigation

1. [Payroll Engine Guide](./GUIDE-PAYROLL-ENGINE-COMPLETION.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)
4. [Audit Coverage Map](./AUDIT-COVERAGE-MAP.md)

---

## 1. Executive Assessment

### Readiness: ARCHITECTURALLY SOUND — CRITICAL WIRING GAPS

Payroll has the most comprehensive schema in the codebase (25+ models) and significant calculation logic already written. The primary gap is the **disconnect between calculation logic and real data** — the engine exists but runs on empty/mock inputs.

| Area | Status | Detail |
|------|--------|--------|
| Prisma Schema | COMPREHENSIVE | 8 core models (PayrollRun, Payslip, SalaryStructure, etc.) + 13 statutory models (WPS 4, GOSI 3, India PF 3, India ESI 3, TDS 2) + 6 enums |
| CRUD Service | PRODUCTION-READY | `payroll.service.ts` (414 lines) — real Prisma queries for runs, structures, declarations, benefits, adjustments, payslips |
| Calculation Engine | LOGIC COMPLETE, DATA STUB | `payroll/payroll.service.ts` (951 lines) — full multi-country calculation with UAE, KSA, India statutory. **`getEmployeesToProcess()` returns `[]`** |
| Fastify Microservice | MOCK DATA | `services/payroll-service/` — standalone engine with MOCK_PAYROLL_RUNS, MOCK_EMPLOYEE_RESULTS |
| V1 API Routes | MIXED | 20+ routes — run CRUD is real; calculation/approval/status/download routes have TODOs |
| Legacy API Routes | REAL | `/api/payroll` with real Prisma queries |
| Frontend Dashboard | COMPREHENSIVE | 15+ modules (processing, reconciliation, reports, payslips, tax, statutory, compliance) |
| Statutory Services | LOGIC COMPLETE | WPS SIF generation, GOSI contributions, India PF/ESI/TDS — exist in microservice |
| Payroll Job | ENTIRELY MOCK | `payroll.job.ts` (269 lines) — 4 TODO comments, returns mock calculations |
| Tests | PRESENT | Unit, integration, E2E, performance, contract tests exist |
| Audit Logging | ZERO | No audit logging in any payroll service or route |

### Top Risk: Scope Creep

Payroll is the largest workstream. The guide specifies 3 countries (UAE, KSA, India) but the codebase has placeholders for Bahrain, Oman, Kuwait, and Qatar. **Scope must be frozen to UAE, KSA, India for release.**

---

## 2. Architecture Decision: Service Layer Integration

There are **3 separate payroll service layers** that need alignment:

| Layer | Location | Purpose | Status |
|-------|----------|---------|--------|
| CRUD Service | `apps/web/src/lib/services/payroll.service.ts` | Run/structure/adjustment CRUD | Real Prisma |
| Calculation Engine | `apps/web/src/lib/services/payroll/payroll.service.ts` | Multi-country calculation | Logic complete, data stub |
| Fastify Microservice | `services/payroll-service/` | Standalone engine + statutory services | Mock data, comprehensive statutory logic |

### Recommended Integration Path

1. **Wire the Calculation Engine** (`payroll/payroll.service.ts`) to real Prisma data by implementing `getEmployeesToProcess()`
2. **Wire the Payroll Job** to call the Calculation Engine (not the Fastify microservice)
3. **Keep statutory services** in the Fastify microservice as-is — they're called after payroll calculation for compliance filing
4. **V1 routes** call the CRUD Service for state management and the Calculation Engine for processing

This avoids a large refactor while connecting the existing logic to real data.

---

## 3. Scope Confirmation

### In Scope (Release — Weeks 9-11)

| # | Feature | Current State | Work Required | Priority |
|---|---------|---------------|---------------|----------|
| 1 | Wire `getEmployeesToProcess()` to Prisma | Returns empty `[]` | Implement real query joining Employee + SalaryStructure | P0 |
| 2 | Wire payroll job to real calculation engine | 4 TODO comments, mock calculations | Connect to `PayrollService.processPayroll()` | P0 |
| 3 | Persist calculation results to Payslip table | Calculations return in-memory objects | Add `prisma.payslip.create()` after calculation | P0 |
| 4 | Wire approval route | TODO: "Implement actual approval logic" | State transition CALCULATED → APPROVED with validation | P0 |
| 5 | Wire status route | TODO: "Implement actual status retrieval" | Real Prisma query for run status | P0 |
| 6 | Wire payslip download | `generateMockPDF()` | Real PDF generation from Payslip data | P1 |
| 7 | Wire tax document routes (3 routes) | `mockTaxDocuments`, `mockPdfContent` | Real Prisma query + PDF | P1 |
| 8 | Wire statutory compliance routes (6 routes) | `mockESIReturn`, `mockPFReturn`, `mockPTCalculation`, `mockSummary` | Real queries against statutory models | P1 |
| 9 | Wire direct deposit verification | Mock amounts | Real bank account validation | P2 |
| 10 | Add audit logging to all payroll write paths | Zero coverage | Wire audit middleware/inline calls | P1 |
| 11 | UAE WPS submission workflow | WPS SIF generation exists in microservice | Connect to payroll run → WPS submission pipeline | P1 |
| 12 | KSA GOSI submission workflow | GOSI service exists in microservice | Connect to payroll run → GOSI filing pipeline | P1 |
| 13 | India statutory filing workflow | PF/ESI/TDS services exist in microservice | Connect to payroll run → statutory filing pipeline | P1 |
| 14 | Leave/attendance data integration | Not fetched in calculation | Add leave days + overtime hours to payroll input assembler | P1 |

### Out of Scope (Deferred)

| # | Feature | Reason |
|---|---------|--------|
| 1 | Bahrain, Oman, Kuwait, Qatar statutory compliance | Non-release countries; defer to post-launch |
| 2 | Form 16 PDF generation | PDF rendering infrastructure deferred; data preparation is in scope |
| 3 | Bank file generation (NEFT/RTGS) | Bank-specific formats require external specification |
| 4 | NPS (National Pension Scheme) contributions | India-specific, lower priority |
| 5 | Ramadan working hours adjustment | Complex policy; handled via shift configuration |
| 6 | Advanced reconciliation reporting | Basic employee-level reconciliation is in scope |
| 7 | Payroll reversal implementation | Exists in microservice but needs testing; defer to post-release |

### Country Scope Freeze

| Country | Release Scope | Statutory |
|---------|--------------|-----------|
| UAE | Full payroll + WPS | WPS SIF file generation and submission |
| KSA | Full payroll + GOSI | GOSI pension/SANED contribution + submission |
| India | Full payroll + PF/ESI/TDS/PT | PF ECR, ESI challan, TDS calculation, Professional Tax |

**Gate 9A enforces this scope freeze.** No new countries added during Weeks 9-11.

---

## 4. File and Module Impact Map

### Files Requiring Changes

#### P0 — Critical Engine Wiring

| File | Change |
|------|--------|
| `apps/web/src/lib/services/payroll/payroll.service.ts` (line ~886) | Implement `getEmployeesToProcess()` with real Prisma query |
| `apps/web/src/lib/queue/jobs/payroll.job.ts` | Replace 4 TODO stubs with real service calls |
| `apps/web/src/app/api/v1/payroll/approve/[runId]/route.ts` | Implement real approval logic with state validation |
| `apps/web/src/app/api/v1/payroll/status/[runId]/route.ts` | Implement real status retrieval |
| `apps/web/src/app/api/v1/payroll/runs/[id]/calculate/route.ts` | Wire to calculation engine with result persistence |
| `apps/web/src/app/api/v1/payroll/runs/[id]/finalize/route.ts` | Validate state before finalization |

#### P1 — Statutory + Audit + Downloads

| File | Change |
|------|--------|
| `apps/web/src/app/api/v1/payroll/pay-stubs/[id]/download/route.ts` | Real PDF generation from Payslip data |
| `apps/web/src/app/api/v1/tax-documents/route.ts` | Replace mock with real Prisma query |
| `apps/web/src/app/api/v1/tax-documents/[id]/route.ts` | Replace mock with real query |
| `apps/web/src/app/api/v1/tax-documents/[id]/download/route.ts` | Replace mock PDF |
| `apps/web/src/app/api/v1/statutory/esi/returns/route.ts` | Replace mock with real IndiaESISubmission query |
| `apps/web/src/app/api/v1/statutory/pf/returns/route.ts` | Replace mock with real IndiaPFSubmission query |
| `apps/web/src/app/api/v1/statutory/pt/calculations/route.ts` | Replace mock with real calculation |
| `apps/web/src/app/api/v1/compliance/india/esi/route.ts` | Replace mock summary with real aggregation |
| `apps/web/src/app/api/v1/compliance/india/pf/route.ts` | Replace mock summary with real aggregation |
| `apps/web/src/app/api/v1/compliance/india/tds/route.ts` | Replace mock summary with real aggregation |
| `apps/web/src/lib/services/payroll.service.ts` | Add `createAuditLog()` to write methods |
| `apps/web/src/lib/services/payroll/payroll.service.ts` | Add audit logging to processPayroll |
| All v1 payroll write routes | Wire audit middleware |

### Files NOT Requiring Changes

| File | Reason |
|------|--------|
| `packages/@aura/database/prisma/schema.prisma` | All 25+ payroll models already exist |
| `apps/web/src/lib/services/payroll.service.ts` (CRUD methods) | Already production-ready real Prisma |
| `apps/web/src/app/api/v1/payroll/runs/route.ts` | Run list/create already real |
| `apps/web/src/app/dashboard/payroll/services.ts` | Frontend calls real API endpoints |
| `services/payroll-service/src/services/wps-service.ts` | WPS SIF generation logic complete |
| `services/payroll-service/src/services/gosi-service.ts` | GOSI contribution logic complete |
| `services/payroll-service/src/services/india-pf-service.ts` | PF logic complete |
| `services/payroll-service/src/services/india-esi-service.ts` | ESI logic complete |
| `services/payroll-service/src/services/india-tds-service.ts` | TDS logic complete |

### Schema Assessment

**ZERO schema changes required.** The Prisma schema has 25+ payroll models with:
- Core: PayrollConfiguration, PayrollRun (7-state enum), Payslip (5-state enum), EmployeeSalaryStructure, PayrollAdjustment, StatutoryPayment, SalaryComponent, CompensationBand
- UAE: WPSConfiguration, WPSSubmission, WPSRecord, WPSAuditLog
- KSA: GOSIConfiguration, GOSISubmission, GOSIRecord
- India: IndiaPFConfiguration, IndiaPFSubmission, IndiaPFRecord, IndiaESIConfiguration, IndiaESISubmission, IndiaESIRecord, IndiaTDSConfiguration, IndiaTDSDeclaration, TaxDeclaration

---

## 5. Critical Fix: `getEmployeesToProcess()` Implementation

The calculation engine's `getEmployeesToProcess()` (line ~886 in `payroll/payroll.service.ts`) returns an empty array. Required implementation:

```
1. Query Employee where tenantId matches AND companyId matches AND isActive = true
2. If employeeIds provided, filter to those IDs
3. Include EmployeeSalaryStructure where isActive = true
4. Include relevant benefit records
5. Include TaxDeclaration for current financial year (India only)
6. Map to EmployeeData interface expected by calculatePayslip()
7. Validate each employee has active salary structure
```

This is the single highest-impact fix — once implemented, the entire calculation pipeline becomes functional.

---

## 6. Acceptance Criteria

### AC-1: Payroll Run Lifecycle
- [ ] Create run (DRAFT) → Calculate (PROCESSING → CALCULATED) → Approve (APPROVED) → Finalize (PAID)
- [ ] Each state transition validated (can't skip states, can't approve uncalculated run)
- [ ] Run totals (totalGrossSalary, totalDeductions, totalNetSalary, totalEmployerCost) computed from payslips
- [ ] Finalized runs locked against mutation

### AC-2: Employee Payroll Calculation
- [ ] `getEmployeesToProcess()` returns real employees with salary structures from database
- [ ] Calculation uses decimal-safe arithmetic (Decimal.js)
- [ ] Each payslip persisted to database with full earnings/deductions JSON
- [ ] Calculation is deterministic — same inputs produce same outputs
- [ ] Calculation trace/notes stored for auditability

### AC-3: Country-Specific Statutory — UAE
- [ ] No statutory deductions applied (UAE has no income tax)
- [ ] WPS SIF file generated from finalized payroll run
- [ ] WPSSubmission record created linking to payroll run
- [ ] WPSRecord created per employee with validation

### AC-4: Country-Specific Statutory — KSA
- [ ] GOSI pension calculated: 9.75% Saudi (employee 9%, employer 9.75%), 0% non-Saudi pension
- [ ] SANED calculated: 0.75% employee + 2% employer (Saudi); 2% employer (non-Saudi)
- [ ] Occupational hazards: 2% employer
- [ ] Salary cap: 45,000 SAR applied to contributable salary
- [ ] GOSISubmission and GOSIRecord created from payroll run

### AC-5: Country-Specific Statutory — India
- [ ] PF: 12% employee + 12% employer (8.33% EPS + 3.67% EPF), wage ceiling 15,000 INR
- [ ] ESI: 0.75% employee + 3.25% employer, wage ceiling 21,000 INR
- [ ] Professional Tax: State-specific rates applied (Maharashtra as default)
- [ ] TDS: Old/New regime supported, tax slabs applied, 87A rebate, surcharge, cess
- [ ] IndiaPFSubmission/Record and IndiaESISubmission/Record created from payroll run

### AC-6: Payroll Job
- [ ] `payroll.job.ts` calls real `PayrollService.processPayroll()` — no mock data
- [ ] Job is idempotent — re-running for same period doesn't create duplicate runs
- [ ] Results persisted to Payslip table
- [ ] Cache invalidated after processing
- [ ] Notification sent on completion

### AC-7: Audit Coverage
- [ ] Payroll run creation, calculation, approval, finalization emit audit events
- [ ] Statutory submission/approval emit audit events
- [ ] All audit entries include tenantId, userId, action, resource details

### AC-8: Leave/Attendance Integration
- [ ] Leave days (LOP) fetched from LeaveBalance for pay period
- [ ] Overtime hours fetched from AttendanceRecord for pay period
- [ ] Pro-rata calculation applies LOP deductions correctly

---

## 7. Test Strategy

### Unit Tests (Calculation Engine)

| # | Test Case | What It Validates |
|---|-----------|-------------------|
| 1 | UAE payroll calculation (no statutory) | Basic + allowances = gross, no deductions, net = gross |
| 2 | KSA payroll — Saudi employee GOSI | 9.75% pension, 0.75% SANED, correct net |
| 3 | KSA payroll — non-Saudi employee | 0% pension, 2% employer SANED only |
| 4 | KSA payroll — salary cap 45K SAR | Contributions capped at ceiling |
| 5 | India payroll — PF calculation | 12% EE + 12% ER, wage ceiling 15K |
| 6 | India payroll — ESI calculation | 0.75% EE + 3.25% ER, wage ceiling 21K |
| 7 | India payroll — TDS (new regime) | Correct slab application, 87A rebate |
| 8 | India payroll — TDS (old regime) | Exemptions (80C, 80D, HRA) applied |
| 9 | Professional Tax — Maharashtra | State-specific slab applied |
| 10 | LOP deduction — 5 days unpaid | Pro-rata deduction from basic + allowances |
| 11 | Overtime addition | Hours × rate added to gross |
| 12 | Decimal precision | No floating-point rounding errors in calculations |

### Integration Tests

| # | Test Case | What It Validates |
|---|-----------|-------------------|
| 1 | Create run → calculate → payslips persisted | Full run lifecycle |
| 2 | Calculate → approve → finalize → locked | State machine works |
| 3 | Duplicate run prevention | Same tenant + company + month rejected |
| 4 | Multi-tenant isolation | Tenant A's run doesn't include Tenant B employees |
| 5 | Statutory records created | WPS/GOSI/PF/ESI records created on calculation |
| 6 | Payroll summary aggregation | Department breakdown, statutory totals match |

### Validation Fixtures (per Guide)

| # | Fixture | What It Validates |
|---|---------|-------------------|
| 1 | UAE 10-employee payroll | Correct WPS SIF output, net pay totals |
| 2 | KSA mixed workforce (Saudi + non-Saudi) | Correct GOSI differentiation |
| 3 | India 10-employee payroll (old + new regime) | Correct PF/ESI/TDS/PT, Form 16 data |

---

## 8. Risks

| ID | Risk | Impact | Probability | Mitigation |
|----|------|--------|-------------|------------|
| PR-1 | `getEmployeesToProcess()` stub blocks all payroll processing | Critical | Confirmed | Single highest-priority fix — implement Prisma query for Employee + SalaryStructure |
| PR-2 | Payroll job entirely mock — 4 TODO stubs | Critical | Confirmed | Wire job to real PayrollService; remove all mock calculations |
| PR-3 | Scope creep to non-release countries | High | Medium | Gate 9A enforces freeze. Bahrain/Oman/Kuwait/Qatar explicitly deferred. |
| PR-4 | Disconnect between Fastify microservice and Next.js API | Medium | Confirmed | Use Next.js calculation engine for payroll runs; Fastify for statutory filing only |
| PR-5 | No audit logging on any payroll operation | High | Confirmed | Same audit approach as other workstreams — inline or middleware |
| PR-6 | Financial precision errors from floating-point | High | Low | Calculation engine already uses Decimal.js; verify in tests |
| PR-7 | Leave/attendance data not integrated into payroll inputs | High | Confirmed | Add LeaveBalance + AttendanceRecord queries to input assembler |
| PR-8 | Payslip PDF generation not implemented | Medium | Confirmed | Implement basic PDF from Payslip data; advanced layout deferred |
| PR-9 | Tax declaration dependency (India TDS) | Medium | Medium | Default to new regime if no declaration submitted |

---

## 9. Cross-Workstream Dependencies

| Dependency | Direction | Status |
|-----------|-----------|--------|
| Leave data (LOP days) | Leave → Payroll | Leave engine must be operational (Weeks 5-6) before payroll (Weeks 9-11) |
| Attendance data (overtime hours) | Attendance → Payroll | Attendance must be operational (Weeks 7-8) before payroll |
| Audit persistence (Gate 2A) | Payroll audit → AuditService | If Gate 2A still FAIL by Week 9, use inline audit |
| Employee data | Core Services → Payroll | Employee + SalaryStructure must be real (Weeks 1-4) |
| Recruitment (offer salary) | Payroll → Recruitment | Deferred — no dependency for payroll runs |

---

## 10. Copilot Handoff — Payroll Weeks 9-11

### Required Reading Before Implementation

1. `docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md`
2. `docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md`
3. `apps/web/src/lib/services/payroll/payroll.service.ts` — understand calculation engine
4. `apps/web/src/lib/services/payroll.service.ts` — understand CRUD operations
5. `apps/web/src/lib/queue/jobs/payroll.job.ts` — understand job pipeline
6. `services/payroll-service/src/services/payroll-engine-service.ts` — understand microservice
7. This document (PAYROLL-ENGINE-PLANNING.md)

### Week 9 Tasks (Core Engine and Persistence)

| # | Task | Files | Acceptance Criteria |
|---|------|-------|---------------------|
| 1 | Implement `getEmployeesToProcess()` | `payroll/payroll.service.ts` | Returns real employees with salary structures from Prisma; validates each has active structure |
| 2 | Wire payroll job to real calculation engine | `payroll.job.ts` | All 4 TODO stubs replaced; calls real `processPayroll()`; results persisted |
| 3 | Persist calculation results to Payslip table | `payroll/payroll.service.ts` | After `calculatePayslip()`, create `prisma.payslip.create()` with full breakdown |
| 4 | Wire run state machine | `api/v1/payroll/approve/`, `status/`, `runs/[id]/calculate/`, `runs/[id]/finalize/` | State transitions validated; finalized runs locked |
| 5 | Add leave/attendance input integration | `payroll/payroll.service.ts` | LOP days from LeaveBalance, overtime from AttendanceRecord included in calculation |

### Week 10 Tasks (Statutory Logic — UAE + KSA)

| # | Task | Files | Acceptance Criteria |
|---|------|-------|---------------------|
| 6 | Verify UAE calculation (no statutory) | Test fixtures | UAE payroll produces correct gross/net with zero deductions |
| 7 | Verify KSA GOSI calculations (Saudi + non-Saudi) | Test fixtures + `payroll/payroll.service.ts` | GOSI rates correct, salary cap applied, GOSIRecord created |
| 8 | Wire WPS submission pipeline | `api/v1/payroll/` routes + microservice | Finalized run → WPSSubmission created → SIF file generated |
| 9 | Wire GOSI submission pipeline | `api/v1/payroll/` routes + microservice | Finalized run → GOSISubmission created → contribution file generated |
| 10 | Wire statutory compliance routes (mock → real) | 6 statutory/compliance routes | Real queries against statutory models |

### Week 11 Tasks (India + Audit + Hardening)

| # | Task | Files | Acceptance Criteria |
|---|------|-------|---------------------|
| 11 | Verify India PF/ESI/PT/TDS calculations | Test fixtures | All statutory rates correct, wage ceilings applied, both tax regimes work |
| 12 | Wire India statutory filing pipeline | Routes + microservice | PF ECR, ESI challan, TDS records created from payroll run |
| 13 | Wire tax document routes (mock → real) | 3 tax-documents routes | Real TaxDeclaration queries + download |
| 14 | Wire payslip download | `pay-stubs/[id]/download/` | Real PDF generated from Payslip data |
| 15 | Add audit logging to all payroll write paths | Services + routes | Run create/calculate/approve/finalize + statutory submit all audited |
| 16 | Add reconciliation output | Payroll service | Employee-level and aggregate reconciliation from payslip data |
| 17 | Update/add tests per test strategy | Test files | 12 unit + 6 integration + 3 fixture validation tests |

### Implementation Constraints

1. **Decimal-safe arithmetic**: All financial calculations MUST use Decimal.js — no floating-point
2. **Country scope freeze**: UAE, KSA, India ONLY — no other countries in Weeks 9-11
3. **Tenant isolation**: Every payroll query scoped by tenantId
4. **State machine integrity**: Runs cannot skip states; finalized runs are immutable
5. **Idempotency**: Duplicate payroll runs for same tenant/company/month prevented
6. **Preserve existing CRUD service**: Don't refactor `payroll.service.ts` — extend it
7. **Audit approach**: Same as other workstreams
8. **Bilingual errors**: API error responses must include `message` and `messageAr`

### Deferred Items

These are explicitly NOT in scope for Weeks 9-11:
- Bahrain, Oman, Kuwait, Qatar statutory compliance
- Advanced PDF payslip layout
- Bank file generation (NEFT/RTGS)
- NPS contributions
- Payroll reversal
- Ramadan hours adjustment
- Advanced reconciliation reporting
- Form 16 PDF rendering (data preparation IS in scope)

---

## Related Documents

- [Payroll Engine Guide](./GUIDE-PAYROLL-ENGINE-COMPLETION.md)
- [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
- [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)
- [Audit Coverage Map](./AUDIT-COVERAGE-MAP.md)
- [Schema Gap Assessment](./SCHEMA-GAP-ASSESSMENT.md)
- [Leave Engine Planning](./LEAVE-ENGINE-PLANNING.md)
- [Attendance Completion Planning](./ATTENDANCE-COMPLETION-PLANNING.md)
