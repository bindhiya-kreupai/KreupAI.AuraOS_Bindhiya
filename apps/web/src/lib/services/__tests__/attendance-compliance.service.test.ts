import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  attendancePolicyService,
  attendanceFraudService,
  attendanceConsentService,
  attendanceCertificateService,
  evaluateAttendanceFraud,
  ATTENDANCE_CONSTANTS,
} from '../attendance-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.attendancePolicy = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'p-1', ...data })),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'p-1', ...create })),
  };
  m.attendanceFraudFlag = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'f-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'f-1', ...data })),
  };
  m.attendanceConsent = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'c-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'c-1', ...data })),
  };
  m.attendanceCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
  m.attendancePunch = { count: vi.fn().mockResolvedValue(0) };
  m.attendanceRecord = { count: vi.fn().mockResolvedValue(0) };
  m.attendanceRegularization = { count: vi.fn().mockResolvedValue(0) };
});

describe('evaluateAttendanceFraud', () => {
  it('flags BUDDY_PUNCH on identical-second punches', () => {
    const r = evaluateAttendanceFraud({ identicalPunchSecond: true });
    expect(r.flags).toContain('BUDDY_PUNCH');
    expect(r.score).toBeGreaterThanOrEqual(50);
  });
  it('flags GEO_MISMATCH when distance exceeds radius', () => {
    const r = evaluateAttendanceFraud({ geoDistanceM: 500, geofenceRadiusM: 200 });
    expect(r.flags).toContain('GEO_MISMATCH');
  });
  it('flags TIME_DRIFT on >5 min clock skew', () => {
    const r = evaluateAttendanceFraud({ clockDriftSeconds: 600 });
    expect(r.flags).toContain('TIME_DRIFT');
  });
  it('flags GHOST_PRESENCE when no biometric', () => {
    const r = evaluateAttendanceFraud({ noBiometric: true });
    expect(r.flags).toContain('GHOST_PRESENCE');
  });
  it('returns zero score for clean signals', () => {
    const r = evaluateAttendanceFraud({});
    expect(r.score).toBe(0);
    expect(r.flags).toEqual([]);
  });
});

describe('attendancePolicyService.seedDefaults', () => {
  it('seeds all GCC country policies', async () => {
    const r = await attendancePolicyService.seedDefaults(auth);
    expect(r.created.length).toBe(ATTENDANCE_CONSTANTS.DEFAULT_POLICIES.length);
  });
});

describe('attendanceFraudService.raise', () => {
  it('derives severity from score', async () => {
    await attendanceFraudService.raise(
      {
        employeeId: 'e-1',
        punchDate: new Date(),
        flagType: 'BUDDY_PUNCH',
        score: 75,
      },
      auth
    );
    const call = m.attendanceFraudFlag.create.mock.calls[0][0];
    expect(call.data.severity).toBe('CRITICAL');
    expect(call.data.score).toBe(75);
  });
  it('computes score from signals when no explicit score', async () => {
    await attendanceFraudService.raise(
      {
        employeeId: 'e-1',
        punchDate: new Date(),
        flagType: 'GEO_MISMATCH',
        signals: { geoDistanceM: 800, geofenceRadiusM: 200 },
      },
      auth
    );
    const call = m.attendanceFraudFlag.create.mock.calls[0][0];
    expect(call.data.score).toBe(35);
  });
});

describe('attendanceConsentService', () => {
  it('grants consent with timestamp', async () => {
    await attendanceConsentService.grant('e-1', 'BIOMETRIC', undefined, auth);
    const call = m.attendanceConsent.upsert.mock.calls[0][0];
    expect(call.create.grantedAt).toBeInstanceOf(Date);
    expect(call.create.consentType).toBe('BIOMETRIC');
  });
  it('revokes consent with timestamp', async () => {
    await attendanceConsentService.revoke('e-1', 'BIOMETRIC', auth);
    const call = m.attendanceConsent.update.mock.calls[0][0];
    expect(call.data.revokedAt).toBeInstanceOf(Date);
  });
});

describe('attendanceCertificateService', () => {
  it('gates when fraud flags open', async () => {
    m.attendanceFraudFlag.count = vi.fn().mockResolvedValue(2);
    const cert = await attendanceCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/open fraud flag/);
  });
  it('gates when consents missing', async () => {
    m.attendanceConsent.count = vi.fn().mockResolvedValue(1);
    const cert = await attendanceCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/missing consent/);
  });
  it('refuses to sign while gated', async () => {
    m.attendanceCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'Blocked: 1 open fraud flag(s)' });
    await expect(attendanceCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign while gated/
    );
  });
});
