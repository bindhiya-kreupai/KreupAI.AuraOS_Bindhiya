// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

const { dsarMock } = vi.hoisted(() => ({
  dsarMock: {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@aura/database', () => ({
  prisma: { dsarRequest: dsarMock },
}));

vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn(), info: vi.fn() } }));

import { GET, POST } from '@/app/api/security/dsar/route';

function ctx(permissions: string[]) {
  return { user: { userId: 'u1', tenantId: 't1' }, permissions } as any;
}

function req(body?: unknown, url = 'http://x/api/security/dsar') {
  return { json: async () => body, url } as any;
}

describe('GET /api/security/dsar', () => {
  beforeEach(() => {
    dsarMock.findMany.mockReset();
    dsarMock.count.mockReset();
  });

  it('403 when permission missing', async () => {
    const res = await GET(req(), ctx([]));
    expect(res.status).toBe(403);
  });

  it('200 lists tenant DSARs', async () => {
    dsarMock.findMany.mockResolvedValue([{ id: 'd1', status: 'new' }]);
    dsarMock.count.mockResolvedValue(1);
    const res = await GET(req(), ctx(['security/gdpr:read']));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(dsarMock.findMany.mock.calls[0][0].where.tenantId).toBe('t1');
  });
});

describe('POST /api/security/dsar', () => {
  beforeEach(() => dsarMock.create.mockReset());

  it('403 when permission missing', async () => {
    const res = await POST(req({}), ctx([]));
    expect(res.status).toBe(403);
  });

  it('400 on invalid requestType', async () => {
    const res = await POST(
      req({ requestType: 'bogus', subjectName: 'A', subjectEmail: 'a@x.com' }),
      ctx(['security/gdpr:create'])
    );
    expect(res.status).toBe(400);
  });

  it('201 creates with tenant scoping and 30d due date', async () => {
    dsarMock.create.mockResolvedValue({ id: 'd2' });
    const res = await POST(
      req({ requestType: 'access', subjectName: 'Alex', subjectEmail: 'alex@x.com' }),
      ctx(['security/gdpr:create'])
    );
    expect(res.status).toBe(201);
    const data = dsarMock.create.mock.calls[0][0].data;
    expect(data.tenantId).toBe('t1');
    expect(data.createdBy).toBe('u1');
    expect(data.status).toBe('new');
    expect(data.dueDate).toBeInstanceOf(Date);
  });
});
