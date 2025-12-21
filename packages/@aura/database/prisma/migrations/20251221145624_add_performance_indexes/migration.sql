-- Add Performance Indexes for Critical Tables
-- Based on QA Review Recommendations
-- This migration adds indexes to frequently queried fields to improve query performance

-- User table indexes
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_tenantId_status_idx" ON "User"("tenantId", "status");
CREATE INDEX IF NOT EXISTS "User_lastLogin_idx" ON "User"("lastLogin");

-- Employee table indexes
CREATE INDEX IF NOT EXISTS "Employee_companyId_idx" ON "Employee"("companyId");
CREATE INDEX IF NOT EXISTS "Employee_departmentId_idx" ON "Employee"("departmentId");
CREATE INDEX IF NOT EXISTS "Employee_managerId_idx" ON "Employee"("managerId");
CREATE INDEX IF NOT EXISTS "Employee_tenantId_status_idx" ON "Employee"("tenantId", "employmentStatus");
CREATE INDEX IF NOT EXISTS "Employee_employmentStatus_idx" ON "Employee"("employmentStatus");

-- UserSession table indexes
CREATE INDEX IF NOT EXISTS "UserSession_userId_idx" ON "UserSession"("userId");
CREATE INDEX IF NOT EXISTS "UserSession_status_idx" ON "UserSession"("status");
CREATE INDEX IF NOT EXISTS "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");
CREATE INDEX IF NOT EXISTS "UserSession_lastActive_idx" ON "UserSession"("lastActive");

-- AuditLog table indexes
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_module_idx" ON "AuditLog"("module");

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
CREATE INDEX IF NOT EXISTS "Department_companyId_idx" ON "Department"("companyId");
CREATE INDEX IF NOT EXISTS "Department_parentId_idx" ON "Department"("parentId");

-- Company table indexes
CREATE INDEX IF NOT EXISTS "Company_tenantId_idx" ON "Company"("tenantId");

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "User_tenantId_email_idx" ON "User"("tenantId", "email");
CREATE INDEX IF NOT EXISTS "Employee_companyId_departmentId_idx" ON "Employee"("companyId", "departmentId");
CREATE INDEX IF NOT EXISTS "UserSession_userId_status_idx" ON "UserSession"("userId", "status");
