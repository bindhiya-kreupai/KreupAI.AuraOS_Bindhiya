// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import JobRequisitionsPage from './page';

vi.mock('../services', () => ({
  JobRequisitionService: {
    getRequisitions: vi.fn(() => Promise.resolve([])),
  },
}));

describe('JobRequisitionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders requisitions from the live requisition contract', async () => {
    const { JobRequisitionService } = await import('../services');

    vi.mocked(JobRequisitionService.getRequisitions).mockResolvedValueOnce([
      {
        id: 'req-1',
        requisitionNumber: 'REQ-1',
        jobTitle: 'Senior Product Designer',
        departmentId: 'dep-1',
        departmentName: 'Design',
        locationId: 'loc-1',
        locationName: 'Dubai',
        hiringManagerId: 'mgr-1',
        hiringManagerName: 'Mona Aziz',
        jobType: 'full_time',
        experienceLevel: 'mid_level',
        employmentMode: 'onsite',
        numberOfPositions: 2,
        positionsFilled: 0,
        status: 'pending_approval',
        priority: 'high',
        jobDescription: 'Design product experiences',
        responsibilities: [],
        qualifications: [],
        skills: [],
        salaryRange: { min: 20000, max: 26000, currency: 'AED' },
        requestedDate: '2026-03-20T00:00:00.000Z',
        createdAt: '2026-03-20T00:00:00.000Z',
        updatedAt: '2026-03-21T00:00:00.000Z',
      },
    ] as any);

    render(<JobRequisitionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Senior Product Designer')).toBeInTheDocument();
    });

    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Dubai')).toBeInTheDocument();
    expect(screen.getAllByText('Pending Approval').length).toBeGreaterThan(0);
    expect(screen.getByText(/Requested by: Mona Aziz/)).toBeInTheDocument();
    expect(screen.getByText('AED 20,000 - 26,000')).toBeInTheDocument();
  });

  it('shows an empty state when there are no requisitions', async () => {
    render(<JobRequisitionsPage />);

    await waitFor(() => {
      expect(screen.getByText('No requisitions found')).toBeInTheDocument();
    });
  });
});