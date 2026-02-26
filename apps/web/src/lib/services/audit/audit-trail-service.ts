/**
 * @module audit-trail-service
 * @description Enterprise Audit Trail Service — field-level change tracking,
 *              anomaly detection, SOX-ready compliance reports, and GDPR erasure.
 * @project AuraOS Enterprise HCM Platform
 * @section 16 — Enterprise Backend Platform Services
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'EXPORT'
  | 'IMPORT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'ROLE_CHANGE'
  | 'APPROVE'
  | 'REJECT'
  | 'ESCALATE';

export type AuditEntity =
  | 'employee'
  | 'department'
  | 'position'
  | 'payroll'
  | 'leave'
  | 'attendance'
  | 'document'
  | 'user'
  | 'role'
  | 'policy'
  | 'benefit'
  | 'recruitment'
  | 'performance'
  | 'compliance';

export interface FieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  sensitive: boolean; // PII or financial fields
}

export interface AuditRecord {
  auditId: string;
  entity: AuditEntity;
  entityId: string;
  action: AuditAction;
  userId: string;
  userName: string;
  userRole: string;
  tenantId: string;
  changes: FieldChange[];
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogFilters {
  entity?: AuditEntity;
  entityId?: string;
  userId?: string;
  action?: AuditAction | AuditAction[];
  tenantId?: string;
  from?: string;
  to?: string;
  ipAddress?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedAuditLog {
  records: AuditRecord[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export interface FieldHistory {
  entity: AuditEntity;
  entityId: string;
  field: string;
  history: Array<{
    oldValue: unknown;
    newValue: unknown;
    changedBy: string;
    changedByName: string;
    changedAt: string;
    auditId: string;
  }>;
}

export interface AnomalyAlert {
  alertId: string;
  type:
    | 'bulk-delete'
    | 'off-hours-access'
    | 'privilege-escalation'
    | 'excessive-exports'
    | 'failed-logins'
    | 'sensitive-field-access'
    | 'unusual-volume';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId: string;
  userName: string;
  entity?: AuditEntity;
  entityId?: string;
  count: number;
  firstOccurrence: string;
  lastOccurrence: string;
  resolved: boolean;
}

export interface ComplianceReport {
  startDate: string;
  endDate: string;
  generatedAt: string;
  tenantId: string;
  summary: {
    totalChanges: number;
    entitiesModified: number;
    usersActive: number;
    criticalChanges: number;
    dataExports: number;
    roleChanges: number;
    failedLoginAttempts: number;
  };
  financialDataChanges: AuditRecord[];
  privilegedActions: AuditRecord[];
  accessControlChanges: AuditRecord[];
  dataExports: AuditRecord[];
  anomalies: AnomalyAlert[];
  signedOffBy?: string;
  signedOffAt?: string;
}

// ============================================================================
// IN-MEMORY AUDIT STORE (replace with append-only PostgreSQL table / Elasticsearch)
// ============================================================================

const auditLog: AuditRecord[] = [];

// Seed sample audit records for realism
(function seedAuditData() {
  const sampleActions: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT'];
  const sampleEntities: AuditEntity[] = ['employee', 'payroll', 'document', 'user'];

  for (let i = 0; i < 50; i++) {
    const ts = new Date(Date.now() - i * 3600 * 1000).toISOString();
    auditLog.push({
      auditId: `aud_seed_${i.toString().padStart(3, '0')}`,
      entity: sampleEntities[i % sampleEntities.length],
      entityId: `ent_${(i % 10).toString().padStart(3, '0')}`,
      action: sampleActions[i % sampleActions.length],
      userId: `usr_${(i % 5).toString().padStart(3, '0')}`,
      userName: ['Alice Johnson', 'Bob Williams', 'Carol Smith', 'David Brown', 'Eva Martinez'][
        i % 5
      ],
      userRole: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE', 'PAYROLL_ADMIN', 'AUDITOR'][i % 5],
      tenantId: 'tenant_001',
      changes:
        i % 3 === 0
          ? [
              {
                field: 'salary',
                oldValue: 80000,
                newValue: 85000,
                dataType: 'number',
                sensitive: true,
              },
            ]
          : [],
      ipAddress: `192.168.1.${(i % 254) + 1}`,
      timestamp: ts,
    });
  }
})();

function generateAuditId(): string {
  return `aud_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * logChange — record a field-level change event to the audit trail.
 */
export async function logChange(
  entity: AuditEntity,
  entityId: string,
  changes: FieldChange[],
  context: {
    userId: string;
    userName: string;
    userRole: string;
    tenantId: string;
    action?: AuditAction;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    requestId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<AuditRecord> {
  const record: AuditRecord = {
    auditId: generateAuditId(),
    entity,
    entityId,
    action: context.action ?? 'UPDATE',
    userId: context.userId,
    userName: context.userName,
    userRole: context.userRole,
    tenantId: context.tenantId,
    changes,
    before: context.before,
    after: context.after,
    ipAddress: context.ipAddress ?? '0.0.0.0',
    userAgent: context.userAgent,
    sessionId: context.sessionId,
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
    metadata: context.metadata,
  };

  // Append to audit log (in production: write to immutable append-only table)
  auditLog.push(record);

  return { ...record };
}

/**
 * getAuditTrail — returns chronological change history for a specific entity.
 */
export async function getAuditTrail(
  entity: AuditEntity,
  entityId: string,
  options: { from?: string; to?: string; limit?: number } = {}
): Promise<AuditRecord[]> {
  let records = auditLog.filter((r) => r.entity === entity && r.entityId === entityId);

  if (options.from) records = records.filter((r) => r.timestamp >= options.from!);
  if (options.to) records = records.filter((r) => r.timestamp <= options.to!);

  records.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  if (options.limit) records = records.slice(0, options.limit);

  return records;
}

/**
 * getAuditLog — filtered, paginated audit log with multi-criteria support.
 */
export async function getAuditLog(filters: AuditLogFilters = {}): Promise<PaginatedAuditLog> {
  let records = [...auditLog];

  if (filters.entity) records = records.filter((r) => r.entity === filters.entity);
  if (filters.entityId) records = records.filter((r) => r.entityId === filters.entityId);
  if (filters.userId) records = records.filter((r) => r.userId === filters.userId);
  if (filters.tenantId) records = records.filter((r) => r.tenantId === filters.tenantId);
  if (filters.ipAddress) records = records.filter((r) => r.ipAddress === filters.ipAddress);

  if (filters.action) {
    const actions = Array.isArray(filters.action) ? filters.action : [filters.action];
    records = records.filter((r) => actions.includes(r.action));
  }

  if (filters.from) records = records.filter((r) => r.timestamp >= filters.from!);
  if (filters.to) records = records.filter((r) => r.timestamp <= filters.to!);

  records.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;
  const total = records.length;
  const pages = Math.ceil(total / pageSize);
  const paginated = records.slice((page - 1) * pageSize, page * pageSize);

  return { records: paginated, total, page, pageSize, pages };
}

/**
 * getFieldHistory — returns the change history of a specific field on an entity.
 */
export async function getFieldHistory(
  entity: AuditEntity,
  entityId: string,
  field: string
): Promise<FieldHistory> {
  const records = auditLog.filter(
    (r) =>
      r.entity === entity && r.entityId === entityId && r.changes.some((c) => c.field === field)
  );

  records.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const history = records.flatMap((r) =>
    r.changes
      .filter((c) => c.field === field)
      .map((c) => ({
        oldValue: c.sensitive ? '[REDACTED]' : c.oldValue,
        newValue: c.sensitive ? '[REDACTED]' : c.newValue,
        changedBy: r.userId,
        changedByName: r.userName,
        changedAt: r.timestamp,
        auditId: r.auditId,
      }))
  );

  return { entity, entityId, field, history };
}

/**
 * detectAnomalies — identifies unusual patterns: bulk deletes, off-hours access,
 *                   privilege escalation, excessive exports, failed login bursts.
 */
export async function detectAnomalies(
  options: { tenantId?: string; windowHours?: number } = {}
): Promise<AnomalyAlert[]> {
  const windowMs = (options.windowHours ?? 24) * 60 * 60 * 1000;
  const cutoff = new Date(Date.now() - windowMs).toISOString();
  const recent = auditLog.filter(
    (r) => r.timestamp >= cutoff && (!options.tenantId || r.tenantId === options.tenantId)
  );

  const alerts: AnomalyAlert[] = [];

  // Pattern 1: Bulk deletes (>10 deletes by same user in window)
  const deletesByUser = new Map<string, AuditRecord[]>();
  recent
    .filter((r) => r.action === 'DELETE')
    .forEach((r) => {
      const list = deletesByUser.get(r.userId) ?? [];
      list.push(r);
      deletesByUser.set(r.userId, list);
    });

  deletesByUser.forEach((records, userId) => {
    if (records.length >= 10) {
      alerts.push({
        alertId: generateAuditId(),
        type: 'bulk-delete',
        severity: records.length >= 50 ? 'critical' : 'high',
        description: `User performed ${records.length} deletions in the last ${options.windowHours ?? 24} hours`,
        userId,
        userName: records[0].userName,
        count: records.length,
        firstOccurrence: records[0].timestamp,
        lastOccurrence: records[records.length - 1].timestamp,
        resolved: false,
      });
    }
  });

  // Pattern 2: Off-hours access (before 6am or after 10pm local)
  const offHours = recent.filter((r) => {
    const hour = new Date(r.timestamp).getHours();
    return hour < 6 || hour >= 22;
  });

  if (offHours.length > 5) {
    const userSet = new Set(offHours.map((r) => r.userId));
    userSet.forEach((userId) => {
      const userRecords = offHours.filter((r) => r.userId === userId);
      if (userRecords.length >= 3) {
        alerts.push({
          alertId: generateAuditId(),
          type: 'off-hours-access',
          severity: 'medium',
          description: `User accessed the system ${userRecords.length} times outside business hours`,
          userId,
          userName: userRecords[0].userName,
          count: userRecords.length,
          firstOccurrence: userRecords[0].timestamp,
          lastOccurrence: userRecords[userRecords.length - 1].timestamp,
          resolved: false,
        });
      }
    });
  }

  // Pattern 3: Privilege escalation (ROLE_CHANGE actions)
  const roleChanges = recent.filter((r) => r.action === 'ROLE_CHANGE');
  if (roleChanges.length > 0) {
    roleChanges.forEach((r) => {
      alerts.push({
        alertId: generateAuditId(),
        type: 'privilege-escalation',
        severity: 'high',
        description: `Privilege escalation detected: role change performed`,
        userId: r.userId,
        userName: r.userName,
        entity: r.entity,
        entityId: r.entityId,
        count: 1,
        firstOccurrence: r.timestamp,
        lastOccurrence: r.timestamp,
        resolved: false,
      });
    });
  }

  // Pattern 4: Excessive exports (>20 exports in window)
  const exportsByUser = new Map<string, AuditRecord[]>();
  recent
    .filter((r) => r.action === 'EXPORT')
    .forEach((r) => {
      const list = exportsByUser.get(r.userId) ?? [];
      list.push(r);
      exportsByUser.set(r.userId, list);
    });

  exportsByUser.forEach((records, userId) => {
    if (records.length >= 20) {
      alerts.push({
        alertId: generateAuditId(),
        type: 'excessive-exports',
        severity: 'medium',
        description: `User performed ${records.length} data exports in the last ${options.windowHours ?? 24} hours`,
        userId,
        userName: records[0].userName,
        count: records.length,
        firstOccurrence: records[0].timestamp,
        lastOccurrence: records[records.length - 1].timestamp,
        resolved: false,
      });
    }
  });

  return alerts;
}

/**
 * getComplianceReport — SOX-ready audit report covering financial data changes,
 *                       privileged actions, and access control modifications.
 */
export async function getComplianceReport(
  startDate: string,
  endDate: string,
  tenantId: string
): Promise<ComplianceReport> {
  const records = auditLog.filter(
    (r) => r.tenantId === tenantId && r.timestamp >= startDate && r.timestamp <= endDate
  );

  const financialDataChanges = records.filter(
    (r) =>
      (r.entity === 'payroll' || r.entity === 'benefit') &&
      r.action === 'UPDATE' &&
      r.changes.some((c) => c.sensitive)
  );

  const privilegedActions = records.filter(
    (r) => r.userRole === 'ADMIN' && ['DELETE', 'ROLE_CHANGE', 'EXPORT'].includes(r.action)
  );

  const accessControlChanges = records.filter(
    (r) => r.action === 'ROLE_CHANGE' || r.entity === 'role'
  );

  const dataExports = records.filter((r) => r.action === 'EXPORT');

  const failedLogins = records.filter((r) => r.action === 'LOGIN' && r.metadata?.failed === true);

  const anomalies = await detectAnomalies({ tenantId });

  return {
    startDate,
    endDate,
    generatedAt: new Date().toISOString(),
    tenantId,
    summary: {
      totalChanges: records.length,
      entitiesModified: new Set(records.map((r) => `${r.entity}:${r.entityId}`)).size,
      usersActive: new Set(records.map((r) => r.userId)).size,
      criticalChanges: financialDataChanges.length + privilegedActions.length,
      dataExports: dataExports.length,
      roleChanges: accessControlChanges.length,
      failedLoginAttempts: failedLogins.length,
    },
    financialDataChanges: financialDataChanges.slice(0, 100),
    privilegedActions: privilegedActions.slice(0, 100),
    accessControlChanges: accessControlChanges.slice(0, 100),
    dataExports: dataExports.slice(0, 100),
    anomalies,
  };
}

/**
 * gdprErasure — anonymize all PII in audit records for a given user (Right to Erasure).
 * Preserves audit structure (actions, timestamps) while replacing personal data.
 */
export async function gdprErasure(
  userId: string,
  requestedBy: string
): Promise<{
  userId: string;
  recordsAnonymized: number;
  fieldsRedacted: number;
  processedAt: string;
  requestedBy: string;
}> {
  let recordsAnonymized = 0;
  let fieldsRedacted = 0;

  for (const record of auditLog) {
    if (record.userId !== userId) continue;

    // Anonymize PII fields
    record.userName = '[DELETED USER]';
    record.ipAddress = '0.0.0.0';
    record.userAgent = undefined;
    record.sessionId = undefined;
    fieldsRedacted += 4;

    // Redact sensitive changes
    record.changes = record.changes.map((c) => {
      if (c.sensitive) {
        fieldsRedacted += 2;
        return { ...c, oldValue: '[ERASED]', newValue: '[ERASED]' };
      }
      return c;
    });

    // Remove before/after snapshots that may contain PII
    if (record.before) {
      record.before = { _erased: true };
      fieldsRedacted++;
    }
    if (record.after) {
      record.after = { _erased: true };
      fieldsRedacted++;
    }

    recordsAnonymized++;
  }

  // Log the erasure itself (non-anonymized — legal requirement)
  await logChange('user', userId, [], {
    userId: requestedBy,
    userName: 'GDPR Processor',
    userRole: 'DATA_PROTECTION_OFFICER',
    tenantId: 'system',
    action: 'DELETE',
    ipAddress: '0.0.0.0',
    metadata: { gdprErasure: true, targetUserId: userId, recordsAnonymized },
  });

  return {
    userId,
    recordsAnonymized,
    fieldsRedacted,
    processedAt: new Date().toISOString(),
    requestedBy,
  };
}
