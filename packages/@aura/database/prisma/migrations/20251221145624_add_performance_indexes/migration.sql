-- Add Performance Indexes for Critical Tables
-- Based on QA Review Recommendations
-- This migration adds indexes to frequently queried fields to improve query performance

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

-- User table indexes
SELECT pg_temp.create_index_if_columns_exist('User_email_idx', 'User', ARRAY['email']);
SELECT pg_temp.create_index_if_columns_exist('User_tenantId_status_idx', 'User', ARRAY['tenantId', 'status']);
SELECT pg_temp.create_index_if_columns_exist('User_lastLogin_idx', 'User', ARRAY['lastLogin']);

-- Employee table indexes
SELECT pg_temp.create_index_if_columns_exist('Employee_companyId_idx', 'Employee', ARRAY['companyId']);
SELECT pg_temp.create_index_if_columns_exist('Employee_departmentId_idx', 'Employee', ARRAY['departmentId']);
SELECT pg_temp.create_index_if_columns_exist('Employee_managerId_idx', 'Employee', ARRAY['managerId']);
SELECT pg_temp.create_index_if_columns_exist('Employee_tenantId_status_idx', 'Employee', ARRAY['tenantId', 'employmentStatus']);
SELECT pg_temp.create_index_if_columns_exist('Employee_employmentStatus_idx', 'Employee', ARRAY['employmentStatus']);

-- UserSession table indexes
SELECT pg_temp.create_index_if_columns_exist('UserSession_userId_idx', 'UserSession', ARRAY['userId']);
SELECT pg_temp.create_index_if_columns_exist('UserSession_status_idx', 'UserSession', ARRAY['status']);
SELECT pg_temp.create_index_if_columns_exist('UserSession_expiresAt_idx', 'UserSession', ARRAY['expiresAt']);
SELECT pg_temp.create_index_if_columns_exist('UserSession_lastActive_idx', 'UserSession', ARRAY['lastActive']);

-- AuditLog table indexes
SELECT pg_temp.create_index_if_columns_exist('AuditLog_userId_idx', 'AuditLog', ARRAY['userId']);
SELECT pg_temp.create_index_if_columns_exist('AuditLog_timestamp_idx', 'AuditLog', ARRAY['timestamp']);
SELECT pg_temp.create_index_if_columns_exist('AuditLog_action_idx', 'AuditLog', ARRAY['action']);
SELECT pg_temp.create_index_if_columns_exist('AuditLog_module_idx', 'AuditLog', ARRAY['module']);

-- Attendance table indexes (if exists)
-- CREATE INDEX IF NOT EXISTS "Attendance_employeeId_idx" ON "Attendance"("employeeId");
-- CREATE INDEX IF NOT EXISTS "Attendance_date_idx" ON "Attendance"("date");
-- CREATE INDEX IF NOT EXISTS "Attendance_status_idx" ON "Attendance"("status");

-- Leave table indexes (if exists)
-- CREATE INDEX IF NOT EXISTS "Leave_employeeId_idx" ON "Leave"("employeeId");
-- CREATE INDEX IF NOT EXISTS "Leave_status_idx" ON "Leave"("status");
-- CREATE INDEX IF NOT EXISTS "Leave_approverId_idx" ON "Leave"("approverId");

-- PerformanceReview table indexes (if exists)
-- CREATE INDEX IF NOT EXISTS "PerformanceReview_employeeId_idx" ON "PerformanceReview"("employeeId");
-- CREATE INDEX IF NOT EXISTS "PerformanceReview_reviewerId_idx" ON "PerformanceReview"("reviewerId");
-- CREATE INDEX IF NOT EXISTS "PerformanceReview_status_idx" ON "PerformanceReview"("status");

-- Candidate table indexes (if exists)
-- CREATE INDEX IF NOT EXISTS "Candidate_email_idx" ON "Candidate"("email");
-- CREATE INDEX IF NOT EXISTS "Candidate_status_idx" ON "Candidate"("status");

-- JobOpening table indexes (if exists)
-- CREATE INDEX IF NOT EXISTS "JobOpening_status_idx" ON "JobOpening"("status");
-- CREATE INDEX IF NOT EXISTS "JobOpening_departmentId_idx" ON "JobOpening"("departmentId");

-- Department table indexes
SELECT pg_temp.create_index_if_columns_exist('Department_companyId_idx', 'Department', ARRAY['companyId']);
SELECT pg_temp.create_index_if_columns_exist('Department_parentId_idx', 'Department', ARRAY['parentId']);

-- Company table indexes
SELECT pg_temp.create_index_if_columns_exist('Company_tenantId_idx', 'Company', ARRAY['tenantId']);

-- Composite indexes for common query patterns
SELECT pg_temp.create_index_if_columns_exist('User_tenantId_email_idx', 'User', ARRAY['tenantId', 'email']);
SELECT pg_temp.create_index_if_columns_exist('Employee_companyId_departmentId_idx', 'Employee', ARRAY['companyId', 'departmentId']);
SELECT pg_temp.create_index_if_columns_exist('UserSession_userId_status_idx', 'UserSession', ARRAY['userId', 'status']);
