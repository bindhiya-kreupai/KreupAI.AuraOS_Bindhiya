// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

const { documentAccessLog } = vi.hoisted(() => ({
  documentAccessLog: {
    count: vi.fn(),
    findMany: vi.fn(),
    createMany: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@aura/database', () => ({
  prisma: { documentAccessLog },
}));

import { GET, POST } from '@/app/api/security/document-access-logs/route';

function req(url: string, body?: unknown) {
  return {
    url,
    headers: { get: () => null },
    json: async () => body,
  } as any;
}

function ctx(permissions: string[]) {
  return { user: { tenantId: 't1', userId: 'u1', email: 'a@x.io' }, permissions } as any;
}

beforeEach(() => {
  vi.clearAllMocks();
  documentAccessLog.count.mockResolvedValue(1);
  documentAccessLog.findMany.mockResolvedValue([
    { id: 'l1', documentName: 'a.pdf', action: 'viewed', createdAt: new Date().toISOString() },
  ]);
  documentAccessLog.createMany.mockResolvedValue({ count: 0 });
  documentAccessLog.create.mockResolvedValue({ id: 'new1' });
});

describe('GET /api/security/document-access-logs', () => {
  it('403 when permission missing', async () => {
    const res = await GET(req('http://x/api'), ctx([]));
    expect(res.status).toBe(403);
  });

  it('200 with list', async () => {
    const res = await GET(
      req('http://x/api?q=report&action=viewed'),
      ctx(['security/document-logs:read'])
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
  });
});

describe('POST /api/security/document-access-logs', () => {
  it('403 when permission missing', async () => {
    const res = await POST(req('http://x/api', {}), ctx([]));
    expect(res.status).toBe(403);
  });

  it('400 on invalid action', async () => {
    const res = await POST(
      req('http://x/api', { documentId: 'd1', documentName: 'n', action: 'nope' }),
      ctx(['security/document-logs:create'])
    );
    expect(res.status).toBe(400);
  });

  it('201 on valid create', async () => {
    const res = await POST(
      req('http://x/api', { documentId: 'd1', documentName: 'n', action: 'viewed' }),
      ctx(['security/document-logs:create'])
    );
    expect(res.status).toBe(201);
    expect(documentAccessLog.create).toHaveBeenCalled();
  });
});
