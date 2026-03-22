import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  _user: { tenantId: 'tenant-1', id: 'user-1' },
  user: { tenantId: 'tenant-1', id: 'user-1' },
  params: { id: 'cand-1' },
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
}));

vi.mock('@aura/database', () => ({
  prisma: {
    user: { findMany: vi.fn() },
    jobPosting: { findMany: vi.fn(), count: vi.fn() },
    candidate: { findMany: vi.fn(), count: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    candidateApplication: { findMany: vi.fn(), count: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    interview: { count: vi.fn() },
    jobOffer: { findMany: vi.fn() },
  },
}));

import { prisma } from '@aura/database';
import { GET as getCandidates } from '@/app/api/v1/recruitment/candidates/route';
import { PUT as updateCandidateStage } from '@/app/api/v1/recruitment/candidates/[id]/stage/route';
import { GET as getRecruitmentStats } from '@/app/api/v1/recruitment/stats/route';

describe('recruitment core routes', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.user.findMany.mockResolvedValue([{ id: 'user-1' }, { id: 'user-2' }]);
  });

  it('scopes candidate applications through tenant user ownership and orders by appliedDate', async () => {
    prismaMock.candidateApplication.findMany.mockResolvedValue([]);
    prismaMock.candidateApplication.count.mockResolvedValue(0);

    const request = new NextRequest('http://localhost/api/v1/recruitment/candidates?jobPostingId=job-1&stage=phone_screen');

    const response = await getCandidates(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(prismaMock.candidateApplication.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          jobPostingId: 'job-1',
          currentStage: 'PHONE_INTERVIEW',
          jobPosting: { createdBy: { in: ['user-1', 'user-2'] } },
        }),
        orderBy: { appliedDate: 'desc' },
      })
    );
  });

  it('supports stage updates by candidate id while normalizing the stage payload', async () => {
    prismaMock.candidateApplication.findFirst.mockResolvedValue({
      id: 'app-1',
      candidateId: 'cand-1',
      currentStage: 'SCREENING',
      status: 'IN_PROGRESS',
      rejectionReason: null,
      notes: 'Initial review',
    });
    prismaMock.candidateApplication.update.mockResolvedValue({
      id: 'app-1',
      candidateId: 'cand-1',
      currentStage: 'HIRED',
      status: 'HIRED',
      candidate: { id: 'cand-1', firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
      jobPosting: { id: 'job-1', title: 'Senior Frontend Engineer' },
    });

    const request = new NextRequest('http://localhost/api/v1/recruitment/candidates/cand-1/stage', {
      method: 'PUT',
      body: JSON.stringify({ stage: 'hired' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await updateCandidateStage(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toMatchObject({ id: 'app-1', currentStage: 'HIRED', status: 'HIRED' });
    expect(prismaMock.candidateApplication.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ id: 'cand-1' }, { candidateId: 'cand-1' }],
          jobPosting: { createdBy: { in: ['user-1', 'user-2'] } },
        }),
      })
    );
    expect(prismaMock.candidateApplication.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'app-1' },
        data: expect.objectContaining({ currentStage: 'HIRED', status: 'HIRED' }),
      })
    );
  });

  it('returns direct Prisma-backed recruitment stats instead of proxying to another service', async () => {
    prismaMock.jobPosting.findMany.mockResolvedValue([
      { id: 'job-1', department: 'Engineering', status: 'Active' },
      { id: 'job-2', department: 'Engineering', status: 'Closed' },
    ]);
    prismaMock.candidateApplication.findMany.mockResolvedValue([
      {
        id: 'app-1',
        source: 'linkedin',
        status: 'IN_PROGRESS',
        currentStage: 'APPLIED',
        appliedDate: new Date('2026-03-01T00:00:00.000Z'),
        updatedAt: new Date('2026-03-10T00:00:00.000Z'),
        jobPosting: { department: 'Engineering' },
      },
      {
        id: 'app-2',
        source: 'referral',
        status: 'HIRED',
        currentStage: 'HIRED',
        appliedDate: new Date('2026-03-02T00:00:00.000Z'),
        updatedAt: new Date('2026-03-22T00:00:00.000Z'),
        jobPosting: { department: 'Engineering' },
      },
    ]);
    prismaMock.interview.count.mockResolvedValue(4);
    prismaMock.jobOffer.findMany.mockResolvedValue([
      { status: 'ACCEPTED', createdAt: new Date('2026-03-20T00:00:00.000Z') },
      { status: 'SENT', createdAt: new Date('2026-03-18T00:00:00.000Z') },
    ]);

    const request = new NextRequest('http://localhost/api/v1/recruitment/stats');
    const response = await getRecruitmentStats(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toMatchObject({
      totalOpenPositions: 1,
      totalApplications: 2,
      totalInterviewsScheduled: 4,
      totalOffersMade: 2,
      totalHired: 1,
      offerAcceptanceRate: 50,
    });
    expect(payload.data.pipelineFunnel).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ stage: 'applied', count: 1 }),
        expect.objectContaining({ stage: 'hired', count: 1 }),
      ])
    );
  });
});