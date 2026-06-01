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
    RecruitmentVendor,
    RecruitmentVendorCategory,
    RecruitmentVendorComplianceStatus,
    RecruitmentVendorStatus,
    RequisitionStatus,
    ApplicationStatus,
    OfferStatus, BackgroundCheckItem } from './types';

type ApiEnvelope<T> = {
    success?: boolean;
    data?: T;
    items?: T;
};

const V1_JOB_POSTINGS_ENDPOINT = '/v1/recruitment/jobs';
const V1_CANDIDATES_ENDPOINT = '/v1/recruitment/candidates';
const V1_STATS_ENDPOINT = '/v1/recruitment/stats';
const V1_INTERVIEWS_ENDPOINT = '/v1/recruitment/interviews';
const V1_APPLICATIONS_ENDPOINT = '/v1/recruitment/applications';
const V1_REQUISITIONS_ENDPOINT = '/v1/recruitment/requisitions';
const V1_OFFERS_ENDPOINT = '/v1/recruitment/offers';
const V1_BACKGROUND_CHECK_ENDPOINT = '/v1/recruitment/background-check';
const V1_PIPELINE_ENDPOINT = '/v1/recruitment/pipeline';
const V1_VENDORS_ENDPOINT = '/v1/recruitment/vendors';

const FRONTEND_TO_BACKEND_STAGE: Record<string, string> = {
    new: 'APPLIED',
    applied: 'APPLIED',
    screening: 'SCREENING',
    assessment: 'SCREENING',
    phone_screen: 'PHONE_INTERVIEW',
    interview: 'HIRING_MANAGER_INTERVIEW',
    technical: 'TECHNICAL_INTERVIEW',
    offer: 'OFFER',
    hired: 'HIRED',
    rejected: 'REJECTED',
    withdrawn: 'WITHDRAWN',
};

function normalizeJobType(value?: string): JobPosting['jobType'] {
    const normalized = String(value || 'full_time').toLowerCase();

    if (normalized === 'part_time' || normalized === 'part-time') {
        return 'part_time';
    }

    if (normalized === 'contract') {
        return 'contract';
    }

    if (normalized === 'temporary') {
        return 'temporary';
    }

    if (normalized === 'intern' || normalized === 'internship') {
        return 'internship';
    }

    return 'full_time';
}

function normalizeVendorCategory(value?: string): RecruitmentVendorCategory {
    const normalized = String(value || 'other').toLowerCase();

    if (normalized === 'staffing') return 'staffing';
    if (normalized === 'recruitment_agency' || normalized === 'recruitment agency' || normalized === 'agency') return 'recruitment_agency';
    if (normalized === 'background_check' || normalized === 'background check') return 'background_check';
    if (normalized === 'assessment') return 'assessment';
    if (normalized === 'contractor_management' || normalized === 'contractor management') return 'contractor_management';

    return 'other';
}

function normalizeVendorStatus(value?: string): RecruitmentVendorStatus {
    const normalized = String(value || 'under_review').toLowerCase();

    if (normalized === 'active') return 'active';
    if (normalized === 'inactive') return 'inactive';

    return 'under_review';
}

function normalizeVendorComplianceStatus(value?: string): RecruitmentVendorComplianceStatus {
    const normalized = String(value || 'not_reviewed').toLowerCase();

    if (normalized === 'compliant') return 'compliant';
    if (normalized === 'expiring') return 'expiring';
    if (normalized === 'non_compliant' || normalized === 'non compliant') return 'non_compliant';

    return 'not_reviewed';
}

function normalizeExperienceLevel(value?: string, experienceMax?: number): JobPosting['experienceLevel'] {
    const normalized = String(value || '').toLowerCase();

    if (normalized === 'entry_level' || normalized === 'entry-level') {
        return 'entry_level';
    }

    if (normalized === 'senior_level' || normalized === 'senior-level') {
        return 'senior_level';
    }

    if (normalized === 'executive') {
        return 'executive';
    }

    if ((experienceMax || 0) >= 8) {
        return 'senior_level';
    }

    if ((experienceMax || 0) <= 2) {
        return 'entry_level';
    }

    return 'mid_level';
}

function normalizeEmploymentMode(value?: string, location?: string, isRemote?: boolean): JobPosting['employmentMode'] {
    const normalized = String(value || '').toLowerCase();

    if (normalized === 'remote' || isRemote || String(location || '').toLowerCase() === 'remote') {
        return 'remote';
    }

    if (normalized === 'hybrid') {
        return 'hybrid';
    }

    return 'onsite';
}

function normalizeApplicationStatus(value?: string): ApplicationStatus {
    const normalized = String(value || 'applied').toLowerCase();

    if (normalized === 'screening') {
        return 'screening';
    }

    if (normalized === 'phone_screen' || normalized === 'phone interview') {
        return 'phone_screen';
    }

    if (normalized === 'interview' || normalized === 'technical_interview' || normalized === 'hiring_manager_interview') {
        return 'interview';
    }

    if (normalized === 'offer') {
        return 'offer';
    }

    if (normalized === 'hired') {
        return 'hired';
    }

    if (normalized === 'rejected') {
        return 'rejected';
    }

    if (normalized === 'withdrawn') {
        return 'withdrawn';
    }

    return 'new';
}

function normalizeRequisitionStatus(value?: string): JobRequisition['status'] {
    const normalized = String(value || 'draft').toLowerCase();

    if (normalized === 'pending_approval' || normalized === 'pending approval' || normalized === 'pending') return 'pending_approval';
    if (normalized === 'approved') return 'approved';
    if (normalized === 'open') return 'open';
    if (normalized === 'rejected') return 'rejected';
    if (normalized === 'on_hold' || normalized === 'on hold' || normalized === 'frozen') return 'on_hold';
    if (normalized === 'filled') return 'filled';
    if (normalized === 'cancelled' || normalized === 'closed') return 'cancelled';

    return 'draft';
}

function normalizePriority(value?: string): JobRequisition['priority'] {
    const normalized = String(value || 'medium').toLowerCase();

    if (normalized === 'low') return 'low';
    if (normalized === 'high') return 'high';
    if (normalized === 'urgent') return 'urgent';

    return 'medium';
}

function capitalizeWords(value?: string): string | undefined {
    if (!value) {
        return value;
    }

    return String(value)
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, character => character.toUpperCase());
}

function splitCandidateName(name?: string): { firstName: string; lastName: string } {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
    };
}

function toIsoString(value?: string | Date): string {
    if (!value) {
        return new Date().toISOString();
    }

    return new Date(value).toISOString();
}

function mapJobPostingFromApi(job: any): JobPosting {
    const applicationCount = job.applicationCount ?? job._count?.candidateApplications ?? job.metrics?.applies ?? job.applies ?? 0;
    const salaryDefined = job.salaryMin !== undefined || job.salaryMax !== undefined;

    return {
        id: job.id,
        requisitionId: job.requisitionId || '',
        jobTitle: job.jobTitle || job.title || '',
        departmentName: job.departmentName || job.department || '',
        locationName: job.locationName || job.location || '',
        jobType: normalizeJobType(job.jobType || job.type),
        experienceLevel: normalizeExperienceLevel(job.experienceLevel, job.experienceMax),
        employmentMode: normalizeEmploymentMode(job.employmentMode, job.locationName || job.location, job.isRemote),
        description: job.description || '',
        responsibilities: job.responsibilities || [],
        qualifications: job.qualifications || job.requirements || [],
        skills: job.skills || [],
        salaryRange: salaryDefined
            ? {
                min: Number(job.salaryMin || 0),
                max: Number(job.salaryMax || 0),
                currency: job.currency || 'USD',
                displaySalary: Boolean(job.displaySalary ?? true),
            }
            : undefined,
        benefits: job.benefits || [],
        publishedDate: job.publishedDate || job.postedDate ? toIsoString(job.publishedDate || job.postedDate) : undefined,
        expiryDate: job.expiryDate || job.closingDate ? toIsoString(job.expiryDate || job.closingDate) : undefined,
        isActive: job.isActive ?? String(job.status || '').toLowerCase() === 'active',
        isExternal: Boolean(job.isExternal ?? (Array.isArray(job.channels) && job.channels.length > 0)),
        externalBoards: job.externalBoards || job.channels || [],
        applicationCount,
        viewCount: job.viewCount ?? job.metrics?.views ?? job.views ?? 0,
        createdAt: toIsoString(job.createdAt),
        updatedAt: toIsoString(job.updatedAt || job.createdAt),
    };
}

function mapJobRequisitionFromApi(requisition: any): JobRequisition {
    return {
        id: requisition.id,
        requisitionNumber: requisition.requisitionNumber || `REQ-${String(requisition.id).slice(0, 8).toUpperCase()}`,
        jobTitle: requisition.jobTitle || requisition.title || '',
        departmentId: requisition.departmentId || requisition.department || '',
        departmentName: requisition.departmentName || requisition.department || '',
        locationId: requisition.locationId || requisition.location || '',
        locationName: requisition.locationName || requisition.location || '',
        hiringManagerId: requisition.requestedBy || requisition.hiringManagerId || '',
        hiringManagerName: requisition.hiringManagerName || requisition.requestedByName || 'Unknown',
        recruiterId: requisition.recruiterId || undefined,
        recruiterName: requisition.recruiterName || undefined,
        jobType: normalizeJobType(requisition.jobType || requisition.employmentType),
        experienceLevel: normalizeExperienceLevel(requisition.experienceLevel),
        employmentMode: normalizeEmploymentMode(requisition.employmentMode, requisition.location),
        numberOfPositions: Number(requisition.numberOfPositions || 1),
        positionsFilled: Number(requisition.positionsFilled || 0),
        status: normalizeRequisitionStatus(requisition.status),
        priority: normalizePriority(requisition.priority),
        jobDescription: requisition.jobDescription || requisition.description || '',
        responsibilities: requisition.responsibilities || [],
        qualifications: requisition.qualifications || requisition.requiredSkills || [],
        preferredQualifications: requisition.preferredQualifications || undefined,
        skills: requisition.skills || requisition.requiredSkills || [],
        salaryRange: requisition.salaryRange || { min: 0, max: 0, currency: 'USD' },
        benefits: requisition.benefits || [],
        targetStartDate: requisition.targetStartDate ? toIsoString(requisition.targetStartDate) : undefined,
        requestedDate: toIsoString(requisition.requestedDate),
        approvedDate: requisition.approvedDate ? toIsoString(requisition.approvedDate) : undefined,
        approvedBy: requisition.approvedBy || undefined,
        rejectionReason: requisition.rejectionReason || undefined,
        notes: requisition.notes || undefined,
        createdAt: toIsoString(requisition.createdAt || requisition.requestedDate),
        updatedAt: toIsoString(requisition.updatedAt || requisition.createdAt || requisition.requestedDate),
    };
}

function mapJobRequisitionToApi(data: Partial<JobRequisition>) {
    return {
        jobTitle: data.jobTitle,
        department: data.departmentName,
        location: data.locationName,
        employmentType: data.jobType,
        numberOfPositions: data.numberOfPositions,
        priority: capitalizeWords(data.priority),
        status: capitalizeWords(data.status),
        salaryRange: data.salaryRange,
        requiredSkills: data.skills,
        description: data.jobDescription,
        requestedDate: data.requestedDate,
        approvedDate: data.approvedDate,
        approvedBy: data.approvedBy,
        rejectionReason: data.rejectionReason,
        approvalStatus: data.status === 'approved' ? 'Approved' : data.status === 'rejected' ? 'Rejected' : undefined,
    };
}

function mapJobPostingToApi(data: Partial<JobPosting>) {
    return {
        title: data.jobTitle,
        department: data.departmentName,
        location: data.locationName,
        type: data.jobType,
        status: data.isActive === undefined ? undefined : data.isActive ? 'Active' : 'Draft',
        description: data.description,
        requirements: data.qualifications,
        benefits: data.benefits,
        skills: data.skills,
        salaryMin: data.salaryRange?.min,
        salaryMax: data.salaryRange?.max,
        currency: data.salaryRange?.currency,
        channels: data.externalBoards,
        postedDate: data.publishedDate,
        closingDate: data.expiryDate,
    };
}

function mapApplicationFromApi(record: any): CandidateApplication {
    const application = record?.candidate || record?.jobPosting || record?.applicationNumber || record?.currentStage
        ? record
        : record?.applications?.[0] || {};
    const candidate = application.candidate || record.candidate || record;
    const jobPosting = application.jobPosting || record.jobPosting || {};
    const name = application.candidateName || record.candidateName || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim();
    const parsedName = splitCandidateName(name);
    const currentStage = String(application.currentStage || record.currentStage || application.status || record.status || 'applied').toLowerCase();
    const status = normalizeApplicationStatus(application.status || record.status || currentStage);
    const rating = Number(application.overallRating ?? record.overallRating ?? 0) || undefined;

    return {
        id: candidate.id || application.candidateId || record.candidateId || application.id || record.id,
        applicationNumber: application.applicationNumber || `APP-${String(application.id || record.id || candidate.id || '').slice(0, 8).toUpperCase()}`,
        jobPostingId: jobPosting.id || application.jobPostingId || record.jobPostingId || '',
        jobTitle: application.jobTitle || record.jobTitle || jobPosting.title || '',
        candidateId: candidate.id || application.candidateId || record.candidateId || '',
        firstName: candidate.firstName || parsedName.firstName,
        lastName: candidate.lastName || parsedName.lastName,
        email: candidate.email || application.candidateEmail || record.candidateEmail || '',
        phone: candidate.phone || application.candidatePhone || record.candidatePhone || '',
        location: candidate.location || application.location || record.location || '',
        resumeUrl: candidate.resumeUrl || application.resumeUrl || record.resumeUrl || undefined,
        coverLetterUrl: application.coverLetterUrl || undefined,
        portfolioUrl: candidate.portfolioUrl || undefined,
        linkedInUrl: candidate.linkedinUrl || undefined,
        source: (candidate.source || application.source || record.source || 'other') as CandidateApplication['source'],
        referredBy: application.referredBy || undefined,
        status,
        currentStage,
        rating,
        experience: Number(candidate.experience?.years || candidate.experience || 0),
        currentCompany: candidate.experience?.currentCompany || candidate.currentCompany || undefined,
        currentTitle: candidate.experience?.currentTitle || candidate.currentTitle || undefined,
        expectedSalary: candidate.expectedSalary || undefined,
        noticePeriod: candidate.noticePeriod || undefined,
        skills: candidate.skills || [],
        education: candidate.education || [],
        workExperience: candidate.workExperience || [],
        screeningAnswers: candidate.screeningAnswers || undefined,
        appliedDate: toIsoString(application.appliedDate || record.appliedDate || candidate.createdAt),
        lastActivityDate: toIsoString(candidate.updatedAt || application.updatedAt || record.updatedAt || application.appliedDate),
        rejectionReason: application.rejectionReason || record.rejectionReason || undefined,
        rejectionNotes: application.rejectionNotes || record.rejectionNotes || undefined,
        notes: application.notes || record.notes || '',
        tags: candidate.tags || [],
        createdAt: toIsoString(application.createdAt || record.createdAt || candidate.createdAt),
        updatedAt: toIsoString(application.updatedAt || record.updatedAt || candidate.updatedAt || candidate.createdAt),
        candidateName: name,
        candidateEmail: candidate.email || application.candidateEmail || record.candidateEmail || '',
        candidatePhone: candidate.phone || application.candidatePhone || record.candidatePhone || '',
        positionAppliedFor: application.jobTitle || record.jobTitle || jobPosting.title || '',
        overallRating: rating,
        screeningStatus: application.screeningStatus
            || record.screeningStatus
            || (currentStage === 'screening' ? 'pending' : currentStage === 'rejected' ? 'rejected' : undefined),
        candidate,
    } as CandidateApplication;
}

function mapAnalyticsFromApi(payload: any): RecruitmentStats {
    const applicationsBySource = payload.applicationsBySource
        || Object.fromEntries((payload.sourceEffectiveness || []).map((source: any) => [source.source, source.count]));
    const applicationsByStatus = payload.applicationsByStatus
        || Object.fromEntries((payload.pipelineFunnel || []).map((stage: any) => [String(stage.stage || stage.label || '').toLowerCase(), stage.count]));

    return {
        totalRequisitions: payload.totalRequisitions ?? payload.totalOpenPositions ?? payload.overview?.totalJobs ?? 0,
        openRequisitions: payload.openRequisitions ?? payload.totalOpenPositions ?? 0,
        totalApplications: payload.totalApplications ?? payload.overview?.totalApplications ?? 0,
        applicationsBySource: applicationsBySource || {},
        applicationsByStatus: applicationsByStatus || {},
        averageTimeToHire: payload.averageTimeToHire ?? payload.pipelineMetrics?.averageTimeToHire ?? 0,
        averageTimeToInterview: payload.averageTimeToInterview ?? payload.pipelineMetrics?.averageTimeToFirstInterview ?? 0,
        offerAcceptanceRate: payload.offerAcceptanceRate ?? payload.pipelineMetrics?.offerAcceptanceRate ?? 0,
        interviewsScheduled: payload.interviewsScheduled ?? payload.totalInterviewsScheduled ?? payload.overview?.interviewsScheduled ?? 0,
        offersExtended: payload.offersExtended ?? payload.totalOffersMade ?? payload.overview?.totalOffers ?? 0,
        hires: payload.hires ?? payload.totalHired ?? payload.overview?.totalHires ?? 0,
    };
}

function normalizeInterviewType(value?: string): Interview['type'] {
    const normalized = String(value || 'video').toLowerCase();

    if (normalized === 'phone_screen' || normalized === 'phone') {
        return 'phone_screen';
    }

    if (normalized === 'onsite' || normalized === 'in_person') {
        return 'onsite';
    }

    if (normalized === 'technical') {
        return 'technical';
    }

    if (normalized === 'behavioral') {
        return 'behavioral';
    }

    if (normalized === 'panel') {
        return 'panel';
    }

    if (normalized === 'culture_fit') {
        return 'culture_fit';
    }

    return 'video';
}

function normalizeInterviewStatus(value?: string): Interview['status'] {
    const normalized = String(value || 'scheduled').toLowerCase();

    if (normalized === 'completed') {
        return 'completed';
    }

    if (normalized === 'cancelled') {
        return 'cancelled';
    }

    if (normalized === 'no_show' || normalized === 'no-show') {
        return 'no_show';
    }

    if (normalized === 'rescheduled') {
        return 'rescheduled';
    }

    return 'scheduled';
}

function mapInterviewFromApi(interview: any): Interview {
    const application = interview.application || {};
    const candidate = application.candidate || interview.candidate || {};
    const jobPosting = application.jobPosting || interview.jobPosting || {};
    const interviewerIds = interview.interviewerIds || [];
    const interviewerNames = interview.interviewerNames || [];

    return {
        id: interview.id,
        applicationId: interview.applicationId || application.id || '',
        candidateName: interview.candidateName || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || interview.title || 'Interview',
        jobTitle: interview.jobTitle || jobPosting.title || '',
        type: normalizeInterviewType(interview.type),
        status: normalizeInterviewStatus(interview.status),
        scheduledDate: toIsoString(interview.scheduledDate),
        duration: Number(interview.duration || 60),
        location: interview.location || undefined,
        meetingLink: interview.meetingLink || undefined,
        interviewers: interviewerIds.map((id: string, index: number) => ({
            id,
            name: interviewerNames[index] || `Interviewer ${index + 1}`,
            email: '',
            role: 'Interviewer',
            isPrimary: index === 0,
        })),
        feedback: [],
        notes: interview.notes || undefined,
        createdAt: toIsoString(interview.createdAt),
        updatedAt: toIsoString(interview.updatedAt || interview.createdAt),
    };
}

function mapInterviewToApi(data: Partial<Interview>) {
    const interviewers = data.interviewers || [];

    return {
        applicationId: data.applicationId,
        title: data.jobTitle ? `${data.jobTitle} Interview` : undefined,
        type: data.type,
        scheduledDate: data.scheduledDate,
        duration: data.duration,
        location: data.location,
        meetingLink: data.meetingLink,
        interviewerIds: interviewers.map(interviewer => interviewer.id),
        interviewerNames: interviewers.map(interviewer => interviewer.name),
        status: data.status,
        notes: data.notes,
    };
}

function normalizeRecommendation(value?: string): string {
    const normalized = String(value || 'NEUTRAL').trim().toUpperCase();

    if (normalized === 'STRONG_HIRE' || normalized === 'HIRE' || normalized === 'NEUTRAL' || normalized === 'NO_HIRE' || normalized === 'STRONG_NO_HIRE') {
        return normalized;
    }

    if (normalized === 'HOLD' || normalized === 'UNDECIDED') {
        return 'NEUTRAL';
    }

    if (normalized === 'REJECT') {
        return 'NO_HIRE';
    }

    return 'NEUTRAL';
}

function mapInterviewFeedbackFromApi(feedback: any): InterviewFeedback {
    const criteria = feedback.criteria || {};
    const interview = feedback.interview || {};

    return {
        id: feedback.id,
        interviewId: feedback.interviewId || interview.id || '',
        interviewerId: feedback.interviewerId || '',
        interviewerName: feedback.interviewerName || 'Interviewer',
        rating: String(feedback.recommendation || 'maybe').toLowerCase() as InterviewFeedback['rating'],
        technicalSkills: Number(criteria.technicalSkills || 0) || undefined,
        communicationSkills: Number(criteria.communication || 0) || undefined,
        problemSolving: Number(criteria.problemSolving || 0) || undefined,
        cultureFit: Number(criteria.cultureFit || 0) || undefined,
        strengths: Array.isArray(feedback.strengths) ? feedback.strengths.join(', ') : feedback.strengths || '',
        concerns: Array.isArray(feedback.weaknesses) ? feedback.weaknesses.join(', ') : feedback.weaknesses || '',
        recommendation: String(feedback.recommendation || 'undecided').toLowerCase() === 'hire'
            ? 'hire'
            : String(feedback.recommendation || 'undecided').toLowerCase() === 'no_hire' || String(feedback.recommendation || '').toLowerCase() === 'reject'
                ? 'no_hire'
                : 'undecided',
        notes: feedback.comments || feedback.notes || undefined,
        submittedDate: toIsoString(feedback.submittedAt || feedback.submittedDate || feedback.createdAt),
    };
}

function mapInterviewFeedbackToApi(data: InterviewFeedback) {
    return {
        recommendation: normalizeRecommendation(data.recommendation || data.rating),
        rating: typeof data.technicalSkills === 'number' && typeof data.communicationSkills === 'number' && typeof data.problemSolving === 'number' && typeof data.cultureFit === 'number'
            ? Math.round((((data.technicalSkills + data.communicationSkills + data.problemSolving + data.cultureFit) / 4) + Number.EPSILON) * 100) / 100
            : 0,
        strengths: data.strengths,
        weaknesses: data.concerns,
        notes: data.notes,
        technicalSkillsRating: data.technicalSkills,
        communicationRating: data.communicationSkills,
        cultureFitRating: data.cultureFit,
        criteria: typeof data.problemSolving === 'number' ? { problemSolving: data.problemSolving } : undefined,
    };
}

function normalizeOfferStatus(value?: string): JobOffer['status'] {
    const normalized = String(value || 'draft').toLowerCase();

    if (normalized === 'pending_approval' || normalized === 'pending approval' || normalized === 'pending') return 'pending_approval';
    if (normalized === 'approved') return 'approved';
    if (normalized === 'sent') return 'sent';
    if (normalized === 'accepted') return 'accepted';
    if (normalized === 'declined') return 'declined';
    if (normalized === 'withdrawn') return 'withdrawn';
    if (normalized === 'expired') return 'expired';

    return 'draft';
}

function mapJobOfferFromApi(offer: any): JobOffer {
    return {
        id: offer.id,
        offerNumber: offer.offerNumber || `OFF-${String(offer.id).slice(0, 8).toUpperCase()}`,
        applicationId: offer.applicationId || '',
        candidateName: offer.candidateName || '',
        jobTitle: offer.jobTitle || '',
        departmentName: offer.departmentName || offer.department || '',
        status: normalizeOfferStatus(offer.status),
        jobType: normalizeJobType(offer.jobType || offer.employmentType),
        startDate: toIsoString(offer.startDate),
        salary: Number(offer.salary || 0),
        currency: offer.currency || 'USD',
        bonus: offer.bonus != null ? Number(offer.bonus) : undefined,
        equity: offer.equity || undefined,
        benefits: offer.benefits || [],
        relocationAssistance: offer.relocationAssistance || undefined,
        signingBonus: offer.signingBonus != null ? Number(offer.signingBonus) : undefined,
        probationPeriod: offer.probationPeriod != null ? Number(offer.probationPeriod) : undefined,
        offerLetterUrl: offer.offerLetterUrl || undefined,
        sentDate: offer.sentDate ? toIsoString(offer.sentDate) : undefined,
        expiryDate: offer.expiryDate ? toIsoString(offer.expiryDate) : undefined,
        acceptedDate: offer.acceptedDate ? toIsoString(offer.acceptedDate) : undefined,
        declinedDate: offer.declinedDate ? toIsoString(offer.declinedDate) : undefined,
        declineReason: offer.declineReason || undefined,
        approvedBy: offer.approvedBy || undefined,
        approvedDate: offer.approvedDate ? toIsoString(offer.approvedDate) : undefined,
        notes: offer.notes || undefined,
        createdAt: toIsoString(offer.createdAt),
        updatedAt: toIsoString(offer.updatedAt || offer.createdAt),
    };
}

function mapJobOfferToApi(data: Partial<JobOffer>) {
    return {
        applicationId: data.applicationId,
        jobTitle: data.jobTitle,
        department: data.departmentName,
        employmentType: data.jobType,
        startDate: data.startDate,
        salary: data.salary,
        currency: data.currency,
        bonus: data.bonus,
        equity: data.equity,
        benefits: data.benefits,
        relocationAssistance: data.relocationAssistance,
        signingBonus: data.signingBonus,
        probationPeriod: data.probationPeriod,
        offerLetterUrl: data.offerLetterUrl,
        status: data.status,
        sentDate: data.sentDate,
        expiryDate: data.expiryDate,
        acceptedDate: data.acceptedDate,
        declinedDate: data.declinedDate,
        declineReason: data.declineReason,
        approvedBy: data.approvedBy,
        approvedDate: data.approvedDate,
        notes: data.notes,
    };
}

function normalizeBackgroundCheckStatus(value?: string): string {
    const normalized = String(value || 'pending').toLowerCase();

    if (normalized === 'in_progress') return 'in-progress';
    if (normalized === 'clear') return 'completed';

    return normalized;
}

function mapBackgroundCheckFromApi(check: any): BackgroundCheck {
    return {
        id: check.id,
        applicationId: check.applicationId || '',
        candidateName: check.candidateName || check.candidateId || check.employeeId || 'Unknown Candidate',
        status: normalizeBackgroundCheckStatus(check.status) as BackgroundCheck['status'],
        checks: Array.isArray(check.checks)
            ? check.checks
            : check.checkType
                ? [{
                    id: `${check.id}-item`,
                    type: String(check.checkType).toLowerCase() as BackgroundCheckItem['type'],
                    status: normalizeBackgroundCheckStatus(check.status) as BackgroundCheckItem['status'],
                    result: check.result || undefined,
                    notes: check.notes || undefined,
                }]
                : [],
        vendorName: check.vendorName || check.provider || undefined,
        requestedDate: toIsoString(check.requestedDate || check.requestDate || check.createdAt),
        completedDate: check.completedDate || check.completionDate ? toIsoString(check.completedDate || check.completionDate) : undefined,
        overallResult: check.overallResult || check.result || undefined,
        notes: check.notes || undefined,
        createdAt: toIsoString(check.createdAt || check.requestDate),
        updatedAt: toIsoString(check.updatedAt || check.createdAt || check.requestDate),
        checkType: check.checkType,
        provider: check.provider || undefined,
        candidateId: check.candidateId || undefined,
        employeeId: check.employeeId || undefined,
        requestDate: toIsoString(check.requestDate || check.requestedDate || check.createdAt),
        completionDate: check.completionDate ? toIsoString(check.completionDate) : undefined,
        result: check.result || undefined,
        findings: check.findings || undefined,
        documentUrl: check.documentUrl || undefined,
        initiatedBy: check.initiatedBy || undefined,
        initiatedDate: toIsoString(check.requestDate || check.createdAt),
    } as BackgroundCheck;
}

function mapBackgroundCheckToApi(data: Partial<BackgroundCheck>) {
    return {
        applicationId: data.applicationId,
        candidateId: (data as any).candidateId,
        employeeId: (data as any).employeeId,
        checkType: (data as any).checkType || data.checks?.[0]?.type,
        provider: (data as any).provider || data.vendorName,
        status: data.status === 'in-progress' ? 'in_progress' : data.status,
        result: (data as any).result || data.overallResult,
        findings: (data as any).findings,
        documentUrl: (data as any).documentUrl,
        notes: data.notes,
    };
}

function mapRecruitmentVendorFromApi(record: any): RecruitmentVendor {
    return {
        id: record.id,
        vendorCode: record.vendorCode || `VEN-${String(record.id).slice(0, 8).toUpperCase()}`,
        name: record.name || '',
        category: normalizeVendorCategory(record.category),
        status: normalizeVendorStatus(record.status),
        contactPersonName: record.contactPersonName || undefined,
        contactEmail: record.contactEmail || undefined,
        contactPhone: record.contactPhone || undefined,
        location: record.location || undefined,
        rating: record.rating === null || record.rating === undefined ? undefined : Number(record.rating),
        activePlacements: Number(record.activePlacements || 0),
        totalPlacements: Number(record.totalPlacements || 0),
        totalHires: Number(record.totalHires || 0),
        averageTimeToFillDays: record.averageTimeToFillDays === null || record.averageTimeToFillDays === undefined
            ? undefined
            : Number(record.averageTimeToFillDays),
        monthlySpend: Number(record.monthlySpend || 0),
        currency: record.currency || 'USD',
        complianceStatus: normalizeVendorComplianceStatus(record.complianceStatus),
        contractStartDate: record.contractStartDate ? toIsoString(record.contractStartDate) : undefined,
        contractEndDate: record.contractEndDate ? toIsoString(record.contractEndDate) : undefined,
        specialties: record.specialties || [],
        notes: record.notes || undefined,
        createdAt: toIsoString(record.createdAt),
        updatedAt: toIsoString(record.updatedAt || record.createdAt),
    };
}

function mapRecruitmentVendorToApi(data: Partial<RecruitmentVendor>) {
    return {
        vendorCode: data.vendorCode,
        name: data.name,
        category: data.category,
        status: data.status,
        contactPersonName: data.contactPersonName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        location: data.location,
        rating: data.rating,
        activePlacements: data.activePlacements,
        totalPlacements: data.totalPlacements,
        totalHires: data.totalHires,
        averageTimeToFillDays: data.averageTimeToFillDays,
        monthlySpend: data.monthlySpend,
        currency: data.currency,
        complianceStatus: data.complianceStatus,
        contractStartDate: data.contractStartDate,
        contractEndDate: data.contractEndDate,
        specialties: data.specialties,
        notes: data.notes,
    };
}

function mapHiringPipelineFromApi(pipeline: any): HiringPipeline {
    return {
        id: pipeline.id,
        name: pipeline.name || 'Default Hiring Pipeline',
        stages: (pipeline.stages || []).map((stage: any) => ({
            id: stage.id || `${pipeline.id}-${stage.order || stage.name}`,
            name: stage.name,
            order: Number(stage.order || 0),
            isRequired: Boolean(stage.isRequired ?? true),
            averageDuration: stage.averageDuration || undefined,
            type: stage.type,
            count: stage.count,
        })) as HiringPipeline['stages'],
        isDefault: Boolean(pipeline.isDefault),
        createdAt: toIsoString(pipeline.createdAt || pipeline.createdDate),
        updatedAt: toIsoString(pipeline.updatedAt || pipeline.updatedDate || pipeline.createdDate),
    };
}

function mapRecruitmentSettingsFromApi(settings: any): RecruitmentSettings {
    return {
        ...settings,
        defaultPipelineId: settings.defaultPipelineId || 'default-pipeline',
        applicationExpiryDays: settings.applicationExpiryDays ?? settings.complianceSettings?.dataRetentionPeriod ?? 365,
        offerExpiryDays: settings.offerExpiryDays ?? settings.offerSettings?.defaultOfferExpiryDays ?? 14,
        requireBackgroundCheck: settings.requireBackgroundCheck ?? settings.backgroundCheckSettings?.requireForAllPositions ?? false,
        requireReferenceCheck: settings.requireReferenceCheck ?? false,
        autoRejectAfterDays: settings.autoRejectAfterDays ?? undefined,
        emailTemplates: settings.emailTemplates || [],
        screeningQuestions: settings.screeningQuestions || settings.applicationSettings?.customApplicationFields || [],
    } as RecruitmentSettings;
}

function normalizeApplicationUpdates(updates: Partial<CandidateApplication>): Record<string, unknown> {
    const normalized: Record<string, unknown> = { ...updates };
    const screeningStatus = updates.screeningStatus as string | undefined;

    if (screeningStatus === 'shortlisted') {
        normalized.status = 'interview';
        normalized.currentStage = 'interview';
        delete normalized.screeningStatus;
    }

    if (screeningStatus === 'rejected') {
        normalized.status = 'rejected';
        normalized.currentStage = 'rejected';
        delete normalized.screeningStatus;
    }

    return normalized;
}

export class JobRequisitionService {
    private static endpoint = V1_REQUISITIONS_ENDPOINT;

    static async getRequisitions(filters?: { status?: RequisitionStatus; departmentId?: string }): Promise<JobRequisition[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.status) params.append('status', filters.status);
            if (filters?.departmentId) params.append('department', filters.departmentId);

            const queryString = params.toString();
            const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

            const response = await APIClient.get<ApiEnvelope<any[]>>(url);
            return (response.data || response.items || []).map(mapJobRequisitionFromApi);
        } catch (error: any) {
            console.error('Failed to fetch requisitions:', error);
            return [];
        }
    }

    static async createRequisition(data: JobRequisition): Promise<JobRequisition> {
        const response = await APIClient.post<ApiEnvelope<any> | any>(this.endpoint, mapJobRequisitionToApi(data));
        return mapJobRequisitionFromApi((response as any).data || response);
    }

    static async updateRequisition(id: string, updates: Partial<JobRequisition>): Promise<JobRequisition> {
        const response = await APIClient.put<ApiEnvelope<any> | any>(this.endpoint, {
            id,
            ...mapJobRequisitionToApi(updates),
        });
        return mapJobRequisitionFromApi((response as any).data || response);
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
    private static endpoint = V1_JOB_POSTINGS_ENDPOINT;

    static async getPostings(filters?: { isActive?: boolean }): Promise<JobPosting[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

            const queryString = params.toString();
            const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

            const response = await APIClient.get<ApiEnvelope<any[]>>(url);
            return (response.data || []).map(mapJobPostingFromApi);
        } catch (error: any) {
            console.error('Failed to fetch job postings:', error);
            return [];
        }
    }

    static async createPosting(data: JobPosting): Promise<JobPosting> {
        const response = await APIClient.post<ApiEnvelope<any> | any>(this.endpoint, mapJobPostingToApi(data));
        return mapJobPostingFromApi((response as any).data || response);
    }

    static async updatePosting(id: string, updates: Partial<JobPosting>): Promise<JobPosting> {
        const response = await APIClient.put<ApiEnvelope<any> | any>(`${this.endpoint}/${id}`, mapJobPostingToApi(updates));
        return mapJobPostingFromApi((response as any).data || response);
    }

    static async publishPosting(id: string): Promise<JobPosting> {
        return this.updatePosting(id, { isActive: true });
    }

    static async unpublishPosting(id: string): Promise<JobPosting> {
        return this.updatePosting(id, { isActive: false });
    }
}

export class CandidateApplicationService {
    private static endpoint = V1_CANDIDATES_ENDPOINT;
    private static applicationsEndpoint = V1_APPLICATIONS_ENDPOINT;

    static async getApplications(filters?: { jobPostingId?: string; status?: ApplicationStatus }): Promise<CandidateApplication[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.jobPostingId) params.append('jobPostingId', filters.jobPostingId);
            if (filters?.status) params.append('status', filters.status);

            const queryString = params.toString();
            const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

            const response = await APIClient.get<ApiEnvelope<any[]>>(url);
            return (response.data || []).map(mapApplicationFromApi);
        } catch (error: any) {
            console.error('Failed to fetch applications:', error);
            return [];
        }
    }

    static async createApplication(data: CandidateApplication): Promise<CandidateApplication> {
        const response = await APIClient.post<ApiEnvelope<any> | any>(this.applicationsEndpoint, data);
        return mapApplicationFromApi((response as any).data || response);
    }

    static async updateApplication(id: string, updates: Partial<CandidateApplication>): Promise<CandidateApplication> {
        const normalizedUpdates = normalizeApplicationUpdates(updates);
        const rawStage = String(normalizedUpdates.currentStage || normalizedUpdates.status || 'applied').toLowerCase();
        const response = await APIClient.put<ApiEnvelope<any> | any>(`${this.endpoint}/${id}/stage`, {
            stage: FRONTEND_TO_BACKEND_STAGE[rawStage] || rawStage,
            reason: normalizedUpdates.rejectionReason,
            notes: normalizedUpdates.rejectionNotes || normalizedUpdates.notes,
        });
        return mapApplicationFromApi((response as any).data || response);
    }

    static async moveToStage(id: string, stage: string, status: ApplicationStatus): Promise<CandidateApplication> {
        const response = await APIClient.put<ApiEnvelope<any> | any>(`${this.endpoint}/${id}/stage`, {
            stage: FRONTEND_TO_BACKEND_STAGE[stage] || stage,
            status,
        });
        return mapApplicationFromApi((response as any).data || response);
    }

    static async rejectApplication(id: string, reason: string, notes?: string): Promise<CandidateApplication> {
        const response = await APIClient.put<ApiEnvelope<any> | any>(`${this.endpoint}/${id}/stage`, {
            stage: 'REJECTED',
            reason,
            notes,
        });
        return mapApplicationFromApi((response as any).data || response);
    }
}

export class InterviewService {
    private static endpoint = V1_INTERVIEWS_ENDPOINT;
    private static legacyEndpoint = '/recruitment/interviews';

    static async getInterviews(filters?: { applicationId?: string }): Promise<Interview[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.applicationId) params.append('applicationId', filters.applicationId);

            const queryString = params.toString();
            const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

            const response = await APIClient.get<ApiEnvelope<any[]>>(url);
            return (response.data || []).map(mapInterviewFromApi);
        } catch (error: any) {
            console.error('Failed to fetch interviews:', error);
            return [];
        }
    }

    static async scheduleInterview(data: Interview): Promise<Interview> {
        const response = await APIClient.post<ApiEnvelope<any> | any>(this.endpoint, mapInterviewToApi(data));
        return mapInterviewFromApi((response as any).data || response);
    }

    static async updateInterview(id: string, updates: Partial<Interview>): Promise<Interview> {
        const response = await APIClient.put<ApiEnvelope<any> | any>(this.legacyEndpoint, {
            id,
            ...mapInterviewToApi(updates),
        });
        return mapInterviewFromApi((response as any).data || response);
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
    private static legacyEndpoint = '/recruitment/interviews/feedback';

    static async getFeedback(interviewId: string): Promise<InterviewFeedback[]> {
        try {
            const response = await APIClient.get<ApiEnvelope<any[]>>(`${this.legacyEndpoint}?interviewId=${interviewId}`);
            const feedbackList = response.data || response.items || [];
            return feedbackList.map(mapInterviewFeedbackFromApi);
        } catch (error: any) {
            console.error('Failed to fetch feedback:', error);
            return [];
        }
    }

    static async submitFeedback(data: InterviewFeedback): Promise<InterviewFeedback> {
        const response = await APIClient.post<ApiEnvelope<any> | any>(`${V1_INTERVIEWS_ENDPOINT}/${data.interviewId}/feedback`, mapInterviewFeedbackToApi(data));
        return mapInterviewFeedbackFromApi((response as any).data || response);
    }
}

export class JobOfferService {
    private static endpoint = V1_OFFERS_ENDPOINT;
    private static eSignEndpoint = `${V1_OFFERS_ENDPOINT}/e-sign`;

    static async getOffers(filters?: { applicationId?: string; status?: OfferStatus }): Promise<JobOffer[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.applicationId) params.append('applicationId', filters.applicationId);
            if (filters?.status) params.append('status', filters.status);

            const queryString = params.toString();
            const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

            const response = await APIClient.get<ApiEnvelope<any[]>>(url);
            return (response.data || []).map(mapJobOfferFromApi);
        } catch (error: any) {
            console.error('Failed to fetch offers:', error);
            return [];
        }
    }

    static async createOffer(data: JobOffer): Promise<JobOffer> {
        const response = await APIClient.post<ApiEnvelope<any> | any>(this.endpoint, mapJobOfferToApi(data));
        return mapJobOfferFromApi((response as any).data || response);
    }

    static async getSigningStatus(offerId: string): Promise<any> {
        const response = await APIClient.get<ApiEnvelope<any>>(`${this.endpoint}/${offerId}/signing-status`);
        return response.data || response;
    }

    static async approveOffer(id: string): Promise<JobOffer> {
        const response = await APIClient.post<ApiEnvelope<any> | any>(this.eSignEndpoint, { offerId: id, action: 'approve' });
        return mapJobOfferFromApi((response as any).data || response);
    }

    static async sendOffer(id: string): Promise<JobOffer> {
        const response = await APIClient.post<ApiEnvelope<any> | any>(this.eSignEndpoint, { offerId: id, action: 'send' });
        return mapJobOfferFromApi((response as any).data || response);
    }

    static async acceptOffer(id: string): Promise<JobOffer> {
        const response = await APIClient.post<ApiEnvelope<any> | any>(this.eSignEndpoint, { offerId: id, action: 'accept' });
        return mapJobOfferFromApi((response as any).data || response);
    }

    static async declineOffer(id: string, reason?: string): Promise<JobOffer> {
        const response = await APIClient.post<ApiEnvelope<any> | any>(this.eSignEndpoint, { offerId: id, action: 'decline', reason });
        return mapJobOfferFromApi((response as any).data || response);
    }
}

export class BackgroundCheckService {
    private static endpoint = V1_BACKGROUND_CHECK_ENDPOINT;

    static async getBackgroundChecks(applicationId?: string): Promise<BackgroundCheck[]> {
        try {
            const url = applicationId ? `${this.endpoint}?applicationId=${applicationId}` : this.endpoint;
            const response = await APIClient.get<ApiEnvelope<any[]>>(url);
            return (response.data || []).map(mapBackgroundCheckFromApi);
        } catch (error: any) {
            console.error('Failed to fetch background checks:', error);
            return [];
        }
    }

    static async initiateBackgroundCheck(data: BackgroundCheck): Promise<BackgroundCheck> {
        const response = await APIClient.post<ApiEnvelope<any> | any>(this.endpoint, mapBackgroundCheckToApi(data));
        return mapBackgroundCheckFromApi((response as any).data || response);
    }

    static async updateBackgroundCheck(id: string, updates: Partial<BackgroundCheck>): Promise<BackgroundCheck> {
        const response = await APIClient.put<ApiEnvelope<any> | any>(`${this.endpoint}/${id}`, mapBackgroundCheckToApi(updates));
        return mapBackgroundCheckFromApi((response as any).data || response);
    }
}

export class RecruitmentVendorService {
    private static endpoint = V1_VENDORS_ENDPOINT;

    static async getVendors(filters?: { status?: RecruitmentVendorStatus; category?: RecruitmentVendorCategory }): Promise<RecruitmentVendor[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.status) params.append('status', filters.status);
            if (filters?.category) params.append('category', filters.category);

            const queryString = params.toString();
            const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

            const response = await APIClient.get<ApiEnvelope<any[]>>(url);
            return (response.data || response.items || []).map(mapRecruitmentVendorFromApi);
        } catch (error: any) {
            console.error('Failed to fetch recruitment vendors:', error);
            return [];
        }
    }

    static async createVendor(data: Partial<RecruitmentVendor>): Promise<RecruitmentVendor> {
        const response = await APIClient.post<ApiEnvelope<any> | any>(this.endpoint, mapRecruitmentVendorToApi(data));
        return mapRecruitmentVendorFromApi((response as any).data || response);
    }

    static async updateVendor(id: string, updates: Partial<RecruitmentVendor>): Promise<RecruitmentVendor> {
        const response = await APIClient.put<ApiEnvelope<any> | any>(`${this.endpoint}/${id}`, mapRecruitmentVendorToApi(updates));
        return mapRecruitmentVendorFromApi((response as any).data || response);
    }
}

export class HiringPipelineService {
    private static endpoint = V1_PIPELINE_ENDPOINT;

    static async getPipelines(): Promise<HiringPipeline[]> {
        try {
            const response = await APIClient.get<ApiEnvelope<any>>(this.endpoint);
            const pipelines = response.items || response.data?.items || response.data || [];
            return (Array.isArray(pipelines) ? pipelines : [pipelines]).filter(Boolean).map(mapHiringPipelineFromApi);
        } catch (error: any) {
            console.error('Failed to fetch pipelines:', error);
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
            const response = await APIClient.get<any>(this.endpoint);
            return mapRecruitmentSettingsFromApi(response);
        } catch (error: any) {
            console.error('Failed to fetch recruitment settings:', error);
            return null;
        }
    }

    static async updateSettings(updates: Partial<RecruitmentSettings>): Promise<RecruitmentSettings> {
        const response = await APIClient.put<any>(this.endpoint, updates);
        return mapRecruitmentSettingsFromApi(response);
    }
}

export class RecruitmentAnalyticsService {
    private static endpoint = V1_STATS_ENDPOINT;

    static async getStats(): Promise<RecruitmentStats> {
        try {
            const response = await APIClient.get<ApiEnvelope<any>>(this.endpoint);
            return mapAnalyticsFromApi(response.data || response);
        } catch (error: any) {
            console.error('Failed to fetch recruitment analytics:', error);
            throw error;
        }
    }
}
