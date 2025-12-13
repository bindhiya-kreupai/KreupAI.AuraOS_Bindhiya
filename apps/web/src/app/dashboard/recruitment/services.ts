/**
 * Recruitment Module - Service Layer
 * 
 * API-ready service classes with localStorage persistence.
 * Replace localStorage calls with real API endpoints when backend is ready.
 */

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
    InterviewStatus,
    OfferStatus,
    BackgroundCheckStatus,
} from './types';

// Storage keys
const STORAGE_KEYS = {
    JOB_REQUISITIONS: 'recruitment_job_requisitions',
    JOB_POSTINGS: 'recruitment_job_postings',
    APPLICATIONS: 'recruitment_applications',
    INTERVIEWS: 'recruitment_interviews',
    INTERVIEW_FEEDBACK: 'recruitment_interview_feedback',
    JOB_OFFERS: 'recruitment_job_offers',
    BACKGROUND_CHECKS: 'recruitment_background_checks',
    HIRING_PIPELINES: 'recruitment_hiring_pipelines',
    SETTINGS: 'recruitment_settings',
};

// Helper for simulating API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Storage helper
class StorageService {
    static load<T>(key: string): T | null {
        if (typeof window === 'undefined') return null;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    static save<T>(key: string, data: T): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(data));
    }
}

export class JobRequisitionService {
    static async getRequisitions(filters?: { status?: RequisitionStatus; departmentId?: string }): Promise<JobRequisition[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<JobRequisition[]>(STORAGE_KEYS.JOB_REQUISITIONS);
        let requisitions = stored || [];
        
        if (filters?.status) {
            requisitions = requisitions.filter(r => r.status === filters.status);
        }
        if (filters?.departmentId) {
            requisitions = requisitions.filter(r => r.departmentId === filters.departmentId);
        }
        
        return requisitions;
    }

    static async createRequisition(data: JobRequisition): Promise<JobRequisition> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<JobRequisition[]>(STORAGE_KEYS.JOB_REQUISITIONS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.JOB_REQUISITIONS, stored);
        return data;
    }

    static async updateRequisition(id: string, updates: Partial<JobRequisition>): Promise<JobRequisition> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<JobRequisition[]>(STORAGE_KEYS.JOB_REQUISITIONS) || [];
        const index = stored.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Requisition not found');
        
        stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.JOB_REQUISITIONS, stored);
        return stored[index];
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
    static async getPostings(filters?: { isActive?: boolean }): Promise<JobPosting[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<JobPosting[]>(STORAGE_KEYS.JOB_POSTINGS);
        let postings = stored || [];
        
        if (filters?.isActive !== undefined) {
            postings = postings.filter(p => p.isActive === filters.isActive);
        }
        
        return postings;
    }

    static async createPosting(data: JobPosting): Promise<JobPosting> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<JobPosting[]>(STORAGE_KEYS.JOB_POSTINGS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.JOB_POSTINGS, stored);
        return data;
    }

    static async updatePosting(id: string, updates: Partial<JobPosting>): Promise<JobPosting> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<JobPosting[]>(STORAGE_KEYS.JOB_POSTINGS) || [];
        const index = stored.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Job posting not found');
        
        stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.JOB_POSTINGS, stored);
        return stored[index];
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
    static async getApplications(filters?: { jobPostingId?: string; status?: ApplicationStatus }): Promise<CandidateApplication[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<CandidateApplication[]>(STORAGE_KEYS.APPLICATIONS);
        let applications = stored || [];
        
        if (filters?.jobPostingId) {
            applications = applications.filter(a => a.jobPostingId === filters.jobPostingId);
        }
        if (filters?.status) {
            applications = applications.filter(a => a.status === filters.status);
        }
        
        return applications;
    }

    static async createApplication(data: CandidateApplication): Promise<CandidateApplication> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<CandidateApplication[]>(STORAGE_KEYS.APPLICATIONS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.APPLICATIONS, stored);
        
        // Update job posting application count
        const postings = StorageService.load<JobPosting[]>(STORAGE_KEYS.JOB_POSTINGS) || [];
        const posting = postings.find(p => p.id === data.jobPostingId);
        if (posting) {
            posting.applicationCount += 1;
            StorageService.save(STORAGE_KEYS.JOB_POSTINGS, postings);
        }
        
        return data;
    }

    static async updateApplication(id: string, updates: Partial<CandidateApplication>): Promise<CandidateApplication> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<CandidateApplication[]>(STORAGE_KEYS.APPLICATIONS) || [];
        const index = stored.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Application not found');
        
        stored[index] = { 
            ...stored[index], 
            ...updates, 
            lastActivityDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        StorageService.save(STORAGE_KEYS.APPLICATIONS, stored);
        return stored[index];
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
    static async getInterviews(filters?: { applicationId?: string }): Promise<Interview[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<Interview[]>(STORAGE_KEYS.INTERVIEWS);
        let interviews = stored || [];
        
        if (filters?.applicationId) {
            interviews = interviews.filter(i => i.applicationId === filters.applicationId);
        }
        
        return interviews;
    }

    static async scheduleInterview(data: Interview): Promise<Interview> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<Interview[]>(STORAGE_KEYS.INTERVIEWS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.INTERVIEWS, stored);
        return data;
    }

    static async updateInterview(id: string, updates: Partial<Interview>): Promise<Interview> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<Interview[]>(STORAGE_KEYS.INTERVIEWS) || [];
        const index = stored.findIndex(i => i.id === id);
        if (index === -1) throw new Error('Interview not found');
        
        stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.INTERVIEWS, stored);
        return stored[index];
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
    static async getFeedback(interviewId: string): Promise<InterviewFeedback[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<InterviewFeedback[]>(STORAGE_KEYS.INTERVIEW_FEEDBACK);
        return (stored || []).filter(f => f.interviewId === interviewId);
    }

    static async submitFeedback(data: InterviewFeedback): Promise<InterviewFeedback> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<InterviewFeedback[]>(STORAGE_KEYS.INTERVIEW_FEEDBACK) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.INTERVIEW_FEEDBACK, stored);
        return data;
    }
}

export class JobOfferService {
    static async getOffers(filters?: { applicationId?: string; status?: OfferStatus }): Promise<JobOffer[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<JobOffer[]>(STORAGE_KEYS.JOB_OFFERS);
        let offers = stored || [];
        
        if (filters?.applicationId) {
            offers = offers.filter(o => o.applicationId === filters.applicationId);
        }
        if (filters?.status) {
            offers = offers.filter(o => o.status === filters.status);
        }
        
        return offers;
    }

    static async createOffer(data: JobOffer): Promise<JobOffer> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<JobOffer[]>(STORAGE_KEYS.JOB_OFFERS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.JOB_OFFERS, stored);
        return data;
    }

    static async updateOffer(id: string, updates: Partial<JobOffer>): Promise<JobOffer> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<JobOffer[]>(STORAGE_KEYS.JOB_OFFERS) || [];
        const index = stored.findIndex(o => o.id === id);
        if (index === -1) throw new Error('Offer not found');
        
        stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.JOB_OFFERS, stored);
        return stored[index];
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
    static async getBackgroundChecks(applicationId?: string): Promise<BackgroundCheck[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<BackgroundCheck[]>(STORAGE_KEYS.BACKGROUND_CHECKS);
        let checks = stored || [];
        
        if (applicationId) {
            checks = checks.filter(c => c.applicationId === applicationId);
        }
        
        return checks;
    }

    static async initiateBackgroundCheck(data: BackgroundCheck): Promise<BackgroundCheck> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<BackgroundCheck[]>(STORAGE_KEYS.BACKGROUND_CHECKS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.BACKGROUND_CHECKS, stored);
        return data;
    }

    static async updateBackgroundCheck(id: string, updates: Partial<BackgroundCheck>): Promise<BackgroundCheck> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<BackgroundCheck[]>(STORAGE_KEYS.BACKGROUND_CHECKS) || [];
        const index = stored.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Background check not found');
        
        stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.BACKGROUND_CHECKS, stored);
        return stored[index];
    }
}

export class HiringPipelineService {
    static async getPipelines(): Promise<HiringPipeline[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<HiringPipeline[]>(STORAGE_KEYS.HIRING_PIPELINES);
        return stored || [];
    }

    static async getDefaultPipeline(): Promise<HiringPipeline | null> {
        const pipelines = await this.getPipelines();
        return pipelines.find(p => p.isDefault) || null;
    }
}

export class RecruitmentSettingsService {
    static async getSettings(): Promise<RecruitmentSettings | null> {
        await delay(300);
        // TODO: Replace with real API call
        return StorageService.load<RecruitmentSettings>(STORAGE_KEYS.SETTINGS);
    }

    static async updateSettings(updates: Partial<RecruitmentSettings>): Promise<RecruitmentSettings> {
        await delay(500);
        // TODO: Replace with real API call
        const current = StorageService.load<RecruitmentSettings>(STORAGE_KEYS.SETTINGS);
        const updated = { ...current, ...updates } as RecruitmentSettings;
        StorageService.save(STORAGE_KEYS.SETTINGS, updated);
        return updated;
    }
}

export class RecruitmentAnalyticsService {
    static async getStats(): Promise<RecruitmentStats> {
        await delay(300);
        // TODO: Replace with real API call
        const requisitions = StorageService.load<JobRequisition[]>(STORAGE_KEYS.JOB_REQUISITIONS) || [];
        const applications = StorageService.load<CandidateApplication[]>(STORAGE_KEYS.APPLICATIONS) || [];
        const interviews = StorageService.load<Interview[]>(STORAGE_KEYS.INTERVIEWS) || [];
        const offers = StorageService.load<JobOffer[]>(STORAGE_KEYS.JOB_OFFERS) || [];

        const applicationsBySource = applications.reduce((acc, app) => {
            acc[app.source] = (acc[app.source] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const applicationsByStatus = applications.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const acceptedOffers = offers.filter(o => o.status === 'accepted').length;
        const sentOffers = offers.filter(o => o.status === 'sent' || o.status === 'accepted' || o.status === 'declined').length;

        return {
            totalRequisitions: requisitions.length,
            openRequisitions: requisitions.filter(r => r.status === 'open').length,
            totalApplications: applications.length,
            applicationsBySource: applicationsBySource as any,
            applicationsByStatus: applicationsByStatus as any,
            averageTimeToHire: 30, // TODO: Calculate from actual data
            averageTimeToInterview: 7, // TODO: Calculate from actual data
            offerAcceptanceRate: sentOffers > 0 ? (acceptedOffers / sentOffers) * 100 : 0,
            interviewsScheduled: interviews.filter(i => i.status === 'scheduled').length,
            offersExtended: offers.length,
            hires: applications.filter(a => a.status === 'hired').length,
        };
    }
}
