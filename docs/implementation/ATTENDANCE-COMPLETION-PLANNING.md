# Attendance Completion — Claude Planning Document

**Document Version**: 1.0
**Last Updated**: March 22, 2026
**Owner**: Claude (Planning Agent)
**Workstream**: WS-4 Attendance Completion (Weeks 7-8)
**Status**: Planning Complete — Ready for Copilot Handoff

---

## Quick Navigation

1. [Attendance Completion Guide](./GUIDE-ATTENDANCE-COMPLETION.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)
4. [Audit Coverage Map](./AUDIT-COVERAGE-MAP.md)

---

## 1. Executive Assessment

### Readiness: STRONGEST FOUNDATION OF ALL WORKSTREAMS

The attendance module is the most complete backend in the feature-completion program. The gap is primarily in **frontend services using mock data** and a few **legacy API routes with mock fallbacks**, while the underlying backend services and v1 API layer are production-grade.

| Area | Status | Detail |
|------|--------|--------|
| Prisma Schema | COMPLETE | 10+ models: AttendancePunch, AttendanceRecord, Shift, ShiftAssignment, ShiftRoster, ShiftSwapRequest, OvertimeRequest, AttendanceRegularization, CompOffRequest, CompOffEarned, GeofenceLocation |
| Backend Services | PRODUCTION-READY | AttendanceService (853 lines, real Prisma), TimeTrackingService (282 lines, real CRUD), ShiftManagementService (390 lines, real CRUD) |
| V1 API Routes | PRODUCTION-READY | 29 routes, all using `withEnhancedAuth`, real Prisma queries |
| Legacy API Routes | MIXED | 22 routes — most real, ~11 return mock data for specialized features |
| Frontend Services | MIXED | `attendance-client.ts` calls real APIs. `attendanceService.ts`, `biometricService.ts`, `shiftService.ts` use mock arrays |
| Dashboard Services | REAL | 20 service classes calling `/attendance/*` endpoints |
| Cron Jobs | REAL | `attendance-sync` runs every 15 minutes, processes daily attendance from punches |
| Tests | PARTIAL | Unit tests for calculations (373 lines), but no integration or E2E tests |
| Audit Logging | MINIMAL | AttendanceService has some `createAuditLog()` calls. V1 routes and TimeTrackingService have zero audit. |

### Key Insight

Unlike other workstreams where the backend is mock-heavy, attendance has the **inverse problem**: the backend is real but some frontend services bypass the real APIs and use hardcoded mock arrays. The fix is to point these frontend services at the existing real API endpoints.

---

## 2. Scope Confirmation

### In Scope (Release)

| # | Feature | Current State | Work Required | Priority |
|---|---------|---------------|---------------|----------|
| 1 | Replace `attendanceService.ts` mock data with real API calls | Uses MOCK_ATTENDANCE_LOG, MOCK_TEAM_ATTENDANCE, MOCK_ANOMALIES | Rewrite to use `attendance-client.ts` or direct API calls | P0 |
| 2 | Replace `biometricService.ts` mock data | Uses MOCK_DEVICES, MOCK_PUNCHES, MOCK_ENROLLMENTS | Connect to v1 biometric endpoints | P0 |
| 3 | Replace `shiftService.ts` mock data | Uses MOCK_SHIFT_PATTERNS, MOCK_ROSTER_EMPLOYEES | Connect to ShiftManagementService endpoints | P0 |
| 4 | Fix shift swap roster completion | `managerApproveSwap()` has TODO: "Actually swap the roster entries" | Implement transactional roster swap | P0 |
| 5 | Wire mock legacy API routes to real data | ~11 routes return mock (field-force, punch-rules, time-capture, comp-off, ip-restriction, geo-fencing, rules, shift-swap, roster, WFH, time-rounding) | Replace mock returns with Prisma queries | P1 |
| 6 | Add audit logging to v1 attendance routes | Zero coverage on ~10 write paths | Wire `auditMiddleware` or inline audit calls | P1 |
| 7 | Add audit logging to TimeTrackingService + ShiftManagementService | Zero coverage | Add `createAuditLog()` to write methods | P1 |
| 8 | Country-specific overtime rates | `calculateOvertime()` exists but country configs incomplete | Implement UAE/KSA/India overtime multipliers | P2 |

### Out of Scope (Deferred)

| # | Feature | Reason |
|---|---------|--------|
| 1 | AI-based facial recognition attendance | Requires external AI service integration; beyond feature-completion scope |
| 2 | Physical biometric device API integration (ZKTeco, Suprema) | Hardware-dependent; attendance recording works via GPS/manual punch |
| 3 | InfluxDB time-series for punch data | Current PostgreSQL model is sufficient for release volumes |
| 4 | Ramadan working hours adjustment | Complex policy engine; can be handled via shift configuration post-release |
| 5 | Advanced anomaly ML detection | Rule-based anomaly detection already exists; ML enhancement deferred |

---

## 3. File and Module Impact Map

### Files Requiring Changes

#### P0 — Frontend Mock Replacement

| File | Change | Lines |
|------|--------|-------|
| `apps/web/src/services/attendanceService.ts` | Replace MOCK arrays with real API calls via `attendance-client.ts` or direct fetch | ~503 |
| `apps/web/src/services/biometricService.ts` | Replace MOCK_DEVICES, MOCK_PUNCHES, MOCK_ENROLLMENTS with real API calls | Moderate |
| `apps/web/src/services/shiftService.ts` | Replace MOCK_SHIFT_PATTERNS, MOCK_ROSTER_EMPLOYEES with real API calls | Moderate |
| `apps/web/src/services/shiftManagementService.ts` | Replace mock arrays with ShiftManagementService API calls | Moderate |

#### P0 — Backend Fix

| File | Change |
|------|--------|
| `apps/web/src/lib/services/shift-management.service.ts` (line ~346) | Implement actual roster swap in `managerApproveSwap()` — update ShiftRoster entries transactionally |

#### P1 — Legacy API Route Fixes

| File | Change |
|------|--------|
| `apps/web/src/app/api/attendance/field-force/route.ts` | Replace `mockFieldVisits` with Prisma query |
| `apps/web/src/app/api/attendance/punch-rules/route.ts` | Replace `mockPunchRules` with Prisma query |
| `apps/web/src/app/api/attendance/time-capture/route.ts` | Replace `mockTimeCaptures` with Prisma query |
| `apps/web/src/app/api/attendance/comp-off/route.ts` | Replace `mockCompOffs` with Prisma CompOffRequest query |
| `apps/web/src/app/api/attendance/ip-restriction/route.ts` | Replace `mockIPRestrictions` with Prisma query |
| `apps/web/src/app/api/attendance/geo-fencing/route.ts` | Replace `mockGeoFences` with Prisma GeofenceLocation query |
| `apps/web/src/app/api/attendance/rules/route.ts` | Replace `mockRules` with Prisma query |
| `apps/web/src/app/api/attendance/shift-swap/route.ts` | Replace `mockSwaps` with ShiftManagementService |
| `apps/web/src/app/api/attendance/roster/route.ts` | Replace `mockRosters` with ShiftManagementService |
| `apps/web/src/app/api/attendance/work-from-home/route.ts` | Replace `mockWFH` with Prisma query |
| `apps/web/src/app/api/attendance/time-rounding/route.ts` | Replace `mockRoundingRules` with Prisma query |

#### P1 — Audit Coverage

| File | Change |
|------|--------|
| `apps/web/src/lib/services/time-tracking.service.ts` | Add `createAuditLog()` to createPunch, verifyPunch, approveRecord, rejectRecord |
| `apps/web/src/lib/services/shift-management.service.ts` | Add `createAuditLog()` to createShift, createAssignment, peerApproveSwap, managerApproveSwap |
| `apps/web/src/app/api/v1/attendance/clock-in/route.ts` | Wire audit middleware |
| `apps/web/src/app/api/v1/attendance/clock-out/route.ts` | Wire audit middleware |
| `apps/web/src/app/api/v1/attendance/records/[id]/approve/route.ts` | Wire audit middleware |
| `apps/web/src/app/api/v1/attendance/regularize/route.ts` | Wire audit middleware |
| `apps/web/src/app/api/v1/attendance/biometric/verify/route.ts` | Wire audit middleware |

### Files NOT Requiring Changes

| File | Reason |
|------|--------|
| `packages/@aura/database/prisma/schema.prisma` | All 10+ attendance models exist and are production-grade |
| `apps/web/src/lib/services/attendance/attendance.service.ts` | 853 lines, real Prisma, already production-ready |
| `apps/web/src/lib/services/time-tracking.service.ts` | Real CRUD, only needs audit additions |
| `apps/web/src/lib/services/shift-management.service.ts` | Real CRUD, only needs swap completion + audit |
| `apps/web/src/lib/services/attendance-client.ts` | Frontend API client, already calls real endpoints |
| `apps/web/src/app/dashboard/attendance/services.ts` | 949 lines, 20 service classes, all call real APIs |
| All v1 attendance routes (except audit additions) | Already use real Prisma queries |
| `services/scheduling-service/` (attendance-sync cron) | Already runs every 15 minutes, processes real data |

### Schema Assessment

**ZERO schema changes required.** All models exist: AttendancePunch (37 fields), AttendanceRecord (27 fields), Shift (20 fields), ShiftAssignment (11 fields), ShiftRoster (12 fields), ShiftSwapRequest (16 fields), OvertimeRequest (22 fields), AttendanceRegularization (15 fields), CompOffRequest (15 fields), CompOffEarned (15 fields), GeofenceLocation (9 fields).

---

## 4. Critical Fix: Shift Swap Roster Completion

The `managerApproveSwap()` method in `shift-management.service.ts` (line ~346) has a TODO stub where it should transactionally swap roster entries. Required implementation:

```
1. Start Prisma transaction
2. Find requestor's ShiftRoster for requestorDate
3. Find swapWith's ShiftRoster for swapWithDate
4. Swap the shiftId values between the two roster entries
5. Update ShiftSwapRequest status to COMPLETED
6. Commit transaction
7. If any step fails, roll back and set status to FAILED
```

This must be **transactional** — a partial swap (one roster updated, the other not) is a data integrity violation.

---

## 5. Acceptance Criteria

### AC-1: Frontend Mock Replacement
- [ ] `attendanceService.ts` returns real data from API (no MOCK_ arrays)
- [ ] `biometricService.ts` returns real data from API
- [ ] `shiftService.ts` returns real data from API
- [ ] No `MOCK_` prefixed variables remain in production attendance code paths

### AC-2: Shift Swap Transaction
- [ ] `managerApproveSwap()` updates both roster entries in a Prisma transaction
- [ ] Partial swap is prevented (atomic success or failure)
- [ ] Swap status set to COMPLETED only after roster entries are updated
- [ ] Failed swap sets status to REJECTED with error details

### AC-3: Legacy Route Mock Replacement
- [ ] All 11 mock-returning legacy routes replaced with real Prisma queries
- [ ] Each route preserves existing response shape
- [ ] Tenant isolation maintained in all queries

### AC-4: Audit Coverage
- [ ] Clock-in, clock-out, punch verification, record approval/rejection emit audit events
- [ ] Shift creation, assignment, swap approval emit audit events
- [ ] Regularization submission and approval emit audit events
- [ ] All audit entries include `tenantId`, `userId`, action, and resource details

### AC-5: Attendance Processing Pipeline
- [ ] Punches persisted → attendance-sync job processes → daily records created
- [ ] Team summaries generated from real attendance data
- [ ] Anomaly detection runs against real punch data (not mock arrays)

### AC-6: Overtime Calculation
- [ ] Country-specific overtime rates applied (UAE: 1.25x normal, 1.5x overtime; KSA: 1.5x; India: 2x)
- [ ] Overtime computed from actual clock-in/out vs shift hours
- [ ] Overtime amounts feed into payroll integration point

---

## 6. Test Strategy

### Unit Tests (Extend Existing)

Existing test file: `tests/unit/services/attendance-service.test.ts` (373 lines) — covers calculations, break deduction, overtime detection, anomaly detection.

| # | New Test Case | What It Validates |
|---|---------------|-------------------|
| 1 | Shift swap transaction succeeds atomically | Both roster entries swapped, status COMPLETED |
| 2 | Shift swap transaction rolls back on failure | Partial swap prevented, status unchanged |
| 3 | Overtime rate for UAE (1.25x/1.5x) | Country-specific multiplier applied |
| 4 | Overtime rate for KSA (1.5x) | KSA multiplier applied |
| 5 | Duplicate punch prevention | Same employee, same minute rejected |
| 6 | Regularization applies to daily record | After approval, AttendanceRecord updated with corrected times |

### Integration Tests

| # | Test Case | What It Validates |
|---|-----------|-------------------|
| 1 | Clock-in → clock-out → daily record created | End-to-end punch-to-record pipeline |
| 2 | Regularization submit → approve → record updated | Correction workflow |
| 3 | Shift swap request → peer approve → manager approve → roster swapped | Full swap lifecycle |
| 4 | Punch → attendance-sync processes → team summary reflects | Cron job produces real summaries |
| 5 | Multi-tenant isolation | Tenant A's punches don't appear in Tenant B's records |
| 6 | Geofence validation rejects out-of-radius punch | GPS validation works |

### Operational Tests

| # | Test Case | What It Validates |
|---|-----------|-------------------|
| 1 | Duplicate biometric events handled | Deduplication works |
| 2 | Missing punch-out scenario detected | Anomaly flagged |
| 3 | High-volume punch load (1000/minute) | Performance under load |

---

## 7. Risks

| ID | Risk | Impact | Probability | Mitigation |
|----|------|--------|-------------|------------|
| AR-1 | Frontend `attendanceService.ts` mock data masks real API errors — users see "working" attendance but data isn't persisted | High | Confirmed | Replace mock arrays with real API calls; verify data persistence end-to-end |
| AR-2 | Shift swap TODO stub means approved swaps don't actually change rosters — data integrity gap | High | Confirmed | Implement transactional roster swap in `managerApproveSwap()` |
| AR-3 | 11 legacy routes return mock data while v1 equivalents work — inconsistent behavior between API versions | Medium | Confirmed | Replace mock returns in legacy routes or redirect to v1 handlers |
| AR-4 | Attendance audit logging dependency on Gate 2A | Medium | Confirmed | If Gate 2A still FAIL by Week 7, use inline `prisma.auditLog.create()` |
| AR-5 | Country-specific overtime rates incomplete for release countries | Low | Medium | Implement as configurable multipliers, not hardcoded logic |
| AR-6 | Biometric device integration deferred — some customers may expect it at launch | Medium | Low | GPS and manual punch cover release needs; biometric device API is Phase 2 |

---

## 8. Cross-Workstream Dependencies

| Dependency | Direction | Status |
|-----------|-----------|--------|
| Leave integration | Attendance → Leave (approved leave creates attendance record) | AttendanceService already calls `getApprovedLeaves()` |
| Payroll integration | Attendance → Payroll (overtime hours, work days) | Interface point exists; Payroll workstream (Weeks 9-11) will consume |
| Core employee data | Attendance → Employee table | AVAILABLE — Employee model exists with all required fields |
| Audit persistence (Gate 2A) | Attendance audit → AuditService | BLOCKED (Gate 2A FAIL). Mitigation: use inline audit writes. |
| Shift data | Internal dependency | ShiftManagementService already provides real shift data |

---

## 9. Copilot Handoff — Attendance Weeks 7-8

### Required Reading Before Implementation

1. `docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md`
2. `docs/implementation/FEATURE-COMPLETION-API-CONTRACTS.md`
3. `apps/web/src/lib/services/attendance/attendance.service.ts` — understand existing real backend
4. `apps/web/src/lib/services/time-tracking.service.ts` — understand real CRUD
5. `apps/web/src/lib/services/shift-management.service.ts` — understand shift management + TODO stub
6. `apps/web/src/services/attendanceService.ts` — understand current mock data to replace
7. `apps/web/src/lib/services/attendance-client.ts` — understand existing real API client
8. This document (ATTENDANCE-COMPLETION-PLANNING.md)

### Week 7 Tasks (Attendance Core)

| # | Task | Files | Acceptance Criteria |
|---|------|-------|---------------------|
| 1 | Replace `attendanceService.ts` mock arrays with real API calls | `services/attendanceService.ts` | All methods call real API endpoints; MOCK_ arrays removed |
| 2 | Replace `biometricService.ts` mock arrays | `services/biometricService.ts` | All methods call real API endpoints; MOCK_ arrays removed |
| 3 | Replace `shiftService.ts` mock arrays | `services/shiftService.ts` | All methods call ShiftManagementService endpoints |
| 4 | Replace `shiftManagementService.ts` frontend mock arrays | `services/shiftManagementService.ts` | All methods call real backend endpoints |
| 5 | Implement shift swap roster completion | `lib/services/shift-management.service.ts` `managerApproveSwap()` | Transactional roster swap; atomic success/failure |
| 6 | Replace mock data in 6 critical legacy routes | `api/attendance/{shift-swap,roster,comp-off,geo-fencing,ip-restriction,time-capture}/route.ts` | Routes return real Prisma data |

### Week 8 Tasks (Advanced Completion + Audit)

| # | Task | Files | Acceptance Criteria |
|---|------|-------|---------------------|
| 7 | Replace mock data in 5 remaining legacy routes | `api/attendance/{field-force,punch-rules,rules,work-from-home,time-rounding}/route.ts` | Routes return real Prisma data |
| 8 | Add audit logging to TimeTrackingService write methods | `lib/services/time-tracking.service.ts` | createPunch, verifyPunch, approveRecord, rejectRecord emit audit |
| 9 | Add audit logging to ShiftManagementService write methods | `lib/services/shift-management.service.ts` | createShift, createAssignment, approveSwap emit audit |
| 10 | Wire audit middleware to v1 attendance write routes | `api/v1/attendance/clock-in/`, `clock-out/`, `records/[id]/approve/`, `regularize/`, `biometric/verify/` | Write routes emit audit events |
| 11 | Implement country-specific overtime rates | `lib/services/attendance/attendance.service.ts` `calculateOvertime()` | UAE 1.25x/1.5x, KSA 1.5x, India 2x rates applied |
| 12 | Add new unit + integration tests per test strategy | New test files | Minimum: 6 unit tests + 6 integration tests |

### Implementation Constraints

1. **Preserve existing backend services**: AttendanceService, TimeTrackingService, and ShiftManagementService are production-ready — extend, don't replace
2. **Tenant isolation**: Every query MUST include `tenantId`
3. **Transactional integrity**: Shift swaps MUST use Prisma transactions
4. **Response shape preservation**: Legacy routes must keep existing response shapes when replacing mock data
5. **Cron job compatibility**: attendance-sync job must continue to work after changes
6. **Audit approach**: Same as Leave — if Gate 2A passes, use middleware; if not, use inline `prisma.auditLog.create()`
7. **Bilingual errors**: API error responses must include `message` and `messageAr`

### Deferred Items

These are explicitly NOT in scope for Weeks 7-8:
- Physical biometric device API integration
- Facial recognition
- InfluxDB time-series migration
- Ramadan shift adjustments
- Advanced ML-based anomaly detection
- Notification system integration

---

## Related Documents

- [Attendance Completion Guide](./GUIDE-ATTENDANCE-COMPLETION.md)
- [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
- [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)
- [Audit Coverage Map](./AUDIT-COVERAGE-MAP.md)
- [Schema Gap Assessment](./SCHEMA-GAP-ASSESSMENT.md)
- [Leave Engine Planning](./LEAVE-ENGINE-PLANNING.md)
