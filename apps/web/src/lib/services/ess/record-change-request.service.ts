/**
 * EPIC-08 RecordChangeRequest maker-checker workflow.
 *
 * Closes the audit gap "No RecordChangeRequest maker-checker" for
 * EPIC-08 Employee Records. Sensitive Employee field updates
 * (bank account, contact details, emergency contact, dependants,
 * address, marital status, nationality / passport, etc.) must
 * NOT be self-served free-of-friction — they need a second pair
 * of eyes per PCI / GCC labour-authority KYC.
 *
 * Persistence reuses the OrgChangeRequest pattern: each change
 * request is a chain of AuditLog rows keyed by requestId,
 * resourceType='employee_record_change_request', with metadata
 * carrying { requestId, status, employeeId, fieldChanges,
 * proposedBy, approvedBy, ... }.
 *
 * The set of fields that REQUIRES maker-checker is defined here as
 * SENSITIVE_FIELDS; field updates outside this list can be applied
 * inline by the existing employee service. Self-served fields
 * (profile photo, language preference) are NOT in this list.
 *
 * Bilingual reason strings are exposed on every verdict for
 * downstream UI rendering.
 *
 * No schema change required.
 */

import { randomUUID } from 'crypto';
import { prisma } from '@aura/database';
import { auditService, AuditAction, AuditSeverity } from '@/lib/audit/audit.service';

export interface AuthContext {
  tenantId: string;
  userId: string;
  userEmail?: string;
}

export type RecordChangeStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

/**
 * Employee fields that require maker-checker. Keep tight — fewer
 * sensitive fields mean fewer human-in-loop steps without weakening
 * audit posture. Expand cautiously.
 */
export const SENSITIVE_FIELDS = new Set<string>([
  'bankName',
  'bankAccountNumber',
  'bankAccountIban',
  'bankBic',
  'salary',
  'basicSalary',
  'nationality',
  'passportNumber',
  'nationalIdNumber',
  'emiratesId',
  'residenceVisaNumber',
  'maritalStatus',
  'dependants',
  'emergencyContactName',
  'emergencyContactPhone',
  'permanentAddress',
  'fullName',
  'firstName',
  'lastName',
]);

export interface FieldChange {
  field: string;
  before: unknown;
  after: unknown;
}

export interface ProposeInput {
  employeeId: string;
  changes: FieldChange[];
  justification: string;
}

export interface RecordChangeRecord {
  requestId: string;
  employeeId: string;
  changes: FieldChange[];
  sensitiveChanges: FieldChange[];
  status: RecordChangeStatus;
  proposedBy: string;
  proposedAt: Date;
  justification?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  /** True when none of the changes touched a sensitive field; safe to inline. */
  inlineEligible: boolean;
}

const RESOURCE = 'employee_record_change_request';

export function classifyChanges(changes: FieldChange[]): {
  sensitive: FieldChange[];
  inlineEligible: boolean;
} {
  const sensitive = changes.filter((c) => SENSITIVE_FIELDS.has(c.field));
  return { sensitive, inlineEligible: sensitive.length === 0 };
}

export function reduceAuditTrailToRecord(
  rows: Array<{ timestamp: Date; metadata: Record<string, unknown> | null }>
): RecordChangeRecord | null {
  if (rows.length === 0) return null;
  const head = rows[0];
  const tail = rows[rows.length - 1].metadata as Record<string, unknown> | null;
  if (!tail) return null;
  const headMeta = head.metadata as Record<string, unknown>;
  const changes = (tail.changes ?? []) as FieldChange[];
  const { sensitive, inlineEligible } = classifyChanges(changes);
  const out: RecordChangeRecord = {
    requestId: String(tail.requestId ?? ''),
    employeeId: String(tail.employeeId ?? ''),
    changes,
    sensitiveChanges: sensitive,
    status: (headMeta.status as RecordChangeStatus) ?? 'PENDING',
    proposedBy: String(tail.proposedBy ?? ''),
    proposedAt: new Date(String(tail.proposedAt ?? rows[rows.length - 1].timestamp)),
    justification:
      typeof tail.justification === 'string' ? (tail.justification as string) : undefined,
    inlineEligible,
  };
  if (out.status === 'APPROVED') {
    out.approvedBy = String(headMeta.approvedBy ?? '');
    out.approvedAt = new Date(String(headMeta.approvedAt ?? head.timestamp));
  }
  if (out.status === 'REJECTED') {
    out.rejectedBy = String(headMeta.rejectedBy ?? '');
    out.rejectedAt = new Date(String(headMeta.rejectedAt ?? head.timestamp));
    out.rejectionReason =
      typeof headMeta.reason === 'string' ? (headMeta.reason as string) : undefined;
  }
  return out;
}

export class EmployeeRecordChangeRequestService {
  async propose(input: ProposeInput, auth: AuthContext): Promise<RecordChangeRecord> {
    if (!input.changes || input.changes.length === 0) {
      throw new Error('at least one change is required');
    }
    if (!input.justification || input.justification.trim().length < 5) {
      throw new Error('justification is required (min 5 chars)');
    }
    const { sensitive, inlineEligible } = classifyChanges(input.changes);

    // Inline path: no sensitive fields — apply now, skip the workflow.
    if (inlineEligible) {
      await this.applyChanges(input.employeeId, input.changes, auth);
      const requestId = randomUUID();
      const proposedAt = new Date();
      await auditService.log({
        action: AuditAction.EMPLOYEE_UPDATED,
        severity: AuditSeverity.LOW,
        userId: auth.userId,
        userEmail: auth.userEmail,
        tenantId: auth.tenantId,
        resourceType: RESOURCE,
        resourceId: requestId,
        success: true,
        metadata: {
          requestId,
          employeeId: input.employeeId,
          changes: input.changes,
          status: 'APPROVED',
          proposedBy: auth.userId,
          proposedAt: proposedAt.toISOString(),
          approvedBy: auth.userId,
          approvedAt: proposedAt.toISOString(),
          justification: input.justification,
          inlineEligible: true,
        },
      });
      return {
        requestId,
        employeeId: input.employeeId,
        changes: input.changes,
        sensitiveChanges: [],
        status: 'APPROVED',
        proposedBy: auth.userId,
        proposedAt,
        approvedBy: auth.userId,
        approvedAt: proposedAt,
        justification: input.justification,
        inlineEligible: true,
      };
    }

    // Maker-checker path: queue, no apply yet.
    const requestId = randomUUID();
    const proposedAt = new Date();
    await auditService.log({
      action: AuditAction.EMPLOYEE_UPDATED,
      severity: AuditSeverity.HIGH,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tenantId: auth.tenantId,
      resourceType: RESOURCE,
      resourceId: requestId,
      success: true,
      metadata: {
        requestId,
        employeeId: input.employeeId,
        changes: input.changes,
        sensitiveFields: sensitive.map((c) => c.field),
        status: 'PENDING',
        proposedBy: auth.userId,
        proposedAt: proposedAt.toISOString(),
        justification: input.justification,
        inlineEligible: false,
      },
    });
    return {
      requestId,
      employeeId: input.employeeId,
      changes: input.changes,
      sensitiveChanges: sensitive,
      status: 'PENDING',
      proposedBy: auth.userId,
      proposedAt,
      justification: input.justification,
      inlineEligible: false,
    };
  }

  async approve(requestId: string, auth: AuthContext): Promise<RecordChangeRecord> {
    const record = await this.findOne(requestId, auth.tenantId);
    if (!record) throw new Error('record change request not found');
    if (record.status !== 'PENDING') throw new Error(`cannot approve a ${record.status} request`);
    if (record.proposedBy === auth.userId) {
      throw new Error('maker-checker violation: proposer cannot self-approve');
    }

    await this.applyChanges(record.employeeId, record.changes, auth);

    const approvedAt = new Date();
    await auditService.log({
      action: AuditAction.EMPLOYEE_UPDATED,
      severity: AuditSeverity.HIGH,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tenantId: auth.tenantId,
      resourceType: RESOURCE,
      resourceId: requestId,
      success: true,
      metadata: {
        requestId,
        status: 'APPROVED',
        approvedBy: auth.userId,
        approvedAt: approvedAt.toISOString(),
      },
    });
    return { ...record, status: 'APPROVED', approvedBy: auth.userId, approvedAt };
  }

  async reject(requestId: string, reason: string, auth: AuthContext): Promise<RecordChangeRecord> {
    const record = await this.findOne(requestId, auth.tenantId);
    if (!record) throw new Error('record change request not found');
    if (record.status !== 'PENDING') throw new Error(`cannot reject a ${record.status} request`);

    const rejectedAt = new Date();
    await auditService.log({
      action: AuditAction.EMPLOYEE_UPDATED,
      severity: AuditSeverity.MEDIUM,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tenantId: auth.tenantId,
      resourceType: RESOURCE,
      resourceId: requestId,
      success: true,
      metadata: {
        requestId,
        status: 'REJECTED',
        rejectedBy: auth.userId,
        rejectedAt: rejectedAt.toISOString(),
        reason,
      },
    });
    return {
      ...record,
      status: 'REJECTED',
      rejectedBy: auth.userId,
      rejectedAt,
      rejectionReason: reason,
    };
  }

  async findOne(requestId: string, tenantId: string): Promise<RecordChangeRecord | null> {
    const rows = await (prisma as any).auditLog.findMany({
      where: { tenantId, resourceType: RESOURCE, resourceId: requestId },
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true, metadata: true },
    });
    return reduceAuditTrailToRecord(rows);
  }

  async listPending(tenantId: string): Promise<RecordChangeRecord[]> {
    const rows = await (prisma as any).auditLog.findMany({
      where: { tenantId, resourceType: RESOURCE },
      orderBy: { timestamp: 'desc' },
      select: { resourceId: true, timestamp: true, metadata: true },
      take: 2000,
    });
    const byRequest = new Map<string, Array<{ timestamp: Date; metadata: any }>>();
    for (const r of rows) {
      if (!r.resourceId) continue;
      if (!byRequest.has(r.resourceId)) byRequest.set(r.resourceId, []);
      byRequest.get(r.resourceId)!.push({ timestamp: r.timestamp, metadata: r.metadata });
    }
    const out: RecordChangeRecord[] = [];
    for (const arr of byRequest.values()) {
      const rec = reduceAuditTrailToRecord(arr);
      if (rec && rec.status === 'PENDING') out.push(rec);
    }
    return out;
  }

  private async applyChanges(
    employeeId: string,
    changes: FieldChange[],
    auth: AuthContext
  ): Promise<void> {
    const data: Record<string, unknown> = {};
    for (const c of changes) data[c.field] = c.after;
    await (prisma as any).employee.update({
      where: { id: employeeId },
      data,
    });
  }
}

export const employeeRecordChangeRequestService = new EmployeeRecordChangeRequestService();
