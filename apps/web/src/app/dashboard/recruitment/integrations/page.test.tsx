// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import JobBoardsPage from './page';

vi.mock('../services', () => ({
  RecruitmentSettingsService: {
    getSettings: vi.fn(() => Promise.resolve(null)),
  },
  JobPostingService: {
    getPostings: vi.fn(() => Promise.resolve([])),
  },
}));

describe('JobBoardsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('derives the connected board from recruitment settings and active postings', async () => {
    const { RecruitmentSettingsService, JobPostingService } = await import('../services');

    vi.mocked(RecruitmentSettingsService.getSettings).mockResolvedValueOnce({
      defaultPipelineId: 'default-pipeline',
      applicationExpiryDays: 365,
      offerExpiryDays: 14,
      requireBackgroundCheck: false,
      requireReferenceCheck: false,
      emailTemplates: [],
      screeningQuestions: [],
      general: {
        defaultJobBoard: 'LinkedIn',
      },
      updatedDate: new Date().toISOString(),
    } as any);

    vi.mocked(JobPostingService.getPostings).mockResolvedValueOnce([
      { id: 'job-1' },
      { id: 'job-2' },
    ] as any);

    render(<JobBoardsPage />);

    await waitFor(() => {
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });

    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Compatibility View')).toBeInTheDocument();
  });

  it('shows a real empty state when no job board is configured', async () => {
    const { RecruitmentSettingsService, JobPostingService } = await import('../services');

    vi.mocked(RecruitmentSettingsService.getSettings).mockResolvedValueOnce({
      defaultPipelineId: 'default-pipeline',
      applicationExpiryDays: 365,
      offerExpiryDays: 14,
      requireBackgroundCheck: false,
      requireReferenceCheck: false,
      emailTemplates: [],
      screeningQuestions: [],
      general: {
        defaultJobBoard: '',
      },
    } as any);

    vi.mocked(JobPostingService.getPostings).mockResolvedValueOnce([] as any);

    render(<JobBoardsPage />);

    await waitFor(() => {
      expect(screen.getByText('No job board integrations configured')).toBeInTheDocument();
    });
  });
});