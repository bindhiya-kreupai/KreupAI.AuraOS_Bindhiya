// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ReferralsPage from './page';

vi.mock('../services', () => ({
  JobPostingService: {
    getPostings: vi.fn(() => Promise.resolve([])),
  },
  CandidateApplicationService: {
    getApplications: vi.fn(() => Promise.resolve([])),
  },
}));

describe('ReferralsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders referral applications and open jobs from live recruitment fields', async () => {
    const { JobPostingService, CandidateApplicationService } = await import('../services');

    vi.mocked(JobPostingService.getPostings).mockResolvedValueOnce([
      {
        id: 'job-1',
        requisitionId: 'req-1',
        jobTitle: 'Senior Backend Engineer',
        departmentName: 'Engineering',
        locationName: 'Remote',
        jobType: 'full_time',
        experienceLevel: 'senior_level',
        employmentMode: 'remote',
        description: 'Build systems',
        responsibilities: [],
        qualifications: [],
        skills: [],
        isActive: true,
        isExternal: true,
        applicationCount: 3,
        viewCount: 12,
        createdAt: '2026-03-22T00:00:00.000Z',
        updatedAt: '2026-03-22T00:00:00.000Z',
      },
    ] as any);

    vi.mocked(CandidateApplicationService.getApplications).mockResolvedValueOnce([
      {
        id: 'app-1',
        applicationNumber: 'APP-1',
        jobPostingId: 'job-1',
        jobTitle: 'Senior Backend Engineer',
        candidateId: 'cand-1',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: 'sarah@example.com',
        phone: '12345',
        location: 'Remote',
        source: 'referral',
        status: 'interview',
        currentStage: 'technical_interview',
        experience: 5,
        skills: [],
        education: [],
        workExperience: [],
        appliedDate: '2026-03-20T00:00:00.000Z',
        lastActivityDate: '2026-03-21T00:00:00.000Z',
        createdAt: '2026-03-20T00:00:00.000Z',
        updatedAt: '2026-03-21T00:00:00.000Z',
      },
      {
        id: 'app-2',
        applicationNumber: 'APP-2',
        jobPostingId: 'job-2',
        jobTitle: 'Designer',
        candidateId: 'cand-2',
        firstName: 'Chris',
        lastName: 'Doe',
        email: 'chris@example.com',
        phone: '12345',
        location: 'Remote',
        source: 'linkedin',
        status: 'screening',
        currentStage: 'screening',
        experience: 3,
        skills: [],
        education: [],
        workExperience: [],
        appliedDate: '2026-03-20T00:00:00.000Z',
        lastActivityDate: '2026-03-21T00:00:00.000Z',
        createdAt: '2026-03-20T00:00:00.000Z',
        updatedAt: '2026-03-21T00:00:00.000Z',
      },
    ] as any);

    render(<ReferralsPage />);

    await waitFor(() => {
      expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Senior Backend Engineer').length).toBeGreaterThan(0);
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByText('Interviewing')).toBeInTheDocument();
  });

  it('shows empty states when there are no referrals or jobs', async () => {
    const { JobPostingService, CandidateApplicationService } = await import('../services');

    vi.mocked(JobPostingService.getPostings).mockResolvedValueOnce([] as any);
    vi.mocked(CandidateApplicationService.getApplications).mockResolvedValueOnce([] as any);

    render(<ReferralsPage />);

    await waitFor(() => {
      expect(screen.getByText('No referrals yet. Refer a friend to get started.')).toBeInTheDocument();
    });

    expect(screen.getByText('No open positions available for referrals.')).toBeInTheDocument();
  });
});