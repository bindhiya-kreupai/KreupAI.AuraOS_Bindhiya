# AuraOS Schema Gap Assessment — All 9 Workstreams

**Document Version**: 1.0
**Last Updated**: March 22, 2026
**Owner**: Claude (Planning Agent)
**Source**: Prisma schema at `packages/@aura/database/prisma/schema.prisma` (6,085 lines)

---

## Executive Summary

**6 of 9 workstreams require ZERO schema changes** before implementation can begin. The Prisma schema is far more complete than initially estimated. The primary gap is not in the data model — it is in the **service layer** that connects existing models to real API endpoints.

| Assessment | Workstreams | Count |
|------------|------------|-------|
| **COMPLETE — No schema work** | Core Services, Leave Engine, Attendance, Payroll, Recruitment, Employee Lifecycle | 6 |
| **PARTIAL — Minor additions needed** | Audit/Compliance, Export/Reporting | 2 |
| **MISSING — New models needed** | Mobile Integration | 1 |

This means **implementation can begin immediately** for 6 workstreams without waiting for schema design or migration.

---

## Workstream-by-Workstream Assessment

### WS-1: Core Services — COMPLETE

**Models found**: 12+ core models

| Model | Key Capabilities |
|-------|-----------------|
| `Employee` | 13 indexes, FK to department/location/jobProfile/grade/manager/position/status/type |
| `Department` | Self-referencing hierarchy via `parentId`, cost center FK |
| `Company` | Tenant-scoped, soft-delete support |
| `Position` | Headcount, FTE, salary range, budget tracking, utilization rate |
| `Location` | Type enum (HQ/BRANCH/REMOTE_HUB/WAREHOUSE/PLANT), address FK |
| `EmployeeDocument` | File storage, versioning via `parentId`, expiry, verification, AI OCR fields |
| `BenefitPlan` | 20+ enums, full plan configuration |
| `BenefitEnrollment` | Employee enrollment with dependent tracking |
| `Address` | 4-level hierarchy (Country > State > City > Address) |

Additional: `JobProfile`, `Grade`, `EmergencyContact`, `Asset`, `AssetAssignment`, `IDCard`, `LetterTemplate`

**Schema work needed**: None. Production-grade with multi-tenant support, soft deletes, audit fields, hierarchical structures.

---

### WS-2: Leave Engine — COMPLETE

**Models found**: 8 models

| Model | Key Capabilities |
|-------|-----------------|
| `LeavePolicy` | Accrual type (ANNUAL/MONTHLY/QUARTERLY/TENURE), carry-forward rules, encashment rules, negative balance, consecutive day limits, pro-rata |
| `LeaveBalance` | Running balance with 8 balance columns (opening, accrued, taken, adjusted, encashed, carriedForward, lapsed, current) |
| `LeaveRequest` | Multi-level approvers (JSON), cancellation workflow, half-day support, `balanceDeducted` flag |
| `LeaveAccrual` | Individual accrual records with `runId` for batch tracking, pro-rata factor |
| `LeaveCarryForward` | Year-end transition with eligibility, application, lapse, and expiry tracking |
| `LeaveEncashment` | Trigger types (YEAR_END/ON_RESIGNATION/ON_TERMINATION/ON_REQUEST), calculation details, payroll month link |
| `CompOffEarned` | Worked date/hours, credited days, expiry, usage tracking |
| `LeaveType` | Code, name, isPaid |

**Schema consideration**: The current `LeaveBalance` uses a **mutable counter** pattern. The GUIDE-LEAVE-ENGINE-COMPLETION.md recommends a transaction-based ledger (append-only log). Consider adding a `LeaveTransaction` model for immutable audit trail:

```prisma
model LeaveTransaction {
  id              String   @id @default(uuid())
  tenantId        String
  employeeId      String
  leaveTypeId     String
  policyId        String
  transactionType String   // ACCRUAL, DEDUCTION, REVERSAL, CARRY_FORWARD, LAPSE, ENCASHMENT, ADJUSTMENT
  days            Decimal  @db.Decimal(5, 2)
  balanceAfter    Decimal  @db.Decimal(5, 2)
  referenceType   String?  // LEAVE_REQUEST, ACCRUAL_RUN, CARRY_FORWARD_RUN, MANUAL
  referenceId     String?
  leaveYear       Int
  effectiveDate   DateTime
  notes           String?
  createdAt       DateTime @default(now())
  createdBy       String?

  @@index([tenantId, employeeId, leaveYear])
  @@index([tenantId, employeeId, leaveTypeId])
  @@index([referenceType, referenceId])
  @@index([effectiveDate])
}
```

**Decision needed by Week 5**: Whether to add `LeaveTransaction` or continue with the mutable `LeaveBalance` counter.

---

### WS-3: Attendance — COMPLETE

**Models found**: 8+ models

| Model | Key Capabilities |
|-------|-----------------|
| `AttendancePunch` | GPS location, device type (Mobile/Web/Biometric), IP, photo, regularization flag |
| `AttendanceRecord` | Daily summary with shift info, calculated hours, status enum, late/early flags, unique constraint on `[tenantId, employeeId, date]` |
| `Shift` | Grace periods, break config, overtime rules, flexible shift support |
| `ShiftAssignment` | Employee-shift with effective date range |
| `ShiftRoster` | Weekly/monthly planning, unique per `[tenantId, employeeId, rosterDate]` |
| `ShiftSwapRequest` | 3-tier approval (swap partner, manager, admin) |
| `OvertimeRequest` | Regular/holiday/weekend types, paid/comp-off compensation |
| `AttendanceRegularization` | Type-specific (MISSED_PUNCH/EARLY_OUT/LATE_IN/WRONG_PUNCH), attachments, approval |

Additional: `CompOffRequest`, `ShiftType`, `Holiday`, `GeofenceLocation`

**Schema work needed**: None. Comprehensive attendance system ready for service-layer implementation.

---

### WS-4: Payroll — COMPLETE

**Models found**: 10+ models + 13 compliance models

| Model | Key Capabilities |
|-------|-----------------|
| `PayrollConfiguration` | Country-specific toggles for WPS/GOSI/PF/ESI/TDS, pay cycle, overtime/leave/gratuity bases |
| `PayrollRun` | Full lifecycle (DRAFT → PROCESSING → CALCULATED → PENDING_APPROVAL → APPROVED → PAID → CANCELLED) |
| `Payslip` | Per-employee per-run with JSON earnings/deductions, 10 statutory fields (PF/ESI/Pension/TDS/GOSI/Saned), net salary, working days, LOP |
| `EmployeeSalaryStructure` | Effective date range, component breakdown, CTC |
| `PayrollAdjustment` | One-time adjustments with category (BONUS/PENALTY/ARREAR/RECOVERY) |
| `StatutoryPayment` | Payment tracking with challan/bank references |
| `SalaryComponent` | Master components with calculation type (fixed/percentage), tax/statutory flags |

**Compliance models**: `WPSConfiguration`, `WPSSubmission`, `WPSRecord`, `GOSIConfiguration`, `GOSISubmission`, `GOSIRecord`, `NitaqatConfiguration`, `NitaqatSnapshot`, `EOSBCalculation`, `IndiaPFConfiguration`, `IndiaESIConfiguration`, `IndiaTDSConfiguration`, `IndiaProfessionalTaxConfig`

**Schema work needed**: None. Exceptionally thorough multi-country payroll with all UAE (WPS/GOSI/Nitaqat/EOSB) and India (PF/ESI/TDS/PT) statutory models in place.

---

### WS-5: Recruitment — COMPLETE

**Models found**: 10 models

| Model | Key Capabilities |
|-------|-----------------|
| `JobRequisition` | Priority, position count, salary range, required skills, approval status |
| `Candidate` | Unique email, LinkedIn, resume URL, skills[], experience/education JSON |
| `CandidateApplication` | Status, currentStage, source, overall rating, rejection reason |
| `Interview` | Type, duration, meeting link, interviewer list, status, rating |
| `InterviewFeedback` | Per-interviewer with criteria JSON, recommendation |
| `JobOffer` | Full lifecycle (sent/accepted/declined/expired), salary/bonus/equity/benefits, offer letter URL |
| `BackgroundCheck` | Provider, status, result, findings JSON |
| `OnboardingProgram` | Phase-based with checklist, documents, equipment, training modules |
| `OnboardingInstance` | Progress tracking with task counts |
| `OnboardingTask` | Category, phase, priority, mandatory/approval flags |

**Optional additions**: A `PipelineStage` model for configurable per-tenant stages, and a `ScorecardTemplate` for structured interview scoring. Current design uses `CandidateApplication.currentStage` (string) and `InterviewFeedback.criteria` (JSON), which works but limits configurability.

**Schema work needed**: Minimal. Full requisition-to-onboarding lifecycle already exists.

---

### WS-6: Export/Reporting — PARTIAL

**Models found**: 5 models

| Model | What It Does | Gap |
|-------|-------------|-----|
| `ReportDefinition` | Report configuration with data source, columns, filters, scheduling | No gap |
| `ReportExecution` | Run tracking with status, record count, export URL/format | Limited to reports |
| `CustomReport` | User-defined reports | No gap |
| `DashboardWidget` | Widget configuration | No gap |
| `AnalyticsCache` | Result caching with expiry | No gap |

**Missing**: No dedicated export tracking model. `ReportExecution` handles report exports but does not cover standalone bulk data exports (e.g., "Export all employees to CSV", "Export payroll for government filing").

**Recommended addition**:

```prisma
model ExportJob {
  id            String   @id @default(uuid())
  tenantId      String
  companyId     String?
  requestedBy   String
  exportType    String   // EMPLOYEES, PAYROLL, ATTENDANCE, LEAVE, RECRUITMENT
  entityType    String   // The Prisma model or data source
  filters       Json?    // Applied filters
  format        String   // CSV, EXCEL, PDF
  status        String   @default("PENDING") // PENDING, PROCESSING, COMPLETED, FAILED
  totalRows     Int?
  fileUrl       String?  // Object storage URL
  fileSize      Int?
  fileName      String?
  errorMessage  String?
  startedAt     DateTime?
  completedAt   DateTime?
  expiresAt     DateTime? // Signed URL expiry
  createdAt     DateTime @default(now())
  isDeleted     Boolean  @default(false)

  @@index([tenantId, status])
  @@index([tenantId, requestedBy])
  @@index([tenantId, exportType])
  @@index([expiresAt])
}
```

---

### WS-7: Audit/Compliance — PARTIAL

**Models found**: 3 models

| Model | What It Does | Gap |
|-------|-------------|-----|
| `AuditLog` | General-purpose: tenantId, userId, action, entityType, entityId, metadata JSON, ipAddress | Missing: severity, before/after values, success/failure, userAgent, companyId |
| `ComplianceAuditLog` | Compliance-specific with previousState/newState/changes JSON, bilingual messages | Scoped only to compliance modules |
| `WPSAuditLog` | WPS-specific with before/after values | Scoped only to WPS |

**Critical issues found**:

1. **`AuditService` does not persist to database** — `apps/web/src/lib/audit/audit.service.ts` has `// TODO: Implement with Prisma` comments. Every query method returns empty data. The `log()` method only writes to Redis (TTL 7 days) and console logger.

2. **Field mapping discrepancy** — `BaseService.createAuditLog()` writes a `module` field, but `AuditLog` schema has `entityType`. This is either silently ignored by Prisma or causes runtime errors.

3. **Three fragmented audit tables** — `AuditLog`, `ComplianceAuditLog`, and `WPSAuditLog` have inconsistent schemas. No unified query path.

**Schema enhancement required** (see [AUDIT-SCHEMA-DESIGN.md](./AUDIT-SCHEMA-DESIGN.md) for full design):
- Add `companyId`, `severity` (enum), `userEmail`, `resourceType`/`resourceId` (replacing `entityType`/`entityId`), `success`, `errorMessage`, `beforeValues`/`afterValues` (JSON), `userAgent`, `module` (deprecated compatibility)
- Add `AuditLogArchive` table for retention lifecycle
- Add composite indexes for common query patterns
- Keep deprecated columns (`entityType`, `entityId`, `details`) for backward compatibility

---

### WS-8: Employee Lifecycle — COMPLETE

**Models found**: 9 models

| Model | Key Capabilities |
|-------|-----------------|
| `EmploymentHistory` | 7 change types, before/after state for department/position/grade/location/manager/salary, approval workflow, auto-generation flag |
| `InterCompanyTransfer` | Cross-company with PERMANENT/SECONDMENT/PROJECT_BASED types |
| `EmployeeLifeEvent` | 10+ event types with impact flags (payroll/benefits/tax/emergencyContact) |
| `ExitRequest` | Full exit lifecycle with notice period, clearance, settlement, rehire eligibility |
| `ExitClearance` | Department-by-department clearance tracking |
| `ProbationTracking` | Status lifecycle (ACTIVE → EXTENDED → CONFIRMED/TERMINATED), reviews |
| `ProbationReview` | Performance rating per review cycle |
| `ConfirmationRequest` | Manager/HR approval, confirmation letter, salary revision |
| `LifeEventType` | Configurable event categories |

**Enhancement recommended** (see [LIFECYCLE-SCHEMA-DESIGN.md](./LIFECYCLE-SCHEMA-DESIGN.md)):
- Expand `changeType` values to 14 event types (add PROBATION_START, PROBATION_CONFIRMATION, COMPENSATION_CHANGE, MANAGER_CHANGE, LOCATION_CHANGE, LEAVE_OF_ABSENCE, RETURN_FROM_LEAVE, STATUS_CHANGE)
- Add `previousStatusId`/`newStatusId` columns
- Add `beforeValues`/`afterValues` JSON for flexible snapshots
- Add `sourceType`/`sourceMetadata`/`isBackfilled` for provenance
- Add `Employee` ↔ `EmploymentHistory` Prisma relation (currently missing FK relation)
- Add composite timeline index `[employeeId, effectiveDate DESC]`

---

### WS-9: Mobile Integration — MISSING

**Models found**: 0 dedicated mobile models

**Tangentially relevant**: `AttendancePunch.device`, `Notification`/`NotificationRecipient` (push channel), `GeofenceLocation`, `UserSession` (device/browser fields)

**Minimum new models needed** (by Week 14):

```prisma
model DeviceRegistration {
  id          String   @id @default(uuid())
  tenantId    String
  userId      String
  deviceId    String   // Unique device identifier
  platform    String   // iOS, Android
  pushToken   String?  // FCM/APNs token
  appVersion  String?
  osVersion   String?
  deviceModel String?
  lastActiveAt DateTime?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([tenantId, userId, deviceId])
  @@index([tenantId, userId])
  @@index([pushToken])
}

model PushNotificationLog {
  id              String   @id @default(uuid())
  tenantId        String
  notificationId  String?  // FK to Notification
  deviceId        String   // FK to DeviceRegistration
  payload         Json
  sentAt          DateTime @default(now())
  deliveredAt     DateTime?
  openedAt        DateTime?
  failureReason   String?
  retryCount      Int      @default(0)

  @@index([tenantId, deviceId])
  @@index([notificationId])
  @@index([sentAt])
}

model OfflineSyncQueue {
  id          String   @id @default(uuid())
  tenantId    String
  userId      String
  deviceId    String
  action      String   // CREATE, UPDATE, DELETE
  entityType  String
  entityId    String?
  payload     Json
  syncStatus  String   @default("PENDING") // PENDING, SYNCED, FAILED, CONFLICT
  conflictData Json?
  createdAt   DateTime @default(now())
  syncedAt    DateTime?
  failureReason String?

  @@index([tenantId, userId, syncStatus])
  @@index([deviceId, syncStatus])
}
```

---

## Migration Priority and Sequencing

| Priority | Schema Change | Workstream | By When | Risk |
|----------|--------------|------------|---------|------|
| P0 | Upgrade `AuditLog` + add `AuditLogArchive` | WS-7 Audit | Week 2 | Medium — data migration for `action` column |
| P1 | Enhance `EmploymentHistory` + add Employee relation | WS-8 Lifecycle | Week 3 | Low — all new columns nullable |
| P2 | Add `ExportJob` model | WS-6 Export | Week 12 | Low — new table, no dependencies |
| P2 | Optional `LeaveTransaction` model | WS-2 Leave | Week 5 | Low — new table, additive |
| P3 | Add mobile models (3 new tables) | WS-9 Mobile | Week 14 | Low — new tables, no dependencies |

**Key insight**: P0 (Audit) is the only schema change on the critical path. All other workstreams can start implementation immediately with existing models.

---

## Related Documents

- [Claude Planning Packet](./CLAUDE-PLANNING-PACKET.md)
- [Mock Inventory](./MOCK-INVENTORY.md)
- [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
- [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)
