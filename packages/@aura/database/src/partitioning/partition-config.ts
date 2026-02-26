/**
 * @module partition-config
 * @description PostgreSQL table partitioning strategies for AuraOS high-volume tables.
 *              Supports range partitioning by date (monthly / quarterly).
 *              Provides DDL generation and automated maintenance helpers.
 *
 * Tables:
 *  - AttendancePunch  → range by punchTime   (monthly)
 *  - AuditLog         → range by createdAt   (monthly)
 *  - PayrollEntry     → range by createdAt   (quarterly)
 *  - Notification     → range by createdAt   (monthly)
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type PartitionInterval = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface PartitionConfig {
  tableName:     string;
  schemaName:    string;
  partitionKey:  string;          // column used for partitioning
  interval:      PartitionInterval;
  retentionMonths?: number;       // months to keep before archiving / dropping
  archiveTable?:    string;       // optional archive table name
}

export interface PartitionInfo {
  partitionName:  string;
  startDate:      Date;
  endDate:        Date;
  tablespace?:    string;
}

// ── Partition Configurations ───────────────────────────────────────────────

export const PARTITION_CONFIGS: Record<string, PartitionConfig> = {
  AttendancePunch: {
    tableName:       'AttendancePunch',
    schemaName:      'public',
    partitionKey:    'punchTime',
    interval:        'MONTHLY',
    retentionMonths: 24,
  },
  AuditLog: {
    tableName:       'AuditLog',
    schemaName:      'public',
    partitionKey:    'createdAt',
    interval:        'MONTHLY',
    retentionMonths: 36,
    archiveTable:    'AuditLog_archive',
  },
  PayrollEntry: {
    tableName:       'PayrollEntry',
    schemaName:      'public',
    partitionKey:    'createdAt',
    interval:        'QUARTERLY',
    retentionMonths: 84,   // 7 years (payroll compliance)
  },
  Notification: {
    tableName:       'Notification',
    schemaName:      'public',
    partitionKey:    'createdAt',
    interval:        'MONTHLY',
    retentionMonths: 6,
  },
};

// ── Partition name generation ──────────────────────────────────────────────

/**
 * Generate a partition name from table name and start date.
 * Examples:
 *   AttendancePunch + 2025-01 → "attendancepunch_2025_01"
 *   PayrollEntry   + 2025-Q1 → "payrollentry_2025_q1"
 */
export function getPartitionName(tableName: string, date: Date, interval: PartitionInterval): string {
  const base = tableName.toLowerCase();
  const year = date.getFullYear();

  if (interval === 'MONTHLY') {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${base}_${year}_${month}`;
  }

  if (interval === 'QUARTERLY') {
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `${base}_${year}_q${quarter}`;
  }

  return `${base}_${year}`;
}

/**
 * Calculate start and end dates for a partition.
 */
export function getPartitionBounds(
  date: Date,
  interval: PartitionInterval,
): { startDate: Date; endDate: Date } {
  const start = new Date(date);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);

  if (interval === 'MONTHLY') {
    end.setMonth(end.getMonth() + 1);
  } else if (interval === 'QUARTERLY') {
    // Align to quarter start
    const q = Math.floor(start.getMonth() / 3);
    start.setMonth(q * 3);
    end.setMonth(q * 3 + 3);
  } else {
    start.setMonth(0);
    end.setFullYear(end.getFullYear() + 1);
    end.setMonth(0);
  }

  return { startDate: start, endDate: end };
}

// ── DDL Generation ─────────────────────────────────────────────────────────

/**
 * Generate CREATE TABLE ... PARTITION OF DDL for a single partition.
 *
 * @param tableName - Parent table name
 * @param column    - Partition column
 * @param interval  - Partitioning interval
 * @param startDate - Inclusive lower bound
 * @param endDate   - Exclusive upper bound
 * @param schema    - PostgreSQL schema (default: public)
 */
export function generatePartitionSQL(
  tableName:  string,
  column:     string,
  interval:   PartitionInterval,
  startDate:  Date,
  endDate:    Date,
  schema      = 'public',
): string {
  const partName    = getPartitionName(tableName, startDate, interval);
  const startIso    = formatISO(startDate);
  const endIso      = formatISO(endDate);

  return `
-- Partition: ${partName}
CREATE TABLE IF NOT EXISTS "${schema}"."${partName}"
  PARTITION OF "${schema}"."${tableName}"
  FOR VALUES FROM ('${startIso}') TO ('${endIso}');

-- Index on partition key (speeds up range queries within the partition)
CREATE INDEX IF NOT EXISTS "${partName}_${column}_idx"
  ON "${schema}"."${partName}" ("${column}");
`.trim();
}

/**
 * Generate all partition DDL statements between startDate and endDate.
 */
export function generateAllPartitionSQL(
  config:    PartitionConfig,
  fromDate:  Date,
  toDate:    Date,
): string[] {
  const statements: string[] = [];
  const current = new Date(fromDate);

  // Align current to interval start
  current.setDate(1);
  current.setHours(0, 0, 0, 0);
  if (config.interval === 'QUARTERLY') {
    current.setMonth(Math.floor(current.getMonth() / 3) * 3);
  } else if (config.interval === 'YEARLY') {
    current.setMonth(0);
  }

  while (current < toDate) {
    const { startDate, endDate } = getPartitionBounds(current, config.interval);

    statements.push(
      generatePartitionSQL(
        config.tableName,
        config.partitionKey,
        config.interval,
        startDate,
        endDate,
        config.schemaName,
      ),
    );

    // Advance to next interval
    current.setTime(endDate.getTime());
  }

  return statements;
}

// ── Maintenance Functions ──────────────────────────────────────────────────

/**
 * Create the maintenance SQL for:
 * 1. Pre-creating future partitions (3 months ahead)
 * 2. Dropping or archiving old partitions beyond retention period
 *
 * Returns an object with SQL strings ready to execute via pg client.
 */
export function createPartitionMaintenance(
  config: PartitionConfig,
  now    = new Date(),
): {
  createSQL:  string[];
  dropSQL:    string[];
  archiveSQL: string[];
} {
  const createSQL:  string[] = [];
  const dropSQL:    string[] = [];
  const archiveSQL: string[] = [];

  // Pre-create next 3 months of partitions
  const futureEnd = new Date(now);
  futureEnd.setMonth(futureEnd.getMonth() + 3);
  createSQL.push(...generateAllPartitionSQL(config, now, futureEnd));

  // Identify old partitions to drop / archive
  if (config.retentionMonths) {
    const retentionCutoff = new Date(now);
    retentionCutoff.setMonth(retentionCutoff.getMonth() - config.retentionMonths);

    // Walk back 3 years to find potentially old partitions
    const checkStart = new Date(now);
    checkStart.setFullYear(checkStart.getFullYear() - 3);

    const oldPartitions = getPartitionsBefore(config, checkStart, retentionCutoff);

    for (const p of oldPartitions) {
      const partName = getPartitionName(config.tableName, p.startDate, config.interval);
      const fullName = `"${config.schemaName}"."${partName}"`;

      if (config.archiveTable) {
        // Move data to archive table, then drop partition
        archiveSQL.push(
          `-- Archive old partition: ${partName}`,
          `INSERT INTO "${config.schemaName}"."${config.archiveTable}"`,
          `  SELECT * FROM ${fullName}`,
          `  ON CONFLICT DO NOTHING;`,
          `DROP TABLE IF EXISTS ${fullName};`,
        );
      } else {
        dropSQL.push(
          `-- Drop old partition: ${partName} (before ${formatISO(retentionCutoff)})`,
          `DROP TABLE IF EXISTS ${fullName};`,
        );
      }
    }
  }

  return { createSQL, dropSQL, archiveSQL };
}

/**
 * Get all partition metadata between two dates.
 */
export function getPartitionsBefore(
  config:    PartitionConfig,
  fromDate:  Date,
  toDate:    Date,
): PartitionInfo[] {
  const partitions: PartitionInfo[] = [];
  const current = new Date(fromDate);
  current.setDate(1);
  current.setHours(0, 0, 0, 0);

  if (config.interval === 'QUARTERLY') {
    current.setMonth(Math.floor(current.getMonth() / 3) * 3);
  }

  while (current < toDate) {
    const { startDate, endDate } = getPartitionBounds(current, config.interval);
    partitions.push({
      partitionName: getPartitionName(config.tableName, startDate, config.interval),
      startDate:     new Date(startDate),
      endDate:       new Date(endDate),
    });
    current.setTime(endDate.getTime());
  }

  return partitions;
}

/**
 * Generate the full initial setup SQL for converting an existing table to partitioned.
 * Includes: rename existing table, create parent partitioned table, create indexes.
 */
export function generateTableConversionSQL(config: PartitionConfig): string {
  const { tableName: table, schemaName: schema, partitionKey: col } = config;

  return `
-- ============================================================
-- Convert ${table} to range-partitioned table
-- ============================================================

BEGIN;

-- Step 1: Rename existing table (preserve data)
ALTER TABLE IF EXISTS "${schema}"."${table}"
  RENAME TO "${table}_old";

-- Step 2: Create new partitioned parent table
-- (Schema matches original — adjust columns as needed)
CREATE TABLE "${schema}"."${table}" (
  LIKE "${schema}"."${table}_old" INCLUDING ALL
) PARTITION BY RANGE ("${col}");

-- Step 3: Create default partition to catch out-of-range rows
CREATE TABLE IF NOT EXISTS "${schema}"."${table}_default"
  PARTITION OF "${schema}"."${table}" DEFAULT;

-- Step 4: Migrate data from old table
INSERT INTO "${schema}"."${table}" SELECT * FROM "${schema}"."${table}_old";

-- Step 5: Drop old table after validation
-- DROP TABLE "${schema}"."${table}_old"; -- run manually after validating row counts

COMMIT;
`.trim();
}

// ── Private helpers ────────────────────────────────────────────────────────

function formatISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}
