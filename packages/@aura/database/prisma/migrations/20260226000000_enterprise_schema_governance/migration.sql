-- Migration: Enterprise Schema Governance
-- Generated: 2026-02-26
-- Phase 5 - P0 Critical Schema Fixes:
--   - Add soft delete fields (is_deleted, deleted_at) to core models
--   - Add performance indexes to high-query models
--   - Add audit columns (created_by, updated_by) to core models
-- All changes are additive and safe to run on existing data.

CREATE OR REPLACE FUNCTION pg_temp.create_index_if_columns_exist(
  target_index_name TEXT,
  target_table_name TEXT,
  target_columns TEXT[]
) RETURNS VOID AS $$
DECLARE
  matched_columns INTEGER;
  quoted_columns TEXT;
BEGIN
  SELECT COUNT(*)
  INTO matched_columns
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = target_table_name
    AND column_name = ANY(target_columns);

  IF matched_columns = array_length(target_columns, 1) THEN
    SELECT string_agg(format('%I', column_name), ', ' ORDER BY ordinality)
    INTO quoted_columns
    FROM unnest(target_columns) WITH ORDINALITY AS columns(column_name, ordinality);

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON %I(%s)',
      target_index_name,
      target_table_name,
      quoted_columns
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

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
SELECT pg_temp.create_index_if_columns_exist('Employee_email_idx', 'Employee', ARRAY['email']);
SELECT pg_temp.create_index_if_columns_exist('Employee_employeeCode_idx', 'Employee', ARRAY['employeeCode']);
SELECT pg_temp.create_index_if_columns_exist('Employee_companyId_isDeleted_idx', 'Employee', ARRAY['companyId', 'isDeleted']);

-- LeaveRequest indexes
SELECT pg_temp.create_index_if_columns_exist('LeaveRequest_employeeId_status_idx', 'LeaveRequest', ARRAY['employeeId', 'status']);
SELECT pg_temp.create_index_if_columns_exist('LeaveRequest_startDate_endDate_idx', 'LeaveRequest', ARRAY['startDate', 'endDate']);

-- AttendancePunch indexes
SELECT pg_temp.create_index_if_columns_exist('AttendancePunch_punchTime_idx', 'AttendancePunch', ARRAY['punchTime']);
SELECT pg_temp.create_index_if_columns_exist('AttendancePunch_employeeId_punchTime_idx', 'AttendancePunch', ARRAY['employeeId', 'punchTime']);

-- AttendanceRecord indexes
SELECT pg_temp.create_index_if_columns_exist('AttendanceRecord_employeeId_date_idx', 'AttendanceRecord', ARRAY['employeeId', 'date']);

-- PayrollRun indexes
SELECT pg_temp.create_index_if_columns_exist('PayrollRun_configId_idx', 'PayrollRun', ARRAY['configId']);

-- Payslip indexes
SELECT pg_temp.create_index_if_columns_exist('Payslip_employeeId_payrollRunId_idx', 'Payslip', ARRAY['employeeId', 'payrollRunId']);

-- EmployeeDocument indexes
SELECT pg_temp.create_index_if_columns_exist('EmployeeDocument_employeeId_category_idx', 'EmployeeDocument', ARRAY['employeeId', 'category']);
SELECT pg_temp.create_index_if_columns_exist('EmployeeDocument_employeeId_documentTypeId_idx', 'EmployeeDocument', ARRAY['employeeId', 'documentTypeId']);

-- NotificationRecipient indexes
SELECT pg_temp.create_index_if_columns_exist('NotificationRecipient_isRead_idx', 'NotificationRecipient', ARRAY['isRead']);
SELECT pg_temp.create_index_if_columns_exist('NotificationRecipient_userId_isRead_idx', 'NotificationRecipient', ARRAY['userId', 'isRead']);
SELECT pg_temp.create_index_if_columns_exist('NotificationRecipient_createdAt_idx', 'NotificationRecipient', ARRAY['createdAt']);

-- AuditLog additional indexes
SELECT pg_temp.create_index_if_columns_exist('AuditLog_entityType_entityId_idx', 'AuditLog', ARRAY['entityType', 'entityId']);

-- User indexes
SELECT pg_temp.create_index_if_columns_exist('User_email_idx', 'User', ARRAY['email']);

-- Soft delete indexes on newly updated models
SELECT pg_temp.create_index_if_columns_exist('Company_isDeleted_idx', 'Company', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('Grade_isDeleted_idx', 'Grade', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('LeaveType_isDeleted_idx', 'LeaveType', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('Skill_isDeleted_idx', 'Skill', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('LeaveBalance_isDeleted_idx', 'LeaveBalance', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('AttendancePunch_isDeleted_idx', 'AttendancePunch', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('AttendanceRecord_isDeleted_idx', 'AttendanceRecord', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('PayrollRun_isDeleted_idx', 'PayrollRun', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('Payslip_isDeleted_idx', 'Payslip', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('SalaryComponent_isDeleted_idx', 'SalaryComponent', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('Notification_isDeleted_idx', 'Notification', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('WorkflowDefinition_isDeleted_idx', 'WorkflowDefinition', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('WorkflowInstance_isDeleted_idx', 'WorkflowInstance', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('BenefitPlan_isDeleted_idx', 'BenefitPlan', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('BenefitEnrollment_isDeleted_idx', 'BenefitEnrollment', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('Candidate_isDeleted_idx', 'Candidate', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('TrainingSession_isDeleted_idx', 'TrainingSession', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('User_isDeleted_idx', 'User', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('Role_isDeleted_idx', 'Role', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('Permission_isDeleted_idx', 'Permission', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('AuditLog_isDeleted_idx', 'AuditLog', ARRAY['isDeleted']);
SELECT pg_temp.create_index_if_columns_exist('SystemSetting_isDeleted_idx', 'SystemSetting', ARRAY['isDeleted']);
