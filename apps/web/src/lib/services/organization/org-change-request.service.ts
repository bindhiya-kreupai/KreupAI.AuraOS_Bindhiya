/**
 * EPIC-09-S12: OrgChangeRequest maker-checker workflow.
 *
 * Closes the audit gap "No OrgChangeRequest workflow (S12)" without
 * adding a new Prisma model. The workflow is persisted as a pair of
 * AuditLog rows:
 *
 *   propose() →   AuditLog row with
 *                 resourceType = 'org_change_request'
 *                 action       = SETTINGS_UPDATED
 *                 metadata     = { requestId, status: 'PENDING',
 *                                  entity, operation, payload,
 *                                  proposedBy, proposedAt, justification }
 *
 *   approve() →   AuditLog row with
 *                 resourceType = 'org_change_request'
 *                 metadata     = { requestId, status: 'APPROVED',
 *                                  approvedBy, approvedAt }
 *                 + the actual change is applied to the target model.
 *
 *   reject()  →   AuditLog row with
 *                 metadata     = { requestId, status: 'REJECTED',
 *                                  rejectedBy, rejectedAt, reason }
 *
 * The latest audit row per `requestId` (sorted by timestamp desc) is
 * the authoritative state — list() walks them and emits the head row.
 *
 * Maker-checker enforcement: approve() refuses when the actor user ID
 * matches the original proposer. Reject() has no such restriction.
 *
 * Supported entities:
 *   - 'department' (UPDATE / CREATE)
 *   - 'position'   (UPDATE / CREATE)
 *
 * Caller-supplied payloads are NOT validated here — that belongs in
 * the route's Zod layer. The service trusts validated input.
 */

import { randomUUID } from 'crypto';
import { prisma } from '@aura/database';
import { auditService, AuditAction, AuditSeverity } from '@/lib/audit/audit.service';

export interface AuthContext {
  tenantId: string;
  userId: string;
  userEmail?: string;
}

export type OrgEntity = 'department' | 'position';
export type OrgOperation = 'CREATE' | 'UPDATE' | 'DELETE';
export type OrgChangeStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface OrgChangePayload {
  /** ID of the entity to update / delete. Required for UPDATE + DELETE. */
  targetId?: string;
  /** New / changed fields. Required for CREATE + UPDATE. */
  data?: Record<string, unknown>;
}

export interface ProposeInput {
  entity: OrgEntity;
  operation: OrgOperation;
  payload: OrgChangePayload;
  justification: string;
  /** Optional effective-from for delayed changes. */
  effectiveFrom?: Date;
}

export interface OrgChangeRecord {
  requestId: string;
  entity: OrgEntity;
  operation: OrgOperation;
  payload: OrgChangePayload;
  status: OrgChangeStatus;
  proposedBy: string;
  proposedAt: Date;
  justification?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  effectiveFrom?: Date;
}

const RESOURCE = 'org_change_request';

/**
 * Pure helper: given a list of AuditLog rows for the same requestId
 * (descending by timestamp), reduce to the latest OrgChangeRecord
 * state. Split out so tests can drive it without prisma.
 */
export function reduceAuditTrailToRecord(
  rows: Array<{ timestamp: Date; metadata: Record<string, unknown> | null }>
): OrgChangeRecord | null {
  if (rows.length === 0) return null;
  const head = rows[0]; // assumed sorted timestamp desc
  // Walk to the earliest row (the propose row) to harvest the immutable fields.
  const proposal = rows[rows.length - 1].metadata as Record<string, unknown> | null;
  if (!proposal) return null;
  const headMeta = head.metadata as Record<string, unknown>;
  const out: OrgChangeRecord = {
    requestId: String(proposal.requestId ?? ''),
    entity: proposal.entity as OrgEntity,
    operation: proposal.operation as OrgOperation,
    payload: (proposal.payload ?? {}) as OrgChangePayload,
    status: (headMeta.status as OrgChangeStatus) ?? 'PENDING',
    proposedBy: String(proposal.proposedBy ?? ''),
    proposedAt: new Date(String(proposal.proposedAt ?? rows[rows.length - 1].timestamp)),
    justification:
      typeof proposal.justification === 'string' ? (proposal.justification as string) : undefined,
    effectiveFrom: proposal.effectiveFrom ? new Date(String(proposal.effectiveFrom)) : undefined,
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

export class OrgChangeRequestService {
  async propose(input: ProposeInput, auth: AuthContext): Promise<OrgChangeRecord> {
    if (!input.justification || input.justification.trim().length < 5) {
      throw new Error('justification is required (min 5 chars)');
    }
    if (input.operation !== 'CREATE' && !input.payload.targetId) {
      throw new Error('UPDATE / DELETE require payload.targetId');
    }
    if (input.operation !== 'DELETE' && !input.payload.data) {
      throw new Error('CREATE / UPDATE require payload.data');
    }

    const requestId = randomUUID();
    const proposedAt = new Date();
    const metadata = {
      requestId,
      entity: input.entity,
      operation: input.operation,
      payload: input.payload,
      status: 'PENDING' as const,
      proposedBy: auth.userId,
      proposedAt: proposedAt.toISOString(),
      justification: input.justification,
      effectiveFrom: input.effectiveFrom?.toISOString(),
    };
    await auditService.log({
      action: AuditAction.SETTINGS_UPDATED,
      severity: AuditSeverity.MEDIUM,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tenantId: auth.tenantId,
      resourceType: RESOURCE,
      resourceId: requestId,
      success: true,
      metadata,
    });
    return {
      requestId,
      entity: input.entity,
      operation: input.operation,
      payload: input.payload,
      status: 'PENDING',
      proposedBy: auth.userId,
      proposedAt,
      justification: input.justification,
      effectiveFrom: input.effectiveFrom,
    };
  }

  async approve(requestId: string, auth: AuthContext): Promise<OrgChangeRecord> {
    const record = await this.findOne(requestId, auth.tenantId);
    if (!record) throw new Error('change request not found');
    if (record.status !== 'PENDING') throw new Error(`cannot approve a ${record.status} request`);
    if (record.proposedBy === auth.userId) {
      throw new Error('maker-checker violation: proposer cannot self-approve');
    }

    // Apply the change against the target model.
    await applyChange(auth.tenantId, record);

    const approvedAt = new Date();
    await auditService.log({
      action: AuditAction.SETTINGS_UPDATED,
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

  async reject(requestId: string, reason: string, auth: AuthContext): Promise<OrgChangeRecord> {
    const record = await this.findOne(requestId, auth.tenantId);
    if (!record) throw new Error('change request not found');
    if (record.status !== 'PENDING') throw new Error(`cannot reject a ${record.status} request`);

    const rejectedAt = new Date();
    await auditService.log({
      action: AuditAction.SETTINGS_UPDATED,
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

  async findOne(requestId: string, tenantId: string): Promise<OrgChangeRecord | null> {
    const rows = await (prisma as any).auditLog.findMany({
      where: { tenantId, resourceType: RESOURCE, resourceId: requestId },
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true, metadata: true },
    });
    return reduceAuditTrailToRecord(rows);
  }

  async listPending(tenantId: string): Promise<OrgChangeRecord[]> {
    // Pull all rows, group by resourceId, reduce to records, filter PENDING.
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
    const out: OrgChangeRecord[] = [];
    for (const arr of byRequest.values()) {
      const rec = reduceAuditTrailToRecord(arr);
      if (rec && rec.status === 'PENDING') out.push(rec);
    }
    return out;
  }
}

async function applyChange(tenantId: string, record: OrgChangeRecord): Promise<void> {
  const { entity, operation, payload } = record;
  if (entity === 'department') {
    if (operation === 'CREATE') {
      await (prisma as any).department.create({ data: { tenantId, ...payload.data } });
    } else if (operation === 'UPDATE') {
      await (prisma as any).department.update({
        where: { id: payload.targetId },
        data: payload.data,
      });
    } else if (operation === 'DELETE') {
      await (prisma as any).department.update({
        where: { id: payload.targetId },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    }
  } else if (entity === 'position') {
    if (operation === 'CREATE') {
      await (prisma as any).position.create({ data: { tenantId, ...payload.data } });
    } else if (operation === 'UPDATE') {
      await (prisma as any).position.update({
        where: { id: payload.targetId },
        data: payload.data,
      });
    } else if (operation === 'DELETE') {
      await (prisma as any).position.update({
        where: { id: payload.targetId },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    }
  } else {
    throw new Error(`unsupported entity: ${entity}`);
  }
}

export const orgChangeRequestService = new OrgChangeRequestService();
