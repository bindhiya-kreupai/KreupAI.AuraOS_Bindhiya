// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ResumeParsingPage from './page';

vi.mock('../services', () => ({
  CandidateApplicationService: {
    getApplications: vi.fn(() => Promise.resolve([])),
  },
}));

describe('ResumeParsingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders parsed resumes from live candidate application fields', async () => {
    const { CandidateApplicationService } = await import('../services');

    vi.mocked(CandidateApplicationService.getApplications).mockResolvedValueOnce([
      {
        id: 'app-1',
        applicationNumber: 'APP-1',
        jobPostingId: 'job-1',
        jobTitle: 'Senior Backend Engineer',
        candidateId: 'cand-1',
        firstName: 'Amina',
        lastName: 'Khan',
        email: 'amina@example.com',
        phone: '12345',
        location: 'Remote',
        resumeUrl: 'https://example.com/resume.pdf',
        source: 'linkedin',
        status: 'screening',
        currentStage: 'screening',
        experience: 5,
        skills: ['React', 'TypeScript'],
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
        firstName: 'Samir',
        lastName: 'Odeh',
        email: 'samir@example.com',
        phone: '67890',
        location: 'Dubai',
        source: 'career_site',
        status: 'new',
        currentStage: 'applied',
        experience: 3,
        skills: ['Figma'],
        education: [],
        workExperience: [],
        appliedDate: '2026-03-18T00:00:00.000Z',
        lastActivityDate: '2026-03-21T00:00:00.000Z',
        createdAt: '2026-03-18T00:00:00.000Z',
        updatedAt: '2026-03-21T00:00:00.000Z',
      },
    ] as any);

    render(<ResumeParsingPage />);

    await waitFor(() => {
      expect(screen.getByText('Amina Khan')).toBeInTheDocument();
    });

    expect(screen.getByText('amina@example.com')).toBeInTheDocument();
    expect(screen.getByText('Resume on file')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.queryByText('Samir Odeh')).not.toBeInTheDocument();
  });

  it('shows an empty state when no resumes are available', async () => {
    render(<ResumeParsingPage />);

    await waitFor(() => {
      expect(screen.getByText('No parsed resumes yet. Upload a resume to get started.')).toBeInTheDocument();
    });
  });
});