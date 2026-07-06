/**
 * Learning Management System - Service Layer
 *
 * API-integrated service classes using APIClient.
 *
 * The learning API surface mixes response envelopes (bare array,
 * `{ success, data }`, `{ success, data: { ... } }`). We normalize every
 * response with APIClient.unwrapList / unwrapItem so pages always receive
 * plain arrays / objects regardless of the route's envelope.
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
    const res = await APIClient.get('/learning/courses', filters);
    return APIClient.unwrapList<Course>(res, 'courses');
  }

  static async createCourse(data: Course): Promise<Course | null> {
    const res = await APIClient.post('/learning/courses', data);
    return APIClient.unwrapItem<Course>(res, 'course');
  }

  static async updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
    const res = await APIClient.put('/learning/courses', { id, ...updates });
    return APIClient.unwrapItem<Course>(res, 'course');
  }

  static async publishCourse(id: string): Promise<Course | null> {
    return this.updateCourse(id, {
      status: 'published',
      publishedDate: new Date().toISOString(),
    });
  }

  static async archiveCourse(id: string): Promise<Course | null> {
    return this.updateCourse(id, { status: 'archived' });
  }
}

export class LearningPathService {
  static async getLearningPaths(filters?: { isActive?: boolean }): Promise<LearningPath[]> {
    const res = await APIClient.get('/learning/paths', filters);
    return APIClient.unwrapList<LearningPath>(res, 'paths');
  }

  static async createLearningPath(data: LearningPath): Promise<LearningPath | null> {
    const res = await APIClient.post('/learning/paths', data);
    return APIClient.unwrapItem<LearningPath>(res, 'path');
  }

  static async updateLearningPath(
    id: string,
    updates: Partial<LearningPath>
  ): Promise<LearningPath | null> {
    const res = await APIClient.put('/learning/paths', { id, ...updates });
    return APIClient.unwrapItem<LearningPath>(res, 'path');
  }

  // AI-driven path recommendations for a learner (v1 recommend endpoint).
  static async getRecommendedPaths(employeeId?: string): Promise<LearningPath[]> {
    const res = await APIClient.get(
      '/v1/learning/paths/recommend',
      employeeId ? { employeeId } : undefined
    );
    const list = APIClient.unwrapList<LearningPath>(res, 'recommended');
    if (list.length > 0) return list;
    // Some responses nest under data.recommended.
    const item = APIClient.unwrapItem<{ recommended?: LearningPath[] }>(res);
    return item?.recommended ?? [];
  }
}

export class EnrollmentService {
  static async getEnrollments(filters?: {
    learnerId?: string;
    courseId?: string;
    status?: EnrollmentStatus;
  }): Promise<Enrollment[]> {
    const res = await APIClient.get('/learning/enrollments', filters);
    return APIClient.unwrapList<Enrollment>(res, 'enrollments');
  }

  static async createEnrollment(data: Partial<Enrollment>): Promise<Enrollment | null> {
    const res = await APIClient.post('/learning/enrollments', data);
    return APIClient.unwrapItem<Enrollment>(res, 'enrollment');
  }

  static async updateEnrollment(
    id: string,
    updates: Partial<Enrollment>
  ): Promise<Enrollment | null> {
    const res = await APIClient.put('/learning/enrollments', { id, ...updates });
    return APIClient.unwrapItem<Enrollment>(res, 'enrollment');
  }

  static async startEnrollment(id: string): Promise<Enrollment | null> {
    return this.updateEnrollment(id, {
      status: 'in_progress',
      startDate: new Date().toISOString(),
    });
  }

  static async approveEnrollment(id: string): Promise<Enrollment | null> {
    return this.updateEnrollment(id, { status: 'in_progress' });
  }

  static async rejectEnrollment(id: string): Promise<Enrollment | null> {
    return this.updateEnrollment(id, { status: 'withdrawn' });
  }

  static async completeEnrollment(id: string, score: number): Promise<Enrollment | null> {
    return this.updateEnrollment(id, {
      status: 'completed',
      completedDate: new Date().toISOString(),
      progress: 100,
      score,
    });
  }

  static async withdrawEnrollment(id: string): Promise<Enrollment | null> {
    return this.updateEnrollment(id, { status: 'withdrawn' });
  }

  static async updateProgress(
    id: string,
    progress: number,
    timeSpent: number
  ): Promise<Enrollment | null> {
    return this.updateEnrollment(id, {
      progress,
      timeSpent,
      lastAccessedDate: new Date().toISOString(),
    });
  }
}

export class AssessmentService {
  static async getAssessments(filters?: { courseId?: string }): Promise<Assessment[]> {
    const res = await APIClient.get('/learning/assessments', filters);
    return APIClient.unwrapList<Assessment>(res, 'assessments');
  }

  static async createAssessment(data: Assessment): Promise<Assessment | null> {
    const res = await APIClient.post('/learning/assessments', data);
    return APIClient.unwrapItem<Assessment>(res, 'assessment');
  }

  static async getAssessmentAttempts(filters?: {
    assessmentId?: string;
    learnerId?: string;
  }): Promise<AssessmentAttempt[]> {
    const res = await APIClient.get('/learning/assessment-attempts', filters);
    return APIClient.unwrapList<AssessmentAttempt>(res, 'attempts');
  }

  static async submitAssessment(data: AssessmentAttempt): Promise<AssessmentAttempt | null> {
    const res = await APIClient.post('/learning/assessment-attempts', data);
    return APIClient.unwrapItem<AssessmentAttempt>(res, 'attempt');
  }

  static async updateAssessment(
    id: string,
    updates: Record<string, unknown>
  ): Promise<Assessment | null> {
    const res = await APIClient.put('/learning/assessments', { id, ...updates });
    return APIClient.unwrapItem<Assessment>(res, 'assessment');
  }
}

export class CertificationService {
  static async getCertifications(filters?: {
    learnerId?: string;
    status?: CertificationStatus;
  }): Promise<Certification[]> {
    const res = await APIClient.get('/learning/certifications', filters);
    return APIClient.unwrapList<Certification>(res, 'certifications');
  }

  static async issueCertification(data: Certification): Promise<Certification | null> {
    const res = await APIClient.post('/learning/certifications', data);
    return APIClient.unwrapItem<Certification>(res, 'certification');
  }

  static async updateCertification(
    id: string,
    updates: Partial<Certification>
  ): Promise<Certification | null> {
    const res = await APIClient.put('/learning/certifications', { id, ...updates });
    return APIClient.unwrapItem<Certification>(res, 'certification');
  }

  static async revokeCertification(id: string): Promise<Certification | null> {
    return this.updateCertification(id, { status: 'revoked' });
  }
}

export class TrainingSessionService {
  static async getTrainingSessions(filters?: {
    courseId?: string;
    status?: SessionStatus;
  }): Promise<TrainingSession[]> {
    const res = await APIClient.get('/learning/training-sessions', filters);
    return APIClient.unwrapList<TrainingSession>(res, 'sessions');
  }

  static async createTrainingSession(data: TrainingSession): Promise<TrainingSession | null> {
    const res = await APIClient.post('/learning/training-sessions', data);
    return APIClient.unwrapItem<TrainingSession>(res, 'session');
  }

  static async updateTrainingSession(
    id: string,
    updates: Partial<TrainingSession>
  ): Promise<TrainingSession | null> {
    const res = await APIClient.put('/learning/training-sessions', { id, ...updates });
    return APIClient.unwrapItem<TrainingSession>(res, 'session');
  }

  static async markAttendance(
    sessionId: string,
    learnerId: string,
    status: string
  ): Promise<unknown> {
    const res = await APIClient.post(`/learning/training-sessions/${sessionId}/attendance`, {
      learnerId,
      status,
    });
    return APIClient.unwrapItem(res);
  }

  static async markAllAttendance(
    sessionId: string,
    attendees: Array<{ learnerId: string; status: string }>
  ): Promise<unknown> {
    const res = await APIClient.post(`/learning/training-sessions/${sessionId}/attendance`, {
      attendees,
    });
    return APIClient.unwrapItem(res);
  }
}

export class ExternalTrainingService {
  static async getExternalTraining(filters?: { learnerId?: string }): Promise<ExternalTraining[]> {
    const res = await APIClient.get('/learning/external-training', filters);
    return APIClient.unwrapList<ExternalTraining>(res, 'records');
  }

  static async createExternalTraining(
    data: Partial<ExternalTraining>
  ): Promise<ExternalTraining | null> {
    const res = await APIClient.post('/learning/external-training', data);
    return APIClient.unwrapItem<ExternalTraining>(res, 'record');
  }

  static async approveExternalTraining(
    id: string,
    decision: 'approve' | 'reject' = 'approve'
  ): Promise<ExternalTraining | null> {
    const res = await APIClient.post(`/learning/external-training/${id}/approve`, { decision });
    return APIClient.unwrapItem<ExternalTraining>(res, 'record');
  }
}

export class SkillGapService {
  static async getSkillGapAnalysis(filters?: { employeeId?: string }): Promise<SkillGapAnalysis[]> {
    const res = await APIClient.get('/learning/skill-gap-analysis', filters);
    return APIClient.unwrapList<SkillGapAnalysis>(res);
  }

  static async createSkillGapAnalysis(data: SkillGapAnalysis): Promise<SkillGapAnalysis | null> {
    const res = await APIClient.post('/learning/skill-gap-analysis', data);
    return APIClient.unwrapItem<SkillGapAnalysis>(res);
  }
}

export class MentoringService {
  // The v1 mentorship route returns { data: { activeMatches, pastMatches, availableMentors } }.
  static async getMentoringPrograms(filters?: {
    mentorId?: string;
    menteeId?: string;
  }): Promise<MentoringProgram[]> {
    const res = await APIClient.get('/v1/learning/mentorship', filters);
    const data = APIClient.unwrapItem<{
      activeMatches?: MentoringProgram[];
      pastMatches?: MentoringProgram[];
    }>(res);
    if (!data) return [];
    return [...(data.activeMatches ?? []), ...(data.pastMatches ?? [])];
  }

  static async createMentoringProgram(
    data: Partial<MentoringProgram>
  ): Promise<MentoringProgram | null> {
    const res = await APIClient.post('/v1/learning/mentorship', data);
    return APIClient.unwrapItem<MentoringProgram>(res);
  }
}

export class TrainingBudgetService {
  static async getTrainingBudgets(filters?: {
    fiscalYear?: string;
    departmentId?: string;
  }): Promise<TrainingBudget[]> {
    const res = await APIClient.get('/learning/training-budgets', filters);
    return APIClient.unwrapList<TrainingBudget>(res, 'budgets');
  }

  static async createTrainingBudget(data: Partial<TrainingBudget>): Promise<TrainingBudget | null> {
    const res = await APIClient.post('/learning/training-budgets', data);
    return APIClient.unwrapItem<TrainingBudget>(res, 'budget');
  }
}

export class KnowledgeBaseService {
  static async getKnowledgeArticles(filters?: {
    categoryId?: string;
    search?: string;
  }): Promise<KnowledgeArticle[]> {
    const res = await APIClient.get('/learning/knowledge-articles', filters);
    return APIClient.unwrapList<KnowledgeArticle>(res, 'articles');
  }

  static async createKnowledgeArticle(
    data: Partial<KnowledgeArticle>
  ): Promise<KnowledgeArticle | null> {
    const res = await APIClient.post('/learning/knowledge-articles', data);
    return APIClient.unwrapItem<KnowledgeArticle>(res, 'article');
  }
}

export class TrainingFeedbackService {
  static async getTrainingFeedback(filters?: {
    courseId?: string;
    learnerId?: string;
  }): Promise<TrainingFeedback[]> {
    const res = await APIClient.get('/learning/training-feedback', filters);
    return APIClient.unwrapList<TrainingFeedback>(res, 'feedback');
  }

  static async submitTrainingFeedback(
    data: Partial<TrainingFeedback>
  ): Promise<TrainingFeedback | null> {
    const res = await APIClient.post('/learning/training-feedback', data);
    return APIClient.unwrapItem<TrainingFeedback>(res, 'feedback');
  }
}

export class LearningAnalyticsService {
  static async getAnalytics(): Promise<LearningAnalytics | null> {
    const res = await APIClient.get('/learning/analytics');
    return APIClient.unwrapItem<LearningAnalytics>(res);
  }
}

export class LearningSettingsService {
  static async getSettings(): Promise<LearningSettings | null> {
    const res = await APIClient.get('/learning/settings');
    return APIClient.unwrapItem<LearningSettings>(res);
  }

  static async updateSettings(
    updates: Partial<LearningSettings>
  ): Promise<LearningSettings | null> {
    const res = await APIClient.put('/learning/settings', updates);
    return APIClient.unwrapItem<LearningSettings>(res);
  }
}
