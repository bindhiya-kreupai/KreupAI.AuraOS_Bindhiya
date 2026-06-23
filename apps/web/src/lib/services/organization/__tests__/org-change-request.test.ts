import { describe, it, expect } from 'vitest';
import { reduceAuditTrailToRecord, type OrgChangeRecord } from '../org-change-request.service';

const PROPOSED_AT = new Date('2026-06-17T10:00:00Z');
const APPROVED_AT = new Date('2026-06-17T11:00:00Z');
const REJECTED_AT = new Date('2026-06-17T11:30:00Z');

function proposeRow(overrides: Partial<Record<string, unknown>> = {}): {
  timestamp: Date;
  metadata: Record<string, unknown>;
} {
  return {
    timestamp: PROPOSED_AT,
    metadata: {
      requestId: 'req-1',
      entity: 'department',
      operation: 'UPDATE',
      payload: { targetId: 'dep-1', data: { name: 'Engineering Bahrain' } },
      status: 'PENDING',
      proposedBy: 'user-maker',
      proposedAt: PROPOSED_AT.toISOString(),
      justification: 'Rename due to entity move',
      ...overrides,
    },
  };
}

describe('reduceAuditTrailToRecord — EPIC-09-S12 maker-checker', () => {
  it('returns null when no rows', () => {
    expect(reduceAuditTrailToRecord([])).toBeNull();
  });

  it('reduces a single PENDING propose row', () => {
    const rec = reduceAuditTrailToRecord([proposeRow()])!;
    expect(rec.status).toBe('PENDING');
    expect(rec.requestId).toBe('req-1');
    expect(rec.proposedBy).toBe('user-maker');
    expect(rec.entity).toBe('department');
    expect(rec.operation).toBe('UPDATE');
    expect(rec.justification).toBe('Rename due to entity move');
  });

  it('reduces an APPROVED trail (head is approve, tail is propose)', () => {
    const rec = reduceAuditTrailToRecord([
      {
        timestamp: APPROVED_AT,
        metadata: {
          requestId: 'req-1',
          status: 'APPROVED',
          approvedBy: 'user-checker',
          approvedAt: APPROVED_AT.toISOString(),
        },
      },
      proposeRow(),
    ])!;
    expect(rec.status).toBe('APPROVED');
    expect(rec.approvedBy).toBe('user-checker');
    expect(rec.approvedAt?.toISOString()).toBe(APPROVED_AT.toISOString());
    // Immutable propose fields survive.
    expect(rec.proposedBy).toBe('user-maker');
    expect(rec.entity).toBe('department');
  });

  it('reduces a REJECTED trail with reason', () => {
    const rec = reduceAuditTrailToRecord([
      {
        timestamp: REJECTED_AT,
        metadata: {
          requestId: 'req-1',
          status: 'REJECTED',
          rejectedBy: 'user-checker',
          rejectedAt: REJECTED_AT.toISOString(),
          reason: 'Pending compliance review',
        },
      },
      proposeRow(),
    ])!;
    expect(rec.status).toBe('REJECTED');
    expect(rec.rejectedBy).toBe('user-checker');
    expect(rec.rejectionReason).toBe('Pending compliance review');
  });

  it('honours the head as the authoritative status (most recent wins)', () => {
    // Imagine a malformed trail with status: PENDING re-appended after APPROVED.
    // The head row dictates status — APPROVED here.
    const rec = reduceAuditTrailToRecord([
      {
        timestamp: APPROVED_AT,
        metadata: {
          requestId: 'req-1',
          status: 'APPROVED',
          approvedBy: 'user-checker',
          approvedAt: APPROVED_AT.toISOString(),
        },
      },
      proposeRow({ status: 'PENDING' }),
    ])!;
    expect(rec.status).toBe('APPROVED');
  });

  it('preserves payload through reduction', () => {
    const rec = reduceAuditTrailToRecord([proposeRow()])!;
    expect(rec.payload.targetId).toBe('dep-1');
    expect((rec.payload.data as any).name).toBe('Engineering Bahrain');
  });
});
