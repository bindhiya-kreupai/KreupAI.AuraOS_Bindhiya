-- =============================================================================
-- AuraOS Database Partitioning Migration
--
-- Converts high-volume tables to PostgreSQL range partitions.
-- Execute sections independently in a maintenance window.
--
-- Tables:
--   1. AttendancePunch  → monthly range on punchTime
--   2. AuditLog         → monthly range on createdAt
--   3. PayrollEntry     → quarterly range on createdAt
--   4. Notification     → monthly range on createdAt
--
-- Prerequisites:
--   - PostgreSQL 12+ (native declarative partitioning)
--   - pg_partman extension (optional, for automated maintenance)
--   - Maintenance window: low-traffic period
--
-- Execution order:
--   1. Run in a transaction per table
--   2. Validate row counts before dropping _old tables
--   3. Update application connection strings if needed
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_partman SCHEMA partman;

-- =============================================================================
-- 1. ATTENDANCE PUNCH — Monthly partitions
-- =============================================================================

BEGIN;

-- Rename existing table
ALTER TABLE IF EXISTS "public"."AttendancePunch"
  RENAME TO "AttendancePunch_old";

-- Create partitioned parent
CREATE TABLE "public"."AttendancePunch" (
  "id"          TEXT         NOT NULL,
  "employeeId"  TEXT         NOT NULL,
  "type"        TEXT         NOT NULL,   -- 'IN' | 'OUT' | 'BREAK_START' | 'BREAK_END'
  "punchTime"   TIMESTAMPTZ  NOT NULL,
  "deviceId"    TEXT,
  "method"      TEXT,
  "locationLat" DOUBLE PRECISION,
  "locationLng" DOUBLE PRECISION,
  "shiftId"     TEXT,
  "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
) PARTITION BY RANGE ("punchTime");

-- Default partition (catch-all for out-of-range data)
CREATE TABLE "public"."AttendancePunch_default"
  PARTITION OF "public"."AttendancePunch" DEFAULT;

-- 2024 Monthly partitions
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2024_01" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2024_02" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2024_03" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2024_04" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2024_05" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2024_06" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2024_07" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2024_08" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2024_09" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2024_10" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2024_11" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2024_12" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- 2025 Monthly partitions
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2025_01" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2025_02" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2025_03" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2025_04" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2025_05" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE IF NOT EXISTS "public"."attendancepunch_2025_06" PARTITION OF "public"."AttendancePunch" FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

-- Partition-level indexes
CREATE INDEX IF NOT EXISTS "attendancepunch_2025_01_punchtime_idx" ON "public"."attendancepunch_2025_01" ("punchTime");
CREATE INDEX IF NOT EXISTS "attendancepunch_2025_01_employeeid_idx" ON "public"."attendancepunch_2025_01" ("employeeId");
CREATE INDEX IF NOT EXISTS "attendancepunch_2025_02_punchtime_idx" ON "public"."attendancepunch_2025_02" ("punchTime");
CREATE INDEX IF NOT EXISTS "attendancepunch_2025_02_employeeid_idx" ON "public"."attendancepunch_2025_02" ("employeeId");

-- Migrate data from old table
INSERT INTO "public"."AttendancePunch"
  SELECT * FROM "public"."AttendancePunch_old";

COMMIT;

-- Validate before dropping:
-- SELECT COUNT(*) FROM "public"."AttendancePunch_old";
-- SELECT COUNT(*) FROM "public"."AttendancePunch";
-- DROP TABLE "public"."AttendancePunch_old";  -- run after validation


-- =============================================================================
-- 2. AUDIT LOG — Monthly partitions
-- =============================================================================

BEGIN;

ALTER TABLE IF EXISTS "public"."AuditLog" RENAME TO "AuditLog_old";

CREATE TABLE "public"."AuditLog" (
  "id"          TEXT         NOT NULL,
  "userId"      TEXT,
  "action"      TEXT         NOT NULL,
  "resource"    TEXT         NOT NULL,
  "resourceId"  TEXT,
  "changes"     JSONB,
  "ipAddress"   TEXT,
  "userAgent"   TEXT,
  "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
) PARTITION BY RANGE ("createdAt");

CREATE TABLE "public"."AuditLog_default"
  PARTITION OF "public"."AuditLog" DEFAULT;

-- Create archive table for old audit data (retained indefinitely)
CREATE TABLE IF NOT EXISTS "public"."AuditLog_archive" (LIKE "public"."AuditLog" INCLUDING ALL);

-- 2025 Monthly partitions
CREATE TABLE IF NOT EXISTS "public"."auditlog_2025_01" PARTITION OF "public"."AuditLog" FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE IF NOT EXISTS "public"."auditlog_2025_02" PARTITION OF "public"."AuditLog" FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE IF NOT EXISTS "public"."auditlog_2025_03" PARTITION OF "public"."AuditLog" FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE IF NOT EXISTS "public"."auditlog_2025_04" PARTITION OF "public"."AuditLog" FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE IF NOT EXISTS "public"."auditlog_2025_05" PARTITION OF "public"."AuditLog" FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE IF NOT EXISTS "public"."auditlog_2025_06" PARTITION OF "public"."AuditLog" FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE IF NOT EXISTS "public"."auditlog_2025_07" PARTITION OF "public"."AuditLog" FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE IF NOT EXISTS "public"."auditlog_2025_08" PARTITION OF "public"."AuditLog" FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE IF NOT EXISTS "public"."auditlog_2025_09" PARTITION OF "public"."AuditLog" FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE IF NOT EXISTS "public"."auditlog_2025_10" PARTITION OF "public"."AuditLog" FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE IF NOT EXISTS "public"."auditlog_2025_11" PARTITION OF "public"."AuditLog" FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE IF NOT EXISTS "public"."auditlog_2025_12" PARTITION OF "public"."AuditLog" FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

CREATE INDEX IF NOT EXISTS "auditlog_2025_01_createdat_idx" ON "public"."auditlog_2025_01" ("createdAt");
CREATE INDEX IF NOT EXISTS "auditlog_2025_01_userid_idx"    ON "public"."auditlog_2025_01" ("userId");
CREATE INDEX IF NOT EXISTS "auditlog_2025_02_createdat_idx" ON "public"."auditlog_2025_02" ("createdAt");

INSERT INTO "public"."AuditLog"
  SELECT * FROM "public"."AuditLog_old";

COMMIT;


-- =============================================================================
-- 3. PAYROLL ENTRY — Quarterly partitions
-- =============================================================================

BEGIN;

ALTER TABLE IF EXISTS "public"."PayrollEntry" RENAME TO "PayrollEntry_old";

CREATE TABLE "public"."PayrollEntry" (
  "id"            TEXT         NOT NULL,
  "employeeId"    TEXT         NOT NULL,
  "payrollRunId"  TEXT         NOT NULL,
  "grossPay"      DECIMAL(15,2) NOT NULL,
  "netPay"        DECIMAL(15,2) NOT NULL,
  "deductions"    JSONB,
  "allowances"    JSONB,
  "currency"      TEXT         NOT NULL DEFAULT 'AED',
  "periodStart"   DATE         NOT NULL,
  "periodEnd"     DATE         NOT NULL,
  "createdAt"     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
) PARTITION BY RANGE ("createdAt");

CREATE TABLE "public"."PayrollEntry_default"
  PARTITION OF "public"."PayrollEntry" DEFAULT;

-- Quarterly partitions (7 years retention for compliance)
CREATE TABLE IF NOT EXISTS "public"."payrollentry_2024_q1" PARTITION OF "public"."PayrollEntry" FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE IF NOT EXISTS "public"."payrollentry_2024_q2" PARTITION OF "public"."PayrollEntry" FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
CREATE TABLE IF NOT EXISTS "public"."payrollentry_2024_q3" PARTITION OF "public"."PayrollEntry" FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');
CREATE TABLE IF NOT EXISTS "public"."payrollentry_2024_q4" PARTITION OF "public"."PayrollEntry" FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');
CREATE TABLE IF NOT EXISTS "public"."payrollentry_2025_q1" PARTITION OF "public"."PayrollEntry" FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE IF NOT EXISTS "public"."payrollentry_2025_q2" PARTITION OF "public"."PayrollEntry" FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE IF NOT EXISTS "public"."payrollentry_2025_q3" PARTITION OF "public"."PayrollEntry" FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE IF NOT EXISTS "public"."payrollentry_2025_q4" PARTITION OF "public"."PayrollEntry" FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');
CREATE TABLE IF NOT EXISTS "public"."payrollentry_2026_q1" PARTITION OF "public"."PayrollEntry" FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');

CREATE INDEX IF NOT EXISTS "payrollentry_2025_q1_createdat_idx"   ON "public"."payrollentry_2025_q1" ("createdAt");
CREATE INDEX IF NOT EXISTS "payrollentry_2025_q1_employeeid_idx"  ON "public"."payrollentry_2025_q1" ("employeeId");
CREATE INDEX IF NOT EXISTS "payrollentry_2025_q1_runid_idx"       ON "public"."payrollentry_2025_q1" ("payrollRunId");

INSERT INTO "public"."PayrollEntry"
  SELECT * FROM "public"."PayrollEntry_old";

COMMIT;


-- =============================================================================
-- 4. NOTIFICATION — Monthly partitions
-- =============================================================================

BEGIN;

ALTER TABLE IF EXISTS "public"."Notification" RENAME TO "Notification_old";

CREATE TABLE "public"."Notification" (
  "id"          TEXT         NOT NULL,
  "userId"      TEXT         NOT NULL,
  "type"        TEXT         NOT NULL,
  "title"       TEXT         NOT NULL,
  "body"        TEXT,
  "data"        JSONB,
  "isRead"      BOOLEAN      NOT NULL DEFAULT FALSE,
  "readAt"      TIMESTAMPTZ,
  "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
) PARTITION BY RANGE ("createdAt");

CREATE TABLE "public"."Notification_default"
  PARTITION OF "public"."Notification" DEFAULT;

-- 6 months retention — only keep recent
CREATE TABLE IF NOT EXISTS "public"."notification_2025_01" PARTITION OF "public"."Notification" FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE IF NOT EXISTS "public"."notification_2025_02" PARTITION OF "public"."Notification" FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE IF NOT EXISTS "public"."notification_2025_03" PARTITION OF "public"."Notification" FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE IF NOT EXISTS "public"."notification_2025_04" PARTITION OF "public"."Notification" FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE IF NOT EXISTS "public"."notification_2025_05" PARTITION OF "public"."Notification" FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE IF NOT EXISTS "public"."notification_2025_06" PARTITION OF "public"."Notification" FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

CREATE INDEX IF NOT EXISTS "notification_2025_02_createdat_idx" ON "public"."notification_2025_02" ("createdAt");
CREATE INDEX IF NOT EXISTS "notification_2025_02_userid_idx"    ON "public"."notification_2025_02" ("userId");
CREATE INDEX IF NOT EXISTS "notification_2025_02_isread_idx"    ON "public"."notification_2025_02" ("isRead") WHERE NOT "isRead";

INSERT INTO "public"."Notification"
  SELECT * FROM "public"."Notification_old";

COMMIT;


-- =============================================================================
-- MAINTENANCE: pg_partman setup (run once to enable automated management)
-- =============================================================================

-- Register AttendancePunch with pg_partman for auto-management
SELECT partman.create_parent(
  p_parent_table   => 'public.AttendancePunch',
  p_control        => 'punchTime',
  p_type           => 'native',
  p_interval       => 'monthly',
  p_premake        => 3
);

-- Register AuditLog
SELECT partman.create_parent(
  p_parent_table   => 'public.AuditLog',
  p_control        => 'createdAt',
  p_type           => 'native',
  p_interval       => 'monthly',
  p_premake        => 3
);

-- Register Notification (drop after 6 months)
SELECT partman.create_parent(
  p_parent_table   => 'public.Notification',
  p_control        => 'createdAt',
  p_type           => 'native',
  p_interval       => 'monthly',
  p_premake        => 2,
  p_retention      => '6 months',
  p_retention_keep_table => FALSE
);

-- Add pg_partman maintenance to pg_cron (run hourly)
-- Requires pg_cron extension:
-- SELECT cron.schedule('partition-maintenance', '0 * * * *', 'SELECT partman.run_maintenance_proc()');

-- =============================================================================
-- VERIFY: Check partition information
-- =============================================================================

SELECT
  parent.relname AS parent_table,
  child.relname  AS partition,
  pg_get_expr(child.relpartbound, child.oid) AS partition_bounds,
  pg_size_pretty(pg_relation_size(child.oid)) AS partition_size
FROM
  pg_inherits
  JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
  JOIN pg_class child  ON pg_inherits.inhrelid  = child.oid
WHERE parent.relname IN ('AttendancePunch', 'AuditLog', 'PayrollEntry', 'Notification')
ORDER BY parent.relname, child.relname;
