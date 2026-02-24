/**
 * @module useLearning
 * @description React hook for ESS learning paths — catalog browsing,
 *              enrollment, progress tracking, and path building
 * @project AURA HCM Platform
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  LearningPathData,
  EnrollmentStatus,
  CourseStatus,
  PathMilestone,
  PathProgressData,
} from '@/services/learningService';

// ── Mock Data ────────────────────────────────────────────────────────────────────

const MOCK_PATHS: LearningPathData[] = [
  {
    id: 'lp-1',
    title: 'Full-Stack Engineering Mastery',
    description:
      'Comprehensive path from frontend fundamentals through backend architecture and DevOps practices. Designed for engineers targeting Staff+ roles.',
    level: 'advanced',
    category: 'Engineering',
    totalDuration: 120,
    courses: [
      {
        id: 'c-1',
        title: 'Advanced React Patterns',
        description: 'Compound components, render props, HOCs, and hooks patterns',
        type: 'video',
        duration: 12,
        order: 1,
        isRequired: true,
        prerequisites: [],
        status: 'completed',
        progress: 100,
        completedDate: '2026-01-20',
        instructor: 'Kent C. Dodds',
        provider: 'Frontend Masters',
      },
      {
        id: 'c-2',
        title: 'TypeScript Deep Dive',
        description: 'Generics, mapped types, conditional types, and type-safe patterns',
        type: 'video',
        duration: 8,
        order: 2,
        isRequired: true,
        prerequisites: ['c-1'],
        status: 'completed',
        progress: 100,
        completedDate: '2026-02-05',
        instructor: 'Matt Pocock',
        provider: 'Total TypeScript',
      },
      {
        id: 'c-3',
        title: 'System Design for Engineers',
        description: 'Distributed systems, microservices, and scalability patterns',
        type: 'article',
        duration: 16,
        order: 3,
        isRequired: true,
        prerequisites: ['c-2'],
        status: 'in_progress',
        progress: 45,
        instructor: 'Alex Xu',
        provider: 'Internal L&D',
      },
      {
        id: 'c-4',
        title: 'Node.js Performance Optimization',
        description: 'Event loop, clustering, streams, and memory management',
        type: 'workshop',
        duration: 10,
        order: 4,
        isRequired: true,
        prerequisites: ['c-2'],
        status: 'available',
        progress: 0,
        instructor: 'Matteo Collina',
        provider: 'NodeConf',
      },
      {
        id: 'c-5',
        title: 'DevOps & CI/CD Pipelines',
        description: 'Docker, Kubernetes, GitHub Actions, and deployment strategies',
        type: 'interactive',
        duration: 14,
        order: 5,
        isRequired: true,
        prerequisites: ['c-4'],
        status: 'locked',
        progress: 0,
        provider: 'Internal L&D',
      },
      {
        id: 'c-6',
        title: 'Database Design & Optimization',
        description: 'PostgreSQL tuning, indexing strategies, and query optimization',
        type: 'project',
        duration: 12,
        order: 6,
        isRequired: false,
        prerequisites: ['c-3'],
        status: 'locked',
        progress: 0,
        provider: 'Coursera',
      },
      {
        id: 'c-7',
        title: 'Staff Engineer Leadership',
        description: 'Technical vision, cross-team influence, and architectural decisions',
        type: 'workshop',
        duration: 8,
        order: 7,
        isRequired: true,
        prerequisites: ['c-5', 'c-6'],
        status: 'locked',
        progress: 0,
        instructor: 'Will Larson',
        provider: 'Leadership Academy',
      },
      {
        id: 'c-8',
        title: 'Capstone: Architecture Review',
        description: 'Design and present a complete system architecture proposal',
        type: 'project',
        duration: 40,
        order: 8,
        isRequired: true,
        prerequisites: ['c-7'],
        status: 'locked',
        progress: 0,
        provider: 'Internal',
      },
    ],
    skills: [
      'React',
      'TypeScript',
      'Node.js',
      'System Design',
      'DevOps',
      'PostgreSQL',
      'Leadership',
    ],
    enrollmentCount: 156,
    completionRate: 32,
    rating: 4.8,
    ratingCount: 89,
    thumbnailEmoji: '🚀',
    status: 'published',
    isEnrolled: true,
    enrollmentStatus: 'in_progress',
    progress: 35,
    startedDate: '2026-01-10',
    estimatedCompletion: '2026-06-15',
    createdBy: 'Learning Team',
    createdAt: '2025-11-01',
    updatedAt: '2026-02-20',
  },
  {
    id: 'lp-2',
    title: 'Engineering Leadership Foundations',
    description:
      'Build the core skills needed to transition from individual contributor to engineering leader. Covers people management, communication, and strategic thinking.',
    level: 'intermediate',
    category: 'Leadership',
    totalDuration: 60,
    courses: [
      {
        id: 'c-10',
        title: 'Managing Your First Team',
        description: 'Transitioning from IC to manager, setting expectations, and building trust',
        type: 'video',
        duration: 6,
        order: 1,
        isRequired: true,
        prerequisites: [],
        status: 'completed',
        progress: 100,
        completedDate: '2026-02-01',
        instructor: 'Julie Zhuo',
        provider: 'Internal L&D',
      },
      {
        id: 'c-11',
        title: 'Effective 1:1 Conversations',
        description: 'Frameworks for meaningful one-on-ones with direct reports',
        type: 'article',
        duration: 4,
        order: 2,
        isRequired: true,
        prerequisites: ['c-10'],
        status: 'in_progress',
        progress: 60,
        provider: 'Leadership Academy',
      },
      {
        id: 'c-12',
        title: 'Feedback & Coaching Skills',
        description: 'Giving constructive feedback, coaching frameworks, and growth conversations',
        type: 'workshop',
        duration: 8,
        order: 3,
        isRequired: true,
        prerequisites: ['c-11'],
        status: 'available',
        progress: 0,
        provider: 'People Team',
      },
      {
        id: 'c-13',
        title: 'Hiring & Interview Excellence',
        description: 'Structured interviews, rubrics, and building diverse teams',
        type: 'video',
        duration: 6,
        order: 4,
        isRequired: true,
        prerequisites: ['c-10'],
        status: 'locked',
        progress: 0,
        provider: 'Talent Team',
      },
      {
        id: 'c-14',
        title: 'Strategic Thinking for Managers',
        description: 'OKRs, roadmap planning, resource allocation, and stakeholder management',
        type: 'interactive',
        duration: 10,
        order: 5,
        isRequired: true,
        prerequisites: ['c-12', 'c-13'],
        status: 'locked',
        progress: 0,
        provider: 'Internal L&D',
      },
    ],
    skills: ['People Management', 'Communication', 'Feedback', 'Hiring', 'Strategic Thinking'],
    enrollmentCount: 89,
    completionRate: 48,
    rating: 4.9,
    ratingCount: 62,
    thumbnailEmoji: '👥',
    status: 'published',
    isEnrolled: true,
    enrollmentStatus: 'in_progress',
    progress: 45,
    startedDate: '2026-01-25',
    estimatedCompletion: '2026-04-30',
    createdBy: 'People Team',
    createdAt: '2025-10-15',
    updatedAt: '2026-02-18',
  },
  {
    id: 'lp-3',
    title: 'Data Engineering Fundamentals',
    description:
      'Learn the foundations of data engineering: pipelines, warehousing, ETL, and analytics infrastructure.',
    level: 'beginner',
    category: 'Data',
    totalDuration: 45,
    courses: [
      {
        id: 'c-20',
        title: 'SQL Mastery',
        description: 'Advanced SQL queries, window functions, CTEs, and performance tuning',
        type: 'video',
        duration: 10,
        order: 1,
        isRequired: true,
        prerequisites: [],
        status: 'available',
        progress: 0,
        provider: 'DataCamp',
      },
      {
        id: 'c-21',
        title: 'Python for Data Engineering',
        description: 'pandas, PySpark, and data pipeline scripting',
        type: 'interactive',
        duration: 12,
        order: 2,
        isRequired: true,
        prerequisites: ['c-20'],
        status: 'locked',
        progress: 0,
        provider: 'Coursera',
      },
      {
        id: 'c-22',
        title: 'Data Warehousing Concepts',
        description: 'Star schema, snowflake, dimensional modeling',
        type: 'article',
        duration: 8,
        order: 3,
        isRequired: true,
        prerequisites: ['c-20'],
        status: 'locked',
        progress: 0,
        provider: 'Internal L&D',
      },
      {
        id: 'c-23',
        title: 'ETL Pipeline Design',
        description: 'Airflow, dbt, and orchestration patterns',
        type: 'project',
        duration: 15,
        order: 4,
        isRequired: true,
        prerequisites: ['c-21', 'c-22'],
        status: 'locked',
        progress: 0,
        provider: 'Internal L&D',
      },
    ],
    skills: ['SQL', 'Python', 'Data Warehousing', 'ETL', 'Analytics'],
    enrollmentCount: 234,
    completionRate: 22,
    rating: 4.6,
    ratingCount: 145,
    thumbnailEmoji: '📊',
    status: 'published',
    isEnrolled: false,
    enrollmentStatus: 'not_enrolled',
    progress: 0,
    createdBy: 'Data Team',
    createdAt: '2025-12-01',
    updatedAt: '2026-02-10',
  },
  {
    id: 'lp-4',
    title: 'Cloud Security Certification Prep',
    description:
      'Prepare for AWS/Azure security certification with hands-on labs and practice exams.',
    level: 'expert',
    category: 'Security',
    totalDuration: 80,
    courses: [
      {
        id: 'c-30',
        title: 'Cloud Security Fundamentals',
        description: 'IAM, VPC, encryption at rest/transit, compliance frameworks',
        type: 'video',
        duration: 14,
        order: 1,
        isRequired: true,
        prerequisites: [],
        status: 'available',
        progress: 0,
        provider: 'AWS Training',
      },
      {
        id: 'c-31',
        title: 'Identity & Access Management',
        description: 'RBAC, ABAC, federation, and SSO deep dive',
        type: 'interactive',
        duration: 12,
        order: 2,
        isRequired: true,
        prerequisites: ['c-30'],
        status: 'locked',
        progress: 0,
        provider: 'AWS Training',
      },
      {
        id: 'c-32',
        title: 'Network Security & Monitoring',
        description: 'WAF, Shield, GuardDuty, and Security Hub',
        type: 'workshop',
        duration: 16,
        order: 3,
        isRequired: true,
        prerequisites: ['c-30'],
        status: 'locked',
        progress: 0,
        provider: 'AWS Training',
      },
      {
        id: 'c-33',
        title: 'Incident Response Procedures',
        description: 'IR playbooks, forensics, and remediation workflows',
        type: 'project',
        duration: 18,
        order: 4,
        isRequired: true,
        prerequisites: ['c-31', 'c-32'],
        status: 'locked',
        progress: 0,
        provider: 'Internal Security',
      },
      {
        id: 'c-34',
        title: 'Certification Practice Exams',
        description: '5 full-length practice exams with detailed explanations',
        type: 'quiz',
        duration: 20,
        order: 5,
        isRequired: true,
        prerequisites: ['c-33'],
        status: 'locked',
        progress: 0,
        provider: 'AWS Training',
      },
    ],
    skills: ['Cloud Security', 'IAM', 'Network Security', 'Incident Response', 'Compliance'],
    enrollmentCount: 67,
    completionRate: 18,
    rating: 4.7,
    ratingCount: 34,
    thumbnailEmoji: '🔒',
    status: 'published',
    isEnrolled: false,
    enrollmentStatus: 'not_enrolled',
    progress: 0,
    createdBy: 'Security Team',
    createdAt: '2025-12-15',
    updatedAt: '2026-02-15',
  },
];

// ── Hook ─────────────────────────────────────────────────────────────────────────

export function useLearningPaths() {
  const [paths, setPaths] = useState<LearningPathData[]>(MOCK_PATHS);
  const [isLoading] = useState(false);

  const enrolledPaths = useMemo(() => paths.filter((p) => p.isEnrolled), [paths]);
  const catalogPaths = useMemo(
    () => paths.filter((p) => !p.isEnrolled && p.status === 'published'),
    [paths]
  );

  const enrollInPath = useCallback((pathId: string) => {
    setPaths((prev) =>
      prev.map((p) =>
        p.id === pathId
          ? {
              ...p,
              isEnrolled: true,
              enrollmentStatus: 'enrolled' as EnrollmentStatus,
              startedDate: new Date().toISOString(),
              enrollmentCount: p.enrollmentCount + 1,
            }
          : p
      )
    );
  }, []);

  const unenrollFromPath = useCallback((pathId: string) => {
    setPaths((prev) =>
      prev.map((p) =>
        p.id === pathId
          ? {
              ...p,
              isEnrolled: false,
              enrollmentStatus: 'not_enrolled' as EnrollmentStatus,
              progress: 0,
            }
          : p
      )
    );
  }, []);

  const startCourse = useCallback((pathId: string, courseId: string) => {
    setPaths((prev) =>
      prev.map((p) => {
        if (p.id !== pathId) return p;
        return {
          ...p,
          enrollmentStatus: 'in_progress' as EnrollmentStatus,
          courses: p.courses.map((c) =>
            c.id === courseId && c.status === 'available'
              ? { ...c, status: 'in_progress' as CourseStatus, progress: 5 }
              : c
          ),
        };
      })
    );
  }, []);

  const completeCourse = useCallback((pathId: string, courseId: string) => {
    setPaths((prev) =>
      prev.map((p) => {
        if (p.id !== pathId) return p;
        const updatedCourses = p.courses.map((c) =>
          c.id === courseId
            ? {
                ...c,
                status: 'completed' as CourseStatus,
                progress: 100,
                completedDate: new Date().toISOString().split('T')[0],
              }
            : c
        );
        // Unlock next courses whose prerequisites are all completed
        const completedIds = new Set(
          updatedCourses.filter((c) => c.status === 'completed').map((c) => c.id)
        );
        const finalCourses = updatedCourses.map((c) => {
          if (c.status !== 'locked') return c;
          const allPrereqsMet = c.prerequisites.every((pid) => completedIds.has(pid));
          return allPrereqsMet ? { ...c, status: 'available' as CourseStatus } : c;
        });
        const _completedCount = finalCourses.filter((c) => c.status === 'completed').length;
        const totalRequired = finalCourses.filter((c) => c.isRequired).length;
        const completedRequired = finalCourses.filter(
          (c) => c.isRequired && c.status === 'completed'
        ).length;
        const newProgress =
          totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 0;
        const allDone = completedRequired === totalRequired;
        return {
          ...p,
          courses: finalCourses,
          progress: newProgress,
          enrollmentStatus: allDone ? ('completed' as EnrollmentStatus) : p.enrollmentStatus,
        };
      })
    );
  }, []);

  const getPathProgress = useCallback(
    (pathId: string): PathProgressData | null => {
      const path = paths.find((p) => p.id === pathId);
      if (!path) return null;
      const completedCourses = path.courses.filter((c) => c.status === 'completed');
      const currentCourse = path.courses.find((c) => c.status === 'in_progress');
      const milestones: PathMilestone[] = [
        {
          id: 'm-1',
          title: 'First Course Complete',
          description: 'Complete your first course',
          courseOrder: 1,
          isAchieved: completedCourses.length >= 1,
          achievedDate: completedCourses[0]?.completedDate,
          reward: '🎖️ Quick Starter',
        },
        {
          id: 'm-2',
          title: 'Halfway There',
          description: 'Complete 50% of required courses',
          courseOrder: Math.ceil(path.courses.filter((c) => c.isRequired).length / 2),
          isAchieved: path.progress >= 50,
          reward: '⭐ Dedicated Learner',
        },
        {
          id: 'm-3',
          title: 'Path Complete',
          description: 'Complete all required courses',
          courseOrder: path.courses.length,
          isAchieved: path.progress >= 100,
          reward: '🏆 Path Master',
        },
      ];
      return {
        pathId: path.id,
        pathTitle: path.title,
        overallProgress: path.progress,
        coursesCompleted: completedCourses.length,
        totalCourses: path.courses.length,
        currentCourse,
        timeSpent: path.courses.reduce(
          (s, c) => s + (c.progress > 0 ? Math.round(c.duration * (c.progress / 100) * 60) : 0),
          0
        ),
        streak: 5,
        badges: completedCourses.length >= 1 ? ['Quick Starter'] : [],
        milestones,
      };
    },
    [paths]
  );

  return {
    paths,
    enrolledPaths,
    catalogPaths,
    isLoading,
    enrollInPath,
    unenrollFromPath,
    startCourse,
    completeCourse,
    getPathProgress,
  };
}

// Re-exports for convenience
export type {
  LearningPathData,
  PathCourse,
  PathLevel,
  EnrollmentStatus,
  CourseStatus,
  CourseType,
  PathProgressData,
  PathMilestone,
  PathBuilderInput,
} from '@/services/learningService';
