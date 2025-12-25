/**
 * Onboarding Module - Service Layer
 *
 * API-ready service classes with APIClient integration
 * 14 service classes covering all onboarding workflows
 */

import { APIClient } from '@/lib/api-client';
import type {
    OnboardingProgram,
    OnboardingInstance,
    BuddyAssignment,
    Day30_60_90Plan,
    OnboardingSurvey,
    NewHireFeedback,
    PreBoardingPackage,
    OnboardingMetrics,
    OnboardingSettings,
    TaskStatus} from './types';
import {
    OnboardingTask,
    OnboardingDocument,
    OnboardingEquipment,
    OnboardingAccess,
    OnboardingTraining,
    OnboardingStatus,
} from './types';

/**
 * Onboarding Program Service
 * Manages onboarding program templates and configurations
 */
export class OnboardingProgramService {
    private static endpoint = '/onboarding/programs';

    static async getPrograms(): Promise<OnboardingProgram[]> {
        try {
            const response = await APIClient.get<{ programs?: OnboardingProgram[] }>(this.endpoint);
            return response.programs || [];
        } catch {
                        return [];
        }
    }

    static async getProgramById(id: string): Promise<OnboardingProgram | null> {
        try {
            const response = await APIClient.get<{ program: OnboardingProgram }>(`${this.endpoint}/${id}`);
            return response.program;
        } catch {
                        return null;
        }
    }

    static async createProgram(data: OnboardingProgram): Promise<OnboardingProgram> {
        const response = await APIClient.post<{ program: OnboardingProgram }>(this.endpoint, data);
        return response.program;
    }

    static async updateProgram(id: string, updates: Partial<OnboardingProgram>): Promise<OnboardingProgram> {
        const response = await APIClient.put<{ program: OnboardingProgram }>(`${this.endpoint}/${id}`, updates);
        return response.program;
    }

    static async deleteProgram(id: string): Promise<void> {
        await APIClient.delete(`${this.endpoint}/${id}`);
    }

    static async cloneProgram(id: string, newName: string): Promise<OnboardingProgram> {
        const response = await APIClient.post<{ program: OnboardingProgram }>(`${this.endpoint}/${id}/clone`, { newName });
        return response.program;
    }
}

/**
 * Onboarding Instance Service
 * Manages individual employee onboarding instances
 */
export class OnboardingInstanceService {
    private static endpoint = '/onboarding/instances';

    static async getInstances(): Promise<OnboardingInstance[]> {
        try {
            const response = await APIClient.get<{ instances?: OnboardingInstance[] }>(this.endpoint);
            return response.instances || [];
        } catch {
                        return [];
        }
    }

    static async getInstanceById(id: string): Promise<OnboardingInstance | null> {
        try {
            const response = await APIClient.get<{ instance: OnboardingInstance }>(`${this.endpoint}/${id}`);
            return response.instance;
        } catch {
                        return null;
        }
    }

    static async getByEmployeeId(employeeId: string): Promise<OnboardingInstance | null> {
        try {
            const response = await APIClient.get<{ instance: OnboardingInstance }>(`${this.endpoint}/employee/${employeeId}`);
            return response.instance;
        } catch {
                        return null;
        }
    }

    static async createInstance(data: OnboardingInstance): Promise<OnboardingInstance> {
        const response = await APIClient.post<{ instance: OnboardingInstance }>(this.endpoint, data);
        return response.instance;
    }

    static async updateInstance(id: string, updates: Partial<OnboardingInstance>): Promise<OnboardingInstance> {
        const response = await APIClient.put<{ instance: OnboardingInstance }>(`${this.endpoint}/${id}`, updates);
        return response.instance;
    }

    static async startOnboarding(id: string): Promise<OnboardingInstance> {
        const response = await APIClient.post<{ instance: OnboardingInstance }>(`${this.endpoint}/${id}/start`, {});
        return response.instance;
    }

    static async completeOnboarding(id: string): Promise<OnboardingInstance> {
        const response = await APIClient.post<{ instance: OnboardingInstance }>(`${this.endpoint}/${id}/complete`, {});
        return response.instance;
    }

    static async updateProgress(id: string): Promise<OnboardingInstance> {
        const response = await APIClient.post<{ instance: OnboardingInstance }>(`${this.endpoint}/${id}/progress`, {});
        return response.instance;
    }
}

/**
 * Task Service
 * Manages onboarding tasks
 */
export class OnboardingTaskService {
    private static endpoint = '/onboarding/tasks';

    static async updateTaskStatus(
        instanceId: string,
        taskId: string,
        status: TaskStatus,
        completedBy?: string
    ): Promise<OnboardingInstance> {
        const response = await APIClient.put<{ instance: OnboardingInstance }>(
            `${this.endpoint}/${instanceId}/tasks/${taskId}/status`,
            { status, completedBy }
        );
        return response.instance;
    }

    static async addTaskComment(
        instanceId: string,
        taskId: string,
        comment: string
    ): Promise<OnboardingInstance> {
        const response = await APIClient.post<{ instance: OnboardingInstance }>(
            `${this.endpoint}/${instanceId}/tasks/${taskId}/comment`,
            { comment }
        );
        return response.instance;
    }

    static async assignTask(
        instanceId: string,
        taskId: string,
        assignedTo: string,
        assignedToName: string
    ): Promise<OnboardingInstance> {
        const response = await APIClient.post<{ instance: OnboardingInstance }>(
            `${this.endpoint}/${instanceId}/tasks/${taskId}/assign`,
            { assignedTo, assignedToName }
        );
        return response.instance;
    }
}

/**
 * Document Service
 * Manages onboarding document collection
 */
export class OnboardingDocumentService {
    private static endpoint = '/onboarding/documents';

    static async uploadDocument(
        instanceId: string,
        documentId: string,
        fileUrl: string,
        fileName: string,
        fileSize: number
    ): Promise<OnboardingInstance> {
        const response = await APIClient.post<{ instance: OnboardingInstance }>(
            `${this.endpoint}/${instanceId}/upload/${documentId}`,
            { fileUrl, fileName, fileSize }
        );
        return response.instance;
    }

    static async verifyDocument(
        instanceId: string,
        documentId: string,
        verifiedBy: string,
        approved: boolean,
        rejectionReason?: string
    ): Promise<OnboardingInstance> {
        const response = await APIClient.post<{ instance: OnboardingInstance }>(
            `${this.endpoint}/${instanceId}/verify/${documentId}`,
            { verifiedBy, approved, rejectionReason }
        );
        return response.instance;
    }
}

/**
 * Equipment Service
 * Manages equipment provisioning
 */
export class OnboardingEquipmentService {
    private static endpoint = '/onboarding/equipment';

    static async requestEquipment(
        instanceId: string,
        equipmentId: string,
        requestedBy: string
    ): Promise<OnboardingInstance> {
        const response = await APIClient.post<{ instance: OnboardingInstance }>(
            `${this.endpoint}/${instanceId}/request/${equipmentId}`,
            { requestedBy }
        );
        return response.instance;
    }

    static async approveEquipment(
        instanceId: string,
        equipmentId: string,
        approvedBy: string
    ): Promise<OnboardingInstance> {
        const response = await APIClient.post<{ instance: OnboardingInstance }>(
            `${this.endpoint}/${instanceId}/approve/${equipmentId}`,
            { approvedBy }
        );
        return response.instance;
    }

    static async assignEquipment(
        instanceId: string,
        equipmentId: string,
        assetTag: string,
        serialNumber?: string
    ): Promise<OnboardingInstance> {
        const response = await APIClient.post<{ instance: OnboardingInstance }>(
            `${this.endpoint}/${instanceId}/assign/${equipmentId}`,
            { assetTag, serialNumber }
        );
        return response.instance;
    }
}

/**
 * Access Service
 * Manages system access provisioning
 */
export class OnboardingAccessService {
    private static endpoint = '/onboarding/access';

    static async requestAccess(
        instanceId: string,
        accessId: string,
        requestedBy: string
    ): Promise<OnboardingInstance> {
        const response = await APIClient.post<{ instance: OnboardingInstance }>(
            `${this.endpoint}/${instanceId}/request/${accessId}`,
            { requestedBy }
        );
        return response.instance;
    }

    static async grantAccess(
        instanceId: string,
        accessId: string,
        grantedBy: string,
        username: string,
        accountId?: string
    ): Promise<OnboardingInstance> {
        const response = await APIClient.post<{ instance: OnboardingInstance }>(
            `${this.endpoint}/${instanceId}/grant/${accessId}`,
            { grantedBy, username, accountId }
        );
        return response.instance;
    }
}

/**
 * Training Service
 * Manages onboarding training and induction
 */
export class OnboardingTrainingService {
    private static endpoint = '/onboarding/training';

    static async scheduleTraining(
        instanceId: string,
        moduleId: string,
        scheduledDate: string,
        location?: string,
        meetingLink?: string
    ): Promise<OnboardingInstance> {
        const response = await APIClient.post<{ instance: OnboardingInstance }>(
            `${this.endpoint}/${instanceId}/schedule/${moduleId}`,
            { scheduledDate, location, meetingLink }
        );
        return response.instance;
    }

    static async completeTraining(
        instanceId: string,
        moduleId: string,
        assessmentScore?: number,
        feedback?: string
    ): Promise<OnboardingInstance> {
        const response = await APIClient.post<{ instance: OnboardingInstance }>(
            `${this.endpoint}/${instanceId}/complete/${moduleId}`,
            { assessmentScore, feedback }
        );
        return response.instance;
    }
}

/**
 * Buddy Assignment Service
 * Manages buddy program and assignments
 */
export class BuddyAssignmentService {
    private static endpoint = '/onboarding/buddies';

    static async getAssignments(): Promise<BuddyAssignment[]> {
        try {
            const response = await APIClient.get<{ assignments?: BuddyAssignment[] }>(this.endpoint);
            return response.assignments || [];
        } catch {
                        return [];
        }
    }

    static async getAssignmentById(id: string): Promise<BuddyAssignment | null> {
        try {
            const response = await APIClient.get<{ assignment: BuddyAssignment }>(`${this.endpoint}/${id}`);
            return response.assignment;
        } catch {
                        return null;
        }
    }

    static async createAssignment(data: BuddyAssignment): Promise<BuddyAssignment> {
        const response = await APIClient.post<{ assignment: BuddyAssignment }>(this.endpoint, data);
        return response.assignment;
    }

    static async updateAssignment(id: string, updates: Partial<BuddyAssignment>): Promise<BuddyAssignment> {
        const response = await APIClient.put<{ assignment: BuddyAssignment }>(`${this.endpoint}/${id}`, updates);
        return response.assignment;
    }

    static async completeAssignment(id: string): Promise<BuddyAssignment> {
        const response = await APIClient.post<{ assignment: BuddyAssignment }>(`${this.endpoint}/${id}/complete`, {});
        return response.assignment;
    }
}

/**
 * 30-60-90 Day Plan Service
 * Manages milestone plans and reviews
 */
export class Day30_60_90PlanService {
    private static endpoint = '/onboarding/day-plans';

    static async getPlans(): Promise<Day30_60_90Plan[]> {
        try {
            const response = await APIClient.get<{ plans?: Day30_60_90Plan[] }>(this.endpoint);
            return response.plans || [];
        } catch {
                        return [];
        }
    }

    static async getPlanById(id: string): Promise<Day30_60_90Plan | null> {
        try {
            const response = await APIClient.get<{ plan: Day30_60_90Plan }>(`${this.endpoint}/${id}`);
            return response.plan;
        } catch {
                        return null;
        }
    }

    static async createPlan(data: Day30_60_90Plan): Promise<Day30_60_90Plan> {
        const response = await APIClient.post<{ plan: Day30_60_90Plan }>(this.endpoint, data);
        return response.plan;
    }

    static async updatePlan(id: string, updates: Partial<Day30_60_90Plan>): Promise<Day30_60_90Plan> {
        const response = await APIClient.put<{ plan: Day30_60_90Plan }>(`${this.endpoint}/${id}`, updates);
        return response.plan;
    }

    static async reviewMilestone(
        planId: string,
        phase: 'day_30' | 'day_60' | 'day_90',
        reviewedBy: string,
        managerFeedback: string,
        achievementPercentage: number
    ): Promise<Day30_60_90Plan> {
        const response = await APIClient.post<{ plan: Day30_60_90Plan }>(
            `${this.endpoint}/${planId}/review/${phase}`,
            { reviewedBy, managerFeedback, achievementPercentage }
        );
        return response.plan;
    }
}

/**
 * Survey Service
 * Manages onboarding surveys and feedback
 */
export class OnboardingSurveyService {
    private static endpoint = '/onboarding/surveys';

    static async getSurveys(): Promise<OnboardingSurvey[]> {
        try {
            const response = await APIClient.get<{ surveys?: OnboardingSurvey[] }>(this.endpoint);
            return response.surveys || [];
        } catch {
                        return [];
        }
    }

    static async getSurveyById(id: string): Promise<OnboardingSurvey | null> {
        try {
            const response = await APIClient.get<{ survey: OnboardingSurvey }>(`${this.endpoint}/${id}`);
            return response.survey;
        } catch {
                        return null;
        }
    }

    static async createSurvey(data: OnboardingSurvey): Promise<OnboardingSurvey> {
        const response = await APIClient.post<{ survey: OnboardingSurvey }>(this.endpoint, data);
        return response.survey;
    }

    static async completeSurvey(
        surveyId: string,
        responses: any[],
        overallRating: number,
        comments?: string
    ): Promise<OnboardingSurvey> {
        const response = await APIClient.post<{ survey: OnboardingSurvey }>(
            `${this.endpoint}/${surveyId}/complete`,
            { responses, overallRating, comments }
        );
        return response.survey;
    }
}

/**
 * Feedback Service
 * Manages new hire and manager feedback
 */
export class FeedbackService {
    private static endpoint = '/onboarding/feedback';

    static async getFeedback(): Promise<NewHireFeedback[]> {
        try {
            const response = await APIClient.get<{ feedback?: NewHireFeedback[] }>(this.endpoint);
            return response.feedback || [];
        } catch {
                        return [];
        }
    }

    static async createFeedback(data: NewHireFeedback): Promise<NewHireFeedback> {
        const response = await APIClient.post<{ feedback: NewHireFeedback }>(this.endpoint, data);
        return response.feedback;
    }
}

/**
 * Pre-Boarding Service
 * Manages pre-boarding packages and materials
 */
export class PreBoardingService {
    private static endpoint = '/onboarding/pre-boarding';

    static async getPackages(): Promise<PreBoardingPackage[]> {
        try {
            const response = await APIClient.get<{ packages?: PreBoardingPackage[] }>(this.endpoint);
            return response.packages || [];
        } catch {
                        return [];
        }
    }

    static async getPackageById(id: string): Promise<PreBoardingPackage | null> {
        try {
            const response = await APIClient.get<{ package: PreBoardingPackage }>(`${this.endpoint}/${id}`);
            return response.package;
        } catch {
                        return null;
        }
    }

    static async createPackage(data: PreBoardingPackage): Promise<PreBoardingPackage> {
        const response = await APIClient.post<{ package: PreBoardingPackage }>(this.endpoint, data);
        return response.package;
    }

    static async sendPackage(packageId: string): Promise<PreBoardingPackage> {
        const response = await APIClient.post<{ package: PreBoardingPackage }>(`${this.endpoint}/${packageId}/send`, {});
        return response.package;
    }

    static async acknowledgePackage(packageId: string): Promise<PreBoardingPackage> {
        const response = await APIClient.post<{ package: PreBoardingPackage }>(`${this.endpoint}/${packageId}/acknowledge`, {});
        return response.package;
    }
}

/**
 * Analytics Service
 * Provides onboarding metrics and analytics
 */
export class OnboardingAnalyticsService {
    private static endpoint = '/onboarding/analytics';

    static async getMetrics(): Promise<OnboardingMetrics> {
        try {
            const response = await APIClient.get<{ metrics: OnboardingMetrics }>(this.endpoint);
            return response.metrics;
        } catch {
                        return {
                totalOnboardings: 0,
                activeOnboardings: 0,
                completedOnboardings: 0,
                averageDuration: 0,
                completionRate: 0,
                onTimeCompletionRate: 0,
                averageTaskCompletionRate: 0,
                averageSatisfactionScore: 0,
                byPhase: [],
                byDepartment: [],
                commonChallenges: [],
                topPerformingBuddies: [],
                documentCompletionRate: 0,
                equipmentDeliveryTime: 0,
                accessProvisioningTime: 0,
                trainingCompletionRate: 0,
            };
        }
    }
}

/**
 * Settings Service
 * Manages onboarding module configuration
 */
export class OnboardingSettingsService {
    private static endpoint = '/onboarding/settings';

    static async getSettings(): Promise<OnboardingSettings> {
        try {
            const response = await APIClient.get<{ settings: OnboardingSettings }>(this.endpoint);
            return response.settings;
        } catch {
                        return {
                autoAssignBuddy: true,
                buddyMatchingCriteria: 'department',
                autoSendPreBoarding: true,
                preBoardingDaysBeforeStart: 7,
                autoCreateTasks: true,
                sendTaskReminders: true,
                reminderDaysBefore: 2,
                enableSurveys: true,
                enable30_60_90Plan: true,
                requireManagerReview: true,
                managerReviewFrequency: 'weekly',
                autoNotifications: {
                    newHireWelcome: true,
                    preBoardingPackage: true,
                    taskAssigned: true,
                    taskDue: true,
                    taskOverdue: true,
                    documentPending: true,
                    equipmentReady: true,
                    accessGranted: true,
                    surveyDue: true,
                    buddyAssigned: true,
                    milestoneReached: true,
                    completionCertificate: true,
                },
            };
        }
    }

    static async updateSettings(updates: Partial<OnboardingSettings>): Promise<OnboardingSettings> {
        const response = await APIClient.put<{ settings: OnboardingSettings }>(this.endpoint, updates);
        return response.settings;
    }
}
