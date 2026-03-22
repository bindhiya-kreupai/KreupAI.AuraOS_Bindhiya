// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRecruitment } from './useRecruitment';

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock('./useToast', () => ({
  useToast: () => mockToast,
}));

vi.mock('../services', () => ({
  JobRequisitionService: {
    getRequisitions: vi.fn(() => Promise.resolve([])),
    createRequisition: vi.fn(),
  },
  JobPostingService: {
    getPostings: vi.fn(() => Promise.resolve([])),
    createPosting: vi.fn(),
  },
  CandidateApplicationService: {
    getApplications: vi.fn(() => Promise.resolve([])),
    createApplication: vi.fn(),
  },
  InterviewService: {
    getInterviews: vi.fn(() => Promise.resolve([])),
    scheduleInterview: vi.fn(),
  },
  InterviewFeedbackService: {
    submitFeedback: vi.fn(),
  },
  JobOfferService: {
    getOffers: vi.fn(() => Promise.resolve([])),
    createOffer: vi.fn(),
  },
  BackgroundCheckService: {
    getBackgroundChecks: vi.fn(() => Promise.resolve([])),
    initiateBackgroundCheck: vi.fn(),
  },
  HiringPipelineService: {
    getPipelines: vi.fn(() => Promise.resolve([])),
  },
  RecruitmentSettingsService: {
    getSettings: vi.fn(() => Promise.resolve(null)),
  },
  RecruitmentAnalyticsService: {
    getStats: vi.fn(() => Promise.resolve(null)),
  },
}));

describe('useRecruitment initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps empty API responses empty instead of seeding sample data', async () => {
    const services = await import('../services');
    const { result } = renderHook(() => useRecruitment());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.jobRequisitions).toEqual([]);
    expect(result.current.jobPostings).toEqual([]);
    expect(result.current.applications).toEqual([]);
    expect(result.current.interviews).toEqual([]);
    expect(result.current.interviewFeedback).toEqual([]);
    expect(result.current.jobOffers).toEqual([]);
    expect(result.current.backgroundChecks).toEqual([]);
    expect(result.current.hiringPipelines).toEqual([]);
    expect(result.current.settings).toBeNull();
    expect(result.current.stats).toBeNull();

    expect(services.JobRequisitionService.createRequisition).not.toHaveBeenCalled();
    expect(services.JobPostingService.createPosting).not.toHaveBeenCalled();
    expect(services.CandidateApplicationService.createApplication).not.toHaveBeenCalled();
    expect(services.InterviewService.scheduleInterview).not.toHaveBeenCalled();
    expect(services.JobOfferService.createOffer).not.toHaveBeenCalled();
    expect(services.BackgroundCheckService.initiateBackgroundCheck).not.toHaveBeenCalled();
    expect(mockToast.error).not.toHaveBeenCalled();
  });
});