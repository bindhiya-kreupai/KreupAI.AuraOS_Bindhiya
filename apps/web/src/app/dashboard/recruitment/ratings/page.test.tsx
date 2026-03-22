// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import InterviewRatingsPage from './page';

vi.mock('../services', () => ({
  InterviewService: {
    getInterviews: vi.fn(() => Promise.resolve([])),
  },
  InterviewFeedbackService: {
    getFeedback: vi.fn(() => Promise.resolve([])),
  },
}));

describe('InterviewRatingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('derives rating rows and summary metrics from live interview feedback data', async () => {
    const { InterviewService, InterviewFeedbackService } = await import('../services');

    vi.mocked(InterviewService.getInterviews).mockResolvedValueOnce([
      {
        id: 'int-1',
        applicationId: 'app-1',
        candidateName: 'Huda Karim',
        jobTitle: 'Product Manager',
        type: 'behavioral',
        status: 'completed',
        scheduledDate: '2026-03-20T09:00:00.000Z',
        duration: 60,
        interviewers: [{ id: 'u1', name: 'Nora Ali', email: 'nora@example.com', role: 'Manager', isPrimary: true }],
        createdAt: '2026-03-18T00:00:00.000Z',
        updatedAt: '2026-03-20T00:00:00.000Z',
      },
      {
        id: 'int-2',
        applicationId: 'app-2',
        candidateName: 'Tariq Salem',
        jobTitle: 'QA Engineer',
        type: 'technical',
        status: 'completed',
        scheduledDate: '2026-03-21T09:00:00.000Z',
        duration: 60,
        interviewers: [{ id: 'u2', name: 'Owen Reed', email: 'owen@example.com', role: 'Lead', isPrimary: true }],
        createdAt: '2026-03-19T00:00:00.000Z',
        updatedAt: '2026-03-21T00:00:00.000Z',
      },
    ] as any);

    vi.mocked(InterviewFeedbackService.getFeedback)
      .mockResolvedValueOnce([
        {
          id: 'fb-1',
          interviewId: 'int-1',
          interviewerId: 'u1',
          interviewerName: 'Nora Ali',
          recommendation: 'hire',
          technicalSkills: 4,
          communicationSkills: 4,
          problemSolving: 5,
          cultureFit: 5,
          strengths: 'Clear prioritization',
          concerns: '',
          notes: 'Strong product instincts.',
          submittedDate: '2026-03-20T12:00:00.000Z',
        },
      ] as any)
      .mockResolvedValueOnce([
        {
          id: 'fb-2',
          interviewId: 'int-2',
          interviewerId: 'u2',
          interviewerName: 'Owen Reed',
          recommendation: 'no_hire',
          technicalSkills: 2,
          communicationSkills: 3,
          problemSolving: 2,
          cultureFit: 3,
          strengths: '',
          concerns: 'Automation depth',
          notes: 'Needs stronger test architecture examples.',
          submittedDate: '2026-03-21T12:00:00.000Z',
        },
      ] as any);

    render(<InterviewRatingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Huda Karim')).toBeInTheDocument();
    });

    expect(screen.getByText('Product Manager')).toBeInTheDocument();
    expect(screen.getByText('Nora Ali')).toBeInTheDocument();
    expect(screen.getByText(/Strong product instincts\./)).toBeInTheDocument();
    expect(screen.getByText('3.5')).toBeInTheDocument();
    expect(screen.getByText('Submitted Reviews')).toBeInTheDocument();
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hire').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Reject').length).toBeGreaterThan(0);
  });

  it('shows an empty state when no interview ratings exist', async () => {
    render(<InterviewRatingsPage />);

    await waitFor(() => {
      expect(screen.getByText('No interview ratings available yet.')).toBeInTheDocument();
    });
  });
});