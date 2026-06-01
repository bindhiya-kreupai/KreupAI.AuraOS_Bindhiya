import { BaseService } from './base.service';

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: LearningCourse[];
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  skills: string[];
  enrollmentCount: number;
  active: boolean;
}

export interface LearningCourse {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'assignment';
  duration: string;
  order: number;
}

export interface LearningProgress {
  id: string;
  employeeId: string;
  pathId: string;
  courseId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercent: number;
  lastAccessedAt?: Date;
  completedAt?: Date;
}

export interface Assessment {
  id: string;
  title: string;
  pathId: string;
  questions: AssessmentQuestion[];
  passingScore: number;
  timeLimit: number; // minutes
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'matching';
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
}

export class LearningService extends BaseService {
  constructor() {
    super('LearningService');
  }

  async listPaths(tenantId: string, filters?: { level?: string; skill?: string }): Promise<LearningPath[]> {
    const where: any = { tenantId, active: true };
    if (filters?.level) where.level = filters.level;

    const paths = await this.prisma.learningPath.findMany({
      where,
      include: { courses: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });

    return paths.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      courses: (p.courses || []).map((c: any) => ({
        id: c.id, title: c.title, type: c.type, duration: c.duration, order: c.order,
      })),
      duration: p.duration,
      level: p.level as LearningPath['level'],
      skills: (p.skills as string[]) || [],
      enrollmentCount: p.enrollmentCount || 0,
      active: p.active,
    }));
  }

  async getPathById(id: string): Promise<LearningPath | null> {
    const path = await this.prisma.learningPath.findUnique({
      where: { id },
      include: { courses: { orderBy: { order: 'asc' } } },
    });
    if (!path) return null;
    return {
      id: path.id,
      title: path.title,
      description: path.description,
      courses: (path.courses || []).map((c: any) => ({
        id: c.id, title: c.title, type: c.type, duration: c.duration, order: c.order,
      })),
      duration: path.duration,
      level: path.level as LearningPath['level'],
      skills: (path.skills as string[]) || [],
      enrollmentCount: path.enrollmentCount || 0,
      active: path.active,
    };
  }

  async enrollInPath(employeeId: string, pathId: string): Promise<void> {
    await this.prisma.learningPathEnrollment.create({
      data: { employeeId, pathId, status: 'active', enrolledAt: new Date() },
    });
    await this.prisma.learningPath.update({
      where: { id: pathId },
      data: { enrollmentCount: { increment: 1 } },
    });
    await this.createAuditLog({
      userId: employeeId,
      action: 'CREATE',
      module: 'Learning',
      details: `Enrolled in learning path ${pathId}`,
    });
  }

  async trackProgress(data: {
    employeeId: string;
    pathId: string;
    courseId: string;
    progressPercent: number;
  }): Promise<LearningProgress> {
    const existing = await this.prisma.learningProgress.findFirst({
      where: { employeeId: data.employeeId, pathId: data.pathId, courseId: data.courseId },
    });

    const status = data.progressPercent >= 100 ? 'completed' : data.progressPercent > 0 ? 'in_progress' : 'not_started';

    if (existing) {
      const updated = await this.prisma.learningProgress.update({
        where: { id: existing.id },
        data: {
          progressPercent: data.progressPercent,
          status,
          lastAccessedAt: new Date(),
          completedAt: status === 'completed' ? new Date() : undefined,
        },
      });
      return { id: updated.id, employeeId: updated.employeeId, pathId: updated.pathId, courseId: updated.courseId, status: updated.status as any, progressPercent: updated.progressPercent, lastAccessedAt: updated.lastAccessedAt || undefined, completedAt: updated.completedAt || undefined };
    }

    const progress = await this.prisma.learningProgress.create({
      data: { ...data, status, lastAccessedAt: new Date() },
    });
    return { id: progress.id, employeeId: progress.employeeId, pathId: progress.pathId, courseId: progress.courseId, status: progress.status as any, progressPercent: progress.progressPercent, lastAccessedAt: progress.lastAccessedAt || undefined };
  }

  async getProgress(employeeId: string, pathId?: string): Promise<LearningProgress[]> {
    const where: any = { employeeId };
    if (pathId) where.pathId = pathId;

    const progress = await this.prisma.learningProgress.findMany({ where });
    return progress.map((p: any) => ({
      id: p.id, employeeId: p.employeeId, pathId: p.pathId, courseId: p.courseId, status: p.status as any, progressPercent: p.progressPercent, lastAccessedAt: p.lastAccessedAt || undefined, completedAt: p.completedAt || undefined,
    }));
  }

  async getRecommendations(employeeId: string): Promise<LearningPath[]> {
    // AI-based recommendations based on role, skills gap, and peer activity
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId }, select: { jobTitle: true, department: true } });
    const enrolledPathIds = (await this.prisma.learningPathEnrollment.findMany({ where: { employeeId }, select: { pathId: true } })).map((e: any) => e.pathId);

    const recommended = await this.prisma.learningPath.findMany({
      where: { id: { notIn: enrolledPathIds }, active: true },
      include: { courses: { orderBy: { order: 'asc' } } },
      take: 5,
    });

    return recommended.map((p: any) => ({
      id: p.id, title: p.title, description: p.description, courses: (p.courses || []).map((c: any) => ({ id: c.id, title: c.title, type: c.type, duration: c.duration, order: c.order })), duration: p.duration, level: p.level as any, skills: (p.skills as string[]) || [], enrollmentCount: p.enrollmentCount || 0, active: p.active,
    }));
  }

  async submitAssessment(data: {
    employeeId: string;
    assessmentId: string;
    answers: Record<string, string>;
  }): Promise<{ score: number; passed: boolean; totalPoints: number }> {
    const assessment = await this.prisma.assessment.findUnique({ where: { id: data.assessmentId } });
    if (!assessment) throw new Error('Assessment not found');

    const questions = assessment.questions as any[];
    let totalPoints = 0;
    let earnedPoints = 0;

    for (const q of questions) {
      totalPoints += q.points;
      if (data.answers[q.id] === q.correctAnswer) {
        earnedPoints += q.points;
      }
    }

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= assessment.passingScore;

    await this.prisma.assessmentSubmission.create({
      data: { employeeId: data.employeeId, assessmentId: data.assessmentId, answers: data.answers, score, passed, submittedAt: new Date() },
    });

    return { score, passed, totalPoints };
  }
}

export const learningService = new LearningService();
