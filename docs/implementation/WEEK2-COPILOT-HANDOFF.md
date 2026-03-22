# Week 2 Copilot Handoff — Audit + Compliance + Lifecycle Prep

**Document Version**: 1.0
**Last Updated**: March 22, 2026
**Owner**: Claude (Planning Agent)
**Week**: 2 of 16
**Focus**: WS-7 Audit Foundation + WS-8 Lifecycle Schema Prep + WS-1 Core Service Continuation

---

## Context

Week 1 focused on the mock inventory, universal mock registry remediation, database indexes, and starting core service mock replacement. Week 2 shifts to the **audit foundation** (critical path — must be operational by end of Week 3) and **lifecycle schema preparation**.

### Key Finding from Week 1 Analysis

The Prisma schema is **far more complete than expected**:
- 6 of 9 workstreams need ZERO schema changes
- The `AuditLog` model exists but the `AuditService` **does not persist to database** (Redis-only)
- `BaseService.createAuditLog()` has a field mapping bug (`module` vs `entityType`)
- `EmploymentHistory` exists with 7 event types but needs expansion to 14

---

## Scope Boundary

### Task 1: Audit Schema Migration (CRITICAL PATH)

**Files to modify**:
- `packages/@aura/database/prisma/schema.prisma`

**What to do**:
1. Add `AuditAction` enum with all action types (see [AUDIT-SCHEMA-DESIGN.md](./AUDIT-SCHEMA-DESIGN.md) Section 3)
2. Add `AuditSeverity` enum (LOW, MEDIUM, HIGH, CRITICAL)
3. Enhance `AuditLog` model with new columns:
   - `companyId` (String, nullable)
   - `severity` (AuditSeverity, default LOW)
   - `userEmail` (String, nullable)
   - `resourceType` (String, nullable initially — will backfill from `entityType`)
   - `resourceId` (String, nullable — will backfill from `entityId`)
   - `success` (Boolean, default true)
   - `errorMessage` (String, nullable)
   - `beforeValues` (Json, nullable)
   - `afterValues` (Json, nullable)
   - `userAgent` (String, nullable)
   - `module` (String, nullable — deprecated, fixes BaseService bug)
4. Keep existing `entityType`, `entityId`, `details` columns (deprecated, do not remove)
5. Add composite indexes (see AUDIT-SCHEMA-DESIGN.md Section 3)
6. Add `AuditLogArchive` table (full schema in AUDIT-SCHEMA-DESIGN.md Section 3)

**Acceptance criteria**:
- [ ] Migration generated and applied: `npx prisma migrate dev --name audit_persistence_schema`
- [ ] All existing data preserved (no destructive changes)
- [ ] `AuditAction` enum includes all values from AUDIT-SCHEMA-DESIGN.md
- [ ] `AuditLogArchive` table created
- [ ] New composite indexes built

**Pre-migration check** (run first):
```sql
SELECT DISTINCT action FROM "AuditLog";
```
Every distinct value must map to an `AuditAction` enum variant. If unknown values exist, add them to the enum or map to a safe default.

---

### Task 2: Audit Service — Persistent Writes

**Files to modify**:
- `apps/web/src/lib/audit/audit.service.ts`

**What to do**:
1. Replace Redis-only writes in `log()` with `prisma.auditLog.create()`:
   - Map `AuditLogEntry` interface fields to new schema columns
   - `companyId` from entry (if available) or resolve from tenant context
   - `severity` from entry
   - `resourceType` / `resourceId` from entry (instead of `entityType` / `entityId`)
   - `beforeValues` / `afterValues` from `entry.changes.before/after`
   - `success` from entry
   - `errorMessage` from entry
   - `userAgent` from `entry.metadata.userAgent`
   - Populate deprecated columns too for backward compatibility: `entityType = resourceType`, `entityId = resourceId`
2. Keep Redis write as a secondary cache (for real-time dashboard if needed), but primary write MUST be Prisma
3. Remove all `// TODO: Implement with Prisma` comments
4. Ensure tenant scoping: every write includes `tenantId`

**Acceptance criteria**:
- [ ] `log()` persists to PostgreSQL via Prisma
- [ ] Every audit write includes `tenantId` (no unscoped writes)
- [ ] `AuditLogEntry` interface aligned with new schema columns
- [ ] TypeScript compiles without errors

---

### Task 3: Audit Service — Query Implementation

**Files to modify**:
- `apps/web/src/lib/audit/audit.service.ts`

**What to do**:
1. Implement `search()` with real Prisma queries:
   - Filter by `tenantId` (mandatory), `action`, `resourceType`, `userId`, `severity`, date range
   - Paginate using shared list response shape
   - Sort by `timestamp` descending
2. Implement `getResourceAuditTrail()`:
   - `WHERE tenantId = ? AND resourceType = ? AND resourceId = ?`
   - Return chronological list of all actions on a resource
3. Implement `getUserActivity()`:
   - `WHERE tenantId = ? AND userId = ?`
   - Return user's action history
4. Implement `generateComplianceReport()`:
   - Aggregate by action type, severity, success/failure
   - Return meaningful counts (not zeros)
5. Refactor `cleanup()` from delete to archive-then-delete:
   - Move records older than retention period to `AuditLogArchive`
   - Delete from `AuditLog` after successful archive

**Acceptance criteria**:
- [ ] `search()` returns real paginated results
- [ ] `getResourceAuditTrail()` returns real resource history
- [ ] `getUserActivity()` returns real user activity
- [ ] `generateComplianceReport()` returns non-zero aggregates
- [ ] `cleanup()` archives before deleting
- [ ] All queries tenant-scoped

---

### Task 4: Fix BaseService Audit Field Mapping

**Files to modify**:
- `apps/web/src/lib/services/base.service.ts`

**What to do**:
1. In `createAuditLog()`, change `module` → `resourceType`
2. Add `entityType` and `module` as deprecated mirrors: `entityType: resourceType, module: resourceType`
3. Pass `AuditAction` enum values instead of raw strings (e.g., `AuditAction.CREATE` instead of `'CREATE'`)
4. If the method receives a `module` parameter from callers, map it to `resourceType`

**Acceptance criteria**:
- [ ] No more `module` field in primary Prisma create call
- [ ] `resourceType` is the canonical field
- [ ] Deprecated `entityType` and `module` still populated for backward compatibility
- [ ] TypeScript compiles without errors

---

### Task 5: Data Backfill Migration

**Files to create**:
- `packages/@aura/database/prisma/migrations/[timestamp]_audit_data_backfill/migration.sql` (or a seed script)

**What to do**:
1. Backfill `resourceType` from `entityType` for all existing rows:
   ```sql
   UPDATE "AuditLog" SET "resourceType" = "entityType" WHERE "resourceType" IS NULL AND "entityType" IS NOT NULL;
   ```
2. Backfill `resourceId` from `entityId`:
   ```sql
   UPDATE "AuditLog" SET "resourceId" = "entityId" WHERE "resourceId" IS NULL AND "entityId" IS NOT NULL;
   ```
3. Verify row counts match

**Acceptance criteria**:
- [ ] All rows with `entityType` have `resourceType` populated
- [ ] All rows with `entityId` have `resourceId` populated
- [ ] Zero data loss

---

### Task 6: Lifecycle Schema Preparation (Week 3 prereq)

**Files to modify**:
- `packages/@aura/database/prisma/schema.prisma`

**What to do**:
1. Add new columns to `EmploymentHistory` (see [LIFECYCLE-SCHEMA-DESIGN.md](./LIFECYCLE-SCHEMA-DESIGN.md)):
   - `previousStatusId`, `newStatusId` (String, nullable)
   - `beforeValues`, `afterValues` (Json, nullable)
   - `actorId` (String, nullable)
   - `sourceType` (String, default "MANUAL")
   - `sourceMetadata` (Json, nullable)
   - `isBackfilled` (Boolean, default false)
2. Add `employee` relation to `EmploymentHistory` (FK on `employeeId`)
3. Add `employmentHistory` relation field to `Employee` model
4. Replace single-column indexes with composite indexes (see LIFECYCLE-SCHEMA-DESIGN.md Section 2)

**Acceptance criteria**:
- [ ] Migration generated and applied
- [ ] `Employee` model has `employmentHistory` relation
- [ ] `EmploymentHistory` has composite timeline index
- [ ] All new columns nullable or defaulted (non-breaking)
- [ ] TypeScript compiles

---

### Task 7: Continue Core Service Mock Replacement (from Week 1)

If Tasks 2-5 from Week 1 handoff are not yet complete, continue:

| # | Task | File | Status |
|---|------|------|--------|
| W1-2 | Replace attendanceService.ts mock data | `apps/web/src/services/attendanceService.ts` | Carry from Week 1 |
| W1-3 | Replace approvalService.ts mock data | `apps/web/src/services/approvalService.ts` | Carry from Week 1 |
| W1-4 | Replace documentService.ts mock data | `apps/web/src/services/documentService.ts` | Carry from Week 1 |
| W1-5 | Replace benefitsService.ts mock data | `apps/web/src/services/benefitsService.ts` | Carry from Week 1 |
| W1-6 | Replace directoryService.ts mock data | `apps/web/src/services/directoryService.ts` | Carry from Week 1 |

---

## Priority Order

| Priority | Task | Rationale |
|----------|------|-----------|
| 1 | Task 1 (Audit schema migration) | Critical path — blocks all audit writes |
| 2 | Task 4 (Fix BaseService field mapping) | Quick fix, unblocks existing audit writes |
| 3 | Task 2 (Audit persistent writes) | Core audit functionality |
| 4 | Task 5 (Data backfill) | Completes audit migration |
| 5 | Task 3 (Audit query implementation) | Enables audit search UI |
| 6 | Task 6 (Lifecycle schema prep) | Week 3 prerequisite |
| 7 | Task 7 (Core service continuation) | Ongoing mock replacement |

---

## Required Reading

1. [AUDIT-SCHEMA-DESIGN.md](./AUDIT-SCHEMA-DESIGN.md) — Full schema design with enums, indexes, archival table
2. [LIFECYCLE-SCHEMA-DESIGN.md](./LIFECYCLE-SCHEMA-DESIGN.md) — Full lifecycle schema enhancement
3. [SCHEMA-GAP-ASSESSMENT.md](./SCHEMA-GAP-ASSESSMENT.md) — Cross-workstream schema readiness
4. [MOCK-REGISTRY-REMEDIATION-PLAN.md](./MOCK-REGISTRY-REMEDIATION-PLAN.md) — Universal mock registry fix (if not done in Week 1)
5. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md) — Response shape standards
6. This document

---

## Deferred Items

- Audit query search UI (Week 3)
- Lifecycle backfill execution (Week 3)
- Lifecycle event hooks in employee service (Week 3-4)
- Leave engine (Week 5)
- Payroll engine (Week 9)
- Export/Reporting schema (`ExportJob` model) (Week 12)
- Mobile schema (Week 14)

---

## Review Gate: 2A — Audit Schema Approved

**Due**: End of Week 2
**Reviewer**: Claude (Planning Agent)
**Criteria**:
1. Enhanced `AuditLog` schema migrated with all new columns
2. `AuditLogArchive` table created
3. Existing data backfilled (`resourceType` from `entityType`)
4. `BaseService.createAuditLog()` field mapping fixed
5. `AuditService.log()` persists to PostgreSQL

---

## Related Documents

- [Claude Planning Packet](./CLAUDE-PLANNING-PACKET.md)
- [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
- [Audit/Compliance Guide](./GUIDE-AUDIT-COMPLIANCE-COMPLETION.md)
- [Employee Lifecycle History Guide](./GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md)
