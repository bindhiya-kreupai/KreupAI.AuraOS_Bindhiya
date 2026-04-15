/**
 * @module query-analyzer
 * @description PostgreSQL query analysis utilities for AuraOS.
 *              - Detects missing indexes and full table scans
 *              - Suggests index candidates based on query patterns
 *              - Provides table-level statistics (size, row counts, index usage)
 */

import type { PrismaClient } from '@prisma/client';

// ── Types ──────────────────────────────────────────────────────────────────

export interface QueryAnalysis {
  query:           string;
  estimatedCost:   number | null;
  estimatedRows:   number | null;
  planType:        string | null;     // e.g., 'Seq Scan', 'Index Scan'
  hasSeqScan:      boolean;
  missingIndexes:  string[];
  suggestions:     string[];
  explainOutput?:  string;
}

export interface IndexSuggestion {
  table:   string;
  columns: string[];
  reason:  string;
  sql:     string;
}

export interface TableStats {
  tableName:       string;
  schemaName:      string;
  rowCount:        number;
  tableSizeBytes:  number;
  tableSizePretty: string;
  indexSizeBytes:  number;
  indexSizePretty: string;
  totalSizePretty: string;
  seqScans:        number;
  indexScans:      number;
  indexEfficiency: number;   // % of scans that use indexes
  bloatPercent:    number | null;
}

export interface IndexUsageStat {
  indexName:   string;
  tableName:   string;
  indexScans:  number;
  tuplesFetched: number;
  sizePretty:  string;
  isUnused:    boolean;
}

// ── QueryAnalyzer ──────────────────────────────────────────────────────────

export class QueryAnalyzer {
  private _client: PrismaClient;

  constructor(client: PrismaClient) {
    this._client = client;
  }

  // ── Query analysis ─────────────────────────────────────────────────────

  /**
   * Run EXPLAIN (ANALYZE, FORMAT JSON) on a query and parse the output.
   * Detects sequential scans and missing indexes.
   *
   * NOTE: Only works with SELECT queries (safe to analyze).
   * For DML analysis, wrap in a transaction and ROLLBACK.
   */
  async analyzeQuery(sql: string): Promise<QueryAnalysis> {
    const missingIndexes: string[] = [];
    const suggestions: string[]    = [];

    // Static analysis (pattern matching without hitting DB)
    const staticAnalysis = this._staticAnalyze(sql);
    missingIndexes.push(...staticAnalysis.warnings);
    suggestions.push(...staticAnalysis.suggestions);

    // Dynamic EXPLAIN if the query is a SELECT
    if (/^\s*SELECT/i.test(sql)) {
      try {
        const explainResult = await this._client.$queryRawUnsafe<Array<{ 'QUERY PLAN': string }>>(
          `EXPLAIN (ANALYZE false, FORMAT TEXT) ${sql}`,
        );

        const plan      = explainResult.map((r) => r['QUERY PLAN']).join('\n');
        const hasSeqScan = /Seq Scan/i.test(plan);

        if (hasSeqScan) {
          suggestions.push('Sequential scan detected. Consider adding an index on the WHERE clause columns.');
        }

        const costMatch = plan.match(/cost=(\d+\.\d+)\.\.(\d+\.\d+)/);
        const rowMatch  = plan.match(/rows=(\d+)/);

        return {
          query:          sql,
          estimatedCost:  costMatch ? parseFloat(costMatch[2]) : null,
          estimatedRows:  rowMatch  ? parseInt(rowMatch[1], 10) : null,
          planType:       this._extractPlanType(plan),
          hasSeqScan,
          missingIndexes,
          suggestions,
          explainOutput:  plan,
        };
      } catch {
        // EXPLAIN failed (e.g., permissions, syntax error)
      }
    }

    return {
      query:         sql,
      estimatedCost: null,
      estimatedRows: null,
      planType:      null,
      hasSeqScan:    false,
      missingIndexes,
      suggestions,
    };
  }

  // ── Index suggestions ──────────────────────────────────────────────────

  /**
   * Suggest indexes for a table based on known query patterns.
   * Analyzes pg_stat_user_tables and pg_stat_user_indexes.
   */
  async suggestIndexes(table: string): Promise<IndexSuggestion[]> {
    const suggestions: IndexSuggestion[] = [];

    try {
      // Find columns used in sequential scans (high seq_scan count)
      const seqScanStats = await this._client.$queryRaw<
        Array<{ relname: string; seq_scan: bigint; n_live_tup: bigint }>
      >`
        SELECT relname, seq_scan, n_live_tup
        FROM pg_stat_user_tables
        WHERE relname = ${table}
          AND seq_scan > 100
          AND n_live_tup > 10000
      `;

      for (const stat of seqScanStats) {
        suggestions.push({
          table:   stat.relname,
          columns: ['<column_from_frequent_where_clauses>'],
          reason:  `Table "${stat.relname}" has ${stat.seq_scan} sequential scans on ${stat.n_live_tup} rows. Adding an index on frequently filtered columns will improve performance.`,
          sql:     `CREATE INDEX CONCURRENTLY "idx_${stat.relname.toLowerCase()}_<column>" ON "${stat.relname}" ("<column>");`,
        });
      }

      // Find foreign keys that lack indexes
      const fkResult = await this._client.$queryRaw<
        Array<{ fk_table: string; fk_column: string; ref_table: string }>
      >`
        SELECT
          tc.table_name AS fk_table,
          kcu.column_name AS fk_column,
          ccu.table_name AS ref_table
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = ${table}
          AND kcu.column_name NOT IN (
            SELECT a.attname
            FROM pg_index i
            JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
            WHERE i.indrelid = tc.table_name::regclass
          )
      `;

      for (const fk of fkResult) {
        suggestions.push({
          table:   fk.fk_table,
          columns: [fk.fk_column],
          reason:  `Foreign key column "${fk.fk_column}" (references ${fk.ref_table}) has no index. Join performance will suffer without it.`,
          sql:     `CREATE INDEX CONCURRENTLY "idx_${fk.fk_table.toLowerCase()}_${fk.fk_column.toLowerCase()}" ON "${fk.fk_table}" ("${fk.fk_column}");`,
        });
      }
    } catch {
      // Fallback: return common best-practice suggestions for known tables
      return this._defaultIndexSuggestions(table);
    }

    return suggestions;
  }

  // ── Table statistics ───────────────────────────────────────────────────

  /**
   * Get table size, row count, and index efficiency statistics.
   */
  async getTableStats(table: string, schema = 'public'): Promise<TableStats | null> {
    try {
      const result = await this._client.$queryRaw<
        Array<{
          tablename:       string;
          schemaname:      string;
          n_live_tup:      bigint;
          table_size:      bigint;
          index_size:      bigint;
          total_size:      bigint;
          table_pretty:    string;
          index_pretty:    string;
          total_pretty:    string;
          seq_scan:        bigint;
          idx_scan:        bigint;
        }>
      >`
        SELECT
          t.relname                                                           AS tablename,
          s.schemaname,
          s.n_live_tup,
          pg_relation_size(t.oid)                                             AS table_size,
          pg_indexes_size(t.oid)                                              AS index_size,
          pg_total_relation_size(t.oid)                                       AS total_size,
          pg_size_pretty(pg_relation_size(t.oid))                             AS table_pretty,
          pg_size_pretty(pg_indexes_size(t.oid))                              AS index_pretty,
          pg_size_pretty(pg_total_relation_size(t.oid))                       AS total_pretty,
          s.seq_scan,
          s.idx_scan
        FROM pg_class t
        JOIN pg_namespace n ON n.oid = t.relnamespace
        JOIN pg_stat_user_tables s ON s.relid = t.oid
        WHERE t.relname    = ${table}
          AND n.nspname    = ${schema}
          AND t.relkind    = 'r'
        LIMIT 1
      `;

      if (result.length === 0) return null;

      const row         = result[0];
      const seqScans    = Number(row.seq_scan);
      const idxScans    = Number(row.idx_scan);
      const totalScans  = seqScans + idxScans;
      const efficiency  = totalScans > 0 ? Math.round((idxScans / totalScans) * 100) : 100;

      return {
        tableName:       row.tablename,
        schemaName:      row.schemaname,
        rowCount:        Number(row.n_live_tup),
        tableSizeBytes:  Number(row.table_size),
        tableSizePretty: row.table_pretty,
        indexSizeBytes:  Number(row.index_size),
        indexSizePretty: row.index_pretty,
        totalSizePretty: row.total_pretty,
        seqScans,
        indexScans:      idxScans,
        indexEfficiency: efficiency,
        bloatPercent:    null,   // requires pgstattuple extension
      };
    } catch {
      return null;
    }
  }

  /**
   * Get index usage statistics — find unused indexes.
   */
  async getIndexUsageStats(table?: string): Promise<IndexUsageStat[]> {
    try {
      const whereClause = table ? `AND t.relname = '${table}'` : '';

      const result = await this._client.$queryRawUnsafe<
        Array<{
          indexname:       string;
          tablename:       string;
          idx_scan:        bigint;
          idx_tup_fetch:   bigint;
          index_size:      string;
        }>
      >(`
        SELECT
          i.relname                             AS indexname,
          t.relname                             AS tablename,
          s.idx_scan,
          s.idx_tup_fetch,
          pg_size_pretty(pg_relation_size(i.oid)) AS index_size
        FROM pg_stat_user_indexes s
        JOIN pg_class i ON i.oid = s.indexrelid
        JOIN pg_class t ON t.oid = s.relid
        WHERE s.schemaname = 'public'
          ${whereClause}
        ORDER BY s.idx_scan ASC, pg_relation_size(i.oid) DESC
        LIMIT 50
      `);

      return result.map((r) => ({
        indexName:     r.indexname,
        tableName:     r.tablename,
        indexScans:    Number(r.idx_scan),
        tuplesFetched: Number(r.idx_tup_fetch),
        sizePretty:    r.index_size,
        isUnused:      Number(r.idx_scan) === 0,
      }));
    } catch {
      return [];
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────

  private _staticAnalyze(sql: string): { warnings: string[]; suggestions: string[] } {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    const upper = sql.toUpperCase();

    if (/SELECT\s+\*/i.test(sql)) {
      suggestions.push('Avoid SELECT *. Explicitly list the columns you need to reduce data transfer.');
    }

    if (/WHERE.*LIKE\s+'%/i.test(sql)) {
      warnings.push('Leading wildcard LIKE pattern detected (LIKE \'%...\') — cannot use a B-tree index.');
      suggestions.push('Consider using full-text search (tsvector) or a trigram index (pg_trgm) instead of LIKE \'%value%\'.');
    }

    if (/ORDER BY RAND\(\)|ORDER BY RANDOM\(\)/i.test(sql)) {
      suggestions.push('ORDER BY RANDOM() forces a full table scan. Consider using a keyset pagination approach instead.');
    }

    if (!upper.includes('WHERE') && !upper.includes('LIMIT')) {
      if (upper.includes('SELECT')) {
        suggestions.push('Query has no WHERE clause and no LIMIT — this will scan the entire table.');
      }
    }

    if (/OR\s+\w+\s*=\s*/i.test(sql)) {
      suggestions.push('OR predicates can prevent index use. Consider rewriting as UNION or using IN() instead.');
    }

    if (/NOT IN\s*\(/i.test(sql)) {
      suggestions.push('NOT IN with a subquery can be slow. Consider using NOT EXISTS or a LEFT JOIN / IS NULL pattern.');
    }

    return { warnings, suggestions };
  }

  private _extractPlanType(plan: string): string | null {
    const match = plan.match(/-> +([A-Za-z ]+)\s+on/i) ??
                  plan.match(/^([A-Za-z ]+)\s+on/im);
    return match ? match[1].trim() : null;
  }

  private _defaultIndexSuggestions(table: string): IndexSuggestion[] {
    const knownTables: Record<string, IndexSuggestion[]> = {
      aura_employee: [
        {
          table:   'aura_employee',
          columns: ['departmentId'],
          reason:  'Frequently filtered by department',
          sql:     `CREATE INDEX CONCURRENTLY "idx_employee_departmentid" ON "aura_employee" ("departmentId");`,
        },
        {
          table:   'aura_employee',
          columns: ['managerId'],
          reason:  'Manager hierarchy queries',
          sql:     `CREATE INDEX CONCURRENTLY "idx_employee_managerid" ON "aura_employee" ("managerId");`,
        },
        {
          table:   'aura_employee',
          columns: ['status', 'hireDate'],
          reason:  'Active employee list queries',
          sql:     `CREATE INDEX CONCURRENTLY "idx_employee_status_hiredate" ON "aura_employee" ("status", "hireDate");`,
        },
      ],
      aura_attendance_punch: [
        {
          table:   'aura_attendance_punch',
          columns: ['employeeId', 'punchTime'],
          reason:  'Employee-specific time range queries',
          sql:     `CREATE INDEX CONCURRENTLY "idx_attendancepunch_empid_punchtime" ON "aura_attendance_punch" ("employeeId", "punchTime");`,
        },
      ],
      aura_leave_request: [
        {
          table:   'aura_leave_request',
          columns: ['employeeId', 'status'],
          reason:  'Leave request approval queries',
          sql:     `CREATE INDEX CONCURRENTLY "idx_leaverequest_empid_status" ON "aura_leave_request" ("employeeId", "status");`,
        },
        {
          table:   'aura_leave_request',
          columns: ['approverId', 'status'],
          reason:  'Manager approval queue',
          sql:     `CREATE INDEX CONCURRENTLY "idx_leaverequest_approverid_status" ON "aura_leave_request" ("approverId", "status");`,
        },
      ],
    };

    return knownTables[table] ?? [];
  }
}
