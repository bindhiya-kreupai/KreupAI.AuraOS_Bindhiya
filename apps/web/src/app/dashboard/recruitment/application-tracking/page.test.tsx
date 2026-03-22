// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ApplicationTrackingPage from './page';

vi.mock('../services', () => ({
  CandidateApplicationService: {
    getApplications: vi.fn(() => Promise.resolve([])),
  },
}));

describe('ApplicationTrackingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders live application fields and normalizes stages into board columns', async () => {
    const { CandidateApplicationService } = await import('../services');

    vi.mocked(CandidateApplicationService.getApplications).mockResolvedValueOnce([
      {
        id: 'app-1',
        applicationNumber: 'APP-1',
        jobPostingId: 'job-1',
        jobTitle: 'Senior Backend Engineer',
        candidateId: 'cand-1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '12345',
        location: 'Remote',
        source: 'linkedin',
        status: 'screening',
        currentStage: 'phone_screen',
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
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@example.com',
        phone: '67890',
        location: 'Dubai',
        source: 'career_site',
        status: 'offer',
        currentStage: 'offer',
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

    render(<ApplicationTrackingPage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('Senior Backend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByText('Dubai')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Screening')).toBeInTheDocument();
    expect(screen.getByText('Offered')).toBeInTheDocument();
  });

  it('renders empty columns when no applications are returned', async () => {
    render(<ApplicationTrackingPage />);

    await waitFor(() => {
      expect(screen.getAllByText('No candidates').length).toBe(4);
    });
  });
});