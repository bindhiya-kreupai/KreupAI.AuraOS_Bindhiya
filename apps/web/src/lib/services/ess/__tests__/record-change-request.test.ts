import { describe, it, expect } from 'vitest';
import {
  classifyChanges,
  reduceAuditTrailToRecord,
  SENSITIVE_FIELDS,
} from '../record-change-request.service';

describe('classifyChanges — EPIC-08 sensitivity routing', () => {
  it('marks bank fields as sensitive', () => {
    const r = classifyChanges([
      { field: 'bankAccountIban', before: null, after: 'AE07 0331 2345 6789 0123 456' },
    ]);
    expect(r.sensitive).toHaveLength(1);
    expect(r.inlineEligible).toBe(false);
  });

  it('marks salary fields as sensitive', () => {
    const r = classifyChanges([{ field: 'basicSalary', before: 8000, after: 9000 }]);
    expect(r.inlineEligible).toBe(false);
  });

  it('inline-eligible for non-sensitive fields (profile photo, language)', () => {
    const r = classifyChanges([
      { field: 'profilePhotoUrl', before: 'a.jpg', after: 'b.jpg' },
      { field: 'preferredLanguage', before: 'en', after: 'ar' },
    ]);
    expect(r.sensitive).toEqual([]);
    expect(r.inlineEligible).toBe(true);
  });

  it('mixed batch routes to maker-checker', () => {
    const r = classifyChanges([
      { field: 'profilePhotoUrl', before: 'a.jpg', after: 'b.jpg' },
      { field: 'permanentAddress', before: 'A', after: 'B' },
    ]);
    expect(r.sensitive.map((c) => c.field)).toEqual(['permanentAddress']);
    expect(r.inlineEligible).toBe(false);
  });

  it('SENSITIVE_FIELDS list contains the documented set', () => {
    for (const f of [
      'bankAccountNumber',
      'salary',
      'nationality',
      'passportNumber',
      'emergencyContactName',
      'fullName',
    ]) {
      expect(SENSITIVE_FIELDS.has(f)).toBe(true);
    }
  });
});

const PROPOSED_AT = new Date('2026-06-17T10:00:00Z');
const APPROVED_AT = new Date('2026-06-17T11:00:00Z');

describe('reduceAuditTrailToRecord — EPIC-08 maker-checker', () => {
  it('reduces a PENDING propose row', () => {
    const rec = reduceAuditTrailToRecord([
      {
        timestamp: PROPOSED_AT,
        metadata: {
          requestId: 'req-1',
          employeeId: 'emp-1',
          changes: [{ field: 'bankAccountIban', before: null, after: 'X' }],
          status: 'PENDING',
          proposedBy: 'user-maker',
          proposedAt: PROPOSED_AT.toISOString(),
          justification: 'Bank account change',
        },
      },
    ])!;
    expect(rec.status).toBe('PENDING');
    expect(rec.sensitiveChanges).toHaveLength(1);
    expect(rec.inlineEligible).toBe(false);
  });

  it('reduces an APPROVED trail', () => {
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
      {
        timestamp: PROPOSED_AT,
        metadata: {
          requestId: 'req-1',
          employeeId: 'emp-1',
          changes: [{ field: 'salary', before: 9000, after: 9500 }],
          status: 'PENDING',
          proposedBy: 'user-maker',
          proposedAt: PROPOSED_AT.toISOString(),
          justification: 'Annual increase',
        },
      },
    ])!;
    expect(rec.status).toBe('APPROVED');
    expect(rec.approvedBy).toBe('user-checker');
    expect(rec.proposedBy).toBe('user-maker');
  });

  it('returns null for an empty trail', () => {
    expect(reduceAuditTrailToRecord([])).toBeNull();
  });
});
