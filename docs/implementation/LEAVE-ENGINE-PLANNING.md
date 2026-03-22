# Leave Engine Completion — Claude Planning Document

**Document Version**: 1.0
**Last Updated**: March 22, 2026
**Owner**: Claude (Planning Agent)
**Workstream**: WS-3 Leave Engine Completion (Weeks 5-6)
**Status**: Planning Complete — Ready for Copilot Handoff

---

## Quick Navigation

1. [Leave Engine Guide](./GUIDE-LEAVE-ENGINE-COMPLETION.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)
4. [Audit Coverage Map](./AUDIT-COVERAGE-MAP.md)

---

## 1. Executive Assessment

### Readiness: STRONG FOUNDATION — Targeted Gaps Remain

The leave engine has a **far more complete foundation than expected**. Key findings:

| Area | Status | Detail |
|------|--------|--------|
| Prisma Schema | COMPLETE | 8 models: LeavePolicy, LeaveBalance, LeaveRequest, LeaveEncashment, LeaveAccrual, LeaveCarryForward, CompOffRequest, CompOffEarned |
| LeaveService (CRUD) | PRODUCTION-READY | Real Prisma queries for requests, policies, balances, encashments. Balance deduction on approval, restoration on cancellation. |
| LeaveAccrualService | FRAMEWORK ONLY | Calculation logic complete (accrual, carry-forward, encashment, forecast). **Database stubs not connected to Prisma.** |
| Legacy API routes | REAL | `/api/leave/*` — all use `withEnhancedAuth`, direct Prisma queries |
| V1 API routes | REAL | `/api/v1/leave*` — use LeaveService or direct Prisma |
| Frontend services | REAL | `dashboard/leave/services.ts` — calls real API endpoints via APIClient |
| Tests | PARTIAL | Unit tests for LeaveService + LeaveAccrualService, E2E tests (Playwright), test factory, performance tests |
| Audit logging | MINIMAL | Only 1 legacy route (`/api/leave/accrual POST`) has audit. V1 routes and LeaveService have zero audit. |
| Country-specific rules | STUB | `LabourLawService.getConfig(countryCode)` referenced but not implemented |

### Top Risk

The **LeaveAccrualService database stubs** are the primary gap. The service has complete calculation logic but every database method returns empty/null. This means:
- Monthly accrual processing doesn't actually persist results
- Carry-forward processing doesn't actually create new year balances
- Encashment processing doesn't actually deduct from balances
- Balance forecasting doesn't read real data

---

## 2. Scope Confirmation

### In Scope (Release)

| # | Feature | Current State | Work Required |
|---|---------|---------------|---------------|
| 1 | Wire LeaveAccrualService database stubs to Prisma | Stubs return empty | Connect ~10 stub methods to real queries |
| 2 | Monthly accrual processing (end-to-end) | Logic complete, DB stubs | Wire stubs → test → validate |
| 3 | Year-end carry-forward processing | Logic complete, DB stubs | Wire stubs → test → validate |
| 4 | Encashment processing | Logic complete, DB stubs | Wire stubs → test → validate |
| 5 | Balance forecast (12-month projection) | Logic complete, DB stubs | Wire stubs → validate |
| 6 | Leave accrual job wiring | `leaveAccrualJob.ts` is mock | Connect to real LeaveAccrualService |
| 7 | Audit logging on v1 leave routes | Zero coverage | Wire `auditMiddleware.leaveCreate/leaveApprove/leaveReject` |
| 8 | Audit logging on LeaveService write methods | Zero coverage | Add `createAuditLog()` calls |
| 9 | Country-specific accrual rules (UAE, KSA, India) | LabourLawService stub | Implement country configs for release countries |

### Out of Scope (Deferred)

| # | Feature | Reason |
|---|---------|--------|
| 1 | Multi-level approval workflow | Approval JSON field exists but implementation is complex; single-approver flow works |
| 2 | Leave conflict detection (team overlap) | Nice-to-have; not blocking production |
| 3 | Medical document upload handling | Field exists in schema; storage integration deferred |
| 4 | Notification system (email/SMS on approve/reject) | Depends on notification service readiness |
| 5 | Sandwich rule engine | Complex policy logic; defer to post-release |
| 6 | Partial-day leave (half-day) calculations | Fields exist (`halfDayStart`, `halfDayEnd`) but engine not built |

---

## 3. File and Module Impact Map

### Files Requiring Changes

| File | Change Type | Priority |
|------|-------------|----------|
| `apps/web/src/lib/services/leave/leave-accrual.service.ts` | Wire 10 database stubs to Prisma | P0 — Critical |
| `apps/web/src/lib/queue/jobs/leaveAccrualJob.ts` | Replace mock policies with real service call | P0 |
| `apps/web/src/lib/services/leave.service.ts` | Add `createAuditLog()` to write methods | P1 |
| `apps/web/src/app/api/v1/leave/apply/route.ts` | Add audit middleware | P1 |
| `apps/web/src/app/api/v1/leave/requests/[id]/approve/route.ts` | Add audit middleware | P1 |
| `apps/web/src/app/api/v1/leave/requests/[id]/reject/route.ts` | Add audit middleware | P1 |
| `apps/web/src/app/api/v1/leave/encash/route.ts` | Add audit middleware | P1 |
| `apps/web/src/app/api/v1/leave-requests/route.ts` | Add audit middleware | P1 |
| `apps/web/src/app/api/v1/leave-balances/[id]/adjust/route.ts` | Add audit middleware | P1 |
| `apps/web/src/lib/services/leave/types.ts` | No changes expected | — |

### Files NOT Requiring Changes

| File | Reason |
|------|--------|
| `packages/@aura/database/prisma/schema.prisma` | All 8 leave models already exist and are production-grade |
| `apps/web/src/app/dashboard/leave/services.ts` | Frontend already calls real API endpoints |
| `apps/web/src/app/api/leave/*` (legacy routes) | Already use real Prisma queries |
| `apps/web/src/app/api/v1/leave/policies/route.ts` | Already uses real Prisma queries |
| `apps/web/src/app/api/v1/leave/balance/[employeeId]/route.ts` | Already uses real Prisma queries |
| `apps/web/src/app/api/v1/leave/calendar/route.ts` | Already uses real Prisma queries |

### Schema Assessment

**ZERO schema changes required.** The Prisma schema has all 8 leave models with:
- Comprehensive fields for all leave operations
- Proper relationships and constraints
- Unique constraints and indexes
- Tenant isolation via `tenantId`
- Soft delete support

This confirms the SCHEMA-GAP-ASSESSMENT.md finding that Leave is one of the 6/9 workstreams needing zero schema changes.

---

## 4. Database Stubs to Wire (Critical Path)

These are the 10 stub methods in `leave-accrual.service.ts` that currently return empty/null:

| # | Stub Method | Return Type | Target Prisma Query |
|---|-------------|-------------|---------------------|
| 1 | `getActiveEmployees(tenantId, employeeIds?)` | `Employee[]` | `prisma.employee.findMany({ where: { tenantId, isActive: true, ... } })` |
| 2 | `getLeavePolicies(tenantId, leaveTypeIds?)` | `LeavePolicy[]` | `prisma.leavePolicy.findMany({ where: { tenantId, isActive: true, ... } })` |
| 3 | `getCurrentBalance(employeeId, leaveTypeCode, year)` | `LeaveBalance` | `prisma.leaveBalance.findFirst({ where: { employeeId, leaveYear: year, policy: { code: leaveTypeCode } } })` |
| 4 | `getYearEndBalance(employeeId, leaveTypeCode, year)` | `LeaveBalance` | Same as #3 but for specified year |
| 5 | `updateLeaveBalance(balanceId, updates)` | `LeaveBalance` | `prisma.leaveBalance.update({ where: { id: balanceId }, data: updates })` |
| 6 | `createNewYearBalance(data)` | `LeaveBalance` | `prisma.leaveBalance.create({ data: { ... } })` |
| 7 | `deductLeaveBalance(balanceId, days)` | `LeaveBalance` | `prisma.leaveBalance.update({ ... })` with atomic decrement |
| 8 | `getEmployee(employeeId)` | `Employee` | `prisma.employee.findUnique({ where: { id: employeeId } })` |
| 9 | `getPolicyForEmployee(employee, leaveTypeCode)` | `LeavePolicy` | `prisma.leavePolicy.findFirst({ where: { tenantId, code: leaveTypeCode, isActive: true, ... } })` + eligibility matching |
| 10 | `createAccrualRecord(data)` | `LeaveAccrual` | `prisma.leaveAccrual.create({ data: { ... } })` |

**Implementation pattern**: Each stub should be replaced with a real Prisma call using the existing PrismaClient. The LeaveAccrualService constructor should accept a PrismaClient instance (dependency injection).

---

## 5. Policy and Ledger Design Review

### Current Ledger Model — SOUND

The balance model uses **mutable counters** (`openingBalance`, `accrued`, `taken`, `adjusted`, `encashed`, `carriedForward`, `lapsed`, `currentBalance`). The guide recommends derived balances from transactions, but the current model is acceptable because:

1. Individual transactions are recorded in `LeaveAccrual`, `LeaveCarryForward`, `LeaveRequest`, and `LeaveEncashment` tables
2. `currentBalance` can be reconciled by summing: `openingBalance + accrued + adjusted + carriedForward - taken - encashed - lapsed`
3. Each write operation atomically updates both the transaction record and the balance counter

**Recommendation**: Keep the current counter-based model. Add a reconciliation method that verifies `currentBalance` matches the sum of transactions. This is simpler than migrating to a pure ledger model.

### Policy Resolution — COMPLETE

The `LeavePolicy` model has:
- `tenantId` + `companyId` + `countryCode` for multi-level scoping
- `employmentTypes` (JSON array) for eligibility filtering
- `minServiceMonths` for tenure-based eligibility
- `effectiveFrom` / `effectiveTo` for date-bounded policies
- Unique constraint on `(tenantId, code)` to prevent duplicates

**Policy resolution order** (for Copilot to implement in `getPolicyForEmployee`):
1. Match `tenantId`
2. Match `companyId` if set (company-specific overrides general)
3. Match `countryCode` if set (country-specific overrides general)
4. Match `employmentTypes` contains employee's employment type
5. Check `minServiceMonths` against employee tenure
6. Check `effectiveFrom` <= now <= `effectiveTo`
7. Check `isActive = true`

### Country-Specific Rules — NEEDS IMPLEMENTATION

The `calculateLegalEntitlement()` method references `LabourLawService.getConfig(countryCode)` but this service doesn't exist. For release countries:

| Country | Annual Leave | Key Rules |
|---------|-------------|-----------|
| UAE | 30 days (after 1 year), 2 days/month (first year) | Pro-rata on exit; no carry-forward beyond 2 years in some cases |
| KSA | 21 days (first 5 years), 30 days (after 5 years) | Hajj leave (10-15 days, once per employment); no encashment during employment |
| India | 15-30 days (varies by state/establishment) | Earned leave, casual leave, sick leave as separate categories; state-level Shops & Establishments Act |

**Recommendation**: Implement country configs as database-driven `LeavePolicy` records per country, not as hardcoded service logic. The existing policy model already supports `countryCode` filtering.

---

## 6. Acceptance Criteria

### AC-1: Monthly Accrual Processing
- [ ] Accrual job retrieves active employees and applicable policies from database
- [ ] Pro-rata calculation works for mid-month joiners
- [ ] Accrual respects probation period restrictions
- [ ] Each accrual creates a `LeaveAccrual` record with calculation details
- [ ] `LeaveBalance.accrued` and `currentBalance` updated atomically
- [ ] Duplicate accrual for same employee/policy/month is prevented
- [ ] Audit log entry created for batch processing

### AC-2: Year-End Carry-Forward
- [ ] Carry-forward respects `maxCarryForwardDays` from policy
- [ ] Lapsed days calculated as `balance - carryForwardApplied`
- [ ] `LeaveCarryForward` record created with `expiryDate`
- [ ] New year `LeaveBalance` created with `carriedForward` amount
- [ ] Old year balance updated with `carriedForward` and `lapsed`

### AC-3: Encashment Processing
- [ ] Eligible days calculated from policy rules (`maxEncashmentDays`, min retention)
- [ ] Daily rate calculated from salary basis (`BASIC` or `GROSS`)
- [ ] `LeaveBalance.encashed` and `currentBalance` updated on approval
- [ ] Processed encashment linked to payroll month
- [ ] Audit trail for encashment approval

### AC-4: Balance Reconciliation
- [ ] Reconciliation method validates: `currentBalance == openingBalance + accrued + adjusted + carriedForward - taken - encashed - lapsed`
- [ ] Discrepancies logged with details
- [ ] Reconciliation can be run per-employee or batch

### AC-5: Audit Coverage
- [ ] All v1 leave write routes emit audit events (create, approve, reject, cancel, adjust, encash)
- [ ] LeaveService write methods call `createAuditLog()` or equivalent
- [ ] Audit entries include `tenantId`, `userId`, action, resource details

### AC-6: Leave Accrual Job
- [ ] `leaveAccrualJob.ts` calls real `LeaveAccrualService.processMonthlyAccrual()`
- [ ] No hardcoded sample policies remain in production path
- [ ] Job is idempotent (re-running for same month doesn't create duplicates)

### AC-7: Country-Specific Rules
- [ ] UAE, KSA, India leave policies seeded as database records
- [ ] Policy resolution correctly selects country-specific policy for employee
- [ ] No hardcoded country logic in service layer (policy-driven)

---

## 7. Test Strategy

### Unit Tests (LeaveAccrualService)

| # | Test Case | What It Validates |
|---|-----------|-------------------|
| 1 | Monthly accrual for standard employee | Correct accrual amount posted to balance |
| 2 | Accrual with pro-rata (mid-month joiner) | `proRataFactor` correctly applied |
| 3 | Accrual skipped during probation | Employee within `minServiceMonths` gets zero accrual |
| 4 | Accrual for different frequencies (monthly, quarterly, annual) | `accrualType` drives calculation |
| 5 | Duplicate accrual prevention | Second run for same month doesn't double-post |
| 6 | Carry-forward within policy limit | Days <= `maxCarryForwardDays` carried, rest lapsed |
| 7 | Carry-forward with expiry | `expiryDate` calculated from `carryForwardExpiryMonths` |
| 8 | Encashment eligible days calculation | Respects `maxEncashmentDays` and min retention |
| 9 | Encashment daily rate (BASIC vs GROSS) | Rate correctly calculated for each basis |
| 10 | Balance forecast 12-month projection | Projected months match expected accrual schedule |

### Integration Tests (Leave Workflow)

| # | Test Case | What It Validates |
|---|-----------|-------------------|
| 1 | Create request → approve → balance deducted | End-to-end approval-to-deduction flow |
| 2 | Create request → approve → cancel → balance restored | Cancellation reverses deduction |
| 3 | Create request → reject → balance unchanged | Rejection doesn't affect balance |
| 4 | Accrual run → balance increased → request approved | Full accrual-to-consumption cycle |
| 5 | Year-end carry-forward → new year balance created | Full year transition |
| 6 | Encashment approved → balance decreased, payment linked | Encashment-to-payroll link |
| 7 | Multi-tenant isolation | Tenant A's policies don't affect Tenant B |

### Reconciliation Tests

| # | Test Case | What It Validates |
|---|-----------|-------------------|
| 1 | Balance matches sum of transactions | `currentBalance` == computed balance |
| 2 | Accrual sequence is deterministic | Same inputs produce same outputs |
| 3 | Historical policy change doesn't corrupt existing balances | Policy update only affects future accruals |

### Existing Test Coverage (Already Present)

- `leave.service.test.ts` — unit tests for apply, balance, approve, reject
- `leave-accrual.service.test.ts` — accrual calculation tests
- `leave-application.e2e.test.ts` — E2E workflow tests
- `leave-balance.e2e.test.ts` — balance query tests
- `leave-calendar.e2e.test.ts` — calendar view tests
- `leave.factory.ts` — test data factory
- `leave-load.test.js` — performance tests

**Gap**: Existing tests need updating after stubs are wired to ensure they test real database interactions, not just mocked Prisma.

---

## 8. Risks

| ID | Risk | Impact | Probability | Mitigation |
|----|------|--------|-------------|------------|
| LR-1 | LeaveAccrualService stubs silently return empty data — accrual appears to run but doesn't persist | High | Confirmed | Wire all 10 stubs to Prisma; add assertion that accrual records were created |
| LR-2 | Leave accrual job uses hardcoded sample policies instead of database | High | Confirmed | Replace with `LeaveAccrualService.processMonthlyAccrual()` call |
| LR-3 | Balance reconciliation failure after parallel writes | Medium | Medium | Use Prisma transactions for all balance-modifying operations |
| LR-4 | Country-specific rules incomplete for release countries | Medium | Medium | Implement as database-driven policies, not code; seed UAE/KSA/India policies |
| LR-5 | Audit logging dependency on Gate 2A (AuditService persistence) | Medium | Confirmed | If Gate 2A still FAIL by Week 5, use inline `prisma.auditLog.create()` as interim |
| LR-6 | Carry-forward expiry not automatically processed | Low | Low | Implement expiry check as part of monthly accrual job |

---

## 9. Cross-Workstream Dependencies

| Dependency | Direction | Status |
|-----------|-----------|--------|
| Audit persistence (Gate 2A) | Leave audit → AuditService | BLOCKED (Gate 2A FAIL). Mitigation: use inline audit writes. |
| Employee data (Core Services) | Leave accrual → Employee table | AVAILABLE — Employee model exists with required fields |
| Payroll integration | Leave encashment → Payroll run | DEFERRED to Payroll workstream (Weeks 9-11) |
| Attendance | Leave approval → Attendance records | DEFERRED to Attendance workstream (Weeks 7-8) |

---

## 10. Copilot Handoff — Leave Engine Week 5-6

### Required Reading Before Implementation

1. `docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md`
2. `docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md`
3. `apps/web/src/lib/services/leave/leave-accrual.service.ts` — understand existing calculation logic
4. `apps/web/src/lib/services/leave.service.ts` — understand existing CRUD methods
5. `apps/web/src/lib/services/leave/types.ts` — understand type definitions
6. This document (LEAVE-ENGINE-PLANNING.md)

### Week 5 Tasks (Policy and Ledger Foundation)

| # | Task | Files | Acceptance Criteria |
|---|------|-------|---------------------|
| 1 | Wire LeaveAccrualService database stubs to Prisma | `leave-accrual.service.ts` | All 10 stub methods return real data from database; constructor accepts PrismaClient |
| 2 | Connect leave accrual job to real service | `leaveAccrualJob.ts` | No hardcoded sample policies; calls `processMonthlyAccrual()` with real data |
| 3 | Add balance reconciliation method | `leave.service.ts` or `leave-accrual.service.ts` | Method verifies `currentBalance` matches transaction sum; logs discrepancies |
| 4 | Implement policy resolution logic | `leave-accrual.service.ts` `getPolicyForEmployee()` | Matches tenantId → companyId → countryCode → employmentType → tenure → active |
| 5 | Seed country-specific leave policies (UAE, KSA, India) | Migration or seed script | Annual leave policies for 3 countries exist in database |

### Week 6 Tasks (Transactional Workflows + Audit)

| # | Task | Files | Acceptance Criteria |
|---|------|-------|---------------------|
| 6 | Wire carry-forward processing end-to-end | `leave-accrual.service.ts` | Creates `LeaveCarryForward` records, updates old/new year balances |
| 7 | Wire encashment processing end-to-end | `leave-accrual.service.ts` | Calculates eligible days, deducts from balance, links to payroll month |
| 8 | Add audit logging to LeaveService write methods | `leave.service.ts` | `createRequest`, `approveRequest`, `rejectRequest`, `cancelRequest`, `adjustBalance`, `approveEncashment` all emit audit |
| 9 | Add audit middleware to v1 leave routes | `api/v1/leave*/route.ts` (~6 routes) | Routes use `auditMiddleware.leaveCreate`, `leaveApprove`, `leaveReject` or equivalent |
| 10 | Update existing tests for real database interactions | `leave.service.test.ts`, `leave-accrual.service.test.ts` | Tests pass with real Prisma calls (not just mock assertions) |
| 11 | Add new tests per test strategy | New test files | Minimum: 10 unit tests + 7 integration tests |

### Implementation Constraints

1. **Tenant isolation**: Every query MUST include `tenantId` in WHERE clause
2. **No new hardcoded enums**: Leave types, accrual frequencies, and policy rules from database
3. **Atomic balance updates**: Use Prisma transactions for operations that modify balance + create transaction record
4. **Preserve existing LeaveService**: Don't refactor working CRUD methods — extend, don't replace
5. **Audit approach**: If Gate 2A passes before Week 5, use `auditMiddleware.*` helpers. If Gate 2A still fails, use inline `prisma.auditLog.create()` as interim (matching legacy route pattern).
6. **Bilingual errors**: API error responses must include `message` and `messageAr`

### Deferred Items

These are explicitly NOT in scope for Weeks 5-6:
- Multi-level approval workflow
- Leave conflict detection
- Medical document upload
- Notification on approve/reject
- Sandwich rule engine
- Partial-day leave calculations
- Payroll integration (Weeks 9-11)

---

## Related Documents

- [Leave Engine Guide](./GUIDE-LEAVE-ENGINE-COMPLETION.md)
- [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
- [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)
- [Audit Coverage Map](./AUDIT-COVERAGE-MAP.md)
- [Schema Gap Assessment](./SCHEMA-GAP-ASSESSMENT.md)
