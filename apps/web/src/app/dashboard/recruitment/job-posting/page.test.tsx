// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import JobPostingsPage from './page';

vi.mock('@/components/recruitment/create-job-modal', () => ({
  default: () => null,
}));

vi.mock('../services', () => ({
  JobPostingService: {
    getPostings: vi.fn(() => Promise.resolve([])),
  },
}));

describe('JobPostingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders live job posting fields from the recruitment posting service', async () => {
    const { JobPostingService } = await import('../services');

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
        publishedDate: '2026-03-22T00:00:00.000Z',
        isActive: true,
        isExternal: true,
        externalBoards: ['LinkedIn', 'Indeed'],
        applicationCount: 5,
        viewCount: 20,
        createdAt: '2026-03-22T00:00:00.000Z',
        updatedAt: '2026-03-22T00:00:00.000Z',
      },
    ] as any);

    render(<JobPostingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Senior Backend Engineer')).toBeInTheDocument();
    });

    expect(screen.getByText(/Engineering • Remote • full time • Posted/i)).toBeInTheDocument();
    expect(screen.getAllByText('20').length).toBeGreaterThan(0);
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows an empty state when there are no job postings', async () => {
    render(<JobPostingsPage />);

    await waitFor(() => {
      expect(screen.getByText('No job postings available')).toBeInTheDocument();
    });
  });
});