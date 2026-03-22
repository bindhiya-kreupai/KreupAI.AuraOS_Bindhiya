// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TalentPoolPage from './page';

vi.mock('../services', () => ({
  CandidateApplicationService: {
    getApplications: vi.fn(() => Promise.resolve([])),
  },
}));

describe('TalentPoolPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders live candidate application fields in the talent pool', async () => {
    const { CandidateApplicationService } = await import('../services');

    vi.mocked(CandidateApplicationService.getApplications).mockResolvedValueOnce([
      {
        id: 'app-1',
        applicationNumber: 'APP-1',
        jobPostingId: 'job-1',
        jobTitle: 'Senior Backend Engineer',
        candidateId: 'cand-1',
        firstName: 'Layla',
        lastName: 'Rahman',
        email: 'layla@example.com',
        phone: '12345',
        location: 'Remote',
        source: 'linkedin',
        status: 'screening',
        currentStage: 'technical_interview',
        currentTitle: 'Senior Software Engineer',
        rating: 4,
        experience: 6,
        skills: ['TypeScript', 'Node.js'],
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
        jobTitle: 'Designer',
        candidateId: 'cand-2',
        firstName: 'Noah',
        lastName: 'Ali',
        email: 'noah@example.com',
        phone: '67890',
        location: 'Abu Dhabi',
        source: 'career_site',
        status: 'rejected',
        currentStage: 'rejected',
        experience: 3,
        skills: [],
        education: [],
        workExperience: [],
        appliedDate: '2026-03-18T00:00:00.000Z',
        lastActivityDate: '2026-03-21T00:00:00.000Z',
        createdAt: '2026-03-18T00:00:00.000Z',
        updatedAt: '2026-03-21T00:00:00.000Z',
      },
    ] as any);

    render(<TalentPoolPage />);

    await waitFor(() => {
      expect(screen.getByText('Layla Rahman')).toBeInTheDocument();
    });

    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Considering')).toBeInTheDocument();
    expect(screen.getByText('Do Not Contact')).toBeInTheDocument();
  });

  it('shows an empty state when there are no candidates', async () => {
    render(<TalentPoolPage />);

    await waitFor(() => {
      expect(screen.getByText('No candidates in talent pool')).toBeInTheDocument();
    });
  });
});