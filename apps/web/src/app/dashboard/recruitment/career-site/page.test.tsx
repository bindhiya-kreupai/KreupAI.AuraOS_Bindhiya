// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CareerSitePage from './page';

vi.mock('../services', () => ({
  RecruitmentSettingsService: {
    getSettings: vi.fn(() => Promise.resolve(null)),
  },
  JobPostingService: {
    getPostings: vi.fn(() => Promise.resolve([])),
  },
}));

describe('CareerSitePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders company and open roles from live settings and postings', async () => {
    const { RecruitmentSettingsService, JobPostingService } = await import('../services');

    vi.mocked(RecruitmentSettingsService.getSettings).mockResolvedValueOnce({
      defaultPipelineId: 'default-pipeline',
      applicationExpiryDays: 365,
      offerExpiryDays: 14,
      requireBackgroundCheck: false,
      requireReferenceCheck: false,
      emailTemplates: [],
      screeningQuestions: [],
      companyName: 'AuraOS Technologies',
      careerPageUrl: 'careers.auraos.example',
      applicationSettings: {
        allowDirectApplications: true,
        requireResume: true,
        requireCoverLetter: false,
        enableQuickApply: true,
      },
    } as any);

    vi.mocked(JobPostingService.getPostings).mockResolvedValueOnce([
      {
        id: 'job-1',
        requisitionId: 'req-1',
        jobTitle: 'Senior Software Engineer',
        departmentName: 'Engineering',
        locationName: 'San Francisco',
        jobType: 'full_time',
        experienceLevel: 'senior_level',
        employmentMode: 'hybrid',
        description: 'Build products',
        responsibilities: [],
        qualifications: [],
        skills: [],
        isActive: true,
        isExternal: true,
        applicationCount: 7,
        viewCount: 42,
        createdAt: '2026-03-22T00:00:00.000Z',
        updatedAt: '2026-03-22T00:00:00.000Z',
      },
    ] as any);

    render(<CareerSitePage />);

    await waitFor(() => {
      expect(screen.getByText('Join AuraOS Technologies')).toBeInTheDocument();
    });

    expect(screen.getAllByText('careers.auraos.example').length).toBeGreaterThan(0);
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Engineering - San Francisco')).toBeInTheDocument();
    expect(screen.getByText('Open Roles (1)')).toBeInTheDocument();
  });

  it('shows an empty roles state when there are no active postings', async () => {
    const { RecruitmentSettingsService, JobPostingService } = await import('../services');

    vi.mocked(RecruitmentSettingsService.getSettings).mockResolvedValueOnce({
      defaultPipelineId: 'default-pipeline',
      applicationExpiryDays: 365,
      offerExpiryDays: 14,
      requireBackgroundCheck: false,
      requireReferenceCheck: false,
      emailTemplates: [],
      screeningQuestions: [],
      companyName: 'AuraOS Technologies',
      careerPageUrl: 'careers.auraos.example',
      applicationSettings: {
        allowDirectApplications: false,
        requireResume: true,
        requireCoverLetter: true,
        enableQuickApply: false,
      },
    } as any);

    vi.mocked(JobPostingService.getPostings).mockResolvedValueOnce([]);

    render(<CareerSitePage />);

    await waitFor(() => {
      expect(screen.getByText('No open positions to display.')).toBeInTheDocument();
    });
  });
});