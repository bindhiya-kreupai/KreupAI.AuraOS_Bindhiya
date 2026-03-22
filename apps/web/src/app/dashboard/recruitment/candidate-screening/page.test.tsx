// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CandidateScreeningPage from './page';

vi.mock('../services', () => ({
  CandidateApplicationService: {
    getApplications: vi.fn(() => Promise.resolve([])),
    updateApplication: vi.fn(() => Promise.resolve({})),
  },
}));

describe('CandidateScreeningPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders live application fields and updates screening actions', async () => {
    const { CandidateApplicationService } = await import('../services');

    vi.mocked(CandidateApplicationService.getApplications).mockResolvedValueOnce([
      {
        id: 'app-1',
        applicationNumber: 'APP-1',
        jobPostingId: 'job-1',
        jobTitle: 'Senior Backend Engineer',
        candidateId: 'cand-1',
        firstName: 'Maya',
        lastName: 'Chen',
        email: 'maya@example.com',
        phone: '12345',
        location: 'Remote',
        source: 'linkedin',
        status: 'screening',
        currentStage: 'screening',
        screeningStatus: 'pending',
        rating: 4,
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
        jobTitle: 'Product Manager',
        candidateId: 'cand-2',
        firstName: 'Omar',
        lastName: 'Nasser',
        email: 'omar@example.com',
        phone: '67890',
        location: 'Dubai',
        source: 'referral',
        status: 'screening',
        currentStage: 'screening',
        screeningStatus: 'shortlisted',
        rating: 5,
        experience: 7,
        skills: [],
        education: [],
        workExperience: [],
        appliedDate: '2026-03-18T00:00:00.000Z',
        lastActivityDate: '2026-03-21T00:00:00.000Z',
        createdAt: '2026-03-18T00:00:00.000Z',
        updatedAt: '2026-03-21T00:00:00.000Z',
      },
    ] as any);

    render(<CandidateScreeningPage />);

    await waitFor(() => {
      expect(screen.getByText('Maya Chen')).toBeInTheDocument();
    });

    expect(screen.getByText('Senior Backend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Source: linkedin')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('Pending Review')).toBeInTheDocument();
    expect(screen.getByText('Shortlisted')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /shortlist/i })[0]);

    await waitFor(() => {
      expect(CandidateApplicationService.updateApplication).toHaveBeenCalledWith('app-1', { screeningStatus: 'shortlisted' });
    });
  });

  it('shows an empty state when there are no screening candidates', async () => {
    render(<CandidateScreeningPage />);

    await waitFor(() => {
      expect(screen.getByText('No candidates in screening')).toBeInTheDocument();
    });
  });
});