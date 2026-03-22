import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: { tenantId: 'tenant-1', userId: 'user-1' },
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request, routeContext?: any) =>
    handler(request, mockContext, routeContext),
}));

import { POST } from '@/app/api/core-hr/mass-updates/[updateId]/execute/route';

describe('core-HR mass update execute API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an executed update payload for the requested update id', async () => {
    const request = new NextRequest('http://localhost/api/core-hr/mass-updates/update-1/execute', {
      method: 'POST',
    });

    const response = await POST(request as any, { params: { updateId: 'update-1' } } as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.update).toMatchObject({
      id: 'update-1',
      status: 'EXECUTED',
      executedBy: 'user-1',
    });
  });
});