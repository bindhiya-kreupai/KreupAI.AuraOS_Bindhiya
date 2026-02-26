/**
 * @module db-performance-monitor
 * @description Database Performance Monitor — slow query tracking, table statistics,
 *              connection pool health, query analysis, index recommendations,
 *              replication lag, and deadlock reporting.
 * @project AuraOS Enterprise HCM Platform
 * @section 16 — Enterprise Backend Platform Services
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SlowQuery {
  queryId: string;
  query: string;
  normalizedQuery: string;
  database: string;
  user: string;
  durationMs: number;
  rowsExamined: number;
  rowsSent: number;
  startedAt: string;
  endedAt: string;
  waitType?: string;
  lockTimeMs?: number;
  indexes?: string[];
  explainPlan?: string;
}

export interface TableStats {
  schema: string;
  tableName: string;
  engine: string;
  rowCount: number;
  dataSizeBytes: number;
  indexSizeBytes: number;
  totalSizeBytes: number;
  avgRowLength: number;
  autoIncrement?: number;
  lastAnalyzed?: string;
  fragmentationPct: number;
  indexes: IndexStats[];
}

export interface IndexStats {
  indexName: string;
  columns: string[];
  type: 'BTREE' | 'HASH' | 'FULLTEXT' | 'SPATIAL';
  unique: boolean;
  cardinality: number;
  sizeBytes: number;
  reads: number;
  writes: number;
  lastUsed?: string;
  efficiency: number; // 0-1
}

export interface ConnectionPoolStats {
  poolName: string;
  minConnections: number;
  maxConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  totalConnections: number;
  connectionsCreated: number;
  connectionsDestroyed: number;
  avgAcquireTimeMs: number;
  maxAcquireTimeMs: number;
  errorRate: number;
  uptime: number;
  lastUpdated: string;
}

export interface QueryAnalysis {
  query: string;
  executionPlan: ExecutionPlanNode;
  estimatedCost: number;
  estimatedRows: number;
  actualDurationMs?: number;
  warnings: string[];
  recommendations: QueryRecommendation[];
  affectedTables: string[];
  indexesUsed: string[];
  indexesMissed: string[];
}

export interface ExecutionPlanNode {
  operation: string;
  table?: string;
  type: 'ALL' | 'INDEX' | 'RANGE' | 'REF' | 'EQ_REF' | 'CONST' | 'SYSTEM' | 'FULLTEXT';
  possibleKeys?: string[];
  key?: string;
  rows: number;
  filtered: number;
  extra?: string;
  children?: ExecutionPlanNode[];
}

export interface QueryRecommendation {
  type: 'add-index' | 'remove-index' | 'rewrite-query' | 'partition-table' | 'cache-result';
  priority: 'low' | 'medium' | 'high';
  description: string;
  impact: string;
  sql?: string;
  estimatedImprovementPct: number;
}

export interface MissingIndexRecommendation {
  tableName: string;
  columns: string[];
  reason: string;
  queryCount: number;
  avgDurationMs: number;
  estimatedImprovementPct: number;
  createStatement: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ReplicationLagStatus {
  primaryHost: string;
  replicas: ReplicaStatus[];
  overallHealth: 'healthy' | 'degraded' | 'critical';
  maxLagSeconds: number;
  avgLagSeconds: number;
  checkedAt: string;
}

export interface ReplicaStatus {
  host: string;
  port: number;
  lagSeconds: number;
  status: 'running' | 'stopped' | 'connecting' | 'error';
  lastHeartbeat: string;
  bytesReceived: number;
  binlogPosition: string;
  errorMessage?: string;
}

export interface DeadlockIncident {
  incidentId: string;
  detectedAt: string;
  involvedTransactions: DeadlockTransaction[];
  victim: string; // transaction ID that was rolled back
  resolution: string;
  tables: string[];
  durationMs: number;
}

export interface DeadlockTransaction {
  transactionId: string;
  processId: number;
  user: string;
  query: string;
  lockType: 'RECORD' | 'GAP' | 'NEXT-KEY' | 'INSERT-INTENTION';
  waitingFor: string;
  holdingLocks: string[];
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const SAMPLE_TABLES = [
  'employees',
  'departments',
  'positions',
  'payroll_runs',
  'payroll_items',
  'leave_requests',
  'leave_balances',
  'attendance_records',
  'documents',
  'audit_logs',
  'users',
  'roles',
  'permissions',
  'notifications',
  'recruitment_jobs',
  'candidates',
  'performance_reviews',
  'goals',
];

const SAMPLE_QUERIES = [
  'SELECT e.*, d.name as dept_name FROM employees e JOIN departments d ON e.department_id = d.id WHERE e.status = ? AND e.tenant_id = ? ORDER BY e.created_at DESC LIMIT ?',
  'SELECT COUNT(*) FROM attendance_records WHERE employee_id = ? AND date BETWEEN ? AND ?',
  'SELECT p.*, SUM(pi.amount) as total FROM payroll_runs p JOIN payroll_items pi ON p.id = pi.run_id WHERE p.status = ? GROUP BY p.id',
  'UPDATE employees SET status = ?, updated_at = NOW() WHERE id = ? AND tenant_id = ?',
  'SELECT lr.*, e.name, l.type FROM leave_requests lr JOIN employees e ON lr.employee_id = e.id JOIN leave_types l ON lr.leave_type_id = l.id WHERE lr.manager_id = ? AND lr.status = ?',
  'INSERT INTO audit_logs (entity, entity_id, action, user_id, changes, timestamp) VALUES (?, ?, ?, ?, ?, NOW())',
  'SELECT * FROM documents WHERE entity_id = ? AND entity_type = ? AND status != ? ORDER BY version DESC',
  'SELECT e.id, e.name, e.email, SUM(a.hours_worked) as total_hours FROM employees e LEFT JOIN attendance_records a ON e.id = a.employee_id WHERE a.date >= ? GROUP BY e.id HAVING total_hours < ?',
];

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * getSlowQueries — returns queries that exceeded the given duration threshold.
 */
export async function getSlowQueries(
  thresholdMs: number = 1000,
  options: { limit?: number; from?: string; to?: string; database?: string } = {}
): Promise<SlowQuery[]> {
  const { limit = 50 } = options;

  // Generate realistic mock slow queries
  const queries: SlowQuery[] = SAMPLE_QUERIES.map((q, i) => {
    const duration = thresholdMs + Math.floor(Math.random() * 5000);
    const start = new Date(Date.now() - (i + 1) * 600_000);
    const end = new Date(start.getTime() + duration);

    return {
      queryId: `qry_${i.toString().padStart(3, '0')}`,
      query: q,
      normalizedQuery: q.replace(/\?/g, '?'),
      database: options.database ?? 'aura_production',
      user: ['app_user', 'report_user', 'migration_user'][i % 3],
      durationMs: duration,
      rowsExamined: Math.floor(Math.random() * 500_000),
      rowsSent: Math.floor(Math.random() * 5000),
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      lockTimeMs: Math.floor(Math.random() * 100),
      indexes: [`idx_${SAMPLE_TABLES[i % SAMPLE_TABLES.length]}_tenant_id`],
    };
  });

  return queries
    .filter((q) => q.durationMs >= thresholdMs)
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, limit);
}

/**
 * getTableStats — returns row counts, sizes, and index usage per table.
 */
export async function getTableStats(
  options: { schema?: string; minSizeBytes?: number } = {}
): Promise<TableStats[]> {
  return SAMPLE_TABLES.map((tableName, i) => {
    const rowCount = Math.floor(Math.random() * 1_000_000) + 1000;
    const avgRowLength = 200 + Math.floor(Math.random() * 800);
    const dataSizeBytes = rowCount * avgRowLength;
    const indexSizeBytes = Math.floor(dataSizeBytes * 0.3);

    return {
      schema: options.schema ?? 'public',
      tableName,
      engine: 'InnoDB',
      rowCount,
      dataSizeBytes,
      indexSizeBytes,
      totalSizeBytes: dataSizeBytes + indexSizeBytes,
      avgRowLength,
      autoIncrement: rowCount + 1,
      lastAnalyzed: new Date(Date.now() - i * 3600_000).toISOString(),
      fragmentationPct: Math.random() * 15,
      indexes: [
        {
          indexName: 'PRIMARY',
          columns: ['id'],
          type: 'BTREE',
          unique: true,
          cardinality: rowCount,
          sizeBytes: Math.floor(indexSizeBytes * 0.4),
          reads: Math.floor(Math.random() * 100_000),
          writes: Math.floor(Math.random() * 10_000),
          efficiency: 0.95 + Math.random() * 0.05,
        },
        {
          indexName: `idx_${tableName}_tenant_id`,
          columns: ['tenant_id'],
          type: 'BTREE',
          unique: false,
          cardinality: 50,
          sizeBytes: Math.floor(indexSizeBytes * 0.2),
          reads: Math.floor(Math.random() * 200_000),
          writes: Math.floor(Math.random() * 20_000),
          lastUsed: new Date(Date.now() - Math.random() * 3600_000).toISOString(),
          efficiency: 0.7 + Math.random() * 0.25,
        },
      ],
    };
  });
}

/**
 * getConnectionPoolStats — returns active, idle, and waiting connection counts.
 */
export async function getConnectionPoolStats(): Promise<ConnectionPoolStats[]> {
  return [
    {
      poolName: 'primary-rw',
      minConnections: 5,
      maxConnections: 100,
      activeConnections: 23,
      idleConnections: 12,
      waitingRequests: 2,
      totalConnections: 35,
      connectionsCreated: 4820,
      connectionsDestroyed: 4785,
      avgAcquireTimeMs: 1.4,
      maxAcquireTimeMs: 45,
      errorRate: 0.002,
      uptime: 86400 * 7,
      lastUpdated: new Date().toISOString(),
    },
    {
      poolName: 'replica-ro',
      minConnections: 5,
      maxConnections: 50,
      activeConnections: 8,
      idleConnections: 17,
      waitingRequests: 0,
      totalConnections: 25,
      connectionsCreated: 2100,
      connectionsDestroyed: 2075,
      avgAcquireTimeMs: 0.9,
      maxAcquireTimeMs: 22,
      errorRate: 0.001,
      uptime: 86400 * 7,
      lastUpdated: new Date().toISOString(),
    },
  ];
}

/**
 * analyzeQuery — EXPLAIN ANALYZE a query and return optimization recommendations.
 */
export async function analyzeQuery(sql: string): Promise<QueryAnalysis> {
  // Simulate EXPLAIN ANALYZE
  await new Promise((r) => setTimeout(r, 50));

  const tableMatch = sql.match(/FROM\s+(\w+)/i);
  const joinMatches = sql.matchAll(/JOIN\s+(\w+)/gi);
  const affectedTables = tableMatch ? [tableMatch[1]] : [];
  for (const m of joinMatches) affectedTables.push(m[1]);

  const warnings: string[] = [];
  const recommendations: QueryRecommendation[] = [];

  if (sql.toUpperCase().includes('SELECT *')) {
    warnings.push('Avoid SELECT * — specify only required columns to reduce I/O');
    recommendations.push({
      type: 'rewrite-query',
      priority: 'medium',
      description: 'Replace SELECT * with explicit column list',
      impact: 'Reduces network transfer and memory usage by 20-60%',
      estimatedImprovementPct: 30,
    });
  }

  if (!sql.toUpperCase().includes('WHERE')) {
    warnings.push('Full table scan detected — no WHERE clause');
    recommendations.push({
      type: 'add-index',
      priority: 'high',
      description: 'Add a WHERE clause or partition the table',
      impact: 'Prevents full table scan, critical for large tables',
      estimatedImprovementPct: 80,
    });
  }

  if (sql.toUpperCase().includes("LIKE '%")) {
    warnings.push('Leading wildcard LIKE prevents index use');
    recommendations.push({
      type: 'add-index',
      priority: 'medium',
      description: 'Use full-text search or reversed index for suffix matches',
      impact: 'Eliminates full table scan for text searches',
      estimatedImprovementPct: 70,
    });
  }

  return {
    query: sql,
    executionPlan: {
      operation: 'SELECT',
      table: affectedTables[0],
      type: sql.toUpperCase().includes('WHERE') ? 'REF' : 'ALL',
      rows: Math.floor(Math.random() * 10000),
      filtered: 85,
      key: sql.toUpperCase().includes('WHERE') ? 'idx_tenant_id' : undefined,
    },
    estimatedCost: 120 + Math.random() * 5000,
    estimatedRows: Math.floor(Math.random() * 10000),
    warnings,
    recommendations,
    affectedTables,
    indexesUsed: sql.toUpperCase().includes('WHERE') ? ['idx_tenant_id'] : [],
    indexesMissed: warnings.length > 0 ? ['idx_status_created_at'] : [],
  };
}

/**
 * suggestIndexes — analyze slow queries and suggest missing indexes.
 */
export async function suggestIndexes(
  options: { minQueryCount?: number } = {}
): Promise<MissingIndexRecommendation[]> {
  const { minQueryCount = 10 } = options;

  // In production: analyze pg_stat_statements / MySQL slow log
  return [
    {
      tableName: 'attendance_records',
      columns: ['employee_id', 'date'],
      reason: 'Composite filter in 847 slow queries (avg 3,200ms)',
      queryCount: 847,
      avgDurationMs: 3200,
      estimatedImprovementPct: 92,
      createStatement:
        "CREATE INDEX CONCURRENTLY idx_attendance_employee_date ON attendance_records (employee_id, date) WHERE status != 'deleted';",
      priority: 'critical',
    },
    {
      tableName: 'leave_requests',
      columns: ['manager_id', 'status', 'created_at'],
      reason: 'Manager inbox query scans full table (avg 1,800ms)',
      queryCount: 312,
      avgDurationMs: 1800,
      estimatedImprovementPct: 85,
      createStatement:
        'CREATE INDEX CONCURRENTLY idx_leave_manager_status_date ON leave_requests (manager_id, status, created_at DESC);',
      priority: 'high',
    },
    {
      tableName: 'audit_logs',
      columns: ['entity', 'entity_id', 'timestamp'],
      reason: 'Audit trail query lacks composite index (avg 900ms)',
      queryCount: minQueryCount + 156,
      avgDurationMs: 900,
      estimatedImprovementPct: 75,
      createStatement:
        'CREATE INDEX CONCURRENTLY idx_audit_entity_time ON audit_logs (entity, entity_id, timestamp DESC);',
      priority: 'high',
    },
    {
      tableName: 'notifications',
      columns: ['recipient_id', 'status', 'created_at'],
      reason: 'Notification bell query missing covering index',
      queryCount: 225,
      avgDurationMs: 450,
      estimatedImprovementPct: 60,
      createStatement:
        'CREATE INDEX CONCURRENTLY idx_notifications_recipient_status ON notifications (recipient_id, status, created_at DESC) INCLUDE (subject, channel);',
      priority: 'medium',
    },
  ];
}

/**
 * getReplicationLag — returns lag metrics for all read replicas.
 */
export async function getReplicationLag(): Promise<ReplicationLagStatus> {
  const replicas: ReplicaStatus[] = [
    {
      host: 'db-replica-01.internal',
      port: 5432,
      lagSeconds: 0.8,
      status: 'running',
      lastHeartbeat: new Date(Date.now() - 5000).toISOString(),
      bytesReceived: 1_234_567_890,
      binlogPosition: 'postgres-bin.000047:87654321',
    },
    {
      host: 'db-replica-02.internal',
      port: 5432,
      lagSeconds: 1.2,
      status: 'running',
      lastHeartbeat: new Date(Date.now() - 8000).toISOString(),
      bytesReceived: 1_234_500_000,
      binlogPosition: 'postgres-bin.000047:87650000',
    },
  ];

  const maxLag = Math.max(...replicas.map((r) => r.lagSeconds));
  const avgLag = replicas.reduce((s, r) => s + r.lagSeconds, 0) / replicas.length;

  return {
    primaryHost: 'db-primary-01.internal',
    replicas,
    overallHealth: maxLag < 5 ? 'healthy' : maxLag < 30 ? 'degraded' : 'critical',
    maxLagSeconds: maxLag,
    avgLagSeconds: avgLag,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * getDeadlocks — returns recent deadlock incidents with transaction details.
 */
export async function getDeadlocks(
  options: { limit?: number; from?: string } = {}
): Promise<DeadlockIncident[]> {
  const { limit = 20 } = options;

  // Simulate recent deadlocks
  const incidents: DeadlockIncident[] = [
    {
      incidentId: 'dl_001',
      detectedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
      involvedTransactions: [
        {
          transactionId: 'trx_a1b2',
          processId: 14205,
          user: 'app_user',
          query: 'UPDATE employees SET status = ? WHERE id = ?',
          lockType: 'RECORD',
          waitingFor: 'trx_c3d4',
          holdingLocks: ['employees:row:550'],
        },
        {
          transactionId: 'trx_c3d4',
          processId: 14207,
          user: 'app_user',
          query: 'UPDATE payroll_items SET amount = ? WHERE employee_id = ?',
          lockType: 'RECORD',
          waitingFor: 'trx_a1b2',
          holdingLocks: ['payroll_items:row:330'],
        },
      ],
      victim: 'trx_c3d4',
      resolution: 'Transaction trx_c3d4 was automatically rolled back to resolve the deadlock',
      tables: ['employees', 'payroll_items'],
      durationMs: 1250,
    },
    {
      incidentId: 'dl_002',
      detectedAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
      involvedTransactions: [
        {
          transactionId: 'trx_e5f6',
          processId: 14312,
          user: 'app_user',
          query: 'UPDATE leave_requests SET status = ? WHERE id = ?',
          lockType: 'NEXT-KEY',
          waitingFor: 'trx_g7h8',
          holdingLocks: ['leave_requests:row:112'],
        },
        {
          transactionId: 'trx_g7h8',
          processId: 14315,
          user: 'report_user',
          query: 'SELECT * FROM leave_requests WHERE employee_id = ? FOR UPDATE',
          lockType: 'RECORD',
          waitingFor: 'trx_e5f6',
          holdingLocks: ['leave_balances:row:78'],
        },
      ],
      victim: 'trx_g7h8',
      resolution: 'Transaction trx_g7h8 was automatically rolled back',
      tables: ['leave_requests', 'leave_balances'],
      durationMs: 875,
    },
  ];

  return incidents.slice(0, limit);
}
