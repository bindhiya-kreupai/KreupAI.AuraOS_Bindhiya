# Test Strategy — Audit/Compliance + Employee Lifecycle History

**Document Version**: 1.0
**Last Updated**: March 22, 2026
**Owner**: Claude (Planning Agent)
**Workstreams**: WS-7 Audit/Compliance, WS-8 Employee Lifecycle History

---

## 1. Test Infrastructure (Current State)

| Component | Tool | Config File |
|-----------|------|-------------|
| Unit/Integration | Vitest v4.0.16 (threaded pool, Node env) | `apps/web/vitest.config.mts` |
| E2E | Playwright (Chromium, Firefox, WebKit, Mobile) | `apps/web/playwright.config.ts` |
| DOM assertions | `@testing-library/jest-dom` | Via setup.ts |
| Mock strategy | Global Prisma mock via `vi.mock('@aura/database')` | `apps/web/src/__tests__/setup.ts` |
| Coverage thresholds | 70% lines, 70% functions, 60% branches, 70% statements | vitest.config.mts |

### Current Test Coverage Relevant to Audit + Lifecycle

| Area | Test Files Exist | Coverage Quality |
|------|-----------------|------------------|
| Employment history service | YES (22 test cases) | Good CRUD + approval + statistics. Missing: audit logging verification, tenant isolation, DB failure handling |
| Audit service | NO | No tests exist |
| Audit middleware | NO | No tests exist |
| BaseService.createAuditLog | NO | Not tested in isolation |
| Tenant isolation middleware | YES (1 file) | Exists but scope unclear |
| Auth security | YES (14 security test files) | Comprehensive |

---

## 2. Audit/Compliance Test Strategy (WS-7)

### Unit Tests

#### 2a. AuditService Persistence Tests

**File to create**: `apps/web/src/lib/audit/__tests__/audit.service.test.ts`

| # | Test Case | What It Verifies |
|---|-----------|-----------------|
| 1 | `log()` creates a durable audit record in PostgreSQL | `prisma.auditLog.create` is called with correct fields |
| 2 | `log()` maps `AuditLogEntry` fields to schema columns correctly | `resourceType` from entry, `severity`, `beforeValues`/`afterValues`, `success`, `errorMessage` |
| 3 | `log()` includes `tenantId` on every write | Tenant scoping enforced |
| 4 | `log()` populates deprecated fields for backward compatibility | `entityType = resourceType`, `entityId = resourceId`, `module = resourceType` |
| 5 | `log()` handles missing optional fields gracefully | `companyId`, `userEmail`, `errorMessage` can be null |
| 6 | `log()` records `success: false` and `errorMessage` for failed operations | Failure tracking |
| 7 | `search()` returns paginated results filtered by tenantId | Query scoping |
| 8 | `search()` filters by action, resourceType, userId, severity, date range | Query filtering |
| 9 | `search()` returns shared list response shape (`{items, total, page, pageSize, hasNextPage}`) | API contract compliance |
| 10 | `getResourceAuditTrail()` returns chronological events for a specific resource | Resource history |
| 11 | `getUserActivity()` returns all actions by a specific user | User activity trail |
| 12 | `generateComplianceReport()` returns non-zero aggregates from real data | Compliance reporting |
| 13 | `cleanup()` archives records to `AuditLogArchive` before deleting | Archive-then-delete lifecycle |
| 14 | `cleanup()` preserves all field values during archive | Data integrity |

#### 2b. BaseService.createAuditLog Tests

**File to create**: `apps/web/src/lib/services/__tests__/base.service.test.ts`

| # | Test Case | What It Verifies |
|---|-----------|-----------------|
| 1 | `createAuditLog()` writes to `prisma.auditLog.create()` with `resourceType` (not `module`) | Field mapping fix |
| 2 | `createAuditLog()` populates deprecated `entityType` and `module` for backward compatibility | Backward compat |
| 3 | `createAuditLog()` includes `tenantId` from context | Tenant scoping |
| 4 | `createAuditLog()` passes `AuditAction` enum values | Type safety |

#### 2c. Audit Middleware Tests

**File to create**: `apps/web/src/lib/middleware/__tests__/audit.middleware.test.ts`

| # | Test Case | What It Verifies |
|---|-----------|-----------------|
| 1 | `withAudit()` calls `auditService.log()` after successful handler execution | Audit on success |
| 2 | `withAudit()` calls `auditService.log()` with `success: false` on handler failure | Audit on failure |
| 3 | `withAudit()` extracts IP, user-agent, request/response bodies | Context capture |
| 4 | `withAudit()` sanitizes sensitive fields (password, token, secret) from logged data | Security |
| 5 | `auditMiddleware.createEmployee()` sets correct action and resourceType | Domain helper |
| 6 | `auditMiddleware.runPayroll()` sets correct action and resourceType | Domain helper |

### Integration Tests

**File to create**: `apps/web/src/__tests__/integration/audit-integration.test.ts`

| # | Test Case | What It Verifies |
|---|-----------|-----------------|
| 1 | Creating an employee via API produces an audit log record | End-to-end audit trail |
| 2 | Audit search API returns the record created in test 1 | Query returns real data |
| 3 | Audit records are tenant-scoped — tenant A cannot see tenant B's audit logs | Tenant isolation |
| 4 | Audit records are immutable — cannot be updated or deleted through normal admin flows | Data integrity |
| 5 | Archive job moves records from AuditLog to AuditLogArchive | Retention lifecycle |

### Acceptance Test Criteria (Gate 3A)

- [ ] `AuditService.log()` persists to PostgreSQL (not just Redis)
- [ ] `AuditService.search()` returns real paginated results
- [ ] `AuditService.getResourceAuditTrail()` returns real chronological data
- [ ] `BaseService.createAuditLog()` uses `resourceType` (field mapping bug fixed)
- [ ] All P0 write paths (recruitment, payroll v1, admin v1) have audit logging
- [ ] Tenant isolation verified in audit queries
- [ ] Audit records include `beforeValues`/`afterValues` for data change tracking

---

## 3. Employee Lifecycle History Test Strategy (WS-8)

### Current Test Coverage (Existing)

The existing test file at `lib/services/__tests__/employment-history.service.test.ts` covers:
- CRUD operations (findAll, findById, create, update, delete) — 13 tests
- Timeline retrieval and statistics — 2 tests
- Auto-creation from employee changes — 1 test
- Approval/rejection workflows — 5 tests
- Position tenure calculation — 3 tests

### Gaps in Existing Tests

| Gap | Description |
|-----|-------------|
| No audit logging verification | Tests don't check that `createAuditLog()` is called |
| No tenant isolation tests | Tests don't verify `tenantId` scoping |
| No DB failure handling | Only not-found errors tested, not connection/timeout failures |
| Only 7 event types | Tests don't cover new types (PROBATION_START, COMPENSATION_CHANGE, etc.) |
| No backfill tests | No tests for historical data backfill scenarios |
| No Employee relation tests | No tests using `include: { employmentHistory: true }` |

### New Unit Tests to Add

**File to modify**: `apps/web/src/lib/services/__tests__/employment-history.service.test.ts`

#### 3a. Extended Event Type Tests

| # | Test Case | What It Verifies |
|---|-----------|-----------------|
| 1 | Create `PROBATION_START` event with `previousStatusId` and `newStatusId` | New status tracking fields |
| 2 | Create `PROBATION_CONFIRMATION` event with salary change | Status + compensation change |
| 3 | Create `COMPENSATION_CHANGE` with `beforeValues`/`afterValues` JSON | Flexible snapshot fields |
| 4 | Create `MANAGER_CHANGE` with `previousManagerId` and `newManagerId` | Manager tracking |
| 5 | Create `LOCATION_CHANGE` with location FKs | Location tracking |
| 6 | Create `LEAVE_OF_ABSENCE` with status fields and leave type in `beforeValues` | Status + context |
| 7 | Create `RETURN_FROM_LEAVE` with status restoration | Status tracking |
| 8 | Create `STATUS_CHANGE` for suspension/reactivation | Generic status changes |
| 9 | Reject invalid `changeType` value | Zod validation |
| 10 | Accept legacy values (`PROMOTION`, `DEMOTION`, `TRANSFER`, `LATERAL_MOVE`, `NEW_HIRE`) | Backward compatibility |

#### 3b. Provenance Tests

| # | Test Case | What It Verifies |
|---|-----------|-----------------|
| 1 | Manual event has `sourceType: 'MANUAL'`, `isBackfilled: false` | Default provenance |
| 2 | System-triggered event has `sourceType: 'SYSTEM_TRIGGER'`, `isAutoGenerated: true` | System provenance |
| 3 | Backfilled event has `sourceType: 'MIGRATION'`, `isBackfilled: true` | Migration provenance |
| 4 | `sourceMetadata` stores arbitrary JSON | Metadata flexibility |

#### 3c. Timeline and Query Tests

| # | Test Case | What It Verifies |
|---|-----------|-----------------|
| 1 | Timeline returns events in descending `effectiveDate` order | Composite index usage |
| 2 | Timeline filterable by `changeType` | Type filtering |
| 3 | Timeline filterable by date range | Date filtering |
| 4 | Employee `include: { employmentHistory: true }` returns related records | Prisma relation |
| 5 | Pending approvals filtered by `tenantId` and `status: 'PENDING'` | Tenant + status scoping |

#### 3d. Backfill Tests

| # | Test Case | What It Verifies |
|---|-----------|-----------------|
| 1 | Backfill creates HIRE record for employee without one | Baseline creation |
| 2 | Backfill skips employee who already has HIRE/NEW_HIRE record | Idempotency |
| 3 | Backfill marks records with `isBackfilled: true`, `sourceType: 'MIGRATION'` | Provenance |
| 4 | Post-backfill employee count matches HIRE record count | Completeness validation |

#### 3e. Tenant Isolation Tests

| # | Test Case | What It Verifies |
|---|-----------|-----------------|
| 1 | `findAll()` only returns records matching the provided `tenantId` | Read isolation |
| 2 | `create()` sets `tenantId` on the new record | Write isolation |
| 3 | `update()` cannot modify a record from a different tenant | Cross-tenant protection |
| 4 | `delete()` cannot remove a record from a different tenant | Cross-tenant protection |

### Acceptance Test Criteria (Gate 3A partial)

- [ ] All 14 event types can be created and retrieved
- [ ] Legacy event types still accepted and readable
- [ ] Provenance fields (`sourceType`, `sourceMetadata`, `isBackfilled`) correctly populated
- [ ] Employee model includes `employmentHistory` relation
- [ ] Timeline queries use composite index (verify with `EXPLAIN ANALYZE`)
- [ ] Backfill produces HIRE records for all existing employees
- [ ] Backfill is idempotent (safe to re-run)
- [ ] Tenant isolation verified in all CRUD operations

---

## 4. Test Execution Plan

### Phase 1: Audit Foundation (Week 2-3)

| Test Type | Files | Runner | Gate |
|-----------|-------|--------|------|
| AuditService unit tests | `lib/audit/__tests__/audit.service.test.ts` | Vitest | 2A |
| BaseService audit tests | `lib/services/__tests__/base.service.test.ts` | Vitest | 2A |
| Audit middleware tests | `lib/middleware/__tests__/audit.middleware.test.ts` | Vitest | 3A |
| Audit integration tests | `__tests__/integration/audit-integration.test.ts` | Vitest | 3A |

### Phase 2: Lifecycle History (Week 3-4)

| Test Type | Files | Runner | Gate |
|-----------|-------|--------|------|
| Extended event type tests | `lib/services/__tests__/employment-history.service.test.ts` (additions) | Vitest | 3A |
| Provenance tests | Same file | Vitest | 3A |
| Backfill tests | New file or same | Vitest | 4A |
| Tenant isolation tests | Same file | Vitest | 4A |

### Phase 3: Cross-Workstream Audit Coverage (Weeks 4-14)

Each workstream should add audit verification tests:

| Workstream | Test Expectation |
|---|---|
| Core Services (Week 4) | Verify employee CRUD emits audit events |
| Leave (Week 5-6) | Verify leave request/approve/reject emits audit events |
| Attendance (Week 7-8) | Verify regularization/punch emits audit events |
| Payroll (Week 9-11) | Verify payroll run lifecycle emits audit events |
| Recruitment (Week 12-13) | Verify candidate/offer/interview emits audit events |
| Export (Week 14) | Verify export actions audited |

---

## Related Documents

- [Audit Coverage Map](./AUDIT-COVERAGE-MAP.md) — Which write paths have/need audit logging
- [Audit Schema Design](./AUDIT-SCHEMA-DESIGN.md) — Enhanced AuditLog model
- [Lifecycle Schema Design](./LIFECYCLE-SCHEMA-DESIGN.md) — EmploymentHistory expansion
- [Week 2 Copilot Handoff](./WEEK2-COPILOT-HANDOFF.md) — Implementation tasks
- [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md) — Response shape standards
