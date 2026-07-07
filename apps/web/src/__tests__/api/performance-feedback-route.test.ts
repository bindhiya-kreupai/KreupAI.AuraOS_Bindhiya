import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: {
    tenantId: 'tenant-1',
    employeeId: 'emp-auth-1',
    userId: 'user-1',
  },
  permissions: ['performance:read', 'performance:create'],
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
}));

vi.mock('@aura/database', () => ({
  prisma: {
    auditLog: { create: vi.fn() },
    continuousFeedback: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    continuousFeedbackReaction: { findMany: vi.fn() },
    continuousFeedbackComment: { findMany: vi.fn() },
  },
}));

import { prisma } from '@aura/database';
import { GET, POST } from '@/app/api/performance/feedback/route';

describe('performance feedback API', () => {
  const p = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates feedback with server-derived fromUserId and maps praise -> RECOGNITION', async () => {
    p.continuousFeedback.create.mockResolvedValue({
      id: 'fb-1',
      tenantId: 'tenant-1',
      fromUserId: 'emp-auth-1',
      toEmployeeId: 'emp-2',
      type: 'RECOGNITION',
      message: 'Great job on the release!',
      visibility: 'PUBLIC',
      isAnonymous: false,
      tags: ['Excellence'],
      status: 'active',
      relatedGoalId: null,
      createdAt: new Date('2026-07-02T10:00:00Z'),
      updatedAt: new Date('2026-07-02T10:00:00Z'),
    });

    const request = new NextRequest('http://localhost/api/performance/feedback', {
      method: 'POST',
      body: JSON.stringify({
        category: 'praise',
        visibility: 'public',
        toId: 'emp-2',
        message: 'Great job on the release!',
        tags: ['Excellence'],
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(201);
    // fromUserId is derived from the authenticated context, not the client.
    expect(p.continuousFeedback.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          fromUserId: 'emp-auth-1',
          toEmployeeId: 'emp-2',
          type: 'RECOGNITION',
          visibility: 'PUBLIC',
        }),
      })
    );
    expect(payload.feedback.category).toBe('praise');
    expect(payload.feedback.id).toBe('fb-1');
  });

  it('rejects feedback with a message shorter than 10 characters', async () => {
    const request = new NextRequest('http://localhost/api/performance/feedback', {
      method: 'POST',
      body: JSON.stringify({ category: 'praise', toId: 'emp-2', message: 'short' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.messageAr).toBeTruthy();
    expect(p.continuousFeedback.create).not.toHaveBeenCalled();
  });

  it('maps stored rows into FeedbackItems with grouped reactions on GET', async () => {
    p.continuousFeedback.findMany.mockResolvedValue([
      {
        id: 'fb-1',
        tenantId: 'tenant-1',
        fromUserId: 'emp-3',
        toEmployeeId: 'emp-auth-1',
        type: 'CONSTRUCTIVE',
        message: 'Consider tighter estimates next sprint.',
        visibility: 'PRIVATE',
        isAnonymous: false,
        tags: ['Communication'],
        status: 'active',
        relatedGoalId: null,
        createdAt: new Date('2026-07-01T10:00:00Z'),
        updatedAt: new Date('2026-07-01T10:00:00Z'),
      },
    ]);
    p.continuousFeedback.count.mockResolvedValue(1);
    p.continuousFeedbackReaction.findMany.mockResolvedValue([
      { feedbackId: 'fb-1', type: '👏', userId: 'emp-auth-1' },
      { feedbackId: 'fb-1', type: '👏', userId: 'emp-9' },
    ]);
    p.continuousFeedbackComment.findMany.mockResolvedValue([]);

    const request = new NextRequest('http://localhost/api/performance/feedback?direction=received');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    // direction=received must scope to the authenticated employee.
    expect(p.continuousFeedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', toEmployeeId: 'emp-auth-1' }),
      })
    );
    const item = payload.feedback[0];
    expect(item.category).toBe('constructive');
    const clap = item.reactions.find((r: any) => r.type === '👏');
    expect(clap.count).toBe(2);
    expect(clap.hasReacted).toBe(true);
  });
});
