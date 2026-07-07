// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

// requirePermission returns null (authorized) in these tests; withEnhancedAuth
// is a passthrough so we can invoke the handler with a synthetic context.
vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
  Resource: { COMPLIANCE: 'compliance' },
  Action: { READ: 'read', CREATE: 'create', UPDATE: 'update', DELETE: 'delete' },
  requirePermission: () => null,
}));

const { laborLawEntry } = vi.hoisted(() => ({
  laborLawEntry: {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@aura/database', () => ({
  prisma: { laborLawEntry },
}));

import { GET, POST } from '@/app/api/compliance/labor-laws/route';
import { listShape, genCode, parsePaging } from '@/app/api/compliance/_shared/route-helpers';

const AUTH = { user: { userId: 'u1', tenantId: 't1' }, permissions: ['compliance:read'] };

function req(url: string, body?: unknown) {
  return {
    url,
    json: async () => body,
  } as any;
}

describe('compliance route-helpers', () => {
  it('listShape produces the shared list envelope', () => {
    const shape = listShape([1, 2], 5, 1, 2);
    expect(shape).toEqual({ items: [1, 2], total: 5, page: 1, pageSize: 2, hasNextPage: true });
    expect(listShape([1], 1, 1, 50).hasNextPage).toBe(false);
  });

  it('parsePaging clamps page/pageSize', () => {
    expect(parsePaging('http://x?page=3&pageSize=10')).toEqual({ page: 3, pageSize: 10, skip: 20 });
    expect(parsePaging('http://x?page=0&pageSize=9999').pageSize).toBe(200);
    expect(parsePaging('http://x').page).toBe(1);
  });

  it('genCode prefixes and includes the year', () => {
    const code = genCode('LAW');
    expect(code.startsWith(`LAW-${new Date().getFullYear()}-`)).toBe(true);
  });
});

describe('GET /api/compliance/labor-laws', () => {
  beforeEach(() => {
    laborLawEntry.findMany.mockReset();
    laborLawEntry.count.mockReset();
  });

  it('returns a tenant-scoped list envelope', async () => {
    laborLawEntry.findMany.mockResolvedValue([{ id: 'l1', lawName: 'FLSA' }]);
    laborLawEntry.count.mockResolvedValue(1);

    const res = await GET(req('http://x/api/compliance/labor-laws?page=1&pageSize=50'), AUTH);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.items).toHaveLength(1);
    expect(json.data.total).toBe(1);
    // tenant scoping enforced
    expect(laborLawEntry.findMany.mock.calls[0][0].where).toEqual({ tenantId: 't1' });
  });
});

describe('POST /api/compliance/labor-laws', () => {
  beforeEach(() => laborLawEntry.create.mockReset());

  it('creates a labor law scoped to the auth tenant with a generated code', async () => {
    laborLawEntry.create.mockImplementation(async (args?: any) => ({
      id: 'new',
      ...(args?.data ?? {}),
    }));

    const res = await POST(
      req('http://x/api/compliance/labor-laws', { lawName: 'OSHA', riskLevel: 'high' }),
      AUTH
    );

    expect(res.status).toBe(201);
    // Assert on the persisted payload — tenant scoping + generated code.
    const persisted = laborLawEntry.create.mock.calls[0][0].data;
    expect(persisted.tenantId).toBe('t1');
    expect(persisted.createdBy).toBe('u1');
    expect(persisted.lawName).toBe('OSHA');
    expect(persisted.riskLevel).toBe('high');
    expect(persisted.lawCode).toMatch(/^LAW-/);
  });

  it('rejects an invalid payload with a bilingual 400', async () => {
    const res = await POST(req('http://x/api/compliance/labor-laws', { lawName: '' }), AUTH);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.message).toBeDefined();
    expect(json.messageAr).toBeDefined();
  });
});
