DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuditAction') THEN
    CREATE TYPE "AuditAction" AS ENUM (
      'EMPLOYEE_CREATED', 'EMPLOYEE_UPDATED', 'EMPLOYEE_DELETED', 'EMPLOYEE_TERMINATED', 'EMPLOYEE_REHIRED',
      'PAYROLL_RUN_INITIATED', 'PAYROLL_RUN_APPROVED', 'PAYROLL_RUN_REJECTED', 'PAYSLIP_GENERATED', 'PAYSLIP_VIEWED', 'SALARY_UPDATED',
      'LEAVE_REQUEST_CREATED', 'LEAVE_REQUEST_APPROVED', 'LEAVE_REQUEST_REJECTED', 'LEAVE_REQUEST_CANCELLED', 'LEAVE_POLICY_CREATED', 'LEAVE_POLICY_UPDATED', 'LEAVE_ENCASHMENT_REQUESTED',
      'ATTENDANCE_MARKED', 'ATTENDANCE_UPDATED', 'ATTENDANCE_REGULARIZED', 'BULK_ATTENDANCE_IMPORTED',
      'USER_LOGIN', 'USER_LOGOUT', 'USER_LOGIN_FAILED', 'PASSWORD_CHANGED', 'PASSWORD_RESET_REQUESTED',
      'ROLE_ASSIGNED', 'ROLE_REMOVED', 'PERMISSION_GRANTED', 'PERMISSION_REVOKED',
      'DATA_EXPORTED', 'REPORT_GENERATED', 'REPORT_DOWNLOADED',
      'SETTINGS_UPDATED', 'INTEGRATION_CONFIGURED', 'API_KEY_CREATED', 'API_KEY_REVOKED',
      'CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuditSeverity') THEN
    CREATE TYPE "AuditSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
  END IF;
END $$;

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
-- AuditLog: Migrate from String action to AuditAction enum + add new columns
-- ============================================================================

-- Step 1: Add new columns to AuditLog
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "userEmail" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "resourceType" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "resourceId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "success" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "errorMessage" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "beforeValues" JSONB;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "afterValues" JSONB;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "module" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "severity" "AuditSeverity" NOT NULL DEFAULT 'LOW';

-- Step 2: Add expiresAt to UserSession
ALTER TABLE "UserSession" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

-- Step 3: Add lastLogin index to User
SELECT pg_temp.create_index_if_columns_exist('User_lastLogin_idx', 'User', ARRAY['lastLogin']);

-- Step 4: Backfill resourceType from entityType (Task 5)
UPDATE "AuditLog" SET "resourceType" = "entityType" WHERE "resourceType" IS NULL AND "entityType" IS NOT NULL;

-- Step 5: Backfill resourceId from entityId (Task 5)
UPDATE "AuditLog" SET "resourceId" = "entityId" WHERE "resourceId" IS NULL AND "entityId" IS NOT NULL;

-- Step 6: Map existing String action values to AuditAction enum
-- First, normalize any existing action values to match enum variants
UPDATE "AuditLog" SET "action" = 'CREATE' WHERE "action" NOT IN (
  'EMPLOYEE_CREATED', 'EMPLOYEE_UPDATED', 'EMPLOYEE_DELETED', 'EMPLOYEE_TERMINATED', 'EMPLOYEE_REHIRED',
  'PAYROLL_RUN_INITIATED', 'PAYROLL_RUN_APPROVED', 'PAYROLL_RUN_REJECTED', 'PAYSLIP_GENERATED', 'PAYSLIP_VIEWED', 'SALARY_UPDATED',
  'LEAVE_REQUEST_CREATED', 'LEAVE_REQUEST_APPROVED', 'LEAVE_REQUEST_REJECTED', 'LEAVE_REQUEST_CANCELLED', 'LEAVE_POLICY_CREATED', 'LEAVE_POLICY_UPDATED', 'LEAVE_ENCASHMENT_REQUESTED',
  'ATTENDANCE_MARKED', 'ATTENDANCE_UPDATED', 'ATTENDANCE_REGULARIZED', 'BULK_ATTENDANCE_IMPORTED',
  'USER_LOGIN', 'USER_LOGOUT', 'USER_LOGIN_FAILED', 'PASSWORD_CHANGED', 'PASSWORD_RESET_REQUESTED',
  'ROLE_ASSIGNED', 'ROLE_REMOVED', 'PERMISSION_GRANTED', 'PERMISSION_REVOKED',
  'DATA_EXPORTED', 'REPORT_GENERATED', 'REPORT_DOWNLOADED',
  'SETTINGS_UPDATED', 'INTEGRATION_CONFIGURED', 'API_KEY_CREATED', 'API_KEY_REVOKED',
  'CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
);

-- Step 7: Convert action column from String to AuditAction enum
ALTER TABLE "AuditLog" ALTER COLUMN "action" TYPE "AuditAction" USING ("action"::"AuditAction");

-- Step 8: Make entityType nullable (was required, now deprecated)
ALTER TABLE "AuditLog" ALTER COLUMN "entityType" DROP NOT NULL;

-- Step 9: Add new composite indexes to AuditLog
SELECT pg_temp.create_index_if_columns_exist('AuditLog_tenantId_timestamp_idx', 'AuditLog', ARRAY['tenantId', 'timestamp']);
SELECT pg_temp.create_index_if_columns_exist('AuditLog_tenantId_companyId_timestamp_idx', 'AuditLog', ARRAY['tenantId', 'companyId', 'timestamp']);
SELECT pg_temp.create_index_if_columns_exist('AuditLog_userId_timestamp_idx', 'AuditLog', ARRAY['userId', 'timestamp']);
SELECT pg_temp.create_index_if_columns_exist('AuditLog_resourceType_resourceId_idx', 'AuditLog', ARRAY['resourceType', 'resourceId']);
SELECT pg_temp.create_index_if_columns_exist('AuditLog_tenantId_action_timestamp_idx', 'AuditLog', ARRAY['tenantId', 'action', 'timestamp']);
SELECT pg_temp.create_index_if_columns_exist('AuditLog_severity_idx', 'AuditLog', ARRAY['severity']);
SELECT pg_temp.create_index_if_columns_exist('AuditLog_success_idx', 'AuditLog', ARRAY['success']);

-- Step 10: Drop old redundant indexes (replaced by composites above)
-- Note: keeping tenantId, userId, timestamp, action, entityType_entityId as they still serve queries
-- The new composites are additions, not replacements

-- ============================================================================
-- AuditLogArchive: Create archive table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "AuditLogArchive" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "companyId" TEXT,
  "userId" TEXT,
  "userEmail" TEXT,
  "action" "AuditAction" NOT NULL,
  "severity" "AuditSeverity" NOT NULL DEFAULT 'LOW',
  "resourceType" TEXT NOT NULL,
  "resourceId" TEXT,
  "success" BOOLEAN NOT NULL DEFAULT true,
  "errorMessage" TEXT,
  "beforeValues" JSONB,
  "afterValues" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "metadata" JSONB,
  "timestamp" TIMESTAMP(3) NOT NULL,
  "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,

  CONSTRAINT "AuditLogArchive_pkey" PRIMARY KEY ("id")
);

SELECT pg_temp.create_index_if_columns_exist('AuditLogArchive_tenantId_timestamp_idx', 'AuditLogArchive', ARRAY['tenantId', 'timestamp']);
SELECT pg_temp.create_index_if_columns_exist('AuditLogArchive_tenantId_companyId_timestamp_idx', 'AuditLogArchive', ARRAY['tenantId', 'companyId', 'timestamp']);
SELECT pg_temp.create_index_if_columns_exist('AuditLogArchive_userId_timestamp_idx', 'AuditLogArchive', ARRAY['userId', 'timestamp']);
SELECT pg_temp.create_index_if_columns_exist('AuditLogArchive_resourceType_resourceId_idx', 'AuditLogArchive', ARRAY['resourceType', 'resourceId']);
SELECT pg_temp.create_index_if_columns_exist('AuditLogArchive_archivedAt_idx', 'AuditLogArchive', ARRAY['archivedAt']);

-- ============================================================================
-- EmploymentHistory: Add lifecycle enhancement columns + relation
-- ============================================================================

-- Add new columns
ALTER TABLE "EmploymentHistory" ADD COLUMN IF NOT EXISTS "previousStatusId" TEXT;
ALTER TABLE "EmploymentHistory" ADD COLUMN IF NOT EXISTS "newStatusId" TEXT;
ALTER TABLE "EmploymentHistory" ADD COLUMN IF NOT EXISTS "beforeValues" JSONB;
ALTER TABLE "EmploymentHistory" ADD COLUMN IF NOT EXISTS "afterValues" JSONB;
ALTER TABLE "EmploymentHistory" ADD COLUMN IF NOT EXISTS "actorId" TEXT;
ALTER TABLE "EmploymentHistory" ADD COLUMN IF NOT EXISTS "sourceType" TEXT DEFAULT 'MANUAL';
ALTER TABLE "EmploymentHistory" ADD COLUMN IF NOT EXISTS "sourceMetadata" JSONB;
ALTER TABLE "EmploymentHistory" ADD COLUMN IF NOT EXISTS "isBackfilled" BOOLEAN NOT NULL DEFAULT false;

-- Add Employee relation foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'EmploymentHistory_employeeId_fkey'
  ) THEN
    ALTER TABLE "EmploymentHistory"
      ADD CONSTRAINT "EmploymentHistory_employeeId_fkey"
      FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Add composite timeline index
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'EmploymentHistory' AND column_name = 'employeeId'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'EmploymentHistory' AND column_name = 'effectiveDate'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS "EmploymentHistory_employeeId_effectiveDate_idx" ON "EmploymentHistory"("employeeId", "effectiveDate" DESC)';
  END IF;
END $$;

-- ============================================================================
-- UserSession: Add expiresAt index
-- ============================================================================

SELECT pg_temp.create_index_if_columns_exist('UserSession_expiresAt_idx', 'UserSession', ARRAY['expiresAt']);
