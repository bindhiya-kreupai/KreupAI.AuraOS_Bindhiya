// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AgencyPortalPage from './page';

vi.mock('../services', () => ({
  JobPostingService: {
    getPostings: vi.fn(() => Promise.resolve([])),
  },
}));

describe('AgencyPortalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders live agency-shareable jobs from posting fields', async () => {
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
        isActive: true,
        isExternal: true,
        applicationCount: 4,
        viewCount: 12,
        createdAt: '2026-03-22T00:00:00.000Z',
        updatedAt: '2026-03-22T00:00:00.000Z',
      },
    ] as any);

    render(<AgencyPortalPage />);

    await waitFor(() => {
      expect(screen.getByText('Senior Backend Engineer')).toBeInTheDocument();
    });

    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('View Posting')).toBeInTheDocument();
  });

  it('shows explicit empty states for unsupported submissions and agencies tabs', async () => {
    render(<AgencyPortalPage />);

    await waitFor(() => {
      expect(screen.getByText('No agency-shareable jobs available')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submissions' }));
    expect(screen.getByText('Agency submissions are not configured')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Agencies' }));
    expect(screen.getByText('Agency directory is not configured')).toBeInTheDocument();
  });
});