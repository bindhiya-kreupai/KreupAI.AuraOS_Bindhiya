// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import RecruitmentEmailsPage from './page';

vi.mock('../services', () => ({
  RecruitmentSettingsService: {
    getSettings: vi.fn(() => Promise.resolve(null)),
  },
}));

describe('RecruitmentEmailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email templates from recruitment settings', async () => {
    const { RecruitmentSettingsService } = await import('../services');

    vi.mocked(RecruitmentSettingsService.getSettings).mockResolvedValueOnce({
      defaultPipelineId: 'default-pipeline',
      applicationExpiryDays: 365,
      offerExpiryDays: 21,
      requireBackgroundCheck: true,
      requireReferenceCheck: false,
      emailTemplates: [
        {
          id: 'email-1',
          name: 'Interview Invitation',
          subject: 'Interview with AuraOS - {{role}}',
          body: 'Please join us tomorrow.',
          type: 'interview_scheduled',
        },
      ],
      screeningQuestions: [],
    } as any);

    render(<RecruitmentEmailsPage />);

    await waitFor(() => {
      expect(screen.getByText('Interview Invitation')).toBeInTheDocument();
    });

    expect(screen.getByText('Interview Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Interview with AuraOS - {{role}}')).toBeInTheDocument();
    expect(screen.queryByText('No email templates configured')).not.toBeInTheDocument();
  });

  it('shows an empty state when no templates are configured', async () => {
    const { RecruitmentSettingsService } = await import('../services');

    vi.mocked(RecruitmentSettingsService.getSettings).mockResolvedValueOnce({
      defaultPipelineId: 'default-pipeline',
      applicationExpiryDays: 365,
      offerExpiryDays: 21,
      requireBackgroundCheck: false,
      requireReferenceCheck: false,
      emailTemplates: [],
      screeningQuestions: [],
    } as any);

    render(<RecruitmentEmailsPage />);

    await waitFor(() => {
      expect(screen.getByText('No email templates configured')).toBeInTheDocument();
    });
  });
});