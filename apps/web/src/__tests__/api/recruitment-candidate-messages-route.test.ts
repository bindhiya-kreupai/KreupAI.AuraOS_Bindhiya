import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: { tenantId: 'tenant-1', id: 'user-1', name: 'Recruiter One' },
  permissions: ['recruitment:read', 'recruitment:create'],
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
}));

vi.mock('@/lib/middleware/audit.middleware', () => ({
  withAudit: (handler: any) => handler,
}));

vi.mock('@/lib/audit/audit.service', () => ({
  AuditAction: { EMPLOYEE_CREATED: 'EMPLOYEE_CREATED' },
}));

vi.mock('@aura/database', () => ({
  prisma: {
    candidate: { findMany: vi.fn(), findUnique: vi.fn() },
    candidateMessage: { findMany: vi.fn(), create: vi.fn() },
  },
}));

import { prisma } from '@aura/database';
import { GET, POST } from '@/app/api/v1/recruitment/messages/route';

describe('recruitment candidate messages route', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('groups tenant-scoped messages into candidate threads', async () => {
    prismaMock.candidateMessage.findMany.mockResolvedValue([
      {
        id: 'm1',
        candidateId: 'cand-1',
        applicationId: null,
        channel: 'email',
        direction: 'outbound',
        status: 'sent',
        subject: 'Hello',
        body: 'Welcome to the process',
        sender: 'HR',
        senderRole: 'Recruiter',
        sentAt: new Date('2026-05-01T10:00:00Z'),
      },
    ]);
    prismaMock.candidate.findMany.mockResolvedValue([
      {
        id: 'cand-1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: '+100',
        applications: [{ currentStage: 'SCREENING', jobPosting: { title: 'Engineer' } }],
      },
    ]);

    const request = new NextRequest('http://localhost/api/v1/recruitment/messages');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(prismaMock.candidateMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', isDeleted: false }),
        orderBy: { sentAt: 'asc' },
      })
    );
    expect(payload.data.threads).toHaveLength(1);
    expect(payload.data.threads[0]).toMatchObject({
      candidateId: 'cand-1',
      candidateName: 'Ada Lovelace',
      jobTitle: 'Engineer',
      lastChannel: 'email',
    });
    expect(payload.data.threads[0].messages).toHaveLength(1);
  });

  it('rejects a message without candidateId or body', async () => {
    const request = new NextRequest('http://localhost/api/v1/recruitment/messages', {
      method: 'POST',
      body: JSON.stringify({ body: 'no candidate' }),
    });
    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.message).toContain('candidateId');
    expect(payload.error.messageAr).toBeTruthy();
    expect(prismaMock.candidateMessage.create).not.toHaveBeenCalled();
  });

  it('persists a tenant-scoped outbound message', async () => {
    prismaMock.candidate.findUnique.mockResolvedValue({ id: 'cand-1' });
    prismaMock.candidateMessage.create.mockResolvedValue({ id: 'm-new', candidateId: 'cand-1' });

    const request = new NextRequest('http://localhost/api/v1/recruitment/messages', {
      method: 'POST',
      body: JSON.stringify({ candidateId: 'cand-1', channel: 'email', body: 'Hi there' }),
    });
    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.success).toBe(true);
    expect(prismaMock.candidateMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          candidateId: 'cand-1',
          channel: 'email',
          direction: 'outbound',
          body: 'Hi there',
        }),
      })
    );
  });
});
