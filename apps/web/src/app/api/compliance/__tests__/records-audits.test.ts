// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

// withEnhancedAuth is a passthrough; requirePermission authorizes.
vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
  Resource: { COMPLIANCE: 'compliance' },
  Action: { READ: 'read', CREATE: 'create', UPDATE: 'update', DELETE: 'delete' },
  requirePermission: () => null,
}));

const { complianceRecordEntry, complianceAuditEntry } = vi.hoisted(() => ({
  complianceRecordEntry: {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  complianceAuditEntry: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@aura/database', () => ({
  prisma: { complianceRecordEntry, complianceAuditEntry },
}));

import { GET as RECORDS_GET, POST as RECORDS_POST } from '@/app/api/compliance/records/route';
import { PUT as RECORD_PUT } from '@/app/api/compliance/records/[id]/route';
import { PUT as AUDIT_PUT } from '@/app/api/compliance/audits/[id]/route';

const AUTH = { user: { userId: 'u1', tenantId: 't1' }, permissions: ['compliance:read'] };

function req(url: string, body?: unknown) {
  return { url, json: async () => body } as any;
}

describe('compliance records route (statutory / regulatory backing)', () => {
  beforeEach(() => {
    Object.values(complianceRecordEntry).forEach((f) => (f as any).mockReset());
  });

  it('GET returns the shared list envelope, tenant-scoped', async () => {
    complianceRecordEntry.findMany.mockResolvedValue([{ id: 'r1', requirement: 'PF filing' }]);
    complianceRecordEntry.count.mockResolvedValue(1);
    const res = await (RECORDS_GET as any)(req('http://x/api/compliance/records'), AUTH);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.items).toHaveLength(1);
    expect(json.data).toMatchObject({ total: 1, page: 1, hasNextPage: false });
    expect(complianceRecordEntry.findMany.mock.calls[0][0].where.tenantId).toBe('t1');
  });

  it('POST creates a statutory record with generated code and tenant scope', async () => {
    complianceRecordEntry.create.mockImplementation(async ({ data }: any) => ({
      id: 'r2',
      ...data,
    }));
    const res = await (RECORDS_POST as any)(
      req('http://x/api/compliance/records', {
        requirement: 'ESI return',
        complianceType: 'tax',
        status: 'pending_review',
      }),
      AUTH
    );
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.data.tenantId).toBe('t1');
    expect(json.data.recordCode).toMatch(/^CR-/);
    expect(json.data.requirement).toBe('ESI return');
  });

  it('PUT marks a record compliant', async () => {
    complianceRecordEntry.findFirst.mockResolvedValue({ id: 'r1', tenantId: 't1' });
    complianceRecordEntry.update.mockImplementation(async ({ data }: any) => ({
      id: 'r1',
      ...data,
    }));
    const res = await (RECORD_PUT as any)(
      req('http://x/api/compliance/records/r1', {
        status: 'compliant',
        completedDate: '2026-07-02T00:00:00.000Z',
      }),
      { ...AUTH, params: { id: 'r1' } }
    );
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe('compliant');
    // Route parses the ISO string into a Date; NextResponse serialises it back.
    expect(new Date(json.data.completedDate).toISOString()).toBe('2026-07-02T00:00:00.000Z');
  });
});

describe('compliance audits route (regulatory audit backing)', () => {
  beforeEach(() => {
    Object.values(complianceAuditEntry).forEach((f) => (f as any).mockReset());
  });

  it('PUT marks a regulatory audit complete', async () => {
    complianceAuditEntry.findFirst.mockResolvedValue({ id: 'a1', tenantId: 't1' });
    complianceAuditEntry.update.mockImplementation(async ({ data }: any) => ({
      id: 'a1',
      ...data,
    }));
    const res = await (AUDIT_PUT as any)(
      req('http://x/api/compliance/audits/a1', {
        status: 'completed',
        completionDate: '2026-07-02T00:00:00.000Z',
      }),
      { ...AUTH, params: { id: 'a1' } }
    );
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe('completed');
    expect(new Date(json.data.completionDate).toISOString()).toBe('2026-07-02T00:00:00.000Z');
  });

  it('PUT returns 404 for a cross-tenant audit id', async () => {
    complianceAuditEntry.findFirst.mockResolvedValue(null);
    const res = await (AUDIT_PUT as any)(
      req('http://x/api/compliance/audits/nope', { status: 'completed' }),
      { ...AUTH, params: { id: 'nope' } }
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error?.messageAr ?? json.messageAr).toBeTruthy();
  });
});
