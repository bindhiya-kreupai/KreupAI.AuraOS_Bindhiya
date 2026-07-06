// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const findManyMock = vi.fn();
const countMock = vi.fn();

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
  requirePermission: () => null,
  Resource: { MASTER_DATA: 'MASTER_DATA' },
  Action: { READ: 'READ', CREATE: 'CREATE', UPDATE: 'UPDATE', DELETE: 'DELETE' },
}));

vi.mock('@aura/database', () => ({
  prisma: {
    company: {
      findMany: (...args: any[]) => findManyMock(...args),
      count: (...args: any[]) => countMock(...args),
    },
    auditLog: { create: vi.fn() },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { GET } from '@/app/api/master-data/[entity]/route';

function ctx(tenantId = 't1') {
  return {
    user: { tenantId, userId: 'u1' },
    permissions: ['master-data:read'],
    params: { entity: 'companies' },
  } as any;
}

describe('GET /api/master-data/companies (export + tenant scoping)', () => {
  beforeEach(() => {
    findManyMock.mockReset();
    countMock.mockReset();
  });

  it('scopes the companies list query by tenantId and isDeleted', async () => {
    findManyMock.mockResolvedValue([]);
    countMock.mockResolvedValue(0);
    const req = { url: 'http://x/api/master-data/companies?page=1&limit=20' } as any;

    await GET(req, ctx('tenant-abc'));

    expect(findManyMock).toHaveBeenCalled();
    const where = findManyMock.mock.calls[0][0].where;
    expect(where.tenantId).toBe('tenant-abc');
    expect(where.isDeleted).toBe(false);
  });

  it('returns CSV attachment with header + escaped rows when export=csv', async () => {
    findManyMock.mockResolvedValue([
      {
        code: 'ACME',
        name: 'Acme, Inc.',
        email: 'info@acme.com',
        phoneNumber: '123',
        address: 'Line 1',
        city: 'Dubai',
        state: '',
        postalCode: '00000',
        country: 'UAE',
        industry: 'Tech',
        website: 'https://acme.com',
        taxId: 'TRN-1',
        registrationNumber: 'REG-1',
        status: 'Active',
      },
    ]);
    const req = { url: 'http://x/api/master-data/companies?export=csv' } as any;

    const res = await GET(req, ctx());

    expect(res.headers.get('Content-Type')).toContain('text/csv');
    expect(res.headers.get('Content-Disposition')).toContain('companies-export.csv');
    const text = await res.text();
    const [header, firstRow] = text.split('\n');
    expect(header).toBe(
      'code,name,email,phoneNumber,address,city,state,postalCode,country,industry,website,taxId,registrationNumber,status'
    );
    // Name containing a comma must be quoted
    expect(firstRow).toContain('"Acme, Inc."');
    expect(firstRow.startsWith('ACME,')).toBe(true);
  });
});
