// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import BackgroundVerificationPage from './page';

vi.mock('../services', () => ({
  BackgroundCheckService: {
    getBackgroundChecks: vi.fn(() => Promise.resolve([])),
    initiateBackgroundCheck: vi.fn(() => Promise.resolve({})),
  },
}));

describe('BackgroundVerificationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders live background checks and derives connected vendors from them', async () => {
    const { BackgroundCheckService } = await import('../services');

    vi.mocked(BackgroundCheckService.getBackgroundChecks).mockResolvedValueOnce([
      {
        id: 'bg-1',
        applicationId: 'app-1',
        candidateName: 'Lina Omar',
        status: 'in-progress',
        checks: [],
        vendorName: 'Checkr',
        requestedDate: '2026-03-20T00:00:00.000Z',
        createdAt: '2026-03-20T00:00:00.000Z',
        updatedAt: '2026-03-21T00:00:00.000Z',
        checkType: 'criminal',
        candidateId: 'cand-12345678',
        requestDate: '2026-03-20T00:00:00.000Z',
        result: 'clear',
      },
      {
        id: 'bg-2',
        applicationId: 'app-2',
        candidateName: 'Yousef Adel',
        status: 'completed',
        checks: [],
        vendorName: 'HireRight',
        requestedDate: '2026-03-18T00:00:00.000Z',
        completedDate: '2026-03-21T00:00:00.000Z',
        createdAt: '2026-03-18T00:00:00.000Z',
        updatedAt: '2026-03-21T00:00:00.000Z',
        checkType: 'education',
        candidateId: 'cand-87654321',
        requestDate: '2026-03-18T00:00:00.000Z',
        result: 'flagged',
      },
    ] as any);

    render(<BackgroundVerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('criminal')).toBeInTheDocument();
    });

    expect(screen.getByText('Checkr')).toBeInTheDocument();
    expect(screen.getByText('HireRight')).toBeInTheDocument();
    expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Result:/).length).toBeGreaterThan(0);
  });

  it('shows truthful empty states when there are no checks or vendors', async () => {
    render(<BackgroundVerificationPage />);

    await waitFor(() => {
      expect(screen.getByText('No background checks')).toBeInTheDocument();
    });

    expect(screen.getByText('No connected vendors available from live background check data yet.')).toBeInTheDocument();
  });
});