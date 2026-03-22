# Audit Persistence Schema Design — Week 2

**Document Version**: 1.0
**Last Updated**: March 22, 2026
**Owner**: Claude (Planning Agent)
**Workstream**: WS-7 Audit/Compliance
**Target**: Week 2 migration

---

## 1. Current State

### Three Audit Models Exist

| Model | Line | Purpose | Quality |
|-------|------|---------|---------|
| `AuditLog` | 1120 | General-purpose audit | Missing critical fields |
| `ComplianceAuditLog` | 3425 | Compliance modules only | Good schema (has before/after, bilingual) |
| `WPSAuditLog` | 1850 | WPS-specific | Good schema (has before/after) |

### Two Service-Layer Components

**`AuditService`** at `apps/web/src/lib/audit/audit.service.ts`:
- Has a rich TypeScript interface with `severity`, `changes.before/after`, `metadata.ipAddress/userAgent`, `success`, `errorMessage`
- **Does NOT use Prisma** — every query method returns empty data
- `log()` method only writes to Redis (TTL 7 days) and application logger
- All Prisma calls are commented out with `// TODO: Implement with Prisma`

**`BaseService.createAuditLog()`** at `apps/web/src/lib/services/base.service.ts`:
- Writes to `prisma.auditLog.create()` — real persistence
- Uses a `module` field that **does not exist** on the current `AuditLog` model (schema has `entityType`)
- This is a field mapping bug

**`audit.middleware.ts`** at `apps/web/src/lib/middleware/audit.middleware.ts`:
- `withAudit()` HOF wraps API handlers
- Extracts IP, user-agent, request/response bodies, sanitizes sensitive fields
- Routes to the non-persistent `AuditService`

---

## 2. Schema Gap Analysis

| Required by AuditService | Current AuditLog | Gap |
|---|---|---|
| `companyId` | Missing | No company-level scoping |
| `severity` (LOW/MEDIUM/HIGH/CRITICAL) | Missing | No severity classification |
| `userEmail` | Missing | No human-readable actor |
| `resourceType` / `resourceId` | Has `entityType` / `entityId` | Naming mismatch |
| `changes.before` / `changes.after` (JSON) | Missing | No before/after diff tracking |
| `success` (boolean) | Missing | No success/failure tracking |
| `errorMessage` | Missing | No error capture |
| `userAgent` | Missing (only `ipAddress`) | Partial client context |
| Archival table | Does not exist | No retention strategy |
| `module` (used by BaseService) | Does not exist | Runtime field mapping bug |

---

## 3. Proposed Schema

### Enhanced `AuditLog` Model

```prisma
enum AuditAction {
  // Employee lifecycle
  EMPLOYEE_CREATED
  EMPLOYEE_UPDATED
  EMPLOYEE_DELETED
  EMPLOYEE_TERMINATED
  EMPLOYEE_REHIRED

  // Payroll
  PAYROLL_RUN_INITIATED
  PAYROLL_RUN_APPROVED
  PAYROLL_RUN_REJECTED
  PAYSLIP_GENERATED
  PAYSLIP_VIEWED
  SALARY_UPDATED

  // Leave
  LEAVE_REQUEST_CREATED
  LEAVE_REQUEST_APPROVED
  LEAVE_REQUEST_REJECTED
  LEAVE_REQUEST_CANCELLED
  LEAVE_POLICY_CREATED
  LEAVE_POLICY_UPDATED
  LEAVE_ENCASHMENT_REQUESTED

  // Attendance
  ATTENDANCE_MARKED
  ATTENDANCE_UPDATED
  ATTENDANCE_REGULARIZED
  BULK_ATTENDANCE_IMPORTED

  // Authentication
  USER_LOGIN
  USER_LOGOUT
  USER_LOGIN_FAILED
  PASSWORD_CHANGED
  PASSWORD_RESET_REQUESTED

  // Authorization
  ROLE_ASSIGNED
  ROLE_REMOVED
  PERMISSION_GRANTED
  PERMISSION_REVOKED

  // Data operations
  DATA_EXPORTED
  REPORT_GENERATED
  REPORT_DOWNLOADED

  // System
  SETTINGS_UPDATED
  INTEGRATION_CONFIGURED
  API_KEY_CREATED
  API_KEY_REVOKED

  // Generic CRUD (BaseService compatibility)
  CREATE
  READ
  UPDATE
  DELETE
  LOGIN
  LOGOUT
}

enum AuditSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

model AuditLog {
  id            String         @id @default(uuid())

  // Tenant & Company Context
  tenantId      String
  companyId     String?

  // Actor
  userId        String?
  user          User?          @relation(fields: [userId], references: [id])
  userEmail     String?

  // Action
  action        AuditAction
  severity      AuditSeverity  @default(LOW)

  // Resource
  resourceType  String         // "employee", "payroll", "leave", "authentication"
  resourceId    String?

  // Outcome
  success       Boolean        @default(true)
  errorMessage  String?

  // Change Tracking
  beforeValues  Json?          // Resource state before the action
  afterValues   Json?          // Resource state after the action

  // Context & Metadata
  ipAddress     String?
  userAgent     String?
  metadata      Json?          // Arbitrary key-value pairs

  // Timestamps
  timestamp     DateTime       @default(now())

  // Soft-delete
  isDeleted     Boolean        @default(false)
  deletedAt     DateTime?

  // Provenance
  createdBy     String?
  updatedBy     String?

  // Backward compatibility (deprecated — use resourceType/resourceId)
  entityType    String?
  entityId      String?
  details       String?
  module        String?

  // Indexes
  @@index([tenantId, timestamp])
  @@index([tenantId, companyId, timestamp])
  @@index([userId, timestamp])
  @@index([resourceType, resourceId])
  @@index([action])
  @@index([severity])
  @@index([tenantId, action, timestamp])
  @@index([success])
  @@index([tenantId])
  @@index([userId])
  @@index([timestamp])
  @@index([entityType, entityId])
}
```

### Archival Table

```prisma
model AuditLogArchive {
  id            String         @id
  tenantId      String
  companyId     String?
  userId        String?
  userEmail     String?
  action        AuditAction
  severity      AuditSeverity  @default(LOW)
  resourceType  String
  resourceId    String?
  success       Boolean        @default(true)
  errorMessage  String?
  beforeValues  Json?
  afterValues   Json?
  ipAddress     String?
  userAgent     String?
  metadata      Json?
  timestamp     DateTime
  archivedAt    DateTime       @default(now())
  createdBy     String?

  @@index([tenantId, timestamp])
  @@index([tenantId, companyId, timestamp])
  @@index([userId, timestamp])
  @@index([resourceType, resourceId])
  @@index([archivedAt])
}
```

### Archival Lifecycle

| Stage | Table | Retention | Trigger |
|---|---|---|---|
| Active | `AuditLog` | 0–90 days | Real-time writes |
| Archived | `AuditLogArchive` | 91 days – 7 years | Scheduled job moves rows |
| Purged | Deleted | > 7 years (configurable) | Scheduled job deletes from archive |

---

## 4. Migration Impact

### Schema Changes

| Change | Type | Risk |
|---|---|---|
| `action` column: `String` → `AuditAction` enum | **Breaking** — existing rows need value migration | Medium |
| New `severity` column (enum, default `LOW`) | Additive | Low |
| New `companyId`, `userEmail`, `resourceType`, `resourceId`, `success`, `errorMessage`, `beforeValues`, `afterValues`, `userAgent`, `module` columns | Additive (all nullable or with defaults) | Low |
| Old `entityType`/`entityId`/`details` kept as nullable deprecated | Non-breaking | Low |
| New `AuditLogArchive` table | Additive | Low |
| 7 new composite indexes on `AuditLog` | Additive | Low-Medium (build time on large tables) |

### Data Migration Steps

1. **Add new columns** as nullable with defaults (safe, online)
2. **Backfill `resourceType`** from `entityType` for existing rows
3. **Backfill `resourceId`** from `entityId` for existing rows
4. **Migrate `action` values** from free-text to enum (map `"CREATE"` → `CREATE`, `"LOGIN"` → `LOGIN`, etc.)
5. **Pre-check**: Run `SELECT DISTINCT action FROM "AuditLog"` to identify all values before migration
6. **Create `AuditLogArchive`** table (zero risk)
7. **Build indexes** (schedule during maintenance window if table is large)

### Code Changes Required After Migration

| File | Change |
|---|---|
| `apps/web/src/lib/audit/audit.service.ts` | Replace Redis-only writes with `prisma.auditLog.create()`. Implement `search()`, `getResourceAuditTrail()`, `getUserActivity()`, `generateComplianceReport()` with real Prisma queries. Refactor `cleanup()` to archive-then-delete. |
| `apps/web/src/lib/services/base.service.ts` | Update `createAuditLog()` to use `resourceType` instead of `module`, pass `AuditAction` enum values |
| `apps/web/src/lib/audit/audit.service.ts` (TS enums) | Replace TypeScript enums with Prisma-generated types or add mapping layer |

---

## 5. Acceptance Criteria (Gate 2A)

1. Enhanced `AuditLog` schema migrated with all new columns
2. `AuditLogArchive` table created
3. Existing data backfilled (`resourceType` from `entityType`, `resourceId` from `entityId`)
4. `action` column migrated to enum (all existing values mapped)
5. `BaseService.createAuditLog()` field mapping bug resolved
6. Schema approved for downstream workstream integration

---

## Related Documents

- [Schema Gap Assessment](./SCHEMA-GAP-ASSESSMENT.md)
- [Audit/Compliance Guide](./GUIDE-AUDIT-COMPLIANCE-COMPLETION.md)
- [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
