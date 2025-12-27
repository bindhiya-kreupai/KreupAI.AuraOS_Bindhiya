/**
 * useMeetings Hook Tests - Production Ready
 * Comprehensive test coverage for 1-on-1 meetings management business logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMeetings } from './useMeetings';
import type { Meeting, MeetingFeedback, MeetingAnalytics } from '../types';

// ============================================================================
// MOCKS
// ============================================================================

// Mock meetings service
vi.mock('../services', () => ({
  MeetingsService: {
    getMeetings: vi.fn(() => Promise.resolve([])),
    createMeeting: vi.fn((data) => Promise.resolve(data)),
    updateMeeting: vi.fn((id, data) => Promise.resolve({ id, ...data })),
    deleteMeeting: vi.fn(() => Promise.resolve()),
    completeMeeting: vi.fn((id) => Promise.resolve({ id, status: 'completed' })),
    submitFeedback: vi.fn((id, feedback) => Promise.resolve({ id, feedback })),
    getAnalytics: vi.fn(() => Promise.resolve(null)),
  },
}));

// Mock sample data generator
vi.mock('../data', () => ({
  generateSampleMeetings: vi.fn(() => []),
}));

// Mock useToast hook
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock('../hooks/useToast', () => ({
  useToast: () => mockToast,
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockMeeting: Meeting = {
  id: 'mtg-001',
  employeeId: 'emp-001',
  employeeName: 'John Employee',
  managerId: 'mgr-001',
  managerName: 'Jane Manager',
  scheduledDate: new Date(Date.now() + 86400000).toISOString(),
  duration: 60,
  location: 'Conference Room A',
  meetingType: '1-on-1',
  agenda: ['Career development', 'Current projects', 'Feedback'],
  status: 'scheduled',
  createdDate: new Date().toISOString(),
  createdBy: 'mgr-001',
};

const mockFeedback: MeetingFeedback = {
  meetingId: 'mtg-001',
  employeeFeedback: 'Great discussion about career goals',
  managerFeedback: 'Employee showed strong interest in leadership development',
  actionItems: ['Research leadership training programs', 'Schedule follow-up in 2 weeks'],
  employeeRating: 5,
  managerRating: 5,
  submittedDate: new Date().toISOString(),
  submittedBy: 'mgr-001',
};

const mockAnalytics: MeetingAnalytics = {
  totalMeetings: 50,
  completedMeetings: 45,
  upcomingMeetings: 5,
  averageDuration: 55,
  averageEmployeeRating: 4.5,
  averageManagerRating: 4.3,
  completionRate: 90,
  topAgendaItems: [
    { item: 'Career development', count: 30 },
    { item: 'Current projects', count: 40 },
    { item: 'Feedback', count: 35 },
  ],
};

// ============================================================================
// TESTS
// ============================================================================

describe('useMeetings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  describe('Initialization', () => {
    it('initializes with loading state', () => {
      const { result } = renderHook(() => useMeetings());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.meetings).toEqual([]);
    });

    it('loads all meetings on mount', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([mockMeeting]);

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(MeetingsService.getMeetings).toHaveBeenCalled();
      expect(result.current.meetings).toEqual([mockMeeting]);
    });

    it('initializes with sample data when no data exists', async () => {
      const { MeetingsService } = await import('../services');
      const { generateSampleMeetings } = await import('../data');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([]);
      vi.mocked(generateSampleMeetings).mockReturnValue([mockMeeting]);

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(generateSampleMeetings).toHaveBeenCalled();
    });

    it('handles initialization errors gracefully', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockRejectedValue(new Error('Failed to load data'));

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockToast.error).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // MEETING CRUD OPERATIONS
  // ==========================================================================

  describe('Meeting CRUD Operations', () => {
    it('creates meeting successfully', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([]);
      vi.mocked(MeetingsService.createMeeting).mockResolvedValue(mockMeeting);

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createMeeting(mockMeeting);
      });

      expect(MeetingsService.createMeeting).toHaveBeenCalledWith(mockMeeting);
      expect(result.current.meetings).toContainEqual(mockMeeting);
      expect(mockToast.success).toHaveBeenCalledWith('Meeting scheduled successfully!');
    });

    it('updates meeting successfully', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([mockMeeting]);

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates = { duration: 90 };

      await act(async () => {
        await result.current.updateMeeting('mtg-001', updates);
      });

      expect(MeetingsService.updateMeeting).toHaveBeenCalledWith('mtg-001', updates);
      expect(mockToast.success).toHaveBeenCalledWith('Meeting updated successfully!');
    });

    it('deletes meeting successfully', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([mockMeeting]);

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteMeeting('mtg-001');
      });

      expect(MeetingsService.deleteMeeting).toHaveBeenCalledWith('mtg-001');
      expect(result.current.meetings).not.toContainEqual(mockMeeting);
      expect(mockToast.success).toHaveBeenCalledWith('Meeting cancelled successfully!');
    });

    it('handles create errors', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([]);
      vi.mocked(MeetingsService.createMeeting).mockRejectedValue(new Error('Creation failed'));

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.createMeeting(mockMeeting);
        } catch (error) {
          // Expected error
        }
      });

      expect(mockToast.error).toHaveBeenCalledWith('Creation failed');
    });

    it('handles update errors', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([mockMeeting]);
      vi.mocked(MeetingsService.updateMeeting).mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.updateMeeting('mtg-001', { duration: 90 });
        } catch (error) {
          // Expected error
        }
      });

      expect(mockToast.error).toHaveBeenCalledWith('Update failed');
    });

    it('handles delete errors', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([mockMeeting]);
      vi.mocked(MeetingsService.deleteMeeting).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.deleteMeeting('mtg-001');
        } catch (error) {
          // Expected error
        }
      });

      expect(mockToast.error).toHaveBeenCalledWith('Delete failed');
    });
  });

  // ==========================================================================
  // MEETING COMPLETION
  // ==========================================================================

  describe('Meeting Completion', () => {
    it('completes meeting successfully', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([mockMeeting]);

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.completeMeeting('mtg-001');
      });

      expect(MeetingsService.completeMeeting).toHaveBeenCalledWith('mtg-001');
      expect(mockToast.success).toHaveBeenCalledWith('Meeting marked as completed!');
    });

    it('handles completion errors', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([mockMeeting]);
      vi.mocked(MeetingsService.completeMeeting).mockRejectedValue(
        new Error('Completion failed')
      );

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.completeMeeting('mtg-001');
        } catch (error) {
          // Expected error
        }
      });

      expect(mockToast.error).toHaveBeenCalledWith('Completion failed');
    });
  });

  // ==========================================================================
  // FEEDBACK OPERATIONS
  // ==========================================================================

  describe('Feedback Operations', () => {
    it('submits feedback successfully', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([mockMeeting]);

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.submitFeedback('mtg-001', mockFeedback);
      });

      expect(MeetingsService.submitFeedback).toHaveBeenCalledWith('mtg-001', mockFeedback);
      expect(mockToast.success).toHaveBeenCalledWith('Feedback submitted successfully!');
    });

    it('handles feedback submission errors', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([mockMeeting]);
      vi.mocked(MeetingsService.submitFeedback).mockRejectedValue(
        new Error('Submission failed')
      );

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.submitFeedback('mtg-001', mockFeedback);
        } catch (error) {
          // Expected error
        }
      });

      expect(mockToast.error).toHaveBeenCalledWith('Submission failed');
    });
  });

  // ==========================================================================
  // ANALYTICS OPERATIONS
  // ==========================================================================

  describe('Analytics Operations', () => {
    it('gets analytics successfully', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getAnalytics).mockResolvedValue(mockAnalytics);

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let analytics: MeetingAnalytics | null = null;

      await act(async () => {
        analytics = await result.current.getAnalytics();
      });

      expect(MeetingsService.getAnalytics).toHaveBeenCalled();
      expect(analytics).toEqual(mockAnalytics);
    });

    it('handles analytics errors', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getAnalytics).mockRejectedValue(new Error('Analytics failed'));

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.getAnalytics();
        } catch (error) {
          // Expected error
        }
      });

      expect(mockToast.error).toHaveBeenCalledWith('Analytics failed');
    });
  });

  // ==========================================================================
  // LOADING STATES
  // ==========================================================================

  describe('Loading States', () => {
    it('sets isSaving during create operations', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([]);
      vi.mocked(MeetingsService.createMeeting).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockMeeting), 100);
          })
      );

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.createMeeting(mockMeeting);
      });

      expect(result.current.isSaving).toBe(true);

      await waitFor(() => {
        expect(result.current.isSaving).toBe(false);
      });
    });

    it('resets isSaving after save completes', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([]);
      vi.mocked(MeetingsService.createMeeting).mockResolvedValue(mockMeeting);

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createMeeting(mockMeeting);
      });

      expect(result.current.isSaving).toBe(false);
    });

    it('resets isSaving after errors', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([]);
      vi.mocked(MeetingsService.createMeeting).mockRejectedValue(new Error('Creation failed'));

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.createMeeting(mockMeeting);
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.isSaving).toBe(false);
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('handles empty service responses', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([]);

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.meetings).toEqual([]);
    });

    it('handles concurrent operations', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([]);
      vi.mocked(MeetingsService.createMeeting).mockResolvedValue(mockMeeting);

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await Promise.all([
          result.current.createMeeting(mockMeeting),
          result.current.createMeeting({ ...mockMeeting, id: 'mtg-002' }),
        ]);
      });

      expect(MeetingsService.createMeeting).toHaveBeenCalledTimes(2);
    });

    it('maintains data integrity after failed operations', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([mockMeeting]);
      vi.mocked(MeetingsService.updateMeeting).mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const originalMeetings = result.current.meetings;

      await act(async () => {
        try {
          await result.current.updateMeeting('mtg-001', { duration: 90 });
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.meetings).toEqual(originalMeetings);
    });

    it('handles null analytics gracefully', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getAnalytics).mockResolvedValue(null);

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let analytics: MeetingAnalytics | null = null;

      await act(async () => {
        analytics = await result.current.getAnalytics();
      });

      expect(analytics).toBeNull();
    });

    it('handles meeting updates with partial data', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([mockMeeting]);

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const partialUpdate = { location: 'Conference Room B' };

      await act(async () => {
        await result.current.updateMeeting('mtg-001', partialUpdate);
      });

      expect(MeetingsService.updateMeeting).toHaveBeenCalledWith('mtg-001', partialUpdate);
      expect(mockToast.success).toHaveBeenCalledWith('Meeting updated successfully!');
    });
  });

  // ==========================================================================
  // INTEGRATION SCENARIOS
  // ==========================================================================

  describe('Integration Scenarios', () => {
    it('completes full meeting workflow: create -> complete -> feedback', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([]);
      vi.mocked(MeetingsService.createMeeting).mockResolvedValue(mockMeeting);

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Create meeting
      await act(async () => {
        await result.current.createMeeting(mockMeeting);
      });

      expect(result.current.meetings).toContainEqual(mockMeeting);

      // Complete meeting
      await act(async () => {
        await result.current.completeMeeting('mtg-001');
      });

      expect(MeetingsService.completeMeeting).toHaveBeenCalledWith('mtg-001');

      // Submit feedback
      await act(async () => {
        await result.current.submitFeedback('mtg-001', mockFeedback);
      });

      expect(MeetingsService.submitFeedback).toHaveBeenCalledWith('mtg-001', mockFeedback);
      expect(mockToast.success).toHaveBeenCalledTimes(3);
    });

    it('handles reschedule workflow: update -> notify', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([mockMeeting]);

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newDate = new Date(Date.now() + 172800000).toISOString();

      await act(async () => {
        await result.current.updateMeeting('mtg-001', {
          scheduledDate: newDate,
        });
      });

      expect(MeetingsService.updateMeeting).toHaveBeenCalledWith('mtg-001', {
        scheduledDate: newDate,
      });
      expect(mockToast.success).toHaveBeenCalledWith('Meeting updated successfully!');
    });

    it('handles cancellation workflow: delete meeting', async () => {
      const { MeetingsService } = await import('../services');

      vi.mocked(MeetingsService.getMeetings).mockResolvedValue([mockMeeting]);

      const { result } = renderHook(() => useMeetings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.meetings).toHaveLength(1);

      await act(async () => {
        await result.current.deleteMeeting('mtg-001');
      });

      expect(MeetingsService.deleteMeeting).toHaveBeenCalledWith('mtg-001');
      expect(result.current.meetings).toHaveLength(0);
      expect(mockToast.success).toHaveBeenCalledWith('Meeting cancelled successfully!');
    });
  });
});
