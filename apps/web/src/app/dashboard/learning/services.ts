/**
 * Learning Management System - Service Layer
 * 
 * API-ready service classes with localStorage persistence.
 * Replace localStorage calls with real API endpoints when backend is ready.
 */

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

// Storage keys
const STORAGE_KEYS = {
    COURSES: 'learning_courses',
    LEARNING_PATHS: 'learning_paths',
    ENROLLMENTS: 'learning_enrollments',
    ASSESSMENTS: 'learning_assessments',
    ASSESSMENT_ATTEMPTS: 'learning_assessment_attempts',
    CERTIFICATIONS: 'learning_certifications',
    TRAINING_SESSIONS: 'learning_training_sessions',
    EXTERNAL_TRAINING: 'learning_external_training',
    SKILL_GAP_ANALYSIS: 'learning_skill_gap_analysis',
    MENTORING_PROGRAMS: 'learning_mentoring_programs',
    TRAINING_BUDGETS: 'learning_training_budgets',
    KNOWLEDGE_ARTICLES: 'learning_knowledge_articles',
    TRAINING_FEEDBACK: 'learning_training_feedback',
    SETTINGS: 'learning_settings',
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

export class CourseService {
    static async getCourses(filters?: { status?: string; categoryId?: string }): Promise<Course[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<Course[]>(STORAGE_KEYS.COURSES);
        let courses = stored || [];
        
        if (filters?.status) {
            courses = courses.filter(c => c.status === filters.status);
        }
        if (filters?.categoryId) {
            courses = courses.filter(c => c.categoryId === filters.categoryId);
        }
        
        return courses;
    }

    static async createCourse(data: Course): Promise<Course> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<Course[]>(STORAGE_KEYS.COURSES) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.COURSES, stored);
        return data;
    }

    static async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<Course[]>(STORAGE_KEYS.COURSES) || [];
        const index = stored.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Course not found');
        
        stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.COURSES, stored);
        return stored[index];
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
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<LearningPath[]>(STORAGE_KEYS.LEARNING_PATHS);
        let paths = stored || [];
        
        if (filters?.isActive !== undefined) {
            paths = paths.filter(p => p.isActive === filters.isActive);
        }
        
        return paths;
    }

    static async createLearningPath(data: LearningPath): Promise<LearningPath> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<LearningPath[]>(STORAGE_KEYS.LEARNING_PATHS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.LEARNING_PATHS, stored);
        return data;
    }

    static async updateLearningPath(id: string, updates: Partial<LearningPath>): Promise<LearningPath> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<LearningPath[]>(STORAGE_KEYS.LEARNING_PATHS) || [];
        const index = stored.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Learning path not found');
        
        stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.LEARNING_PATHS, stored);
        return stored[index];
    }
}

export class EnrollmentService {
    static async getEnrollments(filters?: { learnerId?: string; courseId?: string; status?: EnrollmentStatus }): Promise<Enrollment[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS);
        let enrollments = stored || [];
        
        if (filters?.learnerId) {
            enrollments = enrollments.filter(e => e.learnerId === filters.learnerId);
        }
        if (filters?.courseId) {
            enrollments = enrollments.filter(e => e.courseId === filters.courseId);
        }
        if (filters?.status) {
            enrollments = enrollments.filter(e => e.status === filters.status);
        }
        
        return enrollments;
    }

    static async createEnrollment(data: Enrollment): Promise<Enrollment> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.ENROLLMENTS, stored);
        
        // Update course enrollment count
        const courses = StorageService.load<Course[]>(STORAGE_KEYS.COURSES) || [];
        const course = courses.find(c => c.id === data.courseId);
        if (course) {
            course.currentEnrollments += 1;
            StorageService.save(STORAGE_KEYS.COURSES, courses);
        }
        
        return data;
    }

    static async updateEnrollment(id: string, updates: Partial<Enrollment>): Promise<Enrollment> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS) || [];
        const index = stored.findIndex(e => e.id === id);
        if (index === -1) throw new Error('Enrollment not found');
        
        stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.ENROLLMENTS, stored);
        return stored[index];
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
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<Assessment[]>(STORAGE_KEYS.ASSESSMENTS);
        let assessments = stored || [];
        
        if (filters?.courseId) {
            assessments = assessments.filter(a => a.courseId === filters.courseId);
        }
        
        return assessments;
    }

    static async createAssessment(data: Assessment): Promise<Assessment> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<Assessment[]>(STORAGE_KEYS.ASSESSMENTS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.ASSESSMENTS, stored);
        return data;
    }

    static async getAssessmentAttempts(filters?: { assessmentId?: string; learnerId?: string }): Promise<AssessmentAttempt[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<AssessmentAttempt[]>(STORAGE_KEYS.ASSESSMENT_ATTEMPTS);
        let attempts = stored || [];
        
        if (filters?.assessmentId) {
            attempts = attempts.filter(a => a.assessmentId === filters.assessmentId);
        }
        if (filters?.learnerId) {
            attempts = attempts.filter(a => a.learnerId === filters.learnerId);
        }
        
        return attempts;
    }

    static async submitAssessment(data: AssessmentAttempt): Promise<AssessmentAttempt> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<AssessmentAttempt[]>(STORAGE_KEYS.ASSESSMENT_ATTEMPTS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.ASSESSMENT_ATTEMPTS, stored);
        return data;
    }
}

export class CertificationService {
    static async getCertifications(filters?: { learnerId?: string; status?: CertificationStatus }): Promise<Certification[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<Certification[]>(STORAGE_KEYS.CERTIFICATIONS);
        let certifications = stored || [];
        
        if (filters?.learnerId) {
            certifications = certifications.filter(c => c.learnerId === filters.learnerId);
        }
        if (filters?.status) {
            certifications = certifications.filter(c => c.status === filters.status);
        }
        
        return certifications;
    }

    static async issueCertification(data: Certification): Promise<Certification> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<Certification[]>(STORAGE_KEYS.CERTIFICATIONS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.CERTIFICATIONS, stored);
        return data;
    }

    static async updateCertification(id: string, updates: Partial<Certification>): Promise<Certification> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<Certification[]>(STORAGE_KEYS.CERTIFICATIONS) || [];
        const index = stored.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Certification not found');
        
        stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.CERTIFICATIONS, stored);
        return stored[index];
    }

    static async revokeCertification(id: string): Promise<Certification> {
        return this.updateCertification(id, { status: 'revoked' });
    }
}

export class TrainingSessionService {
    static async getTrainingSessions(filters?: { courseId?: string; status?: SessionStatus }): Promise<TrainingSession[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<TrainingSession[]>(STORAGE_KEYS.TRAINING_SESSIONS);
        let sessions = stored || [];
        
        if (filters?.courseId) {
            sessions = sessions.filter(s => s.courseId === filters.courseId);
        }
        if (filters?.status) {
            sessions = sessions.filter(s => s.status === filters.status);
        }
        
        return sessions;
    }

    static async createTrainingSession(data: TrainingSession): Promise<TrainingSession> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<TrainingSession[]>(STORAGE_KEYS.TRAINING_SESSIONS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.TRAINING_SESSIONS, stored);
        return data;
    }

    static async updateTrainingSession(id: string, updates: Partial<TrainingSession>): Promise<TrainingSession> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<TrainingSession[]>(STORAGE_KEYS.TRAINING_SESSIONS) || [];
        const index = stored.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Training session not found');
        
        stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.TRAINING_SESSIONS, stored);
        return stored[index];
    }

    static async markAttendance(sessionId: string, learnerId: string, status: string): Promise<TrainingSession> {
        const stored = StorageService.load<TrainingSession[]>(STORAGE_KEYS.TRAINING_SESSIONS) || [];
        const session = stored.find(s => s.id === sessionId);
        if (!session) throw new Error('Training session not found');
        
        const attendee = session.attendees.find(a => a.learnerId === learnerId);
        if (attendee) {
            attendee.attendanceStatus = status as any;
            attendee.attendanceMarkedAt = new Date().toISOString();
        }
        
        StorageService.save(STORAGE_KEYS.TRAINING_SESSIONS, stored);
        return session;
    }
}

export class ExternalTrainingService {
    static async getExternalTraining(filters?: { learnerId?: string }): Promise<ExternalTraining[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<ExternalTraining[]>(STORAGE_KEYS.EXTERNAL_TRAINING);
        let trainings = stored || [];
        
        if (filters?.learnerId) {
            trainings = trainings.filter(t => t.learnerId === filters.learnerId);
        }
        
        return trainings;
    }

    static async createExternalTraining(data: ExternalTraining): Promise<ExternalTraining> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<ExternalTraining[]>(STORAGE_KEYS.EXTERNAL_TRAINING) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.EXTERNAL_TRAINING, stored);
        return data;
    }

    static async approveExternalTraining(id: string, approvedBy: string): Promise<ExternalTraining> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<ExternalTraining[]>(STORAGE_KEYS.EXTERNAL_TRAINING) || [];
        const index = stored.findIndex(t => t.id === id);
        if (index === -1) throw new Error('External training not found');
        
        stored[index] = { 
            ...stored[index], 
            approvalStatus: 'approved',
            approvedBy,
            approvedDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        StorageService.save(STORAGE_KEYS.EXTERNAL_TRAINING, stored);
        return stored[index];
    }
}

export class SkillGapService {
    static async getSkillGapAnalysis(filters?: { employeeId?: string }): Promise<SkillGapAnalysis[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<SkillGapAnalysis[]>(STORAGE_KEYS.SKILL_GAP_ANALYSIS);
        let analyses = stored || [];
        
        if (filters?.employeeId) {
            analyses = analyses.filter(a => a.employeeId === filters.employeeId);
        }
        
        return analyses;
    }

    static async createSkillGapAnalysis(data: SkillGapAnalysis): Promise<SkillGapAnalysis> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<SkillGapAnalysis[]>(STORAGE_KEYS.SKILL_GAP_ANALYSIS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.SKILL_GAP_ANALYSIS, stored);
        return data;
    }
}

export class MentoringService {
    static async getMentoringPrograms(filters?: { mentorId?: string; menteeId?: string }): Promise<MentoringProgram[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<MentoringProgram[]>(STORAGE_KEYS.MENTORING_PROGRAMS);
        let programs = stored || [];
        
        if (filters?.mentorId) {
            programs = programs.filter(p => p.mentorId === filters.mentorId);
        }
        if (filters?.menteeId) {
            programs = programs.filter(p => p.menteeId === filters.menteeId);
        }
        
        return programs;
    }

    static async createMentoringProgram(data: MentoringProgram): Promise<MentoringProgram> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<MentoringProgram[]>(STORAGE_KEYS.MENTORING_PROGRAMS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.MENTORING_PROGRAMS, stored);
        return data;
    }
}

export class TrainingBudgetService {
    static async getTrainingBudgets(filters?: { fiscalYear?: string; departmentId?: string }): Promise<TrainingBudget[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<TrainingBudget[]>(STORAGE_KEYS.TRAINING_BUDGETS);
        let budgets = stored || [];
        
        if (filters?.fiscalYear) {
            budgets = budgets.filter(b => b.fiscalYear === filters.fiscalYear);
        }
        if (filters?.departmentId) {
            budgets = budgets.filter(b => b.departmentId === filters.departmentId);
        }
        
        return budgets;
    }

    static async createTrainingBudget(data: TrainingBudget): Promise<TrainingBudget> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<TrainingBudget[]>(STORAGE_KEYS.TRAINING_BUDGETS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.TRAINING_BUDGETS, stored);
        return data;
    }
}

export class KnowledgeBaseService {
    static async getKnowledgeArticles(filters?: { categoryId?: string }): Promise<KnowledgeArticle[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<KnowledgeArticle[]>(STORAGE_KEYS.KNOWLEDGE_ARTICLES);
        let articles = stored || [];
        
        if (filters?.categoryId) {
            articles = articles.filter(a => a.categoryId === filters.categoryId);
        }
        
        return articles;
    }

    static async createKnowledgeArticle(data: KnowledgeArticle): Promise<KnowledgeArticle> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<KnowledgeArticle[]>(STORAGE_KEYS.KNOWLEDGE_ARTICLES) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.KNOWLEDGE_ARTICLES, stored);
        return data;
    }
}

export class TrainingFeedbackService {
    static async getTrainingFeedback(filters?: { courseId?: string; learnerId?: string }): Promise<TrainingFeedback[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<TrainingFeedback[]>(STORAGE_KEYS.TRAINING_FEEDBACK);
        let feedback = stored || [];
        
        if (filters?.courseId) {
            feedback = feedback.filter(f => f.courseId === filters.courseId);
        }
        if (filters?.learnerId) {
            feedback = feedback.filter(f => f.learnerId === filters.learnerId);
        }
        
        return feedback;
    }

    static async submitTrainingFeedback(data: TrainingFeedback): Promise<TrainingFeedback> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<TrainingFeedback[]>(STORAGE_KEYS.TRAINING_FEEDBACK) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.TRAINING_FEEDBACK, stored);
        return data;
    }
}

export class LearningAnalyticsService {
    static async getAnalytics(): Promise<LearningAnalytics> {
        await delay(300);
        // TODO: Replace with real API call
        const courses = StorageService.load<Course[]>(STORAGE_KEYS.COURSES) || [];
        const enrollments = StorageService.load<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS) || [];
        const certifications = StorageService.load<Certification[]>(STORAGE_KEYS.CERTIFICATIONS) || [];

        const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
        const totalEnrollments = enrollments.length;

        return {
            totalCourses: courses.length,
            activeCourses: courses.filter(c => c.status === 'published').length,
            totalEnrollments,
            activeEnrollments: enrollments.filter(e => e.status === 'in_progress').length,
            completedEnrollments,
            averageCompletionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
            averageScore: enrollments.reduce((sum, e) => sum + (e.score || 0), 0) / (enrollments.filter(e => e.score).length || 1),
            totalCertificationsIssued: certifications.length,
            totalTrainingHours: enrollments.reduce((sum, e) => sum + (e.timeSpent / 60), 0),
            trainingBudgetUtilization: 75, // TODO: Calculate from actual budget data
            topCourses: [],
            enrollmentsByCategory: {},
            completionTrend: [],
        };
    }
}

export class LearningSettingsService {
    static async getSettings(): Promise<LearningSettings | null> {
        await delay(300);
        // TODO: Replace with real API call
        return StorageService.load<LearningSettings>(STORAGE_KEYS.SETTINGS);
    }

    static async updateSettings(updates: Partial<LearningSettings>): Promise<LearningSettings> {
        await delay(500);
        // TODO: Replace with real API call
        const current = StorageService.load<LearningSettings>(STORAGE_KEYS.SETTINGS);
        const updated = { ...current, ...updates } as LearningSettings;
        StorageService.save(STORAGE_KEYS.SETTINGS, updated);
        return updated;
    }
}
