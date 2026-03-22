# Review Gates 2A and 3A — Verification Criteria

**Document Version**: 1.0
**Last Updated**: March 22, 2026
**Owner**: Claude (Planning Agent)
**Purpose**: Defines what Claude will verify when Copilot completes Week 2 and Week 3 tasks

---

## Gate 2A: Audit Schema Approved (End of Week 2)

### What Claude Will Verify

| # | Criterion | How to Verify | Pass/Fail |
|---|-----------|---------------|-----------|
| 1 | `AuditAction` enum exists in Prisma schema | Read schema, confirm enum with all required values | |
| 2 | `AuditSeverity` enum exists | Read schema, confirm LOW/MEDIUM/HIGH/CRITICAL | |
| 3 | `AuditLog` model has new columns | Confirm: `companyId`, `severity`, `userEmail`, `resourceType`, `resourceId`, `success`, `errorMessage`, `beforeValues`, `afterValues`, `userAgent`, `module` | |
| 4 | Deprecated columns preserved | Confirm: `entityType`, `entityId`, `details` still exist (nullable) | |
| 5 | Composite indexes added | Confirm: `[tenantId, timestamp]`, `[tenantId, companyId, timestamp]`, `[userId, timestamp]`, `[resourceType, resourceId]`, `[tenantId, action, timestamp]` | |
| 6 | `AuditLogArchive` table created | Read schema, confirm matching structure | |
| 7 | Migration applied successfully | Check migration file exists and Prisma validates | |
| 8 | Existing data backfilled | Verify `resourceType` populated from `entityType`, `resourceId` from `entityId` | |
| 9 | `action` values migrated to enum | Query distinct actions — all must map to `AuditAction` variants | |
| 10 | `BaseService.createAuditLog()` uses `resourceType` | Read file, confirm `module` field replaced with `resourceType` | |
| 11 | `AuditService.log()` persists to PostgreSQL | Read file, confirm `prisma.auditLog.create()` is active (not commented out) | |
| 12 | Unit tests exist for AuditService | Confirm test file created with persistence and query tests | |

### Gate 2A Decision

- **PASS**: All 12 criteria met → proceed to Week 3
- **CONDITIONAL PASS**: Criteria 1-11 met, tests partial → proceed with test debt noted
- **FAIL**: Any of criteria 1-9 not met → block Week 3 audit-dependent work

---

## Gate 3A: Audit Persistence Verified (End of Week 3)

### What Claude Will Verify

| # | Criterion | How to Verify | Pass/Fail |
|---|-----------|---------------|-----------|
| 1 | `AuditService.search()` returns real paginated data | Read implementation — no empty array returns, uses Prisma findMany with where/skip/take | |
| 2 | `AuditService.getResourceAuditTrail()` queries by resourceType + resourceId | Read implementation — real Prisma query | |
| 3 | `AuditService.getUserActivity()` queries by userId + tenantId | Read implementation — real Prisma query | |
| 4 | `AuditService.generateComplianceReport()` returns meaningful aggregates | Read implementation — uses Prisma groupBy or aggregate | |
| 5 | `AuditService.cleanup()` archives before deleting | Read implementation — moves to AuditLogArchive first | |
| 6 | All audit reads are tenant-scoped | Every query includes `tenantId` in where clause | |
| 7 | Audit responses follow shared list response shape | `{items, total, page, pageSize, hasNextPage}` | |
| 8 | `withAudit` middleware routes to persistent AuditService | Read middleware — calls `auditService.log()` which now persists | |
| 9 | At least P0 write paths have audit logging | Check recruitment, payroll v1, admin v1 routes for `auditMiddleware` or `createAuditLog` | |
| 10 | Integration test exists proving end-to-end audit trail | Test creates a record → queries audit → finds it | |

### Gate 3A also includes Lifecycle:

| # | Criterion | How to Verify | Pass/Fail |
|---|-----------|---------------|-----------|
| 11 | `EmploymentHistory` has `employee` relation | Schema has `@relation("EmployeeHistory")` | |
| 12 | `Employee` model has `employmentHistory` field | Schema has `EmploymentHistory[] @relation("EmployeeHistory")` | |
| 13 | New columns added (status, provenance, before/after) | Schema has `previousStatusId`, `newStatusId`, `beforeValues`, `afterValues`, `sourceType`, `sourceMetadata`, `isBackfilled` | |
| 14 | Composite timeline index exists | `@@index([employeeId, effectiveDate])` | |
| 15 | Zod enum includes 14 event types | Service file validates expanded changeType list | |

### Gate 3A Decision

- **PASS**: All 15 criteria met → Week 4 core service closure can proceed
- **CONDITIONAL PASS**: Criteria 1-8 + 11-14 met, P0 coverage partial → proceed with coverage debt tracked in R7
- **FAIL**: AuditService still returns empty data → block until persistence works

---

## Core Service Scope Review (Post-Audit Findings)

### Does R7/R8 Change Core Service Scope?

**Finding**: The audit findings (R7: AuditService not persisting, R8: BaseService field mapping) do NOT change the core service mock-replacement scope for Week 1-4. The core service tasks are:

1. Replace `attendanceService.ts` mock data → **Not affected** by audit gaps
2. Replace `approvalService.ts` mock data → **Not affected**
3. Replace `documentService.ts` mock data → **Not affected** (already uses `createAuditLog`)
4. Replace `benefitsService.ts` mock data → **Not affected** (already uses `createAuditLog`)
5. Replace `directoryService.ts` mock data → **Not affected**

**However**, once R8 (field mapping bug) is fixed, the `createAuditLog()` calls in `documentService.ts` and `benefitsService.ts` will start writing `resourceType` instead of the broken `module` field. This is a positive side effect — not a scope change.

**Recommendation**: Core service scope remains unchanged. Audit fixes (Week 2) are additive and improve existing audit behavior for services that already call `createAuditLog()`.

### Does Lifecycle Findings Change Core Service Scope?

**Finding**: The lifecycle findings (existing model + service + UI + tests, missing Employee relation) do NOT change core service scope. Lifecycle work is tracked separately in Week 3-4.

**One dependency noted**: The `employee.service.ts` `getEmploymentHistory()` method (line 373) falls back to a stub because the Prisma relation doesn't exist yet. This will be fixed as part of the lifecycle schema prep (Week 2 Task 6) and the lifecycle implementation (Week 3). Core service mock replacement does not depend on this.

---

## Related Documents

- [Audit Coverage Map](./AUDIT-COVERAGE-MAP.md)
- [Audit Schema Design](./AUDIT-SCHEMA-DESIGN.md)
- [Lifecycle Schema Design](./LIFECYCLE-SCHEMA-DESIGN.md)
- [Test Strategy](./TEST-STRATEGY-AUDIT-LIFECYCLE.md)
- [Week 2 Copilot Handoff](./WEEK2-COPILOT-HANDOFF.md)
- [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
