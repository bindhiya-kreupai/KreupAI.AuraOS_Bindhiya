/**
 * Learning Management System - Service Layer
 *
 * API-integrated service classes using APIClient.
 */

import { APIClient } from '@/lib/api-client';
import type {
    Course,
    LearningPath,
    Enrollment,
    Assessment,
    AssessmentAttempt,
    Certification,
    TrainingSession,
    ExternalTraining,
    SkillGapAnalysis,
    MentoringProgram,
    TrainingBudget,
    KnowledgeArticle,
    TrainingFeedback,
    LearningAnalytics,
    LearningSettings,
    EnrollmentStatus,
    CertificationStatus,
    SessionStatus,
} from './types';

export class CourseService {
    static async getCourses(filters?: { status?: string; categoryId?: string }): Promise<Course[]> {
        return APIClient.get<Course[]>('/learning/courses', filters);
    }

    static async createCourse(data: Course): Promise<Course> {
        return APIClient.post<Course>('/learning/courses', data);
    }

    static async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
        return APIClient.put<Course>(`/learning/courses/${id}`, updates);
    }

    static async publishCourse(id: string): Promise<Course> {
        return this.updateCourse(id, {
            status: 'published',
            publishedDate: new Date().toISOString(),
        });
    }

    static async archiveCourse(id: string): Promise<Course> {
        return this.updateCourse(id, { status: 'archived' });
    }
}

export class LearningPathService {
    static async getLearningPaths(filters?: { isActive?: boolean }): Promise<LearningPath[]> {
        return APIClient.get<LearningPath[]>('/learning/paths', filters);
    }

    static async createLearningPath(data: LearningPath): Promise<LearningPath> {
        return APIClient.post<LearningPath>('/learning/paths', data);
    }

    static async updateLearningPath(id: string, updates: Partial<LearningPath>): Promise<LearningPath> {
        return APIClient.put<LearningPath>(`/learning/paths/${id}`, updates);
    }
}

export class EnrollmentService {
    static async getEnrollments(filters?: { learnerId?: string; courseId?: string; status?: EnrollmentStatus }): Promise<Enrollment[]> {
        return APIClient.get<Enrollment[]>('/learning/enrollments', filters);
    }

    static async createEnrollment(data: Enrollment): Promise<Enrollment> {
        return APIClient.post<Enrollment>('/learning/enrollments', data);
    }

    static async updateEnrollment(id: string, updates: Partial<Enrollment>): Promise<Enrollment> {
        return APIClient.put<Enrollment>(`/learning/enrollments/${id}`, updates);
    }

    static async startEnrollment(id: string): Promise<Enrollment> {
        return this.updateEnrollment(id, {
            status: 'in_progress',
            startDate: new Date().toISOString(),
        });
    }

    static async completeEnrollment(id: string, score: number): Promise<Enrollment> {
        return this.updateEnrollment(id, {
            status: 'completed',
            completedDate: new Date().toISOString(),
            progress: 100,
            score,
        });
    }

    static async withdrawEnrollment(id: string): Promise<Enrollment> {
        return this.updateEnrollment(id, { status: 'withdrawn' });
    }

    static async updateProgress(id: string, progress: number, timeSpent: number): Promise<Enrollment> {
        return this.updateEnrollment(id, {
            progress,
            timeSpent,
            lastAccessedDate: new Date().toISOString(),
        });
    }
}

export class AssessmentService {
    static async getAssessments(filters?: { courseId?: string }): Promise<Assessment[]> {
        return APIClient.get<Assessment[]>('/learning/assessments', filters);
    }

    static async createAssessment(data: Assessment): Promise<Assessment> {
        return APIClient.post<Assessment>('/learning/assessments', data);
    }

    static async getAssessmentAttempts(filters?: { assessmentId?: string; learnerId?: string }): Promise<AssessmentAttempt[]> {
        return APIClient.get<AssessmentAttempt[]>('/learning/assessment-attempts', filters);
    }

    static async submitAssessment(data: AssessmentAttempt): Promise<AssessmentAttempt> {
        return APIClient.post<AssessmentAttempt>('/learning/assessment-attempts', data);
    }
}

export class CertificationService {
    static async getCertifications(filters?: { learnerId?: string; status?: CertificationStatus }): Promise<Certification[]> {
        return APIClient.get<Certification[]>('/learning/certifications', filters);
    }

    static async issueCertification(data: Certification): Promise<Certification> {
        return APIClient.post<Certification>('/learning/certifications', data);
    }

    static async updateCertification(id: string, updates: Partial<Certification>): Promise<Certification> {
        return APIClient.put<Certification>(`/learning/certifications/${id}`, updates);
    }

    static async revokeCertification(id: string): Promise<Certification> {
        return this.updateCertification(id, { status: 'revoked' });
    }
}

export class TrainingSessionService {
    static async getTrainingSessions(filters?: { courseId?: string; status?: SessionStatus }): Promise<TrainingSession[]> {
        return APIClient.get<TrainingSession[]>('/learning/training-sessions', filters);
    }

    static async createTrainingSession(data: TrainingSession): Promise<TrainingSession> {
        return APIClient.post<TrainingSession>('/learning/training-sessions', data);
    }

    static async updateTrainingSession(id: string, updates: Partial<TrainingSession>): Promise<TrainingSession> {
        return APIClient.put<TrainingSession>(`/learning/training-sessions/${id}`, updates);
    }

    static async markAttendance(sessionId: string, learnerId: string, status: string): Promise<TrainingSession> {
        return APIClient.post<TrainingSession>(`/learning/training-sessions/${sessionId}/attendance`, {
            learnerId,
            status,
        });
    }
}

export class ExternalTrainingService {
    static async getExternalTraining(filters?: { learnerId?: string }): Promise<ExternalTraining[]> {
        return APIClient.get<ExternalTraining[]>('/learning/external-training', filters);
    }

    static async createExternalTraining(data: ExternalTraining): Promise<ExternalTraining> {
        return APIClient.post<ExternalTraining>('/learning/external-training', data);
    }

    static async approveExternalTraining(id: string, approvedBy: string): Promise<ExternalTraining> {
        return APIClient.post<ExternalTraining>(`/learning/external-training/${id}/approve`, { approvedBy });
    }
}

export class SkillGapService {
    static async getSkillGapAnalysis(filters?: { employeeId?: string }): Promise<SkillGapAnalysis[]> {
        return APIClient.get<SkillGapAnalysis[]>('/learning/skill-gap-analysis', filters);
    }

    static async createSkillGapAnalysis(data: SkillGapAnalysis): Promise<SkillGapAnalysis> {
        return APIClient.post<SkillGapAnalysis>('/learning/skill-gap-analysis', data);
    }
}

export class MentoringService {
    static async getMentoringPrograms(filters?: { mentorId?: string; menteeId?: string }): Promise<MentoringProgram[]> {
        return APIClient.get<MentoringProgram[]>('/learning/mentoring-programs', filters);
    }

    static async createMentoringProgram(data: MentoringProgram): Promise<MentoringProgram> {
        return APIClient.post<MentoringProgram>('/learning/mentoring-programs', data);
    }
}

export class TrainingBudgetService {
    static async getTrainingBudgets(filters?: { fiscalYear?: string; departmentId?: string }): Promise<TrainingBudget[]> {
        return APIClient.get<TrainingBudget[]>('/learning/training-budgets', filters);
    }

    static async createTrainingBudget(data: TrainingBudget): Promise<TrainingBudget> {
        return APIClient.post<TrainingBudget>('/learning/training-budgets', data);
    }
}

export class KnowledgeBaseService {
    static async getKnowledgeArticles(filters?: { categoryId?: string }): Promise<KnowledgeArticle[]> {
        return APIClient.get<KnowledgeArticle[]>('/learning/knowledge-articles', filters);
    }

    static async createKnowledgeArticle(data: KnowledgeArticle): Promise<KnowledgeArticle> {
        return APIClient.post<KnowledgeArticle>('/learning/knowledge-articles', data);
    }
}

export class TrainingFeedbackService {
    static async getTrainingFeedback(filters?: { courseId?: string; learnerId?: string }): Promise<TrainingFeedback[]> {
        return APIClient.get<TrainingFeedback[]>('/learning/training-feedback', filters);
    }

    static async submitTrainingFeedback(data: TrainingFeedback): Promise<TrainingFeedback> {
        return APIClient.post<TrainingFeedback>('/learning/training-feedback', data);
    }
}

export class LearningAnalyticsService {
    static async getAnalytics(): Promise<LearningAnalytics> {
        return APIClient.get<LearningAnalytics>('/learning/analytics');
    }
}

export class LearningSettingsService {
    static async getSettings(): Promise<LearningSettings | null> {
        return APIClient.get<LearningSettings>('/learning/settings');
    }

    static async updateSettings(updates: Partial<LearningSettings>): Promise<LearningSettings> {
        return APIClient.put<LearningSettings>('/learning/settings', updates);
    }
}
