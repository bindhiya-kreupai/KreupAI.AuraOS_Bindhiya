/**
 * Audit Logging Service
 * Track all critical operations for compliance and security
 */

import { logger } from '../logger';
import { redis } from '../cache/redis';
import { prisma } from '@aura/database';
import type {
  AuditAction as PrismaAuditAction,
  AuditSeverity as PrismaAuditSeverity,
} from '@prisma/client';

export enum AuditAction {
  // Employee actions
  EMPLOYEE_CREATED = 'EMPLOYEE_CREATED',
  EMPLOYEE_UPDATED = 'EMPLOYEE_UPDATED',
  EMPLOYEE_DELETED = 'EMPLOYEE_DELETED',
  EMPLOYEE_TERMINATED = 'EMPLOYEE_TERMINATED',
  EMPLOYEE_REHIRED = 'EMPLOYEE_REHIRED',

  // Payroll actions
  PAYROLL_RUN_INITIATED = 'PAYROLL_RUN_INITIATED',
  PAYROLL_RUN_APPROVED = 'PAYROLL_RUN_APPROVED',
  PAYROLL_RUN_REJECTED = 'PAYROLL_RUN_REJECTED',
  PAYSLIP_GENERATED = 'PAYSLIP_GENERATED',
  PAYSLIP_VIEWED = 'PAYSLIP_VIEWED',
  SALARY_UPDATED = 'SALARY_UPDATED',

  // Leave actions
  LEAVE_REQUEST_CREATED = 'LEAVE_REQUEST_CREATED',
  LEAVE_REQUEST_APPROVED = 'LEAVE_REQUEST_APPROVED',
  LEAVE_REQUEST_REJECTED = 'LEAVE_REQUEST_REJECTED',
  LEAVE_REQUEST_CANCELLED = 'LEAVE_REQUEST_CANCELLED',
  LEAVE_POLICY_CREATED = 'LEAVE_POLICY_CREATED',
  LEAVE_POLICY_UPDATED = 'LEAVE_POLICY_UPDATED',
  LEAVE_ENCASHMENT_REQUESTED = 'LEAVE_ENCASHMENT_REQUESTED',

  // Attendance actions
  ATTENDANCE_MARKED = 'ATTENDANCE_MARKED',
  ATTENDANCE_UPDATED = 'ATTENDANCE_UPDATED',
  ATTENDANCE_REGULARIZED = 'ATTENDANCE_REGULARIZED',
  BULK_ATTENDANCE_IMPORTED = 'BULK_ATTENDANCE_IMPORTED',

  // Authentication actions
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_LOGIN_FAILED = 'USER_LOGIN_FAILED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_VERIFIED = 'MFA_VERIFIED',
  MFA_DISABLED = 'MFA_DISABLED',

  // Authorization actions
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ROLE_REMOVED = 'ROLE_REMOVED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',

  // Data export actions
  DATA_EXPORTED = 'DATA_EXPORTED',
  REPORT_GENERATED = 'REPORT_GENERATED',
  REPORT_DOWNLOADED = 'REPORT_DOWNLOADED',

  // System actions
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
  INTEGRATION_CONFIGURED = 'INTEGRATION_CONFIGURED',
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
}

export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  severity: AuditSeverity;
  userId: string;
  userEmail: string;
  tenantId: string;
  companyId: string;
  resourceType: string; // e.g., 'employee', 'payroll', 'leave'
  resourceId?: string;
  changes?: {
    before?: any;
    after?: any;
  };
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    [key: string]: any;
  };
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

export interface AuditSearchFilters {
  userId?: string;
  tenantId?: string;
  companyId?: string;
  action?: AuditAction;
  resourceType?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  severity?: AuditSeverity;
  success?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Audit Service — persists to PostgreSQL via Prisma, caches in Redis
 */
export class AuditService {
  private readonly AUDIT_RETENTION_DAYS = 90;

  /**
   * Log an audit entry — primary write to PostgreSQL, secondary cache to Redis
   */
  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<string> {
    const id = crypto.randomUUID();
    const timestamp = new Date();

    try {
      // Primary: persist to PostgreSQL
      await prisma.auditLog.create({
        data: {
          id,
          tenantId: entry.tenantId,
          companyId: entry.companyId || null,
          userId: entry.userId || null,
          userEmail: entry.userEmail || null,
          action: entry.action as unknown as PrismaAuditAction,
          severity: (entry.severity || AuditSeverity.LOW) as unknown as PrismaAuditSeverity,
          module: entry.resourceType || 'system',
          resourceType: entry.resourceType,
          resourceId: entry.resourceId || null,
          success: entry.success ?? true,
          errorMessage: entry.errorMessage || null,
          beforeValues: entry.changes?.before || undefined,
          afterValues: entry.changes?.after || undefined,
          ipAddress: entry.metadata?.ipAddress || null,
          userAgent: entry.metadata?.userAgent || null,
          metadata: entry.metadata || undefined,
          timestamp,
          // Backward compatibility (deprecated)
          entityType: entry.resourceType,
          entityId: entry.resourceId || null,
        },
      });

      // Secondary: cache in Redis for real-time dashboard
      const auditEntry: AuditLogEntry = {
        id,
        ...entry,
        timestamp: timestamp.toISOString(),
      };
      await this.storeInRedis(auditEntry).catch(() => {
        // Redis failure should not break audit logging
      });

      logger.info(
        {
          auditId: id,
          action: entry.action,
          userId: entry.userId,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId,
          severity: entry.severity,
        },
        'Audit log entry created'
      );

      return id;
    } catch (error: any) {
      logger.error({ error, entry }, 'Failed to create audit log entry');
      throw error;
    }
  }

  /**
   * Log employee action
   */
  async logEmployeeAction(
    action: AuditAction,
    data: {
      userId: string;
      userEmail: string;
      tenantId: string;
      companyId: string;
      employeeId: string;
      changes?: { before?: any; after?: any };
      metadata?: any;
    }
  ): Promise<string> {
    return await this.log({
      action,
      severity: this.getSeverityForAction(action),
      userId: data.userId,
      userEmail: data.userEmail,
      tenantId: data.tenantId,
      companyId: data.companyId,
      resourceType: 'employee',
      resourceId: data.employeeId,
      changes: data.changes,
      metadata: data.metadata,
      success: true,
    });
  }

  /**
   * Log payroll action
   */
  async logPayrollAction(
    action: AuditAction,
    data: {
      userId: string;
      userEmail: string;
      tenantId: string;
      companyId: string;
      payrollRunId?: string;
      changes?: { before?: any; after?: any };
      metadata?: any;
    }
  ): Promise<string> {
    return await this.log({
      action,
      severity: this.getSeverityForAction(action),
      userId: data.userId,
      userEmail: data.userEmail,
      tenantId: data.tenantId,
      companyId: data.companyId,
      resourceType: 'payroll',
      resourceId: data.payrollRunId,
      changes: data.changes,
      metadata: data.metadata,
      success: true,
    });
  }

  /**
   * Log leave action
   */
  async logLeaveAction(
    action: AuditAction,
    data: {
      userId: string;
      userEmail: string;
      tenantId: string;
      companyId: string;
      leaveRequestId?: string;
      changes?: { before?: any; after?: any };
      metadata?: any;
    }
  ): Promise<string> {
    return await this.log({
      action,
      severity: this.getSeverityForAction(action),
      userId: data.userId,
      userEmail: data.userEmail,
      tenantId: data.tenantId,
      companyId: data.companyId,
      resourceType: 'leave',
      resourceId: data.leaveRequestId,
      changes: data.changes,
      metadata: data.metadata,
      success: true,
    });
  }

  /**
   * Log authentication action
   */
  async logAuthAction(
    action: AuditAction,
    data: {
      userId: string;
      userEmail: string;
      tenantId: string;
      companyId: string;
      success: boolean;
      metadata?: any;
      errorMessage?: string;
    }
  ): Promise<string> {
    return await this.log({
      action,
      severity: data.success ? AuditSeverity.MEDIUM : AuditSeverity.HIGH,
      userId: data.userId,
      userEmail: data.userEmail,
      tenantId: data.tenantId,
      companyId: data.companyId,
      resourceType: 'authentication',
      metadata: data.metadata,
      success: data.success,
      errorMessage: data.errorMessage,
    });
  }

  /**
   * Log data export action
   */
  async logDataExport(data: {
    userId: string;
    userEmail: string;
    tenantId: string;
    companyId: string;
    exportType: string;
    recordCount: number;
    metadata?: any;
  }): Promise<string> {
    return await this.log({
      action: AuditAction.DATA_EXPORTED,
      severity: AuditSeverity.HIGH,
      userId: data.userId,
      userEmail: data.userEmail,
      tenantId: data.tenantId,
      companyId: data.companyId,
      resourceType: 'data_export',
      metadata: {
        ...data.metadata,
        exportType: data.exportType,
        recordCount: data.recordCount,
      },
      success: true,
    });
  }

  /**
   * Search audit logs with pagination and filters
   */
  async search(filters: AuditSearchFilters): Promise<{
    items: AuditLogEntry[];
    total: number;
    page: number;
    pageSize: number;
    hasNextPage: boolean;
  }> {
    const page = filters.page || 1;
    const pageSize = filters.limit || 20;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (filters.tenantId) where.tenantId = filters.tenantId;
    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.resourceType) where.resourceType = filters.resourceType;
    if (filters.resourceId) where.resourceId = filters.resourceId;
    if (filters.severity) where.severity = filters.severity;
    if (filters.success !== undefined) where.success = filters.success;
    if (filters.startDate || filters.endDate) {
      where.timestamp = {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
      };
    }

    const [rows, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);

    const items: AuditLogEntry[] = rows.map((row) => this.mapRowToEntry(row));

    return {
      items,
      total,
      page,
      pageSize,
      hasNextPage: skip + pageSize < total,
    };
  }

  /**
   * Get audit trail for a specific resource
   */
  async getResourceAuditTrail(
    tenantId: string,
    resourceType: string,
    resourceId: string,
    options?: { limit?: number }
  ): Promise<AuditLogEntry[]> {
    const rows = await prisma.auditLog.findMany({
      where: { tenantId, resourceType, resourceId },
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 50,
    });

    return rows.map((row) => this.mapRowToEntry(row));
  }

  /**
   * Get user activity
   */
  async getUserActivity(
    tenantId: string,
    userId: string,
    options?: { startDate?: string; endDate?: string; limit?: number }
  ): Promise<AuditLogEntry[]> {
    const where: Record<string, unknown> = { tenantId, userId };
    if (options?.startDate || options?.endDate) {
      where.timestamp = {
        ...(options?.startDate ? { gte: new Date(options.startDate) } : {}),
        ...(options?.endDate ? { lte: new Date(options.endDate) } : {}),
      };
    }

    const rows = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 100,
    });

    return rows.map((row) => this.mapRowToEntry(row));
  }

  /**
   * Generate compliance report with aggregated data
   */
  async generateComplianceReport(
    tenantId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    actionsBySeverity: Record<string, number>;
    failedActions: number;
    topUsers: Array<{ userId: string; userEmail: string; actionCount: number }>;
  }> {
    const dateFilter = {
      tenantId,
      timestamp: { gte: new Date(startDate), lte: new Date(endDate) },
    };

    const [totalActions, failedActions, byAction, bySeverity, topUsersRaw] = await Promise.all([
      prisma.auditLog.count({ where: dateFilter }),
      prisma.auditLog.count({ where: { ...dateFilter, success: false } }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where: dateFilter,
        _count: { action: true },
      }),
      prisma.auditLog.groupBy({
        by: ['severity'],
        where: dateFilter,
        _count: { severity: true },
      }),
      prisma.auditLog.groupBy({
        by: ['userId', 'userEmail'],
        where: dateFilter,
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),
    ]);

    const actionsByType: Record<string, number> = {};
    for (const row of byAction) {
      actionsByType[row.action] = row._count.action;
    }

    const actionsBySeverity: Record<string, number> = {};
    for (const row of bySeverity) {
      actionsBySeverity[row.severity] = row._count.severity;
    }

    const topUsers = topUsersRaw
      .filter((r) => r.userId)
      .map((r) => ({
        userId: r.userId!,
        userEmail: r.userEmail || '',
        actionCount: r._count.userId,
      }));

    return {
      totalActions,
      actionsByType,
      actionsBySeverity,
      failedActions,
      topUsers,
    };
  }

  /**
   * Cleanup old audit logs — archive then delete
   */
  async cleanup(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.AUDIT_RETENTION_DAYS);

    // Find records to archive
    const recordsToArchive = await prisma.auditLog.findMany({
      where: { timestamp: { lt: cutoffDate } },
      take: 5000, // Process in batches
    });

    if (recordsToArchive.length === 0) {
      logger.info('No audit logs to archive');
      return 0;
    }

    // Archive then delete in a transaction
    const archivedCount = await prisma.$transaction(async (tx) => {
      // Insert into archive
      await tx.auditLogArchive.createMany({
        data: recordsToArchive.map((row) => ({
          id: row.id,
          tenantId: row.tenantId,
          companyId: row.companyId,
          userId: row.userId,
          userEmail: row.userEmail,
          action: row.action,
          severity: row.severity,
          resourceType: row.resourceType || '',
          resourceId: row.resourceId,
          success: row.success,
          errorMessage: row.errorMessage,
          beforeValues: row.beforeValues || undefined,
          afterValues: row.afterValues || undefined,
          ipAddress: row.ipAddress,
          userAgent: row.userAgent,
          metadata: row.metadata || undefined,
          timestamp: row.timestamp,
          createdBy: row.createdBy,
        })),
        skipDuplicates: true,
      });

      // Delete archived records from main table
      const ids = recordsToArchive.map((r) => r.id);
      await tx.auditLog.deleteMany({ where: { id: { in: ids } } });

      return recordsToArchive.length;
    });

    logger.info(
      { cutoffDate: cutoffDate.toISOString(), archivedCount },
      'Audit logs archived and cleaned up'
    );

    return archivedCount;
  }

  /**
   * Store audit entry in Redis for quick access (secondary cache)
   */
  private async storeInRedis(entry: AuditLogEntry): Promise<void> {
    const key = `audit:${entry.tenantId}:recent`;
    const entries = (await redis.get(key)) || [];

    entries.unshift(entry);

    // Keep only last 1000 entries
    if (entries.length > 1000) {
      entries.splice(1000);
    }

    await redis.set(key, entries, 86400 * 7); // 7 days TTL
  }

  /**
   * Map a Prisma row to an AuditLogEntry interface
   */
  private mapRowToEntry(row: any): AuditLogEntry {
    return {
      id: row.id,
      action: row.action as AuditAction,
      severity: row.severity as AuditSeverity,
      userId: row.userId || '',
      userEmail: row.userEmail || '',
      tenantId: row.tenantId,
      companyId: row.companyId || '',
      resourceType: row.resourceType || row.entityType || '',
      resourceId: row.resourceId || row.entityId || undefined,
      changes: {
        before: row.beforeValues || undefined,
        after: row.afterValues || undefined,
      },
      metadata: {
        ipAddress: row.ipAddress || undefined,
        userAgent: row.userAgent || undefined,
        ...(row.metadata && typeof row.metadata === 'object' ? row.metadata : {}),
      },
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : row.timestamp,
      success: row.success ?? true,
      errorMessage: row.errorMessage || undefined,
    };
  }

  /**
   * Get severity level for action
   */
  private getSeverityForAction(action: AuditAction): AuditSeverity {
    const criticalActions = [
      AuditAction.EMPLOYEE_DELETED,
      AuditAction.EMPLOYEE_TERMINATED,
      AuditAction.API_KEY_CREATED,
      AuditAction.API_KEY_REVOKED,
      AuditAction.PERMISSION_GRANTED,
      AuditAction.PERMISSION_REVOKED,
    ];

    const highActions = [
      AuditAction.PAYROLL_RUN_APPROVED,
      AuditAction.SALARY_UPDATED,
      AuditAction.DATA_EXPORTED,
      AuditAction.SETTINGS_UPDATED,
      AuditAction.PASSWORD_CHANGED,
    ];

    const mediumActions = [
      AuditAction.EMPLOYEE_UPDATED,
      AuditAction.LEAVE_REQUEST_APPROVED,
      AuditAction.LEAVE_REQUEST_REJECTED,
      AuditAction.PAYROLL_RUN_INITIATED,
    ];

    if (criticalActions.includes(action)) {
      return AuditSeverity.CRITICAL;
    } else if (highActions.includes(action)) {
      return AuditSeverity.HIGH;
    } else if (mediumActions.includes(action)) {
      return AuditSeverity.MEDIUM;
    } else {
      return AuditSeverity.LOW;
    }
  }
}

// Export singleton instance
export const auditService = new AuditService();
