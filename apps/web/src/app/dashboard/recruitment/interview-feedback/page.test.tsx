// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import InterviewFeedbackPage from './page';

vi.mock('../services', () => ({
  InterviewService: {
    getInterviews: vi.fn(() => Promise.resolve([])),
  },
  InterviewFeedbackService: {
    getFeedback: vi.fn(() => Promise.resolve([])),
  },
}));

describe('InterviewFeedbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders feedback cards from joined interview and interview feedback services', async () => {
    const { InterviewService, InterviewFeedbackService } = await import('../services');

    vi.mocked(InterviewService.getInterviews).mockResolvedValueOnce([
      {
        id: 'int-1',
        applicationId: 'app-1',
        candidateName: 'Rania Saleh',
        jobTitle: 'Senior Backend Engineer',
        type: 'technical',
        status: 'completed',
        scheduledDate: '2026-03-20T09:00:00.000Z',
        duration: 60,
        interviewers: [{ id: 'u1', name: 'Liam Chen', email: 'liam@example.com', role: 'Hiring Manager', isPrimary: true }],
        createdAt: '2026-03-18T00:00:00.000Z',
        updatedAt: '2026-03-20T00:00:00.000Z',
      },
    ] as any);

    vi.mocked(InterviewFeedbackService.getFeedback).mockResolvedValueOnce([
      {
        id: 'fb-1',
        interviewId: 'int-1',
        interviewerId: 'u1',
        interviewerName: 'Liam Chen',
        recommendation: 'hire',
        technicalSkills: 5,
        communicationSkills: 4,
        problemSolving: 5,
        cultureFit: 4,
        strengths: 'Strong systems thinking',
        concerns: '',
        notes: 'Excellent API design discussion.',
        submittedDate: '2026-03-20T12:00:00.000Z',
      },
    ] as any);

    render(<InterviewFeedbackPage />);

    await waitFor(() => {
      expect(screen.getByText('Rania Saleh')).toBeInTheDocument();
    });

    expect(screen.getByText('Senior Backend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Technical')).toBeInTheDocument();
    expect(screen.getByText('Liam Chen')).toBeInTheDocument();
    expect(screen.getAllByText('Hire').length).toBeGreaterThan(0);
    expect(screen.getByText('"Excellent API design discussion."')).toBeInTheDocument();
    expect(InterviewFeedbackService.getFeedback).toHaveBeenCalledWith('int-1');
  });

  it('shows an empty state when no interview feedback exists', async () => {
    render(<InterviewFeedbackPage />);

    await waitFor(() => {
      expect(screen.getByText('No feedback yet')).toBeInTheDocument();
    });
  });
});