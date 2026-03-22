// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import InterviewSchedulingPage from './page';

vi.mock('../services', () => ({
  InterviewService: {
    getInterviews: vi.fn(() => Promise.resolve([])),
    scheduleInterview: vi.fn(() => Promise.resolve({})),
  },
}));

describe('InterviewSchedulingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upcoming interviews from the live interview contract', async () => {
    const { InterviewService } = await import('../services');

    vi.mocked(InterviewService.getInterviews).mockResolvedValueOnce([
      {
        id: 'int-1',
        applicationId: 'app-1',
        candidateName: 'Zain Abbas',
        jobTitle: 'Backend Engineer',
        type: 'technical',
        status: 'scheduled',
        scheduledDate: '2026-03-22T10:30:00.000Z',
        duration: 60,
        meetingLink: 'https://meet.example.com/abc',
        interviewers: [],
        createdAt: '2026-03-20T00:00:00.000Z',
        updatedAt: '2026-03-21T00:00:00.000Z',
      },
    ] as any);

    render(<InterviewSchedulingPage />);

    await waitFor(() => {
      expect(screen.getByText('Zain Abbas')).toBeInTheDocument();
    });

    expect(screen.getByText('Technical')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('shows an empty state when there are no interviews', async () => {
    render(<InterviewSchedulingPage />);

    await waitFor(() => {
      expect(screen.getByText('No upcoming interviews')).toBeInTheDocument();
    });
  });
});