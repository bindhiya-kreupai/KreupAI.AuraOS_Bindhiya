import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: { tenantId: 'tenant-1', userId: 'user-1' },
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
}));

import { GET, POST } from '@/app/api/core-hr/auto-numbers/route';

describe('core-HR auto-numbers API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns sequence metadata for the dashboard sequence list', async () => {
    const request = new NextRequest('http://localhost/api/core-hr/auto-numbers');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(payload.sequences)).toBe(true);
    expect(payload.sequences[0]).toMatchObject({
      entityType: 'EMPLOYEE',
      prefix: 'EMP',
      padLength: 6,
    });
  });

  it('returns both number and generatedNumber for backward-compatible generation callers', async () => {
    const request = new NextRequest('http://localhost/api/core-hr/auto-numbers', {
      method: 'POST',
      body: JSON.stringify({ entityType: 'employee' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toMatchObject({
      entityType: 'EMPLOYEE',
      number: 'EMP-001001',
      generatedNumber: 'EMP-001001',
    });
  });
});