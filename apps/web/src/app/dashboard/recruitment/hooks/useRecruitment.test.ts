/**
 * useRecruitment Hook Tests - Production Ready
 * Comprehensive test coverage for recruitment management business logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRecruitment } from './useRecruitment';
import type {
  JobRequisition,
  JobPosting,
  CandidateApplication,
  Interview,
  InterviewFeedback,
  JobOffer,
  BackgroundCheck,
  HiringPipeline,
  RecruitmentSettings,
  RecruitmentStats,
} from '../types';

// ============================================================================
// MOCKS
// ============================================================================

// Mock all recruitment services
vi.mock('../services', () => ({
  JobRequisitionService: {
    getRequisitions: vi.fn(() => Promise.resolve([])),
    createRequisition: vi.fn((data) => Promise.resolve(data)),
    updateRequisition: vi.fn((id, data) => Promise.resolve({ id, ...data })),
    approveRequisition: vi.fn((id, approverId, approverName, comments) =>
      Promise.resolve({
        id,
        status: 'approved',
        approvedBy: approverId,
        approvedDate: new Date().toISOString(),
      })
    ),
    rejectRequisition: vi.fn((id, approverId, approverName, comments) =>
      Promise.resolve({
        id,
        status: 'rejected',
        rejectedBy: approverId,
        rejectedDate: new Date().toISOString(),
      })
    ),
  },
  JobPostingService: {
    getPostings: vi.fn(() => Promise.resolve([])),
    createPosting: vi.fn((data) => Promise.resolve(data)),
    updatePosting: vi.fn((id, data) => Promise.resolve({ id, ...data })),
    publishPosting: vi.fn((id) => Promise.resolve({ id, status: 'published' })),
    unpublishPosting: vi.fn((id) => Promise.resolve({ id, status: 'unpublished' })),
  },
  CandidateApplicationService: {
    getApplications: vi.fn(() => Promise.resolve([])),
    createApplication: vi.fn((data) => Promise.resolve(data)),
    updateApplication: vi.fn((id, data) => Promise.resolve({ id, ...data })),
    moveApplicationToStage: vi.fn((id, stage) => Promise.resolve({ id, currentStage: stage })),
    rejectApplication: vi.fn((id, reason) =>
      Promise.resolve({ id, status: 'rejected', rejectionReason: reason })
    ),
  },
  InterviewService: {
    getInterviews: vi.fn(() => Promise.resolve([])),
    scheduleInterview: vi.fn((data) => Promise.resolve(data)),
    updateInterview: vi.fn((id, data) => Promise.resolve({ id, ...data })),
    cancelInterview: vi.fn((id, reason) =>
      Promise.resolve({ id, status: 'cancelled', cancellationReason: reason })
    ),
    completeInterview: vi.fn((id) => Promise.resolve({ id, status: 'completed' })),
  },
  InterviewFeedbackService: {
    getFeedback: vi.fn(() => Promise.resolve([])),
    submitFeedback: vi.fn((data) => Promise.resolve(data)),
  },
  JobOfferService: {
    getOffers: vi.fn(() => Promise.resolve([])),
    createOffer: vi.fn((data) => Promise.resolve(data)),
    approveOffer: vi.fn((id, approverId, approverName) =>
      Promise.resolve({ id, status: 'approved', approvedBy: approverId })
    ),
    sendOffer: vi.fn((id) => Promise.resolve({ id, status: 'sent', sentDate: new Date().toISOString() })),
    acceptOffer: vi.fn((id) =>
      Promise.resolve({ id, status: 'accepted', acceptedDate: new Date().toISOString() })
    ),
    declineOffer: vi.fn((id, reason) =>
      Promise.resolve({ id, status: 'declined', declineReason: reason })
    ),
  },
  BackgroundCheckService: {
    getBackgroundChecks: vi.fn(() => Promise.resolve([])),
    initiateBackgroundCheck: vi.fn((data) => Promise.resolve(data)),
    updateBackgroundCheck: vi.fn((id, data) => Promise.resolve({ id, ...data })),
  },
  HiringPipelineService: {
    getPipelines: vi.fn(() => Promise.resolve([])),
  },
  RecruitmentSettingsService: {
    getSettings: vi.fn(() => Promise.resolve(null)),
    updateSettings: vi.fn((data) => Promise.resolve(data)),
  },
  RecruitmentAnalyticsService: {
    getStats: vi.fn(() => Promise.resolve(null)),
  },
}));

// Mock sample data generators
vi.mock('../data', () => ({
  generateSampleRequisitions: vi.fn(() => []),
  generateSamplePostings: vi.fn(() => []),
  generateSampleApplications: vi.fn(() => []),
  generateSampleInterviews: vi.fn(() => []),
  generateSampleFeedback: vi.fn(() => []),
  generateSampleOffers: vi.fn(() => []),
  generateSampleBackgroundChecks: vi.fn(() => []),
  generateSamplePipelines: vi.fn(() => []),
  generateDefaultSettings: vi.fn(() => null),
}));

// Mock useToast hook
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock('./useToast', () => ({
  useToast: () => mockToast,
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockJobRequisition: JobRequisition = {
  id: 'req-001',
  positionTitle: 'Senior Software Engineer',
  departmentId: 'dept-001',
  departmentName: 'Engineering',
  hiringManagerId: 'mgr-001',
  hiringManagerName: 'John Manager',
  numberOfPositions: 2,
  employmentType: 'full-time',
  priority: 'high',
  budgetedSalaryMin: 100000,
  budgetedSalaryMax: 150000,
  justification: 'Team expansion',
  status: 'pending',
  createdDate: new Date().toISOString(),
  createdBy: 'user-001',
};

const mockJobPosting: JobPosting = {
  id: 'post-001',
  requisitionId: 'req-001',
  title: 'Senior Software Engineer',
  description: 'Looking for experienced software engineer',
  requirements: ['5+ years experience', 'React expertise'],
  responsibilities: ['Lead development', 'Mentor juniors'],
  benefits: ['Health insurance', '401k'],
  location: 'San Francisco, CA',
  employmentType: 'full-time',
  salaryRange: '$100k - $150k',
  status: 'draft',
  createdDate: new Date().toISOString(),
};

const mockApplication: CandidateApplication = {
  id: 'app-001',
  postingId: 'post-001',
  candidateName: 'Jane Candidate',
  candidateEmail: 'jane@example.com',
  candidatePhone: '555-0100',
  resumeUrl: 'https://example.com/resume.pdf',
  coverLetter: 'I am interested in this position',
  currentStage: 'screening',
  status: 'active',
  appliedDate: new Date().toISOString(),
  rating: 0,
};

const mockInterview: Interview = {
  id: 'int-001',
  applicationId: 'app-001',
  candidateName: 'Jane Candidate',
  candidateEmail: 'jane@example.com',
  interviewType: 'technical',
  round: 1,
  scheduledDate: new Date(Date.now() + 86400000).toISOString(),
  duration: 60,
  interviewers: [{ id: 'int-001', name: 'Tech Lead', email: 'lead@example.com' }],
  location: 'Zoom',
  status: 'scheduled',
  createdDate: new Date().toISOString(),
};

const mockInterviewFeedback: InterviewFeedback = {
  id: 'fb-001',
  interviewId: 'int-001',
  interviewerId: 'int-001',
  interviewerName: 'Tech Lead',
  applicationId: 'app-001',
  technicalSkills: 4,
  communication: 5,
  problemSolving: 4,
  cultureFit: 5,
  overallRating: 4.5,
  recommendation: 'hire',
  strengths: ['Strong technical skills', 'Good communicator'],
  weaknesses: ['Limited domain experience'],
  comments: 'Excellent candidate',
  submittedDate: new Date().toISOString(),
};

const mockJobOffer: JobOffer = {
  id: 'offer-001',
  applicationId: 'app-001',
  candidateName: 'Jane Candidate',
  candidateEmail: 'jane@example.com',
  positionTitle: 'Senior Software Engineer',
  departmentId: 'dept-001',
  departmentName: 'Engineering',
  employmentType: 'full-time',
  startDate: new Date(Date.now() + 2592000000).toISOString(),
  annualSalary: 125000,
  benefits: ['Health insurance', '401k'],
  status: 'draft',
  createdDate: new Date().toISOString(),
  createdBy: 'user-001',
};

const mockBackgroundCheck: BackgroundCheck = {
  id: 'bg-001',
  applicationId: 'app-001',
  candidateName: 'Jane Candidate',
  checkType: 'criminal',
  provider: 'BackgroundCheck Inc',
  status: 'pending',
  initiatedDate: new Date().toISOString(),
  initiatedBy: 'user-001',
};

// ============================================================================
// TESTS
// ============================================================================

describe('useRecruitment', () => {
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
      const { result } = renderHook(() => useRecruitment());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.jobRequisitions).toEqual([]);
      expect(result.current.jobPostings).toEqual([]);
      expect(result.current.applications).toEqual([]);
      expect(result.current.interviews).toEqual([]);
      expect(result.current.interviewFeedback).toEqual([]);
      expect(result.current.jobOffers).toEqual([]);
      expect(result.current.backgroundChecks).toEqual([]);
    });

    it('loads all recruitment data on mount', async () => {
      const { JobRequisitionService } = await import('../services');

      vi.mocked(JobRequisitionService.getRequisitions).mockResolvedValue([mockJobRequisition]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(JobRequisitionService.getRequisitions).toHaveBeenCalled();
      expect(result.current.jobRequisitions).toEqual([mockJobRequisition]);
    });

    it('initializes with sample data when no data exists', async () => {
      const { JobRequisitionService } = await import('../services');
      const { generateSampleRequisitions } = await import('../data');

      vi.mocked(JobRequisitionService.getRequisitions).mockResolvedValue([]);
      vi.mocked(generateSampleRequisitions).mockReturnValue([mockJobRequisition]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(generateSampleRequisitions).toHaveBeenCalled();
    });

    it('handles initialization errors gracefully', async () => {
      const { JobRequisitionService } = await import('../services');

      vi.mocked(JobRequisitionService.getRequisitions).mockRejectedValue(
        new Error('Failed to load data')
      );

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockToast.error).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // JOB REQUISITION OPERATIONS
  // ==========================================================================

  describe('Job Requisition Operations', () => {
    it('creates requisition successfully', async () => {
      const { JobRequisitionService } = await import('../services');

      vi.mocked(JobRequisitionService.getRequisitions).mockResolvedValue([]);
      vi.mocked(JobRequisitionService.createRequisition).mockResolvedValue(mockJobRequisition);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createRequisition(mockJobRequisition);
      });

      expect(JobRequisitionService.createRequisition).toHaveBeenCalledWith(mockJobRequisition);
      expect(result.current.jobRequisitions).toContainEqual(mockJobRequisition);
      expect(mockToast.success).toHaveBeenCalledWith('Job requisition created successfully!');
    });

    it('updates requisition successfully', async () => {
      const { JobRequisitionService } = await import('../services');

      vi.mocked(JobRequisitionService.getRequisitions).mockResolvedValue([mockJobRequisition]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates = { numberOfPositions: 3 };

      await act(async () => {
        await result.current.updateRequisition('req-001', updates);
      });

      expect(JobRequisitionService.updateRequisition).toHaveBeenCalledWith('req-001', updates);
      expect(mockToast.success).toHaveBeenCalledWith('Job requisition updated successfully!');
    });

    it('approves requisition successfully', async () => {
      const { JobRequisitionService } = await import('../services');

      vi.mocked(JobRequisitionService.getRequisitions).mockResolvedValue([mockJobRequisition]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.approveRequisition('req-001', 'mgr-002', 'VP', 'Approved');
      });

      expect(JobRequisitionService.approveRequisition).toHaveBeenCalledWith(
        'req-001',
        'mgr-002',
        'VP',
        'Approved'
      );
      expect(mockToast.success).toHaveBeenCalledWith('Job requisition approved successfully!');
    });

    it('rejects requisition successfully', async () => {
      const { JobRequisitionService } = await import('../services');

      vi.mocked(JobRequisitionService.getRequisitions).mockResolvedValue([mockJobRequisition]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.rejectRequisition('req-001', 'mgr-002', 'VP', 'Not approved');
      });

      expect(JobRequisitionService.rejectRequisition).toHaveBeenCalledWith(
        'req-001',
        'mgr-002',
        'VP',
        'Not approved'
      );
      expect(mockToast.success).toHaveBeenCalledWith('Job requisition rejected');
    });

    it('handles requisition creation errors', async () => {
      const { JobRequisitionService } = await import('../services');

      vi.mocked(JobRequisitionService.getRequisitions).mockResolvedValue([]);
      vi.mocked(JobRequisitionService.createRequisition).mockRejectedValue(
        new Error('Creation failed')
      );

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.createRequisition(mockJobRequisition);
        } catch (error) {
          // Expected error
        }
      });

      expect(mockToast.error).toHaveBeenCalledWith('Creation failed');
    });
  });

  // ==========================================================================
  // JOB POSTING OPERATIONS
  // ==========================================================================

  describe('Job Posting Operations', () => {
    it('creates posting successfully', async () => {
      const { JobPostingService } = await import('../services');

      vi.mocked(JobPostingService.getPostings).mockResolvedValue([]);
      vi.mocked(JobPostingService.createPosting).mockResolvedValue(mockJobPosting);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createPosting(mockJobPosting);
      });

      expect(JobPostingService.createPosting).toHaveBeenCalledWith(mockJobPosting);
      expect(result.current.jobPostings).toContainEqual(mockJobPosting);
      expect(mockToast.success).toHaveBeenCalledWith('Job posting created successfully!');
    });

    it('publishes posting successfully', async () => {
      const { JobPostingService } = await import('../services');

      vi.mocked(JobPostingService.getPostings).mockResolvedValue([mockJobPosting]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.publishPosting('post-001');
      });

      expect(JobPostingService.publishPosting).toHaveBeenCalledWith('post-001');
      expect(mockToast.success).toHaveBeenCalledWith('Job posting published successfully!');
    });

    it('unpublishes posting successfully', async () => {
      const { JobPostingService } = await import('../services');

      vi.mocked(JobPostingService.getPostings).mockResolvedValue([
        { ...mockJobPosting, status: 'published' },
      ]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.unpublishPosting('post-001');
      });

      expect(JobPostingService.unpublishPosting).toHaveBeenCalledWith('post-001');
      expect(mockToast.success).toHaveBeenCalledWith('Job posting unpublished');
    });
  });

  // ==========================================================================
  // CANDIDATE APPLICATION OPERATIONS
  // ==========================================================================

  describe('Candidate Application Operations', () => {
    it('creates application successfully', async () => {
      const { CandidateApplicationService } = await import('../services');

      vi.mocked(CandidateApplicationService.getApplications).mockResolvedValue([]);
      vi.mocked(CandidateApplicationService.createApplication).mockResolvedValue(mockApplication);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createApplication(mockApplication);
      });

      expect(CandidateApplicationService.createApplication).toHaveBeenCalledWith(mockApplication);
      expect(result.current.applications).toContainEqual(mockApplication);
      expect(mockToast.success).toHaveBeenCalledWith('Application submitted successfully!');
    });

    it('updates application successfully', async () => {
      const { CandidateApplicationService } = await import('../services');

      vi.mocked(CandidateApplicationService.getApplications).mockResolvedValue([mockApplication]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates = { rating: 4 };

      await act(async () => {
        await result.current.updateApplication('app-001', updates);
      });

      expect(CandidateApplicationService.updateApplication).toHaveBeenCalledWith(
        'app-001',
        updates
      );
      expect(mockToast.success).toHaveBeenCalledWith('Application updated successfully!');
    });

    it('moves application to new stage successfully', async () => {
      const { CandidateApplicationService } = await import('../services');

      vi.mocked(CandidateApplicationService.getApplications).mockResolvedValue([mockApplication]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.moveApplicationToStage('app-001', 'interview');
      });

      expect(CandidateApplicationService.moveApplicationToStage).toHaveBeenCalledWith(
        'app-001',
        'interview'
      );
      expect(mockToast.success).toHaveBeenCalledWith('Application moved to interview');
    });

    it('rejects application successfully', async () => {
      const { CandidateApplicationService } = await import('../services');

      vi.mocked(CandidateApplicationService.getApplications).mockResolvedValue([mockApplication]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.rejectApplication('app-001', 'Not a good fit');
      });

      expect(CandidateApplicationService.rejectApplication).toHaveBeenCalledWith(
        'app-001',
        'Not a good fit'
      );
      expect(mockToast.success).toHaveBeenCalledWith('Application rejected');
    });
  });

  // ==========================================================================
  // INTERVIEW OPERATIONS
  // ==========================================================================

  describe('Interview Operations', () => {
    it('schedules interview successfully', async () => {
      const { InterviewService } = await import('../services');

      vi.mocked(InterviewService.getInterviews).mockResolvedValue([]);
      vi.mocked(InterviewService.scheduleInterview).mockResolvedValue(mockInterview);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.scheduleInterview(mockInterview);
      });

      expect(InterviewService.scheduleInterview).toHaveBeenCalledWith(mockInterview);
      expect(result.current.interviews).toContainEqual(mockInterview);
      expect(mockToast.success).toHaveBeenCalledWith('Interview scheduled successfully!');
    });

    it('updates interview successfully', async () => {
      const { InterviewService } = await import('../services');

      vi.mocked(InterviewService.getInterviews).mockResolvedValue([mockInterview]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates = { duration: 90 };

      await act(async () => {
        await result.current.updateInterview('int-001', updates);
      });

      expect(InterviewService.updateInterview).toHaveBeenCalledWith('int-001', updates);
      expect(mockToast.success).toHaveBeenCalledWith('Interview updated successfully!');
    });

    it('cancels interview successfully', async () => {
      const { InterviewService } = await import('../services');

      vi.mocked(InterviewService.getInterviews).mockResolvedValue([mockInterview]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.cancelInterview('int-001', 'Candidate withdrew');
      });

      expect(InterviewService.cancelInterview).toHaveBeenCalledWith(
        'int-001',
        'Candidate withdrew'
      );
      expect(mockToast.success).toHaveBeenCalledWith('Interview cancelled');
    });

    it('completes interview successfully', async () => {
      const { InterviewService } = await import('../services');

      vi.mocked(InterviewService.getInterviews).mockResolvedValue([mockInterview]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.completeInterview('int-001');
      });

      expect(InterviewService.completeInterview).toHaveBeenCalledWith('int-001');
      expect(mockToast.success).toHaveBeenCalledWith('Interview marked as completed');
    });
  });

  // ==========================================================================
  // INTERVIEW FEEDBACK OPERATIONS
  // ==========================================================================

  describe('Interview Feedback Operations', () => {
    it('submits interview feedback successfully', async () => {
      const { InterviewFeedbackService } = await import('../services');

      vi.mocked(InterviewFeedbackService.getFeedback).mockResolvedValue([]);
      vi.mocked(InterviewFeedbackService.submitFeedback).mockResolvedValue(mockInterviewFeedback);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.submitInterviewFeedback(mockInterviewFeedback);
      });

      expect(InterviewFeedbackService.submitFeedback).toHaveBeenCalledWith(mockInterviewFeedback);
      expect(result.current.interviewFeedback).toContainEqual(mockInterviewFeedback);
      expect(mockToast.success).toHaveBeenCalledWith('Interview feedback submitted successfully!');
    });

    it('handles feedback submission errors', async () => {
      const { InterviewFeedbackService } = await import('../services');

      vi.mocked(InterviewFeedbackService.getFeedback).mockResolvedValue([]);
      vi.mocked(InterviewFeedbackService.submitFeedback).mockRejectedValue(
        new Error('Submission failed')
      );

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.submitInterviewFeedback(mockInterviewFeedback);
        } catch (error) {
          // Expected error
        }
      });

      expect(mockToast.error).toHaveBeenCalledWith('Submission failed');
    });
  });

  // ==========================================================================
  // JOB OFFER OPERATIONS
  // ==========================================================================

  describe('Job Offer Operations', () => {
    it('creates offer successfully', async () => {
      const { JobOfferService } = await import('../services');

      vi.mocked(JobOfferService.getOffers).mockResolvedValue([]);
      vi.mocked(JobOfferService.createOffer).mockResolvedValue(mockJobOffer);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createOffer(mockJobOffer);
      });

      expect(JobOfferService.createOffer).toHaveBeenCalledWith(mockJobOffer);
      expect(result.current.jobOffers).toContainEqual(mockJobOffer);
      expect(mockToast.success).toHaveBeenCalledWith('Job offer created successfully!');
    });

    it('approves offer successfully', async () => {
      const { JobOfferService } = await import('../services');

      vi.mocked(JobOfferService.getOffers).mockResolvedValue([mockJobOffer]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.approveOffer('offer-001', 'mgr-001', 'Manager');
      });

      expect(JobOfferService.approveOffer).toHaveBeenCalledWith('offer-001', 'mgr-001', 'Manager');
      expect(mockToast.success).toHaveBeenCalledWith('Job offer approved successfully!');
    });

    it('sends offer successfully', async () => {
      const { JobOfferService } = await import('../services');

      vi.mocked(JobOfferService.getOffers).mockResolvedValue([
        { ...mockJobOffer, status: 'approved' },
      ]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.sendOffer('offer-001');
      });

      expect(JobOfferService.sendOffer).toHaveBeenCalledWith('offer-001');
      expect(mockToast.success).toHaveBeenCalledWith('Job offer sent to candidate!');
    });

    it('accepts offer successfully', async () => {
      const { JobOfferService } = await import('../services');

      vi.mocked(JobOfferService.getOffers).mockResolvedValue([
        { ...mockJobOffer, status: 'sent' },
      ]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.acceptOffer('offer-001');
      });

      expect(JobOfferService.acceptOffer).toHaveBeenCalledWith('offer-001');
      expect(mockToast.success).toHaveBeenCalledWith('Job offer accepted!');
    });

    it('declines offer successfully', async () => {
      const { JobOfferService } = await import('../services');

      vi.mocked(JobOfferService.getOffers).mockResolvedValue([
        { ...mockJobOffer, status: 'sent' },
      ]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.declineOffer('offer-001', 'Accepted another position');
      });

      expect(JobOfferService.declineOffer).toHaveBeenCalledWith(
        'offer-001',
        'Accepted another position'
      );
      expect(mockToast.success).toHaveBeenCalledWith('Job offer declined');
    });
  });

  // ==========================================================================
  // BACKGROUND CHECK OPERATIONS
  // ==========================================================================

  describe('Background Check Operations', () => {
    it('initiates background check successfully', async () => {
      const { BackgroundCheckService } = await import('../services');

      vi.mocked(BackgroundCheckService.getBackgroundChecks).mockResolvedValue([]);
      vi.mocked(BackgroundCheckService.initiateBackgroundCheck).mockResolvedValue(
        mockBackgroundCheck
      );

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.initiateBackgroundCheck(mockBackgroundCheck);
      });

      expect(BackgroundCheckService.initiateBackgroundCheck).toHaveBeenCalledWith(
        mockBackgroundCheck
      );
      expect(result.current.backgroundChecks).toContainEqual(mockBackgroundCheck);
      expect(mockToast.success).toHaveBeenCalledWith('Background check initiated successfully!');
    });

    it('updates background check successfully', async () => {
      const { BackgroundCheckService } = await import('../services');

      vi.mocked(BackgroundCheckService.getBackgroundChecks).mockResolvedValue([
        mockBackgroundCheck,
      ]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates = { status: 'completed' as const, result: 'passed' as const };

      await act(async () => {
        await result.current.updateBackgroundCheck('bg-001', updates);
      });

      expect(BackgroundCheckService.updateBackgroundCheck).toHaveBeenCalledWith('bg-001', updates);
      expect(mockToast.success).toHaveBeenCalledWith('Background check updated successfully!');
    });

    it('handles background check errors', async () => {
      const { BackgroundCheckService } = await import('../services');

      vi.mocked(BackgroundCheckService.getBackgroundChecks).mockResolvedValue([]);
      vi.mocked(BackgroundCheckService.initiateBackgroundCheck).mockRejectedValue(
        new Error('Initiation failed')
      );

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.initiateBackgroundCheck(mockBackgroundCheck);
        } catch (error) {
          // Expected error
        }
      });

      expect(mockToast.error).toHaveBeenCalledWith('Initiation failed');
    });
  });

  // ==========================================================================
  // ANALYTICS OPERATIONS
  // ==========================================================================

  describe('Analytics Operations', () => {
    it('refreshes stats successfully', async () => {
      const { RecruitmentAnalyticsService } = await import('../services');

      const mockStats: RecruitmentStats = {
        totalRequisitions: 10,
        openRequisitions: 5,
        totalPostings: 8,
        activePostings: 6,
        totalApplications: 100,
        activeApplications: 75,
        totalInterviews: 30,
        completedInterviews: 20,
        totalOffers: 5,
        acceptedOffers: 3,
        timeToHireAvg: 30,
        timeToFillAvg: 45,
      };

      vi.mocked(RecruitmentAnalyticsService.getStats).mockResolvedValue(mockStats);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshStats();
      });

      expect(RecruitmentAnalyticsService.getStats).toHaveBeenCalled();
      expect(result.current.stats).toEqual(mockStats);
    });

    it('handles stats refresh errors', async () => {
      const { RecruitmentAnalyticsService } = await import('../services');

      vi.mocked(RecruitmentAnalyticsService.getStats).mockRejectedValue(
        new Error('Stats unavailable')
      );

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.refreshStats();
        } catch (error) {
          // Expected error
        }
      });

      expect(mockToast.error).toHaveBeenCalledWith('Stats unavailable');
    });
  });

  // ==========================================================================
  // LOADING STATES
  // ==========================================================================

  describe('Loading States', () => {
    it('sets isSaving during create operations', async () => {
      const { JobRequisitionService } = await import('../services');

      vi.mocked(JobRequisitionService.getRequisitions).mockResolvedValue([]);
      vi.mocked(JobRequisitionService.createRequisition).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockJobRequisition), 100);
          })
      );

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.createRequisition(mockJobRequisition);
      });

      expect(result.current.isSaving).toBe(true);

      await waitFor(() => {
        expect(result.current.isSaving).toBe(false);
      });
    });

    it('resets isSaving after save completes', async () => {
      const { JobRequisitionService } = await import('../services');

      vi.mocked(JobRequisitionService.getRequisitions).mockResolvedValue([]);
      vi.mocked(JobRequisitionService.createRequisition).mockResolvedValue(mockJobRequisition);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createRequisition(mockJobRequisition);
      });

      expect(result.current.isSaving).toBe(false);
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('handles empty service responses', async () => {
      const { JobRequisitionService, JobPostingService, CandidateApplicationService } =
        await import('../services');

      vi.mocked(JobRequisitionService.getRequisitions).mockResolvedValue([]);
      vi.mocked(JobPostingService.getPostings).mockResolvedValue([]);
      vi.mocked(CandidateApplicationService.getApplications).mockResolvedValue([]);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.jobRequisitions).toEqual([]);
      expect(result.current.jobPostings).toEqual([]);
      expect(result.current.applications).toEqual([]);
    });

    it('handles concurrent operations', async () => {
      const { JobRequisitionService } = await import('../services');

      vi.mocked(JobRequisitionService.getRequisitions).mockResolvedValue([]);
      vi.mocked(JobRequisitionService.createRequisition).mockResolvedValue(mockJobRequisition);

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await Promise.all([
          result.current.createRequisition(mockJobRequisition),
          result.current.createRequisition({ ...mockJobRequisition, id: 'req-002' }),
        ]);
      });

      expect(JobRequisitionService.createRequisition).toHaveBeenCalledTimes(2);
    });

    it('maintains data integrity after failed operations', async () => {
      const { JobRequisitionService } = await import('../services');

      vi.mocked(JobRequisitionService.getRequisitions).mockResolvedValue([mockJobRequisition]);
      vi.mocked(JobRequisitionService.updateRequisition).mockRejectedValue(
        new Error('Update failed')
      );

      const { result } = renderHook(() => useRecruitment());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const originalRequisitions = result.current.jobRequisitions;

      await act(async () => {
        try {
          await result.current.updateRequisition('req-001', { numberOfPositions: 5 });
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.jobRequisitions).toEqual(originalRequisitions);
    });
  });
});
