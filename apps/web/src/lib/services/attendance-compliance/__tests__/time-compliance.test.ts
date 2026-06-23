import { describe, it, expect } from 'vitest';
import {
  reduceTimesheetTrail,
  evaluateOvertimeCap,
  detectBiometricFraud,
} from '../time-compliance.service';

describe('EPIC-28-S-MC — reduceTimesheetTrail', () => {
  const SUBMITTED_AT = new Date('2026-06-10T00:00:00Z');
  const APPROVED_AT = new Date('2026-06-12T00:00:00Z');

  it('null on empty trail', () => {
    expect(reduceTimesheetTrail([])).toBeNull();
  });

  it('reduces SUBMITTED trail', () => {
    const r = reduceTimesheetTrail([
      {
        timestamp: SUBMITTED_AT,
        metadata: {
          timesheetId: 't1',
          status: 'SUBMITTED',
          proposedBy: 'u-maker',
          proposedAt: SUBMITTED_AT.toISOString(),
        },
      },
    ])!;
    expect(r.status).toBe('SUBMITTED');
    expect(r.proposedBy).toBe('u-maker');
  });

  it('reduces APPROVED trail with both rows', () => {
    const r = reduceTimesheetTrail([
      {
        timestamp: APPROVED_AT,
        metadata: {
          timesheetId: 't1',
          status: 'APPROVED',
          approvedBy: 'u-checker',
          approvedAt: APPROVED_AT.toISOString(),
        },
      },
      {
        timestamp: SUBMITTED_AT,
        metadata: {
          timesheetId: 't1',
          status: 'SUBMITTED',
          proposedBy: 'u-maker',
          proposedAt: SUBMITTED_AT.toISOString(),
        },
      },
    ])!;
    expect(r.status).toBe('APPROVED');
    expect(r.approvedBy).toBe('u-checker');
    expect(r.proposedBy).toBe('u-maker');
  });

  it('reduces REJECTED with reason', () => {
    const r = reduceTimesheetTrail([
      {
        timestamp: new Date('2026-06-13'),
        metadata: {
          timesheetId: 't1',
          status: 'REJECTED',
          rejectedBy: 'u-checker',
          rejectedAt: new Date('2026-06-13').toISOString(),
          reason: 'Missing punches',
        },
      },
      {
        timestamp: SUBMITTED_AT,
        metadata: { timesheetId: 't1', status: 'SUBMITTED', proposedBy: 'u-maker' },
      },
    ])!;
    expect(r.status).toBe('REJECTED');
    expect(r.rejectionReason).toBe('Missing punches');
  });
});

describe('EPIC-28-S-OT — evaluateOvertimeCap', () => {
  const caps = { weeklySoftHours: 8, weeklyHardHours: 12, monthlyHardHours: 60 };

  it('PASS within caps', () => {
    const v = evaluateOvertimeCap({ weekHours: 6, monthHours: 30 }, caps);
    expect(v.outcome).toBe('PASS');
    expect(v.utilisationWeeklyPct).toBeLessThan(100);
  });

  it('WARN above soft but within hard', () => {
    const v = evaluateOvertimeCap({ weekHours: 10, monthHours: 30 }, caps);
    expect(v.outcome).toBe('WARN');
    expect(v.reasons.some((r) => r.code === 'OT_WEEKLY_SOFT_BREACH')).toBe(true);
  });

  it('FAIL on weekly hard breach', () => {
    const v = evaluateOvertimeCap({ weekHours: 14, monthHours: 30 }, caps);
    expect(v.outcome).toBe('FAIL');
    expect(v.reasons.some((r) => r.code === 'OT_WEEKLY_HARD_BREACH')).toBe(true);
  });

  it('FAIL on monthly hard breach', () => {
    const v = evaluateOvertimeCap({ weekHours: 6, monthHours: 70 }, caps);
    expect(v.outcome).toBe('FAIL');
    expect(v.reasons.some((r) => r.code === 'OT_MONTHLY_HARD_BREACH')).toBe(true);
  });

  it('bilingual reasons populated', () => {
    const v = evaluateOvertimeCap({ weekHours: 14, monthHours: 70 }, caps);
    for (const r of v.reasons) {
      expect(r.en.length).toBeGreaterThan(0);
      expect(r.ar.length).toBeGreaterThan(0);
    }
  });
});

describe('EPIC-28-S-FRAUD — detectBiometricFraud', () => {
  it('PASS with normal punches', () => {
    const v = detectBiometricFraud([
      {
        punchId: 'p1',
        employeeId: 'e1',
        capturedAt: new Date('2026-06-01T08:00:00Z'),
        lat: 25.27,
        lng: 55.3,
        deviceId: 'd1',
        matchConfidence: 0.92,
      },
      {
        punchId: 'p2',
        employeeId: 'e1',
        capturedAt: new Date('2026-06-01T17:00:00Z'),
        lat: 25.27,
        lng: 55.3,
        deviceId: 'd1',
        matchConfidence: 0.93,
      },
    ]);
    expect(v.outcome).toBe('PASS');
  });

  it('FAIL on impossible travel', () => {
    const v = detectBiometricFraud([
      {
        punchId: 'p1',
        employeeId: 'e1',
        capturedAt: new Date('2026-06-01T08:00:00Z'),
        lat: 25.27,
        lng: 55.3,
        deviceId: 'd1',
        matchConfidence: 0.9,
      },
      {
        punchId: 'p2',
        employeeId: 'e1',
        capturedAt: new Date('2026-06-01T08:30:00Z'),
        lat: 24.71, // Riyadh-ish, ~870km from Dubai
        lng: 46.67,
        deviceId: 'd2',
        matchConfidence: 0.9,
      },
    ]);
    expect(v.outcome).toBe('FAIL');
    expect(v.flags.some((f) => f.code === 'IMPOSSIBLE_TRAVEL')).toBe(true);
  });

  it('FAIL on identical-second on same device across employees', () => {
    const at = new Date('2026-06-01T08:00:00Z');
    const v = detectBiometricFraud([
      { punchId: 'p1', employeeId: 'e1', capturedAt: at, deviceId: 'd1', matchConfidence: 0.9 },
      { punchId: 'p2', employeeId: 'e2', capturedAt: at, deviceId: 'd1', matchConfidence: 0.9 },
    ]);
    expect(v.outcome).toBe('FAIL');
    expect(v.flags.some((f) => f.code === 'IDENTICAL_SECOND')).toBe(true);
  });

  it('WARN on low match confidence', () => {
    const v = detectBiometricFraud([
      {
        punchId: 'p1',
        employeeId: 'e1',
        capturedAt: new Date('2026-06-01T08:00:00Z'),
        deviceId: 'd1',
        matchConfidence: 0.4,
      },
    ]);
    expect(v.outcome).toBe('WARN');
    expect(v.flags.some((f) => f.code === 'LOW_CONFIDENCE')).toBe(true);
  });

  it('detects cluster-punch across multiple devices', () => {
    const base = Date.UTC(2026, 5, 1, 8, 0, 0);
    const v = detectBiometricFraud([
      {
        punchId: 'p1',
        employeeId: 'e1',
        capturedAt: new Date(base),
        deviceId: 'd1',
        matchConfidence: 0.9,
      },
      {
        punchId: 'p2',
        employeeId: 'e1',
        capturedAt: new Date(base + 10000),
        deviceId: 'd2',
        matchConfidence: 0.9,
      },
      {
        punchId: 'p3',
        employeeId: 'e1',
        capturedAt: new Date(base + 30000),
        deviceId: 'd3',
        matchConfidence: 0.9,
      },
    ]);
    expect(v.flags.some((f) => f.code === 'CLUSTER_PUNCH')).toBe(true);
  });
});
