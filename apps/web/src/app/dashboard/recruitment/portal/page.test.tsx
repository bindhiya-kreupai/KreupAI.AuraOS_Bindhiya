// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CandidatePortalPage from './page';

vi.mock('../services', () => ({
  CandidateApplicationService: {
    getApplications: vi.fn(() => Promise.resolve([])),
  },
}));

describe('CandidatePortalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders live application cards in the Applications tab', async () => {
    const { CandidateApplicationService } = await import('../services');

    vi.mocked(CandidateApplicationService.getApplications).mockResolvedValueOnce([
      {
        id: 'app-1',
        applicationNumber: 'APP-1',
        jobPostingId: 'job-1',
        jobTitle: 'Senior Product Designer',
        candidateId: 'cand-1',
        firstName: 'Sara',
        lastName: 'Hamed',
        email: 'sara@example.com',
        phone: '12345',
        location: 'Remote',
        source: 'career_site',
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
    ] as any);

    render(<CandidatePortalPage />);

    await waitFor(() => {
      expect(screen.getByText('Senior Product Designer')).toBeInTheDocument();
    });

    expect(screen.getByText('Sara Hamed')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByText('Technical Interview')).toBeInTheDocument();
    expect(screen.getByText('Portal Overview')).toBeInTheDocument();
  });

  it('shows explicit unsupported states for Documents and Offers tabs', async () => {
    render(<CandidatePortalPage />);

    await waitFor(() => {
      expect(screen.getByText('No applications in the portal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Documents' }));
    expect(screen.getByText('Documents not yet connected')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Offers' }));
    expect(screen.getByText('Offers not yet connected')).toBeInTheDocument();
  });
});