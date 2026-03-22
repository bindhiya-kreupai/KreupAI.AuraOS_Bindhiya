import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RecruitmentService } from '@/services/recruitmentService';

describe('recruitment service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('unwraps job posting envelopes from the v1 recruitment jobs route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              id: 'job-1',
              title: 'Senior Frontend Engineer',
              department: 'Engineering',
              location: 'Remote',
              type: 'full_time',
              status: 'Active',
              description: 'Build product UI',
              createdAt: '2026-03-22T00:00:00.000Z',
              _count: { candidateApplications: 4 },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const jobs = await RecruitmentService.getJobPostings({ status: 'active' });
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);

    expect(requestUrl).toContain('/api/v1/recruitment/jobs');
    expect(jobs).toEqual([
      expect.objectContaining({
        id: 'job-1',
        title: 'Senior Frontend Engineer',
        status: 'active',
        applicantCount: 4,
        isRemote: true,
      }),
    ]);
  });

  it('calls the stage route with the normalized backend stage value', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            id: 'app-1',
            candidateId: 'cand-1',
            currentStage: 'HIRED',
            status: 'HIRED',
            appliedDate: '2026-03-01T00:00:00.000Z',
            candidate: {
              id: 'cand-1',
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@example.com',
              skills: ['React'],
              createdAt: '2026-03-01T00:00:00.000Z',
              updatedAt: '2026-03-22T00:00:00.000Z',
            },
            jobPosting: { id: 'job-1', title: 'Senior Frontend Engineer' },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const candidate = await RecruitmentService.moveCandidateStage('cand-1', 'hired');
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(requestUrl).toContain('/api/v1/recruitment/candidates/cand-1/stage');
    expect(requestInit.method).toBe('PUT');
    expect(body).toEqual({ stage: 'HIRED' });
    expect(candidate).toMatchObject({ id: 'cand-1', currentStage: 'hired' });
  });

  it('unwraps analytics from the stats route instead of using mock analytics', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            totalOpenPositions: 5,
            totalApplications: 42,
            totalInterviewsScheduled: 8,
            totalOffersMade: 3,
            totalHired: 2,
            averageTimeToHire: 21,
            offerAcceptanceRate: 67,
            pipelineFunnel: [],
            sourceEffectiveness: [],
            departmentHiring: [],
            monthlyActivity: [],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const analytics = await RecruitmentService.getRecruitmentAnalytics();

    expect(analytics).toMatchObject({
      totalOpenPositions: 5,
      totalApplications: 42,
      totalInterviewsScheduled: 8,
      totalOffersMade: 3,
      totalHired: 2,
      averageTimeToHire: 21,
      offerAcceptanceRate: 67,
    });
  });
});
