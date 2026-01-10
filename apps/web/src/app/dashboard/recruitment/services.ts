/**
 * Recruitment Module - Service Layer
 *
 * API-integrated service classes using APIClient pattern.
 */
/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

import { APIClient } from '@/lib/api-client';
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
} from './types';

export class JobRequisitionService {
    private static endpoint = '/recruitment/requisitions';

    static async getRequisitions(filters?: { status?: RequisitionStatus; departmentId?: string }): Promise<JobRequisition[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.status) params.append('status', filters.status);
            if (filters?.departmentId) params.append('departmentId', filters.departmentId);

            const queryString = params.toString();
            const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

            const response = await APIClient.get<{ items?: JobRequisition[] }>(url);
            return response.items || [];
        } catch (error) {
                        return [];
        }
    }

    static async createRequisition(data: JobRequisition): Promise<JobRequisition> {
        const response = await APIClient.post<JobRequisition>(this.endpoint, data);
        return response;
    }

    static async updateRequisition(id: string, updates: Partial<JobRequisition>): Promise<JobRequisition> {
        const response = await APIClient.put<JobRequisition>(`${this.endpoint}/${id}`, updates);
        return response;
    }

    static async approveRequisition(id: string, approvedBy: string): Promise<JobRequisition> {
        return this.updateRequisition(id, {
            status: 'approved',
            approvedDate: new Date().toISOString(),
            approvedBy,
        });
    }

    static async rejectRequisition(id: string, reason: string): Promise<JobRequisition> {
        return this.updateRequisition(id, {
            status: 'rejected',
            rejectionReason: reason,
        });
    }
}

export class JobPostingService {
    private static endpoint = '/recruitment/jobs';

    static async getPostings(filters?: { isActive?: boolean }): Promise<JobPosting[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

            const queryString = params.toString();
            const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

            const response = await APIClient.get<{ data?: JobPosting[] }>(url);
            return response.data || [];
        } catch (error) {
            console.error('Failed to fetch job postings:', error);
            return [];
        }
    }

    static async createPosting(data: JobPosting): Promise<JobPosting> {
        const response = await APIClient.post<{ data?: JobPosting } | JobPosting>(this.endpoint, data);
        // Handle both {data: {...}} and direct object responses
        return (response as any).data || response;
    }

    static async updatePosting(id: string, updates: Partial<JobPosting>): Promise<JobPosting> {
        const response = await APIClient.put<JobPosting>(`${this.endpoint}/${id}`, updates);
        return response;
    }

    static async publishPosting(id: string): Promise<JobPosting> {
        return this.updatePosting(id, {
            isActive: true,
            publishedDate: new Date().toISOString(),
        });
    }

    static async unpublishPosting(id: string): Promise<JobPosting> {
        return this.updatePosting(id, { isActive: false });
    }
}

export class CandidateApplicationService {
    private static endpoint = '/recruitment/applications';

    static async getApplications(filters?: { jobPostingId?: string; status?: ApplicationStatus }): Promise<CandidateApplication[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.jobPostingId) params.append('jobPostingId', filters.jobPostingId);
            if (filters?.status) params.append('status', filters.status);

            const queryString = params.toString();
            const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

            const response = await APIClient.get<{ data?: CandidateApplication[] }>(url);
            return response.data || [];
        } catch (error) {
            console.error('Failed to fetch applications:', error);
            return [];
        }
    }

    static async createApplication(data: CandidateApplication): Promise<CandidateApplication> {
        const response = await APIClient.post<CandidateApplication>(this.endpoint, data);
        return response;
    }

    static async updateApplication(id: string, updates: Partial<CandidateApplication>): Promise<CandidateApplication> {
        const response = await APIClient.put<CandidateApplication>(`${this.endpoint}/${id}`, updates);
        return response;
    }

    static async moveToStage(id: string, stage: string, status: ApplicationStatus): Promise<CandidateApplication> {
        return this.updateApplication(id, { currentStage: stage, status });
    }

    static async rejectApplication(id: string, reason: string, notes?: string): Promise<CandidateApplication> {
        return this.updateApplication(id, {
            status: 'rejected',
            rejectionReason: reason as any,
            rejectionNotes: notes,
        });
    }
}

export class InterviewService {
    private static endpoint = '/recruitment/interviews';

    static async getInterviews(filters?: { applicationId?: string }): Promise<Interview[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.applicationId) params.append('applicationId', filters.applicationId);

            const queryString = params.toString();
            const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

            const response = await APIClient.get<{ data?: Interview[] }>(url);
            return response.data || [];
        } catch (error) {
            console.error('Failed to fetch interviews:', error);
            return [];
        }
    }

    static async scheduleInterview(data: Interview): Promise<Interview> {
        const response = await APIClient.post<Interview>(this.endpoint, data);
        return response;
    }

    static async updateInterview(id: string, updates: Partial<Interview>): Promise<Interview> {
        const response = await APIClient.put<Interview>(`${this.endpoint}/${id}`, updates);
        return response;
    }

    static async cancelInterview(id: string, reason?: string): Promise<Interview> {
        return this.updateInterview(id, {
            status: 'cancelled',
            notes: reason,
        });
    }

    static async completeInterview(id: string): Promise<Interview> {
        return this.updateInterview(id, { status: 'completed' });
    }
}

export class InterviewFeedbackService {
    private static endpoint = '/recruitment/interviews/feedback';

    static async getFeedback(interviewId: string): Promise<InterviewFeedback[]> {
        try {
            const response = await APIClient.get<{ items?: InterviewFeedback[] }>(`${this.endpoint}?interviewId=${interviewId}`);
            return response.items || [];
        } catch (error) {
                        return [];
        }
    }

    static async submitFeedback(data: InterviewFeedback): Promise<InterviewFeedback> {
        const response = await APIClient.post<InterviewFeedback>(this.endpoint, data);
        return response;
    }
}

export class JobOfferService {
    private static endpoint = '/recruitment/offers';

    static async getOffers(filters?: { applicationId?: string; status?: OfferStatus }): Promise<JobOffer[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.applicationId) params.append('applicationId', filters.applicationId);
            if (filters?.status) params.append('status', filters.status);

            const queryString = params.toString();
            const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

            const response = await APIClient.get<{ data?: JobOffer[] }>(url);
            return response.data || [];
        } catch (error) {
            console.error('Failed to fetch offers:', error);
            return [];
        }
    }

    static async createOffer(data: JobOffer): Promise<JobOffer> {
        const response = await APIClient.post<JobOffer>(this.endpoint, data);
        return response;
    }

    static async updateOffer(id: string, updates: Partial<JobOffer>): Promise<JobOffer> {
        const response = await APIClient.put<JobOffer>(`${this.endpoint}/${id}`, updates);
        return response;
    }

    static async approveOffer(id: string, approvedBy: string): Promise<JobOffer> {
        return this.updateOffer(id, {
            status: 'approved',
            approvedBy,
            approvedDate: new Date().toISOString(),
        });
    }

    static async sendOffer(id: string): Promise<JobOffer> {
        return this.updateOffer(id, {
            status: 'sent',
            sentDate: new Date().toISOString(),
        });
    }

    static async acceptOffer(id: string): Promise<JobOffer> {
        return this.updateOffer(id, {
            status: 'accepted',
            acceptedDate: new Date().toISOString(),
        });
    }

    static async declineOffer(id: string, reason?: string): Promise<JobOffer> {
        return this.updateOffer(id, {
            status: 'declined',
            declinedDate: new Date().toISOString(),
            declineReason: reason,
        });
    }
}

export class BackgroundCheckService {
    private static endpoint = '/recruitment/background-checks';

    static async getBackgroundChecks(applicationId?: string): Promise<BackgroundCheck[]> {
        try {
            const url = applicationId ? `${this.endpoint}?applicationId=${applicationId}` : this.endpoint;
            const response = await APIClient.get<{ items?: BackgroundCheck[] }>(url);
            return response.items || [];
        } catch (error) {
                        return [];
        }
    }

    static async initiateBackgroundCheck(data: BackgroundCheck): Promise<BackgroundCheck> {
        const response = await APIClient.post<BackgroundCheck>(this.endpoint, data);
        return response;
    }

    static async updateBackgroundCheck(id: string, updates: Partial<BackgroundCheck>): Promise<BackgroundCheck> {
        const response = await APIClient.put<BackgroundCheck>(`${this.endpoint}/${id}`, updates);
        return response;
    }
}

export class HiringPipelineService {
    private static endpoint = '/recruitment/pipeline';

    static async getPipelines(): Promise<HiringPipeline[]> {
        try {
            const response = await APIClient.get<{ items?: HiringPipeline[] }>(this.endpoint);
            return response.items || [];
        } catch (error) {
                        return [];
        }
    }

    static async getDefaultPipeline(): Promise<HiringPipeline | null> {
        const pipelines = await this.getPipelines();
        return pipelines.find(p => p.isDefault) || null;
    }
}

export class RecruitmentSettingsService {
    private static endpoint = '/recruitment/settings';

    static async getSettings(): Promise<RecruitmentSettings | null> {
        try {
            const response = await APIClient.get<RecruitmentSettings>(this.endpoint);
            return response;
        } catch (error) {
                        return null;
        }
    }

    static async updateSettings(updates: Partial<RecruitmentSettings>): Promise<RecruitmentSettings> {
        const response = await APIClient.put<RecruitmentSettings>(this.endpoint, updates);
        return response;
    }
}

export class RecruitmentAnalyticsService {
    private static endpoint = '/recruitment/analytics';

    static async getStats(): Promise<RecruitmentStats> {
        try {
            const response = await APIClient.get<RecruitmentStats>(this.endpoint);
            return response;
        } catch (error) {
                        // Return default/empty stats on error
            return {
                totalRequisitions: 0,
                openRequisitions: 0,
                totalApplications: 0,
                applicationsBySource: {} as any,
                applicationsByStatus: {} as any,
                averageTimeToHire: 0,
                averageTimeToInterview: 0,
                offerAcceptanceRate: 0,
                interviewsScheduled: 0,
                offersExtended: 0,
                hires: 0,
            };
        }
    }
}
