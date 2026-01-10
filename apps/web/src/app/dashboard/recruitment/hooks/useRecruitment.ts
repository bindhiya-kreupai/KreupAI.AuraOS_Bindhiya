/**
 * useRecruitment Hook
 * 
 * Centralized business logic and state management for the Recruitment module.
 * Provides methods for managing job requisitions, applications, interviews, offers, and more.
 */

import { useState, useEffect, useCallback } from 'react';
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
    RequisitionStatus,
    ApplicationStatus,
    OfferStatus,
} from '../types';
import {
    JobRequisitionService,
    JobPostingService,
    CandidateApplicationService,
    InterviewService,
    InterviewFeedbackService,
    JobOfferService,
    BackgroundCheckService,
    HiringPipelineService,
    RecruitmentSettingsService,
    RecruitmentAnalyticsService,
} from '../services';
import {
    generateSampleJobRequisitions,
    generateSampleJobPostings,
    generateSampleApplications,
    generateSampleInterviews,
    generateSampleInterviewFeedback,
    generateSampleJobOffers,
    generateSampleBackgroundChecks,
    generateSampleHiringPipelines,
    generateSampleRecruitmentSettings,
} from '../data';
import { useToast } from './useToast';

export const useRecruitment = () => {
    const [jobRequisitions, setJobRequisitions] = useState<JobRequisition[]>([]);
    const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
    const [applications, setApplications] = useState<CandidateApplication[]>([]);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [interviewFeedback, setInterviewFeedback] = useState<InterviewFeedback[]>([]);
    const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
    const [backgroundChecks, setBackgroundChecks] = useState<BackgroundCheck[]>([]);
    const [hiringPipelines, setHiringPipelines] = useState<HiringPipeline[]>([]);
    const [settings, setSettings] = useState<RecruitmentSettings | null>(null);
    const [stats, setStats] = useState<RecruitmentStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    // Initialize data
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            setIsLoading(true);
            const [
                requisitionsData,
                postingsData,
                applicationsData,
                interviewsData,
                feedbackData,
                offersData,
                checksData,
                pipelinesData,
                settingsData,
                statsData,
            ] = await Promise.all([
                JobRequisitionService.getRequisitions(),
                JobPostingService.getPostings(),
                CandidateApplicationService.getApplications(),
                InterviewService.getInterviews(),
                Promise.resolve(generateSampleInterviewFeedback()),
                JobOfferService.getOffers(),
                BackgroundCheckService.getBackgroundChecks(),
                HiringPipelineService.getPipelines(),
                RecruitmentSettingsService.getSettings(),
                RecruitmentAnalyticsService.getStats(),
            ]);

            // Initialize with sample data if empty
            if (requisitionsData.length === 0) {
                const sampleReqs = generateSampleJobRequisitions();
                for (const req of sampleReqs) {
                    await JobRequisitionService.createRequisition(req);
                }
                setJobRequisitions(sampleReqs);
            } else {
                setJobRequisitions(requisitionsData);
            }

            if (postingsData.length === 0) {
                const samplePostings = generateSampleJobPostings();
                for (const posting of samplePostings) {
                    await JobPostingService.createPosting(posting);
                }
                setJobPostings(samplePostings);
            } else {
                setJobPostings(postingsData);
            }

            if (applicationsData.length === 0) {
                const sampleApps = generateSampleApplications();
                for (const app of sampleApps) {
                    await CandidateApplicationService.createApplication(app);
                }
                setApplications(sampleApps);
            } else {
                setApplications(applicationsData);
            }

            if (interviewsData.length === 0) {
                const sampleInterviews = generateSampleInterviews();
                for (const interview of sampleInterviews) {
                    await InterviewService.scheduleInterview(interview);
                }
                setInterviews(sampleInterviews);
            } else {
                setInterviews(interviewsData);
            }

            setInterviewFeedback(feedbackData);

            if (offersData.length === 0) {
                const sampleOffers = generateSampleJobOffers();
                for (const offer of sampleOffers) {
                    await JobOfferService.createOffer(offer);
                }
                setJobOffers(sampleOffers);
            } else {
                setJobOffers(offersData);
            }

            if (checksData.length === 0) {
                const sampleChecks = generateSampleBackgroundChecks();
                for (const check of sampleChecks) {
                    await BackgroundCheckService.initiateBackgroundCheck(check);
                }
                setBackgroundChecks(sampleChecks);
            } else {
                setBackgroundChecks(checksData);
            }

            if (pipelinesData.length === 0) {
                const samplePipelines = generateSampleHiringPipelines();
                setHiringPipelines(samplePipelines);
            } else {
                setHiringPipelines(pipelinesData);
            }

            if (!settingsData) {
                const sampleSettings = generateSampleRecruitmentSettings();
                setSettings(sampleSettings);
            } else {
                setSettings(settingsData);
            }

            setStats(statsData);
        } catch (error) {
            toast.error('Failed to load recruitment data');
            console.error('Load error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Job Requisition Methods
    const createRequisition = useCallback(async (data: JobRequisition) => {
        try {
            setIsSaving(true);
            const created = await JobRequisitionService.createRequisition(data);
            setJobRequisitions(prev => [...prev, created]);
            toast.success('Job requisition created successfully!');
            return created;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to create requisition');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateRequisition = useCallback(async (id: string, updates: Partial<JobRequisition>) => {
        try {
            setIsSaving(true);
            const updated = await JobRequisitionService.updateRequisition(id, updates);
            setJobRequisitions(prev => prev.map(r => r.id === id ? updated : r));
            toast.success('Requisition updated successfully!');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to update requisition');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const approveRequisition = useCallback(async (id: string, approvedBy: string) => {
        try {
            setIsSaving(true);
            const approved = await JobRequisitionService.approveRequisition(id, approvedBy);
            setJobRequisitions(prev => prev.map(r => r.id === id ? approved : r));
            toast.success('Requisition approved!');
            return approved;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to approve requisition');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const rejectRequisition = useCallback(async (id: string, reason: string) => {
        try {
            setIsSaving(true);
            const rejected = await JobRequisitionService.rejectRequisition(id, reason);
            setJobRequisitions(prev => prev.map(r => r.id === id ? rejected : r));
            toast.success('Requisition rejected');
            return rejected;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to reject requisition');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Job Posting Methods
    const createPosting = useCallback(async (data: JobPosting) => {
        try {
            setIsSaving(true);
            const created = await JobPostingService.createPosting(data);
            setJobPostings(prev => [...prev, created]);
            toast.success('Job posting created!');
            return created;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to create posting');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const publishPosting = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            const published = await JobPostingService.publishPosting(id);
            setJobPostings(prev => prev.map(p => p.id === id ? published : p));
            toast.success('Job posting published!');
            return published;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to publish posting');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const unpublishPosting = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            const unpublished = await JobPostingService.unpublishPosting(id);
            setJobPostings(prev => prev.map(p => p.id === id ? unpublished : p));
            toast.success('Job posting unpublished');
            return unpublished;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to unpublish posting');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Application Methods
    const createApplication = useCallback(async (data: CandidateApplication) => {
        try {
            setIsSaving(true);
            const created = await CandidateApplicationService.createApplication(data);
            setApplications(prev => [...prev, created]);
            toast.success('Application submitted!');
            return created;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to submit application');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateApplication = useCallback(async (id: string, updates: Partial<CandidateApplication>) => {
        try {
            setIsSaving(true);
            const updated = await CandidateApplicationService.updateApplication(id, updates);
            setApplications(prev => prev.map(a => a.id === id ? updated : a));
            toast.success('Application updated!');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to update application');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const moveApplicationToStage = useCallback(async (id: string, stage: string, status: ApplicationStatus) => {
        try {
            setIsSaving(true);
            const updated = await CandidateApplicationService.moveToStage(id, stage, status);
            setApplications(prev => prev.map(a => a.id === id ? updated : a));
            toast.success(`Application moved to ${stage}`);
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to move application');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const rejectApplication = useCallback(async (id: string, reason: string, notes?: string) => {
        try {
            setIsSaving(true);
            const rejected = await CandidateApplicationService.rejectApplication(id, reason, notes);
            setApplications(prev => prev.map(a => a.id === id ? rejected : a));
            toast.success('Application rejected');
            return rejected;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to reject application');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Interview Methods
    const scheduleInterview = useCallback(async (data: Interview) => {
        try {
            setIsSaving(true);
            const scheduled = await InterviewService.scheduleInterview(data);
            setInterviews(prev => [...prev, scheduled]);
            toast.success('Interview scheduled!');
            return scheduled;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to schedule interview');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateInterview = useCallback(async (id: string, updates: Partial<Interview>) => {
        try {
            setIsSaving(true);
            const updated = await InterviewService.updateInterview(id, updates);
            setInterviews(prev => prev.map(i => i.id === id ? updated : i));
            toast.success('Interview updated!');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to update interview');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const cancelInterview = useCallback(async (id: string, reason?: string) => {
        try {
            setIsSaving(true);
            const cancelled = await InterviewService.cancelInterview(id, reason);
            setInterviews(prev => prev.map(i => i.id === id ? cancelled : i));
            toast.success('Interview cancelled');
            return cancelled;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to cancel interview');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const completeInterview = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            const completed = await InterviewService.completeInterview(id);
            setInterviews(prev => prev.map(i => i.id === id ? completed : i));
            toast.success('Interview marked as completed');
            return completed;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to complete interview');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Interview Feedback Methods
    const submitInterviewFeedback = useCallback(async (data: InterviewFeedback) => {
        try {
            setIsSaving(true);
            const submitted = await InterviewFeedbackService.submitFeedback(data);
            setInterviewFeedback(prev => [...prev, submitted]);
            toast.success('Interview feedback submitted!');
            return submitted;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to submit feedback');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Job Offer Methods
    const createOffer = useCallback(async (data: JobOffer) => {
        try {
            setIsSaving(true);
            const created = await JobOfferService.createOffer(data);
            setJobOffers(prev => [...prev, created]);
            toast.success('Job offer created!');
            return created;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to create offer');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const approveOffer = useCallback(async (id: string, approvedBy: string) => {
        try {
            setIsSaving(true);
            const approved = await JobOfferService.approveOffer(id, approvedBy);
            setJobOffers(prev => prev.map(o => o.id === id ? approved : o));
            toast.success('Offer approved!');
            return approved;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to approve offer');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const sendOffer = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            const sent = await JobOfferService.sendOffer(id);
            setJobOffers(prev => prev.map(o => o.id === id ? sent : o));
            toast.success('Offer sent to candidate!');
            return sent;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to send offer');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const acceptOffer = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            const accepted = await JobOfferService.acceptOffer(id);
            setJobOffers(prev => prev.map(o => o.id === id ? accepted : o));
            toast.success('Offer accepted!');
            return accepted;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to accept offer');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const declineOffer = useCallback(async (id: string, reason?: string) => {
        try {
            setIsSaving(true);
            const declined = await JobOfferService.declineOffer(id, reason);
            setJobOffers(prev => prev.map(o => o.id === id ? declined : o));
            toast.success('Offer declined');
            return declined;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to decline offer');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Background Check Methods
    const initiateBackgroundCheck = useCallback(async (data: BackgroundCheck) => {
        try {
            setIsSaving(true);
            const initiated = await BackgroundCheckService.initiateBackgroundCheck(data);
            setBackgroundChecks(prev => [...prev, initiated]);
            toast.success('Background check initiated!');
            return initiated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to initiate background check');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateBackgroundCheck = useCallback(async (id: string, updates: Partial<BackgroundCheck>) => {
        try {
            setIsSaving(true);
            const updated = await BackgroundCheckService.updateBackgroundCheck(id, updates);
            setBackgroundChecks(prev => prev.map(c => c.id === id ? updated : c));
            toast.success('Background check updated!');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to update background check');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Analytics Methods
    const refreshStats = useCallback(async () => {
        try {
            const statsData = await RecruitmentAnalyticsService.getStats();
            setStats(statsData);
        } catch (error) {
            toast.error('Failed to refresh statistics');
            console.error('Stats error:', error);
        }
    }, [toast]);

    return {
        // State
        jobRequisitions,
        jobPostings,
        applications,
        interviews,
        interviewFeedback,
        jobOffers,
        backgroundChecks,
        hiringPipelines,
        settings,
        stats,
        isLoading,
        isSaving,

        // Job Requisition Methods
        createRequisition,
        updateRequisition,
        approveRequisition,
        rejectRequisition,

        // Job Posting Methods
        createPosting,
        publishPosting,
        unpublishPosting,

        // Application Methods
        createApplication,
        updateApplication,
        moveApplicationToStage,
        rejectApplication,

        // Interview Methods
        scheduleInterview,
        updateInterview,
        cancelInterview,
        completeInterview,

        // Interview Feedback Methods
        submitInterviewFeedback,

        // Job Offer Methods
        createOffer,
        approveOffer,
        sendOffer,
        acceptOffer,
        declineOffer,

        // Background Check Methods
        initiateBackgroundCheck,
        updateBackgroundCheck,

        // Analytics Methods
        refreshStats,
    };
};
