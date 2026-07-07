// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const getInstances = vi.fn();
const updateTaskStatus = vi.fn();

vi.mock('@/app/dashboard/onboarding/services', () => ({
  OnboardingInstanceService: {
    getInstances: (...args: unknown[]) => getInstances(...args),
  },
  OnboardingTaskService: {
    updateTaskStatus: (...args: unknown[]) => updateTaskStatus(...args),
  },
}));

import Page from '@/app/dashboard/onboarding/induction-program/page';

const instanceWithTask = {
  id: 'inst-1',
  status: 'in_progress',
  currentPhase: 'first_day',
  tasks: [
    {
      id: 'task-1',
      taskName: 'Complete IT setup',
      description: '',
      phase: 'first_day',
      status: 'pending',
    },
  ],
};

beforeEach(() => {
  getInstances.mockReset();
  updateTaskStatus.mockReset();
});

describe('Induction Program page', () => {
  it('renders phase tasks from the active instance', async () => {
    getInstances.mockResolvedValue([instanceWithTask]);
    render(<Page />);
    await waitFor(() => expect(screen.getByText(/Complete IT setup/i)).toBeInTheDocument());
    expect(screen.getByText(/Induction Program/i)).toBeInTheDocument();
  });

  it('persists a task status change and refreshes', async () => {
    const user = userEvent.setup();
    getInstances.mockResolvedValue([instanceWithTask]);
    updateTaskStatus.mockResolvedValue({ id: 'task-1', status: 'completed' });

    render(<Page />);
    await waitFor(() => expect(screen.getByText(/Complete IT setup/i)).toBeInTheDocument());

    const toggle = screen.getByRole('button', { name: /Complete Complete IT setup/i });
    await user.click(toggle);

    await waitFor(() => expect(updateTaskStatus).toHaveBeenCalled());
    expect(updateTaskStatus).toHaveBeenCalledWith('task-1', 'completed');
    // load() re-runs after mutation (initial + refresh)
    expect(getInstances.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('shows empty state when no instances exist', async () => {
    getInstances.mockResolvedValue([]);
    render(<Page />);
    await waitFor(() => expect(screen.getByText(/No Induction Program/i)).toBeInTheDocument());
  });
});
