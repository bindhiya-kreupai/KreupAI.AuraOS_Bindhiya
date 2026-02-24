/**
 * @module LearningService
 * @description ESS Learning Paths service — path catalog, enrollment,
 *              progress tracking, and path building
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ── Types ────────────────────────────────────────────────────────────────────────

export type PathLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type PathStatus = 'published' | 'draft' | 'archived';
export type CourseType = 'video' | 'article' | 'quiz' | 'project' | 'workshop' | 'interactive';
export type EnrollmentStatus = 'not_enrolled' | 'enrolled' | 'in_progress' | 'completed' | 'paused';
export type CourseStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface PathCourse {
  id: string;
  title: string;
  description: string;
  type: CourseType;
  duration: number;
  order: number;
  isRequired: boolean;
  prerequisites: string[];
  status: CourseStatus;
  progress: number;
  completedDate?: string;
  instructor?: string;
  provider?: string;
}

export interface LearningPathData {
  id: string;
  title: string;
  description: string;
  level: PathLevel;
  category: string;
  totalDuration: number;
  courses: PathCourse[];
  skills: string[];
  enrollmentCount: number;
  completionRate: number;
  rating: number;
  ratingCount: number;
  thumbnailEmoji: string;
  status: PathStatus;
  isEnrolled: boolean;
  enrollmentStatus: EnrollmentStatus;
  progress: number;
  startedDate?: string;
  estimatedCompletion?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PathEnrollmentData {
  pathId: string;
  learnerId: string;
  enrollmentDate: string;
  status: EnrollmentStatus;
  progress: number;
  coursesCompleted: number;
  totalCourses: number;
  timeSpent: number;
  lastAccessedDate?: string;
  estimatedCompletion?: string;
}

export interface PathProgressData {
  pathId: string;
  pathTitle: string;
  overallProgress: number;
  coursesCompleted: number;
  totalCourses: number;
  currentCourse?: PathCourse;
  timeSpent: number;
  streak: number;
  badges: string[];
  milestones: PathMilestone[];
}

export interface PathMilestone {
  id: string;
  title: string;
  description: string;
  courseOrder: number;
  isAchieved: boolean;
  achievedDate?: string;
  reward?: string;
}

export interface PathBuilderInput {
  title: string;
  description: string;
  level: PathLevel;
  category: string;
  skills: string[];
  courses: Omit<PathCourse, 'status' | 'progress' | 'completedDate'>[];
}

// ── Service ──────────────────────────────────────────────────────────────────────

export class LearningPathsService {
  private static basePath = '/api/learning/paths';

  static async getPaths(filters?: {
    level?: PathLevel;
    category?: string;
    search?: string;
  }): Promise<LearningPathData[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.level) params.set('level', filters.level);
      if (filters?.category) params.set('category', filters.category);
      if (filters?.search) params.set('search', filters.search);
      return await APIClient.get(`${this.basePath}?${params.toString()}`);
    } catch {
      return [];
    }
  }

  static async getPathById(id: string): Promise<LearningPathData | null> {
    try {
      return await APIClient.get(`${this.basePath}/${id}`);
    } catch {
      return null;
    }
  }

  static async enrollInPath(pathId: string): Promise<PathEnrollmentData | null> {
    try {
      return await APIClient.post(`${this.basePath}/${pathId}/enroll`, {});
    } catch {
      return null;
    }
  }

  static async unenrollFromPath(pathId: string): Promise<boolean> {
    try {
      await APIClient.post(`${this.basePath}/${pathId}/unenroll`, {});
      return true;
    } catch {
      return false;
    }
  }

  static async getProgress(pathId: string): Promise<PathProgressData | null> {
    try {
      return await APIClient.get(`${this.basePath}/${pathId}/progress`);
    } catch {
      return null;
    }
  }

  static async updateCourseProgress(
    pathId: string,
    courseId: string,
    progress: number
  ): Promise<boolean> {
    try {
      await APIClient.put(`${this.basePath}/${pathId}/courses/${courseId}/progress`, { progress });
      return true;
    } catch {
      return false;
    }
  }

  static async createPath(data: PathBuilderInput): Promise<LearningPathData | null> {
    try {
      return await APIClient.post(this.basePath, data);
    } catch {
      return null;
    }
  }

  static async updatePath(
    id: string,
    data: Partial<PathBuilderInput>
  ): Promise<LearningPathData | null> {
    try {
      return await APIClient.put(`${this.basePath}/${id}`, data);
    } catch {
      return null;
    }
  }
}
