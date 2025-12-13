/**
 * Onboarding Module - Service Layer
 *
 * API-ready service classes with localStorage persistence
 * 11 service classes covering all onboarding workflows
 */

import {
    OnboardingProgram,
    OnboardingInstance,
    OnboardingTask,
    OnboardingDocument,
    OnboardingEquipment,
    OnboardingAccess,
    OnboardingTraining,
    BuddyAssignment,
    Day30_60_90Plan,
    OnboardingSurvey,
    NewHireFeedback,
    PreBoardingPackage,
    OnboardingMetrics,
    OnboardingSettings,
    TaskStatus,
    OnboardingStatus,
} from './types';

const STORAGE_KEYS = {
    PROGRAMS: 'onboarding_programs',
    INSTANCES: 'onboarding_instances',
    BUDDY_ASSIGNMENTS: 'onboarding_buddy_assignments',
    DAY_PLANS: 'onboarding_day_plans',
    SURVEYS: 'onboarding_surveys',
    FEEDBACK: 'onboarding_feedback',
    PRE_BOARDING: 'onboarding_pre_boarding',
    SETTINGS: 'onboarding_settings',
};

// TODO: Replace localStorage with actual API calls

/**
 * Onboarding Program Service
 * Manages onboarding program templates and configurations
 */
export class OnboardingProgramService {
    static async getPrograms(): Promise<OnboardingProgram[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.PROGRAMS);
        return stored ? JSON.parse(stored) : [];
    }

    static async getProgramById(id: string): Promise<OnboardingProgram | null> {
        const programs = await this.getPrograms();
        return programs.find(p => p.id === id) || null;
    }

    static async createProgram(data: OnboardingProgram): Promise<OnboardingProgram> {
        const programs = await this.getPrograms();
        programs.push({ ...data, updatedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
        return data;
    }

    static async updateProgram(id: string, updates: Partial<OnboardingProgram>): Promise<OnboardingProgram> {
        const programs = await this.getPrograms();
        const index = programs.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Program not found');

        programs[index] = { ...programs[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
        return programs[index];
    }

    static async deleteProgram(id: string): Promise<void> {
        const programs = await this.getPrograms();
        const filtered = programs.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(filtered));
    }

    static async cloneProgram(id: string, newName: string): Promise<OnboardingProgram> {
        const program = await this.getProgramById(id);
        if (!program) throw new Error('Program not found');

        const newProgram: OnboardingProgram = {
            ...program,
            id: `prog_${Date.now()}`,
            programCode: `${program.programCode}_COPY`,
            programName: newName,
            isTemplate: true,
            usageCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return this.createProgram(newProgram);
    }
}

/**
 * Onboarding Instance Service
 * Manages individual employee onboarding instances
 */
export class OnboardingInstanceService {
    static async getInstances(): Promise<OnboardingInstance[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.INSTANCES);
        return stored ? JSON.parse(stored) : [];
    }

    static async getInstanceById(id: string): Promise<OnboardingInstance | null> {
        const instances = await this.getInstances();
        return instances.find(i => i.id === id) || null;
    }

    static async getByEmployeeId(employeeId: string): Promise<OnboardingInstance | null> {
        const instances = await this.getInstances();
        return instances.find(i => i.employeeId === employeeId) || null;
    }

    static async createInstance(data: OnboardingInstance): Promise<OnboardingInstance> {
        const instances = await this.getInstances();
        instances.push({ ...data, updatedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.INSTANCES, JSON.stringify(instances));
        return data;
    }

    static async updateInstance(id: string, updates: Partial<OnboardingInstance>): Promise<OnboardingInstance> {
        const instances = await this.getInstances();
        const index = instances.findIndex(i => i.id === id);
        if (index === -1) throw new Error('Instance not found');

        instances[index] = { ...instances[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.INSTANCES, JSON.stringify(instances));
        return instances[index];
    }

    static async startOnboarding(id: string): Promise<OnboardingInstance> {
        return this.updateInstance(id, {
            status: 'in_progress',
            currentPhase: 'first_day',
        });
    }

    static async completeOnboarding(id: string): Promise<OnboardingInstance> {
        return this.updateInstance(id, {
            status: 'completed',
            actualCompletionDate: new Date().toISOString(),
            progress: 100,
        });
    }

    static async updateProgress(id: string): Promise<OnboardingInstance> {
        const instance = await this.getInstanceById(id);
        if (!instance) throw new Error('Instance not found');

        const completedTasks = instance.tasks.filter(t => t.status === 'completed').length;
        const totalTasks = instance.tasks.filter(t => t.isMandatory).length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return this.updateInstance(id, {
            completedTasks,
            overdueTasks: instance.tasks.filter(t => t.status === 'overdue').length,
            progress,
        });
    }
}

/**
 * Task Service
 * Manages onboarding tasks
 */
export class OnboardingTaskService {
    static async updateTaskStatus(
        instanceId: string,
        taskId: string,
        status: TaskStatus,
        completedBy?: string
    ): Promise<OnboardingInstance> {
        const instance = await OnboardingInstanceService.getInstanceById(instanceId);
        if (!instance) throw new Error('Instance not found');

        const taskIndex = instance.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) throw new Error('Task not found');

        instance.tasks[taskIndex] = {
            ...instance.tasks[taskIndex],
            status,
            completedDate: status === 'completed' ? new Date().toISOString() : undefined,
            completedBy: status === 'completed' ? completedBy : undefined,
        };

        await OnboardingInstanceService.updateInstance(instanceId, { tasks: instance.tasks });
        return OnboardingInstanceService.updateProgress(instanceId);
    }

    static async addTaskComment(
        instanceId: string,
        taskId: string,
        comment: string
    ): Promise<OnboardingInstance> {
        const instance = await OnboardingInstanceService.getInstanceById(instanceId);
        if (!instance) throw new Error('Instance not found');

        const taskIndex = instance.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) throw new Error('Task not found');

        instance.tasks[taskIndex].comments = comment;

        return OnboardingInstanceService.updateInstance(instanceId, { tasks: instance.tasks });
    }

    static async assignTask(
        instanceId: string,
        taskId: string,
        assignedTo: string,
        assignedToName: string
    ): Promise<OnboardingInstance> {
        const instance = await OnboardingInstanceService.getInstanceById(instanceId);
        if (!instance) throw new Error('Instance not found');

        const taskIndex = instance.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) throw new Error('Task not found');

        instance.tasks[taskIndex] = {
            ...instance.tasks[taskIndex],
            assignedTo,
            assignedToName,
            status: 'in_progress',
        };

        return OnboardingInstanceService.updateInstance(instanceId, { tasks: instance.tasks });
    }
}

/**
 * Document Service
 * Manages onboarding document collection
 */
export class OnboardingDocumentService {
    static async uploadDocument(
        instanceId: string,
        documentId: string,
        fileUrl: string,
        fileName: string,
        fileSize: number
    ): Promise<OnboardingInstance> {
        const instance = await OnboardingInstanceService.getInstanceById(instanceId);
        if (!instance) throw new Error('Instance not found');

        const docIndex = instance.documents.findIndex(d => d.documentId === documentId);
        if (docIndex === -1) throw new Error('Document not found');

        instance.documents[docIndex] = {
            ...instance.documents[docIndex],
            status: 'submitted',
            uploadedDate: new Date().toISOString(),
            fileUrl,
            fileName,
            fileSize,
        };

        return OnboardingInstanceService.updateInstance(instanceId, { documents: instance.documents });
    }

    static async verifyDocument(
        instanceId: string,
        documentId: string,
        verifiedBy: string,
        approved: boolean,
        rejectionReason?: string
    ): Promise<OnboardingInstance> {
        const instance = await OnboardingInstanceService.getInstanceById(instanceId);
        if (!instance) throw new Error('Instance not found');

        const docIndex = instance.documents.findIndex(d => d.documentId === documentId);
        if (docIndex === -1) throw new Error('Document not found');

        instance.documents[docIndex] = {
            ...instance.documents[docIndex],
            status: approved ? 'approved' : 'rejected',
            verifiedBy,
            verifiedDate: new Date().toISOString(),
            approvedBy: approved ? verifiedBy : undefined,
            approvedDate: approved ? new Date().toISOString() : undefined,
            rejectionReason,
        };

        return OnboardingInstanceService.updateInstance(instanceId, { documents: instance.documents });
    }
}

/**
 * Equipment Service
 * Manages equipment provisioning
 */
export class OnboardingEquipmentService {
    static async requestEquipment(
        instanceId: string,
        equipmentId: string,
        requestedBy: string
    ): Promise<OnboardingInstance> {
        const instance = await OnboardingInstanceService.getInstanceById(instanceId);
        if (!instance) throw new Error('Instance not found');

        const equipIndex = instance.equipment.findIndex(e => e.equipmentId === equipmentId);
        if (equipIndex === -1) throw new Error('Equipment not found');

        instance.equipment[equipIndex] = {
            ...instance.equipment[equipIndex],
            status: 'requested',
            requestedDate: new Date().toISOString(),
            requestedBy,
        };

        return OnboardingInstanceService.updateInstance(instanceId, { equipment: instance.equipment });
    }

    static async approveEquipment(
        instanceId: string,
        equipmentId: string,
        approvedBy: string
    ): Promise<OnboardingInstance> {
        const instance = await OnboardingInstanceService.getInstanceById(instanceId);
        if (!instance) throw new Error('Instance not found');

        const equipIndex = instance.equipment.findIndex(e => e.equipmentId === equipmentId);
        if (equipIndex === -1) throw new Error('Equipment not found');

        instance.equipment[equipIndex] = {
            ...instance.equipment[equipIndex],
            status: 'approved',
            approvedBy,
            approvedDate: new Date().toISOString(),
        };

        return OnboardingInstanceService.updateInstance(instanceId, { equipment: instance.equipment });
    }

    static async assignEquipment(
        instanceId: string,
        equipmentId: string,
        assetTag: string,
        serialNumber?: string
    ): Promise<OnboardingInstance> {
        const instance = await OnboardingInstanceService.getInstanceById(instanceId);
        if (!instance) throw new Error('Instance not found');

        const equipIndex = instance.equipment.findIndex(e => e.equipmentId === equipmentId);
        if (equipIndex === -1) throw new Error('Equipment not found');

        instance.equipment[equipIndex] = {
            ...instance.equipment[equipIndex],
            status: 'assigned',
            assignedDate: new Date().toISOString(),
            assetTag,
            serialNumber,
        };

        return OnboardingInstanceService.updateInstance(instanceId, { equipment: instance.equipment });
    }
}

/**
 * Access Service
 * Manages system access provisioning
 */
export class OnboardingAccessService {
    static async requestAccess(
        instanceId: string,
        accessId: string,
        requestedBy: string
    ): Promise<OnboardingInstance> {
        const instance = await OnboardingInstanceService.getInstanceById(instanceId);
        if (!instance) throw new Error('Instance not found');

        const accessIndex = instance.access.findIndex(a => a.accessId === accessId);
        if (accessIndex === -1) throw new Error('Access not found');

        instance.access[accessIndex] = {
            ...instance.access[accessIndex],
            status: 'requested',
            requestedDate: new Date().toISOString(),
            requestedBy,
        };

        return OnboardingInstanceService.updateInstance(instanceId, { access: instance.access });
    }

    static async grantAccess(
        instanceId: string,
        accessId: string,
        grantedBy: string,
        username: string,
        accountId?: string
    ): Promise<OnboardingInstance> {
        const instance = await OnboardingInstanceService.getInstanceById(instanceId);
        if (!instance) throw new Error('Instance not found');

        const accessIndex = instance.access.findIndex(a => a.accessId === accessId);
        if (accessIndex === -1) throw new Error('Access not found');

        instance.access[accessIndex] = {
            ...instance.access[accessIndex],
            status: 'granted',
            grantedDate: new Date().toISOString(),
            grantedBy,
            username,
            accountId,
        };

        return OnboardingInstanceService.updateInstance(instanceId, { access: instance.access });
    }
}

/**
 * Training Service
 * Manages onboarding training and induction
 */
export class OnboardingTrainingService {
    static async scheduleTraining(
        instanceId: string,
        moduleId: string,
        scheduledDate: string,
        location?: string,
        meetingLink?: string
    ): Promise<OnboardingInstance> {
        const instance = await OnboardingInstanceService.getInstanceById(instanceId);
        if (!instance) throw new Error('Instance not found');

        const trainingIndex = instance.training.findIndex(t => t.moduleId === moduleId);
        if (trainingIndex === -1) throw new Error('Training not found');

        instance.training[trainingIndex] = {
            ...instance.training[trainingIndex],
            status: 'in_progress',
            scheduledDate,
            location,
            meetingLink,
        };

        return OnboardingInstanceService.updateInstance(instanceId, { training: instance.training });
    }

    static async completeTraining(
        instanceId: string,
        moduleId: string,
        assessmentScore?: number,
        feedback?: string
    ): Promise<OnboardingInstance> {
        const instance = await OnboardingInstanceService.getInstanceById(instanceId);
        if (!instance) throw new Error('Instance not found');

        const trainingIndex = instance.training.findIndex(t => t.moduleId === moduleId);
        if (trainingIndex === -1) throw new Error('Training not found');

        instance.training[trainingIndex] = {
            ...instance.training[trainingIndex],
            status: 'completed',
            completedDate: new Date().toISOString(),
            attendanceMarked: true,
            assessmentScore,
            assessmentPassed: assessmentScore ? assessmentScore >= 70 : undefined,
            feedback,
        };

        return OnboardingInstanceService.updateInstance(instanceId, { training: instance.training });
    }
}

/**
 * Buddy Assignment Service
 * Manages buddy program and assignments
 */
export class BuddyAssignmentService {
    static async getAssignments(): Promise<BuddyAssignment[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.BUDDY_ASSIGNMENTS);
        return stored ? JSON.parse(stored) : [];
    }

    static async getAssignmentById(id: string): Promise<BuddyAssignment | null> {
        const assignments = await this.getAssignments();
        return assignments.find(a => a.id === id) || null;
    }

    static async createAssignment(data: BuddyAssignment): Promise<BuddyAssignment> {
        const assignments = await this.getAssignments();
        assignments.push(data);
        localStorage.setItem(STORAGE_KEYS.BUDDY_ASSIGNMENTS, JSON.stringify(assignments));
        return data;
    }

    static async updateAssignment(id: string, updates: Partial<BuddyAssignment>): Promise<BuddyAssignment> {
        const assignments = await this.getAssignments();
        const index = assignments.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Assignment not found');

        assignments[index] = { ...assignments[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.BUDDY_ASSIGNMENTS, JSON.stringify(assignments));
        return assignments[index];
    }

    static async completeAssignment(id: string): Promise<BuddyAssignment> {
        return this.updateAssignment(id, {
            status: 'completed',
            completionDate: new Date().toISOString(),
        });
    }
}

/**
 * 30-60-90 Day Plan Service
 * Manages milestone plans and reviews
 */
export class Day30_60_90PlanService {
    static async getPlans(): Promise<Day30_60_90Plan[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.DAY_PLANS);
        return stored ? JSON.parse(stored) : [];
    }

    static async getPlanById(id: string): Promise<Day30_60_90Plan | null> {
        const plans = await this.getPlans();
        return plans.find(p => p.id === id) || null;
    }

    static async createPlan(data: Day30_60_90Plan): Promise<Day30_60_90Plan> {
        const plans = await this.getPlans();
        plans.push(data);
        localStorage.setItem(STORAGE_KEYS.DAY_PLANS, JSON.stringify(plans));
        return data;
    }

    static async updatePlan(id: string, updates: Partial<Day30_60_90Plan>): Promise<Day30_60_90Plan> {
        const plans = await this.getPlans();
        const index = plans.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Plan not found');

        plans[index] = { ...plans[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.DAY_PLANS, JSON.stringify(plans));
        return plans[index];
    }

    static async reviewMilestone(
        planId: string,
        phase: 'day_30' | 'day_60' | 'day_90',
        reviewedBy: string,
        managerFeedback: string,
        achievementPercentage: number
    ): Promise<Day30_60_90Plan> {
        const plan = await this.getPlanById(planId);
        if (!plan) throw new Error('Plan not found');

        const milestoneKey = `${phase}Goals` as 'day30Goals' | 'day60Goals' | 'day90Goals';
        const milestone = plan[milestoneKey];

        milestone.reviewDate = new Date().toISOString();
        milestone.reviewedBy = reviewedBy;
        milestone.managerFeedback = managerFeedback;
        milestone.achievementPercentage = achievementPercentage;
        milestone.status = achievementPercentage >= 80 ? 'completed' : 'in_progress';

        return this.updatePlan(planId, { [milestoneKey]: milestone });
    }
}

/**
 * Survey Service
 * Manages onboarding surveys and feedback
 */
export class OnboardingSurveyService {
    static async getSurveys(): Promise<OnboardingSurvey[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.SURVEYS);
        return stored ? JSON.parse(stored) : [];
    }

    static async getSurveyById(id: string): Promise<OnboardingSurvey | null> {
        const surveys = await this.getSurveys();
        return surveys.find(s => s.id === id) || null;
    }

    static async createSurvey(data: OnboardingSurvey): Promise<OnboardingSurvey> {
        const surveys = await this.getSurveys();
        surveys.push(data);
        localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(surveys));
        return data;
    }

    static async completeSurvey(
        surveyId: string,
        responses: any[],
        overallRating: number,
        comments?: string
    ): Promise<OnboardingSurvey> {
        const surveys = await this.getSurveys();
        const index = surveys.findIndex(s => s.id === surveyId);
        if (index === -1) throw new Error('Survey not found');

        surveys[index] = {
            ...surveys[index],
            status: 'completed',
            completedDate: new Date().toISOString(),
            responses,
            overallRating,
            comments,
        };

        localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(surveys));
        return surveys[index];
    }
}

/**
 * Feedback Service
 * Manages new hire and manager feedback
 */
export class FeedbackService {
    static async getFeedback(): Promise<NewHireFeedback[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
        return stored ? JSON.parse(stored) : [];
    }

    static async createFeedback(data: NewHireFeedback): Promise<NewHireFeedback> {
        const feedback = await this.getFeedback();
        feedback.push(data);
        localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedback));
        return data;
    }
}

/**
 * Pre-Boarding Service
 * Manages pre-boarding packages and materials
 */
export class PreBoardingService {
    static async getPackages(): Promise<PreBoardingPackage[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.PRE_BOARDING);
        return stored ? JSON.parse(stored) : [];
    }

    static async getPackageById(id: string): Promise<PreBoardingPackage | null> {
        const packages = await this.getPackages();
        return packages.find(p => p.id === id) || null;
    }

    static async createPackage(data: PreBoardingPackage): Promise<PreBoardingPackage> {
        const packages = await this.getPackages();
        packages.push(data);
        localStorage.setItem(STORAGE_KEYS.PRE_BOARDING, JSON.stringify(packages));
        return data;
    }

    static async sendPackage(packageId: string): Promise<PreBoardingPackage> {
        const packages = await this.getPackages();
        const index = packages.findIndex(p => p.id === packageId);
        if (index === -1) throw new Error('Package not found');

        packages[index] = {
            ...packages[index],
            status: 'sent',
            sentDate: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEYS.PRE_BOARDING, JSON.stringify(packages));
        return packages[index];
    }

    static async acknowledgePackage(packageId: string): Promise<PreBoardingPackage> {
        const packages = await this.getPackages();
        const index = packages.findIndex(p => p.id === packageId);
        if (index === -1) throw new Error('Package not found');

        packages[index] = {
            ...packages[index],
            status: 'acknowledged',
            acknowledgedDate: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEYS.PRE_BOARDING, JSON.stringify(packages));
        return packages[index];
    }
}

/**
 * Analytics Service
 * Provides onboarding metrics and analytics
 */
export class OnboardingAnalyticsService {
    static async getMetrics(): Promise<OnboardingMetrics> {
        const instances = await OnboardingInstanceService.getInstances();

        const total = instances.length;
        const active = instances.filter(i => i.status === 'in_progress').length;
        const completed = instances.filter(i => i.status === 'completed').length;

        return {
            totalOnboardings: total,
            activeOnboardings: active,
            completedOnboardings: completed,
            averageDuration: 0,
            completionRate: total > 0 ? (completed / total) * 100 : 0,
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

/**
 * Settings Service
 * Manages onboarding module configuration
 */
export class OnboardingSettingsService {
    static async getSettings(): Promise<OnboardingSettings> {
        const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (stored) return JSON.parse(stored);

        const defaults: OnboardingSettings = {
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

        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaults));
        return defaults;
    }

    static async updateSettings(updates: Partial<OnboardingSettings>): Promise<OnboardingSettings> {
        const current = await this.getSettings();
        const updated = { ...current, ...updates };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
        return updated;
    }
}
