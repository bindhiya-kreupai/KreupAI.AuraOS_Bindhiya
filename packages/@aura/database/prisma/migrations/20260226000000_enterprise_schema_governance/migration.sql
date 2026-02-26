-- Migration: Enterprise Schema Governance
-- Generated: 2026-02-26
-- Phase 5 - P0 Critical Schema Fixes:
--   - Add soft delete fields (is_deleted, deleted_at) to core models
--   - Add performance indexes to high-query models
--   - Add audit columns (created_by, updated_by) to core models
-- All changes are additive and safe to run on existing data.

-- ============================================================================
-- PART 1: ADD SOFT DELETE COLUMNS
-- ============================================================================

-- Company
ALTER TABLE "Company"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- Grade
ALTER TABLE "Grade"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- LeaveType
ALTER TABLE "LeaveType"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- Skill
ALTER TABLE "Skill"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- LeaveBalance
ALTER TABLE "LeaveBalance"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- AttendancePunch
ALTER TABLE "AttendancePunch"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- AttendanceRecord
ALTER TABLE "AttendanceRecord"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- PayrollRun
ALTER TABLE "PayrollRun"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- Payslip
ALTER TABLE "Payslip"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- SalaryComponent
ALTER TABLE "SalaryComponent"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- SystemSetting
ALTER TABLE "SystemSetting"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- AuditLog
ALTER TABLE "AuditLog"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- User
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- Role
ALTER TABLE "Role"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- Permission
ALTER TABLE "Permission"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- Notification
ALTER TABLE "Notification"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- NotificationRecipient (add isRead and createdAt for query support)
ALTER TABLE "NotificationRecipient"
  ADD COLUMN IF NOT EXISTS "isRead" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- WorkflowDefinition
ALTER TABLE "WorkflowDefinition"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- WorkflowInstance
ALTER TABLE "WorkflowInstance"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- BenefitPlan
ALTER TABLE "BenefitPlan"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- BenefitEnrollment
ALTER TABLE "BenefitEnrollment"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- Candidate
ALTER TABLE "Candidate"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- TrainingSession
ALTER TABLE "TrainingSession"
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- ============================================================================
-- PART 2: CREATE PERFORMANCE INDEXES
-- ============================================================================

-- Employee indexes
CREATE INDEX IF NOT EXISTS "Employee_email_idx" ON "Employee"("email");
CREATE INDEX IF NOT EXISTS "Employee_employeeCode_idx" ON "Employee"("employeeCode");
CREATE INDEX IF NOT EXISTS "Employee_companyId_isDeleted_idx" ON "Employee"("companyId", "isDeleted");

-- LeaveRequest indexes
CREATE INDEX IF NOT EXISTS "LeaveRequest_employeeId_status_idx" ON "LeaveRequest"("employeeId", "status");
CREATE INDEX IF NOT EXISTS "LeaveRequest_startDate_endDate_idx" ON "LeaveRequest"("startDate", "endDate");

-- AttendancePunch indexes
CREATE INDEX IF NOT EXISTS "AttendancePunch_punchTime_idx" ON "AttendancePunch"("punchTime");
CREATE INDEX IF NOT EXISTS "AttendancePunch_employeeId_punchTime_idx" ON "AttendancePunch"("employeeId", "punchTime");

-- AttendanceRecord indexes
CREATE INDEX IF NOT EXISTS "AttendanceRecord_employeeId_date_idx" ON "AttendanceRecord"("employeeId", "date");

-- PayrollRun indexes
CREATE INDEX IF NOT EXISTS "PayrollRun_configId_idx" ON "PayrollRun"("configId");

-- Payslip indexes
CREATE INDEX IF NOT EXISTS "Payslip_employeeId_payrollRunId_idx" ON "Payslip"("employeeId", "payrollRunId");

-- EmployeeDocument indexes
CREATE INDEX IF NOT EXISTS "EmployeeDocument_employeeId_category_idx" ON "EmployeeDocument"("employeeId", "category");
CREATE INDEX IF NOT EXISTS "EmployeeDocument_employeeId_documentTypeId_idx" ON "EmployeeDocument"("employeeId", "documentTypeId");

-- NotificationRecipient indexes
CREATE INDEX IF NOT EXISTS "NotificationRecipient_isRead_idx" ON "NotificationRecipient"("isRead");
CREATE INDEX IF NOT EXISTS "NotificationRecipient_userId_isRead_idx" ON "NotificationRecipient"("userId", "isRead");
CREATE INDEX IF NOT EXISTS "NotificationRecipient_createdAt_idx" ON "NotificationRecipient"("createdAt");

-- AuditLog additional indexes
CREATE INDEX IF NOT EXISTS "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- User indexes
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- Soft delete indexes on newly updated models
CREATE INDEX IF NOT EXISTS "Company_isDeleted_idx" ON "Company"("isDeleted");
CREATE INDEX IF NOT EXISTS "Grade_isDeleted_idx" ON "Grade"("isDeleted");
CREATE INDEX IF NOT EXISTS "LeaveType_isDeleted_idx" ON "LeaveType"("isDeleted");
CREATE INDEX IF NOT EXISTS "Skill_isDeleted_idx" ON "Skill"("isDeleted");
CREATE INDEX IF NOT EXISTS "LeaveBalance_isDeleted_idx" ON "LeaveBalance"("isDeleted");
CREATE INDEX IF NOT EXISTS "AttendancePunch_isDeleted_idx" ON "AttendancePunch"("isDeleted");
CREATE INDEX IF NOT EXISTS "AttendanceRecord_isDeleted_idx" ON "AttendanceRecord"("isDeleted");
CREATE INDEX IF NOT EXISTS "PayrollRun_isDeleted_idx" ON "PayrollRun"("isDeleted");
CREATE INDEX IF NOT EXISTS "Payslip_isDeleted_idx" ON "Payslip"("isDeleted");
CREATE INDEX IF NOT EXISTS "SalaryComponent_isDeleted_idx" ON "SalaryComponent"("isDeleted");
CREATE INDEX IF NOT EXISTS "Notification_isDeleted_idx" ON "Notification"("isDeleted");
CREATE INDEX IF NOT EXISTS "WorkflowDefinition_isDeleted_idx" ON "WorkflowDefinition"("isDeleted");
CREATE INDEX IF NOT EXISTS "WorkflowInstance_isDeleted_idx" ON "WorkflowInstance"("isDeleted");
CREATE INDEX IF NOT EXISTS "BenefitPlan_isDeleted_idx" ON "BenefitPlan"("isDeleted");
CREATE INDEX IF NOT EXISTS "BenefitEnrollment_isDeleted_idx" ON "BenefitEnrollment"("isDeleted");
CREATE INDEX IF NOT EXISTS "Candidate_isDeleted_idx" ON "Candidate"("isDeleted");
CREATE INDEX IF NOT EXISTS "TrainingSession_isDeleted_idx" ON "TrainingSession"("isDeleted");
CREATE INDEX IF NOT EXISTS "User_isDeleted_idx" ON "User"("isDeleted");
CREATE INDEX IF NOT EXISTS "Role_isDeleted_idx" ON "Role"("isDeleted");
CREATE INDEX IF NOT EXISTS "Permission_isDeleted_idx" ON "Permission"("isDeleted");
CREATE INDEX IF NOT EXISTS "AuditLog_isDeleted_idx" ON "AuditLog"("isDeleted");
CREATE INDEX IF NOT EXISTS "SystemSetting_isDeleted_idx" ON "SystemSetting"("isDeleted");
