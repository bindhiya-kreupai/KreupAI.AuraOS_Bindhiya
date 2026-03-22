# Audit Coverage Map — Critical Write Paths

**Document Version**: 1.0
**Last Updated**: March 22, 2026
**Owner**: Claude (Planning Agent)
**Workstream**: WS-7 Audit/Compliance
**Purpose**: Identifies which write paths have audit logging and which are gaps

---

## Executive Summary

The codebase has **two API layers** with dramatically different audit postures:

| Layer | Audit Status | Pattern |
|-------|-------------|---------|
| **Legacy routes** (`/api/auth/`, `/api/payroll/`, `/api/leave/`, `/api/attendance/`) | Well-audited | Inline `prisma.auditLog.create()` calls |
| **V1 routes** (`/api/v1/*`) | Almost entirely unaudited | Only 1 of ~100+ v1 routes uses `auditMiddleware` |
| **lib/services** (extending BaseService) | Mixed — 11 of ~30+ services call `createAuditLog()` | Services that extend `BaseService` can use `this.createAuditLog()` |

**Critical architectural finding**: The `withAudit` middleware wrapper exists with pre-built helpers for employee, payroll, leave, and export operations — but only **1 route** in the entire codebase uses it. Wiring this middleware into v1 routes is the fastest path to coverage.

---

## Coverage by Category

### 1. Authentication — FULLY COVERED

All auth write paths have inline `prisma.auditLog.create()` calls.

| Write Path | File | Audited |
|---|---|---|
| Login success/failure | `api/auth/login/route.ts` | YES |
| Logout | `api/auth/logout/route.ts` | YES |
| Password reset (request + reset) | `api/auth/forgot-password/`, `api/auth/reset-password/` | YES |
| MFA setup/verify/validate/disable | `api/auth/mfa/*/route.ts` | YES |
| Token refresh | `api/auth/refresh/route.ts` | YES |
| Profile update | `api/profile/route.ts` | YES |
| Change password | `api/profile/change-password/route.ts` | YES |
| Session revocation | `api/sessions/[id]/route.ts` | YES |
| SSO/MFA/Password policy config | `api/sso-config/`, `api/mfa-config/`, `api/password-policy/` | YES |

**Auth services**: `auth.service.ts` (7 calls), `mfa.service.ts` (3 calls) — all audited.

**No action needed.**

---

### 2. Employee Management — PARTIAL

**Covered (legacy routes + services):**
- `services/employee.service.ts` — 4 `prisma.auditLog.create()` calls
- `services/user.service.ts` — 5 calls
- `lib/services/user.service.ts` — 3 calls (via transaction)
- `api/user-deactivation/route.ts`, `api/user-delegation/route.ts` — audited

**NOT covered (v1 routes + lib services):**

| Write Path | File | Needed Action |
|---|---|---|
| Employee create/update/terminate | `lib/services/employee/employee.service.ts` | `EMPLOYEE_CREATED`, `EMPLOYEE_UPDATED`, `EMPLOYEE_TERMINATED` |
| Employment history CRUD + approve/reject | `lib/services/employment-history.service.ts` | Multiple lifecycle actions |
| Life event create/update/verify/process | `lib/services/life-event.service.ts` | `LIFE_EVENT_CREATED`, `LIFE_EVENT_VERIFIED` |
| Probation create/confirm/extend/fail | `lib/services/probation.service.ts` | `PROBATION_CONFIRMED`, `PROBATION_FAILED` |
| Exit request/clearance | `lib/services/exit.service.ts` | `EXIT_REQUEST_CREATED`, `EXIT_CLEARANCE_COMPLETED` |
| Position create/update/freeze/close | `lib/services/position.service.ts` | `POSITION_CREATED`, `POSITION_APPROVED` |
| ID card issue/revoke | `lib/services/id-card.service.ts` | `ID_CARD_ISSUED` |
| Letter create/issue | `lib/services/letter.service.ts` | `LETTER_ISSUED` |
| Employee status changes | `api/v1/employee-statuses/route.ts` | `EMPLOYEE_STATUS_CHANGED` |

---

### 3. Payroll — PARTIAL

**Covered (legacy routes)**: 15+ route files with inline audit calls (salary structures, statutory deductions, payslips, bank file, tax calculation, arrears, off-cycle, reimbursements, garnishments, loan recovery, year-end, bonus, settings, reconciliation).

**NOT covered (v1 routes + lib services):**

| Write Path | File | Needed Action |
|---|---|---|
| Payroll run create | `api/v1/payroll/runs/route.ts` | `PAYROLL_RUN_INITIATED` |
| Payroll run calculate | `api/v1/payroll/runs/[id]/calculate/route.ts` | `PAYROLL_RUN_CALCULATED` |
| Payroll run finalize | `api/v1/payroll/runs/[id]/finalize/route.ts` | `PAYROLL_RUN_FINALIZED` |
| Salary structures (v1) | `api/v1/payroll/salary-structures/route.ts` | `SALARY_STRUCTURE_CREATED` |
| Retroactive adjustment | `api/v1/payroll/retroactive/route.ts` | `RETROACTIVE_ADJUSTMENT_CREATED` |
| Tax document generation | `api/v1/payroll/tax-documents/generate/route.ts` | `TAX_DOCUMENT_GENERATED` |
| Year-end process (v1) | `api/v1/payroll/year-end/process/route.ts` | `YEAR_END_PROCESSING` |
| Payroll service (lib) | `lib/services/payroll.service.ts` (13 write ops) | Multiple payroll actions |
| Payroll service (lib/payroll) | `lib/services/payroll/payroll.service.ts` | Multiple payroll actions |

---

### 4. Leave — PARTIAL

**Covered (legacy routes)**: accrual, policy, comp-off, carry-forward, holidays, encashment, leave types.

**NOT covered (v1 routes + lib services):**

| Write Path | File | Needed Action |
|---|---|---|
| Leave request create | `api/v1/leaves/route.ts` | `LEAVE_REQUEST_CREATED` |
| Leave approve/reject | `api/v1/leaves/[id]/approve/`, `reject/` | `LEAVE_REQUEST_APPROVED`, `REJECTED` |
| Leave apply (v1) | `api/v1/leave/apply/route.ts` | `LEAVE_REQUEST_CREATED` |
| Leave policy create (v1) | `api/v1/leave/policies/route.ts` | `LEAVE_POLICY_CREATED` |
| Leave encash (v1) | `api/v1/leave/encash/route.ts` | `LEAVE_ENCASHMENT_REQUESTED` |
| Leave balance adjust | `api/v1/leave-balances/[id]/adjust/route.ts` | `LEAVE_BALANCE_ADJUSTED` |
| Leave service (lib) | `lib/services/leave.service.ts` | All leave operations |

---

### 5. Attendance — PARTIAL

**Covered (legacy routes)**: field force, rules, punch rules, shift swap, shifts, WFH, approval workflow, time capture, time rounding, roster, comp-off, geo-fencing, IP restriction.

**NOT covered (v1 routes + lib services):**

| Write Path | File | Needed Action |
|---|---|---|
| Attendance record approve/reject | `api/v1/attendance/records/[id]/approve/` | `ATTENDANCE_REGULARIZED` |
| Punch create/update/verify | `api/v1/attendance/punches/` | `ATTENDANCE_MARKED` |
| Biometric verify | `api/v1/attendance/biometric/verify/route.ts` | `BIOMETRIC_VERIFIED` |
| Regularization approve/reject | `api/v1/regularizations/` | `REGULARIZATION_APPROVED/REJECTED` |
| Shift-management service (18 writes) | `lib/services/shift-management.service.ts` | Multiple shift actions |
| Time-tracking service (10 writes) | `lib/services/time-tracking.service.ts` | Multiple attendance actions |

---

### 6. Recruitment — ZERO COVERAGE

**Most severely uncovered domain.** Zero audit logging across both API layers.

| Write Path | File | Needed Action |
|---|---|---|
| Job posting create | `api/recruitment/jobs/route.ts` | `JOB_POSTING_CREATED` |
| Application create/status change | `api/recruitment/applications/route.ts` | `APPLICATION_CREATED`, `STATUS_CHANGED` |
| Interview schedule/update | `api/recruitment/interviews/route.ts` | `INTERVIEW_SCHEDULED` |
| Interview feedback | `api/recruitment/interviews/feedback/route.ts` | `INTERVIEW_FEEDBACK_SUBMITTED` |
| Job offer create/update | `api/recruitment/offers/route.ts` | `OFFER_CREATED`, `OFFER_STATUS_CHANGED` |
| Background check | `api/recruitment/background-checks/route.ts` | `BACKGROUND_CHECK_INITIATED` |
| Requisition create/update | `api/recruitment/requisitions/route.ts` | `REQUISITION_CREATED` |
| All v1 recruitment routes | `api/v1/recruitment/*` (~17 routes) | Multiple actions |

---

### 7. Settings/Configuration — PARTIAL

**Covered**: roles CRUD, user role assignment, master data CUD, role service, company service, department service, master data service, license service.

**NOT covered**: v1 admin routes — permission matrix, tenant management, feature flags, custom fields, workflows, API keys, policies, AI config, branding, data import, access certifications, forms, webhooks.

---

### 8. Data Export — PARTIAL

**Covered**: Export request (v1 uses `auditMiddleware.exportData`), export service.

**NOT covered**: Report generation, report execution (v1), analytics report service, dashboard create/update, audit log export.

---

## Priority Matrix

| Priority | Category | Unaudited Write Paths | Risk |
|---|---|---|---|
| **P0** | Recruitment | ~20 | Candidate/offer changes invisible to compliance |
| **P0** | Payroll (v1) | ~15 | Payroll run lifecycle, salary changes untracked |
| **P0** | Settings/Admin (v1) | ~15 | Permission changes, API keys, feature flags untracked |
| **P1** | Leave (v1) | ~12 | Leave approval workflows unaudited |
| **P1** | Employee Mgmt (v1 + lib) | ~12 | Employee lifecycle events silently mutating |
| **P1** | Attendance (v1) | ~10 | Regularization approvals, punch data |
| **P2** | Benefits | ~8 | Enrollment and COBRA events |
| **P2** | Data Export | ~5 | Report generation, dashboard creation |

---

## Recommended Remediation Approach

### Fastest path (for Copilot)

1. **Enable `auditService.log()` persistence** — uncomment `prisma.auditLog.create()` in `audit.service.ts` (single line change, highest impact)
2. **Wire `auditMiddleware.*` into v1 route exports** — the pre-configured wrappers already exist for employee, payroll, leave, and export operations
3. **Add `this.createAuditLog()` calls** to BaseService subclass write methods that are missing them
4. **Add recruitment-specific AuditAction enum values** and create corresponding middleware helpers

### Sequencing alignment

| Workstream Week | Audit Coverage Target |
|---|---|
| Week 2-3 (Audit) | Enable persistent writes, fix BaseService mapping, wire middleware to P0 routes |
| Week 4 (Core close) | Employee management v1 routes audited |
| Week 5-6 (Leave) | Leave v1 routes audited |
| Week 7-8 (Attendance) | Attendance v1 routes audited |
| Week 9-11 (Payroll) | Payroll v1 routes audited |
| Week 12-13 (Recruitment) | Recruitment routes audited (from zero) |

---

## Related Documents

- [Audit Schema Design](./AUDIT-SCHEMA-DESIGN.md)
- [Week 2 Copilot Handoff](./WEEK2-COPILOT-HANDOFF.md)
- [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
